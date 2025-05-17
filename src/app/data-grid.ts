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
          const cell = index2cell(col, row);
          this.setCell(sheet, cell, content[row - $y1][col - $x1] || 0);
        }
      }
    } else {
      for (let col = $x1; col <= $x2; col++) {
        for (let row = $y1; row <= $y2; row++) {
          const cell = index2cell(col, row);
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
        const cell = index2cell(col, row);
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

  // Implementations of Excel functions
  COLUMN(cell: string): number {
    return columnNameToColNumber(cell);
  }

  ROW(cell: string): number {
    return cellNameToRowNumber(cell);
  }

  /**
   * Retrieves the value from a specified cell in a specified sheet using the INDEX function.
   */
  INDEX(sheet: string, cell1: string, cell2: string, row: number, col: number): any {
    const x = this.COLUMN(cell1) + (col - 1);
    const y = this.ROW(cell1) + (row - 1);

    return this.getCell(sheet, index2cell(x, y));
  }

  SVERWEIS(sheet: string, value: string | number | null, cell1: string, cell2: string, col: number): string | number | null {
    const x = this.COLUMN(cell1);
    const yStart = this.ROW(cell1);
    const yEnd = this.ROW(cell2);

    let result: string | number | null = null;
    let found = false;

    for (let y = yStart; y <= yEnd; y++) {
      if (found) break;
      const v = this.getCell(sheet, index2cell(x, y));
      if (v == value) {
        found = true;
        result = this.getCell(sheet, index2cell(x + col - 1, y));
      }
    }
    return result;
  }

  /**
   * Excel-style XVERWEIS: accepts array-based args instead of cell references.
   */
  XVERWEIS(
    value: string | number | null,
    lookupArray: (string | number | null)[],
    returnArray: (string | number | null)[],
    options?: {
      ifNotFound?: string | number | null | (() => any),
      matchMode?: 'exact' | 'exactOrNextSmaller' | 'exactOrNextLarger',
      searchMode?: 'first' | 'last';
    }
  ): string | number | null {
    const matchMode = options?.matchMode ?? 'exact';
    const searchMode = options?.searchMode ?? 'first';

    if (lookupArray.length !== returnArray.length) {
      throw new Error('lookupArray and returnArray must be the same length');
    }

    const indices = [...lookupArray.keys()];
    if (searchMode === 'last') indices.reverse();

    let bestIndex: number | null = null;

    for (const i of indices) {
      const lookupCell = lookupArray[i];
      const returnCell = returnArray[i];

      const match = (lookupCell == value); // == for Excel-style comparison

      if (matchMode === 'exact' && match) return returnCell;

      if (typeof value === 'number' && typeof lookupCell === 'number') {
        if (matchMode === 'exactOrNextSmaller') {
          if (lookupCell === value) return returnCell;
          if (lookupCell < value) {
            if (
              bestIndex === null ||
              lookupCell > (lookupArray[bestIndex] as number)
            ) {
              bestIndex = i;
            }
          }
        } else if (matchMode === 'exactOrNextLarger') {
          if (lookupCell === value) return returnCell;
          if (lookupCell > value) {
            if (
              bestIndex === null ||
              lookupCell < (lookupArray[bestIndex] as number)
            ) {
              bestIndex = i;
            }
          }
        }
      }
    }

    if (bestIndex !== null) {
      return returnArray[bestIndex];
    }

    if (typeof options?.ifNotFound === 'function') {
      return (options.ifNotFound as () => any)();
    }

    return options?.ifNotFound ?? null;
  }


  /**
   * Extracts a column from a named database-like range by header name.
   *
   * @param name - The name expression referring to a 2D range
   * @param column - The column name (from the header row) to extract
   * @returns The column values without the header row
   */
  INDIREKT_DB_REF(name: string, column: string): (string | number)[] {
    const rangeRef = this.getCell('Names', name);
    if (typeof rangeRef !== 'string') return [];

    const [, sheet, startCell, , endCell] =
    rangeRef.match(/(?:(\w[\w\s]*)!)?([A-Za-z]+\d+)(?::(?:(\w[\w\s]*)!)?([A-Za-z]+\d+))?/) ?? [];

    if (!sheet || !startCell) return [];

    const startX = columnNameToColNumber(startCell);
    const startY = cellNameToRowNumber(startCell);
    const endX = columnNameToColNumber(endCell ?? startCell);

    const startRowLastCell = index2cell(endX, startY);
    const headerRow = this.getCells(sheet, startCell, startRowLastCell)[0];
    if (!headerRow) return [];

    const colIndex = headerRow.indexOf(column);
    if (colIndex === -1) return [];

    const colX = startX + colIndex;
    const endY = cellNameToRowNumber(endCell ?? startCell);

    const values: (string | number)[] = [];
    for (let y = startY + 1; y <= endY; y++) {
      const cellRef = index2cell(colX, y);
      const value = this.getCell(sheet, cellRef);
      values.push(value ?? '');
    }

    return values;
  }

  /**
   * Resolves a value from a DB range in the current row, by column name.
   */
  DB_THIS_ROW(cell: string, dbName: string, column: string): string | number | null {
    const rowIndex = this.ROW(cell);
    const rangeRef = this.getCell('Names', dbName);
    if (typeof rangeRef !== 'string') return null;

    const [, sheet, startCell, , endCell] =
    rangeRef.match(/(?:(\w[\w\s]*)!)?([A-Za-z]+\d+)(?::(?:(\w[\w\s]*)!)?([A-Za-z]+\d+))?/) ?? [];
    if (!sheet || !startCell) return null;

    const dbStartRow = this.ROW(startCell);
    const offset = rowIndex - dbStartRow - 1; // -1 wegen Header
    if (offset < 0) return null;

    const columnValues = this.INDIREKT_DB_REF(dbName, column);
    return columnValues[offset] ?? null;
  }

  WENN<T>(cond: boolean, thenVal: T, elseVal: T): T {
    return cond ? thenVal : elseVal;
  }

  ODER(...conditions: boolean[]) {
    return conditions.some(cond => cond);
  }

  WAHR(): boolean {
    return true;
  }

  WENNS(...args: any[]): any {
    for (let i = 0; i < args.length - 1; i += 2) {
      if (args[i]) return args[i + 1];
    }
    return args[args.length - 1];
  }

  ISTLEER(value: unknown) {
    return value === '' || value === null || value === undefined;
  }

  ABS(wert: number) {
    return Math.abs(wert)
  };

  /**
   * Resolves a named range to a flat list of values.
   */
  INDIREKT(name: string): string[] {
    const rangeRef = this.getCell('Names', name);
    if (typeof rangeRef !== 'string') return [];

    const [, sheet, startCell, endSheet, endCell] =
    rangeRef.match(/(?:(\w[\w\s]*)!)?([A-Za-z]+\d+)(?::(?:(\w[\w\s]*)!)?([A-Za-z]+\d+))?/) ?? [];

    const matrix = this.getCells(sheet, startCell, endCell ?? startCell);
    if (!matrix) return [];

    return matrix.flat().map(v => v?.toString?.() ?? '');
  }

  GLEICH(a: (string|number)[] | string | number, b: string | number): boolean[] {
    if (Array.isArray(a)) return a.map(x => x == b); // lockerer Vergleich wie in Excel
    return [a == b];
  }

  /**
   * Multiplies two vectors elementwise.
   */
  MULT(a: (boolean | number)[], b: (boolean | number)[]): number[] {
    return a.map((v, i) => Number(v) * Number(b[i]));
  }
}

// helper methods
const charCodeOfA = 'A'.charCodeAt(0);
const alphabetLength = 'Z'.charCodeAt(0) - charCodeOfA + 1;

/**
 * Converts a column name to a numeric column index.
 */
function columnNameToColNumber(cell: string): number {
  let result = 0;
  cell = cell.replace(/[^A-Z]/g, '');
  for (let i = 0; i < cell.length; i++) {
    result *= alphabetLength;
    result += cell.charCodeAt(i) - charCodeOfA + 1;
  }
  return result;
}

/**
 * Extracts the row number from a cell name.
 */
function cellNameToRowNumber(cell: string): number {
  return parseInt(cell.replace(/[^0-9]/g, ''));
}

/**
 * Converts a numeric column index to an Excel-style column name.
 */
function getExcelColumnName(number: number): string {
  let sb = '';
  let num = number - 1;
  while (num >= 0) {
    sb = String.fromCharCode((num % alphabetLength) + charCodeOfA) + sb;
    num = Math.floor(num / alphabetLength) - 1;
  }
  return sb;
}

/**
 * Converts a row and column index to an Excel-style cell name.
 */
function index2cell(x: number, y: number): string {
  return getExcelColumnName(x) + y;
}

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
