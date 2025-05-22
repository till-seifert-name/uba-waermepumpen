#!/usr/bin/env tsx

import ExcelJS from 'exceljs';
import * as fs from 'fs';
import * as path from 'path';
import yargs from 'yargs';
import {hideBin} from 'yargs/helpers';
import {execSync} from 'child_process';
import {Parser as XmlParser, processors} from 'xml2js';

// --- Helper Functions ---
function sanitizeForFilename(name: string): string {
  const sanitized = name.replace(/[^a-zA-Z0-9_.-]/g, '_').replace(/^_+|_+$/g, '');
  return sanitized || 'untitled';
}

function sanitizeForTsVariable(name: string): string {
  let sanitized = name.replace(/[^a-zA-Z0-9_]/g, '_');
  if (/^\d/.test(sanitized)) { // Starts with a digit
    sanitized = '_' + sanitized;
  }
  if (!sanitized) return '_invalidName'; // Fallback for empty or all-invalid-char names
  return sanitized;
}

function getTsValueString(value: any, commentType?: string): string {
  const comment = commentType ? ` /* ${commentType} */` : '';
  if (value === undefined) return `${comment} undefined`;
  if (value === null) return `${comment} null`;
  if (typeof value === 'string') return `${comment} ${JSON.stringify(value)}`;
  if (typeof value === 'number' || typeof value === 'boolean') return `${comment} ${value.toString()}`;
  if (value instanceof Date) return `${comment} new Date(${JSON.stringify(value.toISOString())})`;
  // For other complex objects (like exceljs rich text or hyperlink objects)
  return `${comment} ${JSON.stringify(value)}`;
}

function formatFodsRange(rangeString: string | undefined): string {
  if (!rangeString) return "#REF!";
  // Clean up potential [$Sheet.$A$1:.$B$2] or Sheet.$A$1 etc.
  let cleaned = rangeString
    .replace(/\[\$(.*?)\.\$(.*?)(:\.\$(.*?))?\]/g, (_match, sheet, startCell, _sep, endCell) => {
      return `${sheet.replace(/'/g, '')}.${startCell}${endCell ? `:${endCell}` : ''}`;
    })
    .replace(/\$/g, ''); // Remove all $ signs

  // Convert sheet.cell to sheet!cell
  cleaned = cleaned.replace(/'([^']*)'/g, '$1'); // Remove single quotes around sheet names

  // Careful: only replace dots if they are part of 'Sheet.Cell' not e.g. '1.23' if it's a constant expression
  // This regex tries to match SheetName.CellAddress pattern
  cleaned = cleaned.replace(/([a-zA-Z0-9_]+)\.([A-Z]+[0-9]+)/g, '$1!$2');
  // And SheetName.RangeStart:RangeEnd
  cleaned = cleaned.replace(/([a-zA-Z0-9_]+)\.([A-Z]+[0-9]+:[A-Z]+[0-9]+)/g, '$1!$2');

  return cleaned;
}

// --- Main Script Logic ---
interface Arguments {
  input: string;
  outputDir?: string; // Changed from 'output' to 'outputDir'
  pretty?: boolean;
  libreofficePath?: string;
  keepFods?: boolean;

  [key: string]: unknown;
}

async function convertXlsxToTsModules() {
  const argv = yargs(hideBin(process.argv))
    .option('input', {
      alias: 'i',
      type: 'string',
      description: 'Path to the input XLSX file',
      demandOption: true,
    })
    .option('outputDir', {
      alias: 'o',
      type: 'string',
      description: 'Directory to save the generated TypeScript files (defaults to ./<input-basename>_ts_export)',
    })
    .option('pretty', { // Pretty is implicitly handled by TS file structure
      type: 'boolean',
      description: 'Format generated TypeScript (Note: basic formatting is applied)',
      default: true, // Kept for consistency, but actual formatting might be minimal
    })
    .option('libreofficePath', {
      alias: 'lo',
      type: 'string',
      description: 'Path to LibreOffice executable (e.g., soffice). Defaults to "soffice".',
      default: 'soffice',
    })
    .option('keepFods', {
      type: 'boolean',
      description: 'Keep the intermediate .fods file.',
      default: false,
    })
    .help().alias('help', 'h').version(false)
    .parseSync() as Arguments;

  const inputFile = path.resolve(argv.input);
  const baseOutputDir = argv.outputDir
    ? path.resolve(argv.outputDir)
    : path.resolve(path.dirname(inputFile), `${path.basename(inputFile, path.extname(inputFile))}_ts_export`);

  const tempFodsFile = path.resolve(baseOutputDir, `${path.basename(inputFile, path.extname(inputFile))}.fods`);

  const generationTimestamp = new Date().toISOString();

  try {
    if (!fs.existsSync(inputFile)) {
      console.error(`Error: Input XLSX file not found: ${inputFile}`);
      process.exit(1);
    }
    if (!fs.existsSync(baseOutputDir)) {
      fs.mkdirSync(baseOutputDir, {recursive: true});
    }

    // --- 1. Convert XLSX to FODS (for reliable named ranges) ---
    console.log(`Converting ${inputFile} to FODS at ${tempFodsFile} using LibreOffice...`);
    const loCommand = `"${argv.libreofficePath}" --headless --convert-to fods "${inputFile}" --outdir "${path.dirname(tempFodsFile)}"`;
    try {
      execSync(loCommand, {stdio: 'pipe'});
      console.log('Conversion to FODS successful.');
    } catch (e: any) {
      console.error('Error during LibreOffice conversion:', e.message);
      console.error(`Command: ${loCommand}`);
      console.error('Ensure LibreOffice is installed and in PATH, or specify with --libreofficePath.');
      process.exit(1);
    }

    if (!fs.existsSync(tempFodsFile)) {
      console.error(`Error: FODS file ${tempFodsFile} not found after conversion.`);
      process.exit(1);
    }

    // --- 2. Parse FODS for Named Items ---
    console.log(`Parsing ${tempFodsFile} for named items...`);
    const fodsContent = fs.readFileSync(tempFodsFile, 'utf-8');
    const xmlParser = new XmlParser({explicitArray: false, tagNameProcessors: [processors.stripPrefix]});
    const parsedFods = await xmlParser.parseStringPromise(fodsContent);

    const fodsNamedExpressions: Record<string, string> = {};
    const fodsExplicitNamedRanges: Record<string, string> = {};
    const fodsDatabaseRanges: Record<string, string> = {};

    const officeSpreadsheet = parsedFods?.document?.body?.spreadsheet;
    if (officeSpreadsheet) {
      const namedExpressionsContainer = officeSpreadsheet['named-expressions'];
      if (namedExpressionsContainer) {
        const items = [];
        if (namedExpressionsContainer['named-expression']) {
          items.push(...(Array.isArray(namedExpressionsContainer['named-expression']) ? namedExpressionsContainer['named-expression'] : [namedExpressionsContainer['named-expression']]));
        }
        if (namedExpressionsContainer['named-range']) {
          items.push(...(Array.isArray(namedExpressionsContainer['named-range']) ? namedExpressionsContainer['named-range'] : [namedExpressionsContainer['named-range']]));
        }

        items.forEach((item: any) => {
          const name = item.$?.['table:name'];
          if (name) {
            if (item.$?.['table:expression']) {
              fodsNamedExpressions[name] = formatFodsRange(item.$['table:expression']);
            } else if (item.$?.['table:cell-range-address']) {
              fodsExplicitNamedRanges[name] = formatFodsRange(item.$['table:cell-range-address']);
            }
          }
        });
      }

      const databaseRangesContainer = officeSpreadsheet['database-ranges'];
      if (databaseRangesContainer?.['database-range']) {
        const dbRanges = Array.isArray(databaseRangesContainer['database-range'])
          ? databaseRangesContainer['database-range']
          : [databaseRangesContainer['database-range']];
        dbRanges.forEach((item: any) => {
          const name = item.$?.['table:name'];
          const targetRange = item.$?.['table:target-range-address'];
          if (name && targetRange) {
            fodsDatabaseRanges[name] = formatFodsRange(targetRange);
          }
        });
      }
    }

    // Write named items TS files
    const namedFilesInfo = [
      {name: 'namedExpressions', data: fodsNamedExpressions, fileName: 'namedExpressions.ts'},
      {name: 'explicitNamedRanges', data: fodsExplicitNamedRanges, fileName: 'explicitNamedRanges.ts'},
      {name: 'databaseRanges', data: fodsDatabaseRanges, fileName: 'databaseRanges.ts'},
    ];

    for (const {name, data, fileName} of namedFilesInfo) {
      let content = `// ${name.replace(/([A-Z])/g, ' $1').trim()} from FODS\n`;
      content += `export const ${name} = {\n`;
      for (const [key, value] of Object.entries(data)) {
        content += `  ${JSON.stringify(key)}: ${JSON.stringify(value)},\n`;
      }
      content += '} as const;\n';
      fs.writeFileSync(path.join(baseOutputDir, fileName), content);
      console.log(`Generated ${path.join(baseOutputDir, fileName)}`);
    }

    // --- 3. Parse XLSX for Cell Data (using exceljs) ---
    console.log(`Parsing ${inputFile} for cell data using exceljs...`);
    const workbook = new ExcelJS.Workbook();
    await workbook.xlsx.readFile(inputFile);

    const sheetFileInfos: Array<{ originalName: string, varName: string, fileName: string }> = [];

    workbook.eachSheet((worksheet) => {
      const originalSheetName = worksheet.name;
      const sanitizedFilename = sanitizeForFilename(originalSheetName) + '.ts';
      const sanitizedVarName = sanitizeForTsVariable(originalSheetName) + 'Data';
      sheetFileInfos.push({originalName: originalSheetName, varName: sanitizedVarName, fileName: sanitizedFilename});

      let sheetFileContent = `// Sheet: ${originalSheetName}\n`;
      sheetFileContent += `export const data = {\n`;

      worksheet.eachRow({includeEmpty: true}, (row, rowNumber) => { // true to get all cell addresses if needed by formulas
        row.eachCell({includeEmpty: true}, (cell, colNumber) => {
          if (cell.value !== null || cell.formula) { // Only output cells with value or formula
            let cellValueToStore: any;
            let commentType: string = ExcelJS.ValueType[cell.type] || 'unknown';

            if (cell.formula) {
              cellValueToStore = cell.formula;
              commentType = 'formula';
            } else if (cell.type === ExcelJS.ValueType.Error && cell.value && typeof (cell.value as ExcelJS.CellErrorValue).error === 'string') {
              cellValueToStore = (cell.value as ExcelJS.CellErrorValue).error;
              commentType = 'error_value';
            } else if (cell.type === ExcelJS.ValueType.RichText && cell.value && (cell.value as ExcelJS.CellRichTextValue).richText) {
              cellValueToStore = (cell.value as ExcelJS.CellRichTextValue).richText.map(rt => rt.text).join('');
              commentType = 'richtext_as_string';
            } else if (cell.type === ExcelJS.ValueType.Hyperlink && cell.value && (cell.value as ExcelJS.CellHyperlinkValue).text) {
              cellValueToStore = { // Store as object
                text: (cell.value as ExcelJS.CellHyperlinkValue).text,
                hyperlink: (cell.value as ExcelJS.CellHyperlinkValue).hyperlink
              };
              commentType = 'hyperlink_object';
            } else {
              cellValueToStore = cell.value;
            }
            sheetFileContent += `  ${JSON.stringify(cell.address)}: ${getTsValueString(cellValueToStore, commentType)},\n`;
          }
        });
      });
      sheetFileContent += '} as const;\n';
      fs.writeFileSync(path.join(baseOutputDir, sanitizedFilename), sheetFileContent);
      console.log(`Generated ${path.join(baseOutputDir, sanitizedFilename)}`);
    });

    // --- 4. Generate master.ts ---
    let masterFileContent = `// Master file aggregating all spreadsheet data\n`;

    // Imports for sheets
    sheetFileInfos.forEach(info => {
      masterFileContent += `import { data as ${info.varName} } from './${info.fileName.replace(/\.ts$/, '')}';\n`;
    });

    // Imports for named items
    namedFilesInfo.forEach(info => {
      masterFileContent += `import { ${info.name} } from './${info.fileName.replace(/\.ts$/, '')}';\n`;
    });
    masterFileContent += '\n';

    // Export sheetsData object
    masterFileContent += 'export const sheetsData = {\n';
    sheetFileInfos.forEach(info => {
      masterFileContent += `  ${JSON.stringify(info.originalName)}: ${info.varName},\n`;
    });
    masterFileContent += '};\n\n';

    // Re-export named items
    masterFileContent += 'export {\n';
    namedFilesInfo.forEach(info => {
      masterFileContent += `  ${info.name},\n`;
    });
    masterFileContent += '} as const;\n';

    fs.writeFileSync(path.join(baseOutputDir, 'master.ts'), masterFileContent);
    console.log(`Generated ${path.join(baseOutputDir, 'master.ts')}`);
    console.log(`\nAll TypeScript modules generated in: ${baseOutputDir}`);

  } catch (error) {
    console.error('An overall error occurred:');
    if (error instanceof Error) console.error(error.message, error.stack);
    else console.error(error);
    process.exit(1);
  } finally {
    // --- 5. Cleanup ---
    if (!argv.keepFods && fs.existsSync(tempFodsFile)) {
      try {
        fs.unlinkSync(tempFodsFile);
        console.log(`Temporary FODS file ${tempFodsFile} deleted.`);
      } catch (e) {
        console.warn(`Could not delete temp FODS file ${tempFodsFile}.`);
      }
    }
  }
}

convertXlsxToTsModules();
