import {Subject} from "rxjs";

/**
 * Represents the contents of a cell in the DataGrid.
 */
export type CellContent = string | CellFunc | number;
/**
 * A function that can be used as the content of a cell in the DataGrid.
 */
export type CellFunc = (sheet: string, cell: string, grid: DataGrid) => number | string | null;

export type Sheet = Record<string, CellContent>;
export type CellChange = { sheet: string; cell: string; value: any };

function isRestoredSheets(data: any): data is Record<string, Sheet> {
  if (typeof data !== 'object' || data === null) {
    return false;
  }

  for (const sheet in data) {
    if (typeof data[sheet] !== 'object' || data[sheet] === null) {
      return false;
    }
  }

  return true;
}

/**
 * A class representing a grid of data, similar to an Excel spreadsheet.
 */
export class DataGrid {
  cells: Record<string, Sheet>;
  results: Record<string, Record<string, any>>;
  private cellChangedSubject: Subject<CellChange> = new Subject();
  g: (sheet: string, cell: string) => number | string;

  constructor() {
    this.cells = {};
    this.results = {};

    this.g = this.getCell.bind(this);
  }


  onCellChanged(): Subject<CellChange> {
    return this.cellChangedSubject;
  }

  /**
   * Method to serialize the cells
   */
  serializeCells(): string {
    return JSON.stringify(this.cells);
  }

  // Method to serialize cells based on parsed cell references
  serializeWhitelistedCells(parsedReferences: [string, string][]): string {
    const whitelistedSheets: Record<string, Sheet> = {};

    for (const [sheetName, cellName] of parsedReferences) {
      // Skip if the sheet or cell doesn't exist
      if (!this.cells[sheetName] || this.cells[sheetName][cellName] === undefined) {
        continue;
      }

      // Initialize sheet if needed
      whitelistedSheets[sheetName] = whitelistedSheets[sheetName] || {};
      // Save the cell value
      whitelistedSheets[sheetName][cellName] = this.cells[sheetName][cellName];
    }

    return JSON.stringify(whitelistedSheets);
  }


  /**
   * Method to restore cells from serialized data
   */
  restoreCells(json: string) {
    try {
      const restoredSheets = JSON.parse(json);
      if (!isRestoredSheets(restoredSheets)) {
        throw new Error('Invalid data format for restored cells');
      }
      for (const sheetName in restoredSheets) {
        this.cells[sheetName] ??= {};
        for (const cell in restoredSheets[sheetName]) {
          if (restoredSheets[sheetName][cell] !== null) {
            this.setCell(sheetName, cell, restoredSheets[sheetName][cell]);
          }
        }
      }
    } catch (error) {
      console.error('Error restoring cells:', error);
    }
  }

  /**
   * Sets the content of the specified cell in the specified sheet.
   */
  setCell(sheet: string, cell: string, value: CellContent): void {
    // clear result cache, since input changed
    this.clearResults();

    this.cells[sheet] ??= {};

    if (typeof value === 'string' && /^[0-9\-]*[.,]?[0-9Ee\-]+$/.test(value)) {
    // not used, we will try to use native html5 number inputs
    //  value = parseFloat(value.replace(/[.,]/, '.'));
    }

    this.cells[sheet][cell] = value;
    this.cellChangedSubject.next({sheet, cell, value});
  }

  /**
   * Sets the content of a range of cells in the specified sheet.
   */
  setCells(sheet: string, from: string, to: string, content: CellContent[][] | CellContent): void {
    const $x1 = this.COLUMN(from);
    const $y1 = this.ROW(from);
    const $x2 = this.COLUMN(to);
    const $y2 = this.ROW(to);

    if (Array.isArray(content)) {
      for (let col = $x1; col <= $x2; col++) {
        for (let row = $y1; row <= $y2; row++) {
          const cell = DataGrid.index2cell(col, row);
          this.setCell(sheet, cell, content[row - $y1][col - $x1] || 0);
        }
      }
    } else {
      for (let col = $x1; col <= $x2; col++) {
        for (let row = $y1; row <= $y2; row++) {
          const cell = DataGrid.index2cell(col, row);
          this.setCell(sheet, cell, content);
        }
      }
    }
  }

  /**
   * Gets the content of the specified cell in the specified sheet.
   */
  getCell(sheet: string, cell: string): number | string {
    this.cells[sheet] ??= {};
    this.results[sheet] ??= {};

    const cellContent = this.results[sheet][cell] ?? this.cells[sheet][cell];

    if (typeof cellContent === 'function') {
      return this.resolveFunction(sheet, cell, cellContent);
    }
    return cellContent ?? "";
  }

  /**
   * Gets the contents of a range of cells in the specified sheet.
   * Returns a 2D array with the values.
   */
  getCells(sheet: string, from: string, to: string): (number | string)[][] {
    const $x1 = this.COLUMN(from);
    const $y1 = this.ROW(from);
    const $x2 = this.COLUMN(to);
    const $y2 = this.ROW(to);

    const result: (number | string)[][] = [];

    for (let row = $y1; row <= $y2; row++) {
      const rowData: (number | string)[] = [];
      for (let col = $x1; col <= $x2; col++) {
        const cell = DataGrid.index2cell(col, row);
        rowData.push(this.getCell(sheet, cell));
      }
      result.push(rowData);
    }

    return result;
  }

  private resolveFunction(sheet: string, cell: string, func: CellFunc): number {
    this.results[sheet] ??= {};

    // null marks that the cell is part of the stack that is just evaluated, to detect loops
    if (this.results[sheet][cell] === null) {
      //throw new Error(`Circular dependency detected at ${sheet}!${cell}`);
    }

    this.results[sheet][cell] = null;
    this.results[sheet][cell] = func(sheet, cell, this);
    return this.results[sheet][cell];
  }

  /**
   * Gets the content of the specified cell in the specified sheetas a Number or NaN if it is not
   */
  getCellNumeric(sheet: string, cell: string): number {
    const value = this.getCell(sheet, cell);
    return (typeof value === 'number' || typeof value === 'bigint') ? value : NaN;
  }

  /**
   * Clears the results cache.
   */
  clearResults() {
    for (const i in this.results) {
      this.results[i] = {};
    }
  }

  /**
   * Calculates the sum of the specified cells in the specified sheet.
   */
  SUM(sheet: string, cells: string[]): number {
    return cells.reduce((sum, cell) => {
      const add = this.getCell(sheet, cell);
      if (typeof add === 'number') {
        return sum + add;
      }
      return NaN;
    }, 0);
  }

  // Static helper methods

  static charCodeOfA = 'A'.charCodeAt(0);
  static alphabetLength = 'Z'.charCodeAt(0) - DataGrid.charCodeOfA + 1;

  /**
   * Converts a column name to a numeric column index.
   */
  static columnNameToColNumber(cell: string): number {
    let result = 0;
    cell = cell.replace(/[^A-Z]/g, '');
    for (let i = 0; i < cell.length; i++) {
      result *= DataGrid.alphabetLength;
      result += cell.charCodeAt(i) - DataGrid.charCodeOfA + 1;
    }
    return result;
  }

  /**
   * Extracts the row number from a cell name.
   */
  static cellNameToRowNumber(cell: string): number {
    return parseInt(cell.replace(/[^0-9]/g, ''));
  }

  /**
   * Converts a numeric column index to an Excel-style column name.
   */
  static getExcelColumnName(number: number): string {
    let sb = '';
    let num = number - 1;
    while (num >= 0) {
      sb = String.fromCharCode((num % DataGrid.alphabetLength) + DataGrid.charCodeOfA) + sb;
      num = Math.floor(num / DataGrid.alphabetLength) - 1;
    }
    return sb;
  }


  // Implementations of Excel functions
  COLUMN(cell: string): number {
    return DataGrid.columnNameToColNumber(cell);
  }

  ROW(cell: string): number {
    return DataGrid.cellNameToRowNumber(cell);
  }

  /**
   * Retrieves the value from a specified cell in a specified sheet using the INDEX function.
   */
  INDEX(sheet: string, cell1: string, cell2: string, row: number, col: number): any {
    const x = this.COLUMN(cell1) + (col - 1);
    const y = this.ROW(cell1) + (row - 1);

    return this.getCell(sheet, DataGrid.index2cell(x, y));
  }

  SVERWEIS(sheet: string, value: string | number | null, cell1: string, cell2: string, col: number): string | number | null {
    const x = this.COLUMN(cell1);
    const yStart = this.ROW(cell1);
    const yEnd = this.ROW(cell2);

    let result: string | number | null = null;
    let found = false;

    for (let y = yStart; y <= yEnd; y++) {
      if (found) break;
      const v = this.getCell(sheet, DataGrid.index2cell(x, y));
      if (v == value) {
        found = true;
        result = this.getCell(sheet, DataGrid.index2cell(x + col - 1, y));
      }
    }
    return result;
  }

  /**
   * Converts a row and column index to an Excel-style cell name.
   */
  static index2cell(x: number, y: number): string {
    return DataGrid.getExcelColumnName(x) + y;
  }
}

export const WENN = (bedingung: boolean, wertWennWahr: any, wertWennFalsch: any = "") => bedingung ? wertWennWahr : wertWennFalsch;

export function UND(...conditions: boolean[]) {
  return conditions.every((condition) => condition);
}

export function WAHR(): boolean {
  return true;
}

export function WENNS(...args: any[]): any {
  for (let i = 0; i < args.length - 1; i += 2) {
    if (args[i]) return args[i + 1];
  }
  return args[args.length - 1];
}

export function ODER(...conditions: boolean[]) {
  return conditions.some(cond => cond);
}

export function ISTLEER(value: unknown) {
  return value === '' || value === null || value === undefined;
}

export const ABS = (wert: number) => Math.abs(wert);

/**
 * Parses a cell reference in the format "Sheet!Cell" to [sheet, cell]
 */
export function parseCellReference(reference: string): [string, string] {
    const parts = reference.split('!');
    if (parts.length === 2) {
      return [parts[0], parts[1]];
    }
    // Default to Names sheet if no sheet specified
    return ["", reference];
  }
