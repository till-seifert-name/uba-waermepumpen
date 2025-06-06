import {Subject} from "rxjs";

/**
 * Represents the contents of a cell in the DataGrid.
 */
export type CellContent = string | CellFunc | number;
/**
 * A function that can be used as the content of a cell in the DataGrid.
 */
export type CellFunc = (sheet: string, cell: string, grid: DataGrid) => number | string | boolean | null;

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
  n: (sheet: string, cell: string) => number;
  private cellRefStack: string[] = [];

  constructor() {
    this.cells = {};
    this.results = {};

    this.g = this.getCell.bind(this);
    this.n = this.getCellNumeric.bind(this);
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

  /**
   * Method to serialize the results
   * @param pretty Whether to pretty-print the JSON
   */
  serializeResults(pretty: boolean = false): string {
    return JSON.stringify(this.results, null, pretty ? 2 : 0);
  }

  /**
   * Returns an array of all sheet names currently in the grid
   */
  getSheetNames(): string[] {
    return Object.keys(this.cells);
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
   * Method to restore cells from serialized data, optionally filtering by a whitelist
   *
   * @param json - The serialized cell data as a JSON string
   * @param parsedReferences - Optional array of [sheet, cell] pairs to restrict restoration to
   */
  restoreCells(json: string, parsedReferences?: [string, string][]) {
    try {
      const restoredSheets = JSON.parse(json);
      if (!isRestoredSheets(restoredSheets)) {
        throw new Error('Invalid data format for restored cells');
      }

      const restoredCells: Record<string, any> = {};

      for (const sheetName in restoredSheets) {
        this.cells[sheetName] ??= {};
        for (const cell in restoredSheets[sheetName]) {
          // If parsedReferences is provided, only restore cells in the whitelist
          if (parsedReferences) {
            const isInWhitelist = parsedReferences.some(
              ([refSheet, refCell]) => refSheet === sheetName && refCell === cell
            );

            if (!isInWhitelist) {
              continue; // Skip this cell as it's not in the whitelist
            }
          }

          if (restoredSheets[sheetName][cell] !== null) {
            this.setCell(sheetName, cell, restoredSheets[sheetName][cell]);
            restoredCells[`${sheetName}.${cell}`] = restoredSheets[sheetName][cell];
          }
        }
      }
      console.log('Input restored:', restoredCells);
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

  private static readonly MAX_RECURSION_DEPTH = 100;

  private resolveFunction(sheet: string, cell: string, func: CellFunc): number {
    this.results[sheet] ??= {};

    const cellRef = `${sheet}!${cell}`;

    // Check for maximum recursion depth
    if (this.cellRefStack.length >= DataGrid.MAX_RECURSION_DEPTH) {
      console.error(`Maximum recursion depth exceeded at ${cellRef}`);
      return NaN;
    }

    // Check for circular dependencies using the stack
    if (this.cellRefStack.includes(cellRef)) {
      const cycleStart = this.cellRefStack.indexOf(cellRef);
      const cycle = [...this.cellRefStack.slice(cycleStart), cellRef];
      console.error(`Circular dependency detected: ${cycle.join(' → ')}`);
      return NaN; // Don't clear stack - let normal cleanup handle it
    }

    // Add current cell to the reference stack
    this.cellRefStack.push(cellRef);

    try {
      const result = func(sheet, cell, this);
      this.results[sheet][cell] = result;

      if (Number.isNaN(result)) {
        console.debug(`Error in formula at ${cellRef}: Result is NaN.`);
        console.debug(`NaN propagation path: ${this.cellRefStack.join(' → ')}`);

        // If we're the first cell to evaluate to NaN in this chain, log it differently
        if (!this.cellRefStack.slice(0, -1).some(ref => {
          const [refSheet, refCell] = ref.split('!');
          return Number.isNaN(this.results[refSheet]?.[refCell]);
        })) {
          console.warn(`NaN ORIGIN detected at ${cellRef} - This is the first cell in the chain to return NaN`);
        }
      }

      return this.results[sheet][cell];
    } catch (error) {
      console.error(`Error evaluating formula at ${cellRef}: ${error instanceof Error ? error.message : String(error)}`);
      console.error(`Cell reference stack: ${this.cellRefStack.join(' → ')}`);
      this.results[sheet][cell] = NaN;
      return NaN;
    } finally {
      // Always remove the current cell from stack in finally block
      this.cellRefStack.pop();

      // Clear stack only if we're back to the root level
      if (this.cellRefStack.length === 0) {
        this.cellRefStack = [];
      }
    }
  }

  /**
   * Gets the content of the specified cell in the specified sheet as a Number or NaN if it is not
   */
  getCellNumeric(sheet: string, cell: string): number {
    const value = this.getCell(sheet, cell);
    if (value === "" || value === undefined || value === null) {
      return 0;
    } else if (typeof value === 'number' || typeof value === 'bigint') {
      return value;
    } else if (typeof value === 'string') {
      const parsedValue = parseFloat(value);
      return isNaN(parsedValue) ? NaN : parsedValue;
    }
    return NaN;
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
   * Or a vector.
   */
  SUM(sheet: string, cellsOrValues: (string | number)[]): number {
    const values = cellsOrValues.map(item => {
      if (typeof item === 'string') {
        return this.n(sheet, item);
      }
      return item;
    });

    return values.reduce((sum, value) => sum + value, 0);
  }

  /**
   * Calculates the average of the specified cells in the specified sheet.
   * Or a vector.
   */
  AVERAGE(sheet: string, cellsOrValues: (string | number)[]): number {
    const values = cellsOrValues.map(item => {
      if (typeof item === 'string') {
        return this.n(sheet, item);
      }
      return item;
    }).filter(v => !isNaN(v) && typeof v === 'number');

    if (values.length === 0) return 0;
    return values.reduce((sum, value) => sum + value, 0) / values.length;
  }

  /**
   * Deutsche Alias für AVERAGE
   */
  DURCHSCHNITT(sheet: string, cellsOrValues: (string | number)[]): number {
    return this.AVERAGE(sheet, cellsOrValues);
  }

  /**
   * Converts a range string like "A1:A10" or "Sheet!B2:B5" into a flat array of values.
   */
  resolveRange(sheet: string, input: (string | number)[] | string): (string | number)[] {
    if (Array.isArray(input)) return input;

    const match = input.match(/(?:(\w[\w\s]*)!)?\$?([A-Za-z]+\$?\d+):\$?([A-Za-z]+\$?\d+)/);
    if (!match) {
      console.warn(`Input does not match expected range format: ${input}`);
      return [];
    }

    const [, maybeSheet, from, to] = match;
    const targetSheet = maybeSheet || sheet;

    const matrix = this.getCells(targetSheet, from, to);
    return matrix.flat();
  }

  /**
   * Summe aller Werte aus sumRange, deren entsprechendes Element in criteriaRange dem Kriterium entspricht.
   * Unterstützt auch Excel-Range-Notation als String.
   */
  SUMIF(
    criteriaRange: string | (string | number)[],
    criteria: string | number,
    sumRange: string | (string | number)[],
    sheet: string = ''
  ): number {
    const criteriaArray = this.resolveRange(sheet, criteriaRange);

    // Wenn sumRange ein Array ist, alles normal behandeln
    if (Array.isArray(sumRange)) {
      if (criteriaArray.length !== sumRange.length) {
        throw new Error("SUMIF: Mismatched array lengths");
      }

      let sum = 0;
      for (let i = 0; i < criteriaArray.length; i++) {
        if (criteriaArray[i] == criteria) {
          const val = Number(sumRange[i]);
          if (!isNaN(val)) sum += val;
        }
      }
      return sum;
    }

    // sumRange ist ein String (Excel-Notation)
    const match = (sumRange as string).match(/(?:(\w[\w\s]*)!)?([A-Za-z]+\d+):([A-Za-z]+\d+)/);
    if (!match) throw new Error("SUMIF: Invalid sumRange");

    const [, maybeSheet, from, to] = match;
    const sumSheet = maybeSheet || sheet;

    const fromX = columnNameToColNumber(from);
    const fromY = cellNameToRowNumber(from);
    const toX = columnNameToColNumber(to);
    const toY = cellNameToRowNumber(to);

    const width = toX - fromX + 1;
    const height = toY - fromY + 1;

    if (criteriaArray.length !== width * height) {
      throw new Error(`SUMIF: criteriaRange length (${criteriaArray.length}, ${criteriaRange}) doesn't match sumRange (${sumRange}) shape (expected ${width * height} based on range from ${from} to ${to})`);
    }

    let sum = 0;
    let index = 0;
    for (let y = fromY; y <= toY; y++) {
      for (let x = fromX; x <= toX; x++) {
        if (criteriaArray[index] == criteria) {
          const cell = index2cell(x, y);
          const val = Number(this.getCell(sumSheet, cell));
          if (!isNaN(val)) sum += val;
        }
        index++;
      }
    }

    return sum;
  }

  /** Deutsche Alias-Version */
  SUMMEWENN(
    kriterienbereich: (string | number)[] | string,
    kriterium: string | number,
    summenbereich: (number | string)[] | string,
    sheet: string = ''
  ): number {
    return this.SUMIF(kriterienbereich, kriterium, summenbereich, sheet);
  }

  SUMMEWENNS(sumRange: (string | number)[], ...pairs: ((string | number)[] | string | number)[]): number {
    if (pairs.length % 2 !== 0) throw new Error("SUMMEWENNS: must receive pairs of criteriaRange and criteria");

    const criteriaRanges: (string | number)[][] = [];
    const criteriaValues: (string | number)[] = [];

    for (let i = 0; i < pairs.length; i += 2) {
      const range = pairs[i];
      const crit = pairs[i + 1];

      if (!Array.isArray(range)) throw new Error("SUMMEWENNS: criteriaRange must be array");
      criteriaRanges.push(range);

      if (Array.isArray(crit)) {
        if (crit.length !== 1) throw new Error("SUMMEWENNS: criteria must be scalar or single-element array");
        criteriaValues.push(crit[0]);
      } else {
        criteriaValues.push(crit);
      }
    }

    let total = 0;
    for (let i = 0; i < sumRange.length; i++) {
      const match = criteriaRanges.every((range, idx) => range[i] == criteriaValues[idx]);
      if (match) {
        const v = Number(sumRange[i]);
        if (!isNaN(v)) total += v;
      }
    }

    return total;
  }


  /**
   * Performs aggregate functions over a range, similar to Excel's AGGREGAT function.
   * Function numbers based on Excel:
   * 1 = AVERAGE, 2 = COUNT, 3 = COUNTA, 4 = MAX, 5 = MIN, 6 = PRODUCT,
   * 7 = STDEV.S, 8 = STDEV.P, 9 = SUM, 10 = VAR.S, 11 = VAR.P,
   * 12 = MEDIAN, 13 = MODE.SNGL, 14 = LARGE, 15 = SMALL,
   * 16 = PERCENTILE.INC, 17 = QUARTILE.INC, 18 = PERCENTILE.EXC, 19 = QUARTILE.EXC
   */
  AGGREGATE(functionNum: number, errors: number = 6, range: (number | string)[] | string, sheet: string = '', param?: number): number {

    // build sanitized values based on errors mask
    const values: number[] = [];
    const raw = this.resolveRange(sheet, range);
    for (let v of raw) {
      const isEmpty = v === '' || v == null;
      const num = typeof v === 'number' ? v : Number(v);
      const isError = isNaN(num);
      if ((errors & 4) && isEmpty) continue;
      if ((errors & 2) && isError) continue;
      if (isError) {
        // Excel returns error if error not ignored
        return NaN;
      }
      values.push(num);
    }

    switch (functionNum) {
      case 1:
        return values.length ? values.reduce((a, b) => a + b, 0) / values.length : 0;
      case 2:
        return values.length;
      case 3:
        // COUNTA counts non-empty raw
        return raw.filter(v => !(v === '' || v == null)).length;
      case 4:
        return Math.max(...values);
      case 5:
        return Math.min(...values);
      case 6:
        return values.reduce((a, b) => a * b, 1);
      case 7: // STDEV.S
        const mean7 = values.reduce((a, b) => a + b, 0) / values.length;
        return Math.sqrt(values.reduce((acc, v) => acc + (v - mean7) ** 2, 0) / (values.length - 1));
      case 8: // STDEV.P
        const mean8 = values.reduce((a, b) => a + b, 0) / values.length;
        return Math.sqrt(values.reduce((acc, v) => acc + (v - mean8) ** 2, 0) / values.length);
      case 9:
        return values.reduce((a, b) => a + b, 0);
      case 10: // VAR.S
        const mean10 = values.reduce((a, b) => a + b, 0) / values.length;
        return values.reduce((acc, v) => acc + (v - mean10) ** 2, 0) / (values.length - 1);
      case 11: // VAR.P
        const mean11 = values.reduce((a, b) => a + b, 0) / values.length;
        return values.reduce((acc, v) => acc + (v - mean11) ** 2, 0) / values.length;
      case 12: // MEDIAN
        const sorted = [...values].sort((a, b) => a - b);
        const mid = Math.floor(sorted.length / 2);
        return sorted.length % 2 === 0 ? (sorted[mid - 1] + sorted[mid]) / 2 : sorted[mid];
      case 13: // MODE.SNGL
        const freq: Record<number, number> = {};
        values.forEach(v => freq[v] = (freq[v] || 0) + 1);
        return Object.entries(freq).reduce((a, b) => b[1] > a[1] ? b : a)[0] as unknown as number;
      case 14: // LARGE
        if (!param) throw new Error("AGGREGATE 14 requires a rank parameter");
        return [...values].sort((a, b) => b - a)[param - 1] ?? NaN;
      case 15: // SMALL
        if (!param) throw new Error("AGGREGATE 15 requires a rank parameter");
        return [...values].sort((a, b) => a - b)[param - 1] ?? NaN;
      case 16: // PERCENTILE.INC
      case 17: // QUARTILE.INC
        if (param == null) throw new Error("AGGREGATE 16/17 requires a percentile");
        const sortedInc = [...values].sort((a, b) => a - b);
        const pInc = functionNum === 16 ? param : param / 4;
        const idxInc = (sortedInc.length - 1) * pInc;
        const lowerInc = Math.floor(idxInc);
        const upperInc = Math.ceil(idxInc);
        return lowerInc === upperInc
          ? sortedInc[lowerInc]
          : sortedInc[lowerInc] + (sortedInc[upperInc] - sortedInc[lowerInc]) * (idxInc - lowerInc);
      case 18: // PERCENTILE.EXC
      case 19: // QUARTILE.EXC
        if (param == null) throw new Error("AGGREGATE 18/19 requires a percentile");
        const sortedExc = [...values].sort((a, b) => a - b);
        const n = sortedExc.length;
        const pExc = functionNum === 18 ? param : param / 4;
        const idxExc = pExc * (n + 1) - 1;
        const lowerExc = Math.floor(idxExc);
        const upperExc = Math.ceil(idxExc);
        return lowerExc < 0 || upperExc >= n
          ? NaN
          : sortedExc[lowerExc] + (sortedExc[upperExc] - sortedExc[lowerExc]) * (idxExc - lowerExc);
      default:
        throw new Error(`AGGREGATE: Unsupported function number ${functionNum}`);
    }
  }

  // Deutsche Alias
  AGGREGAT(...args: Parameters<DataGrid['AGGREGATE']>): number {
    return this.AGGREGATE(...args);
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

  SVERWEIS(sheet: string, value: string | number | null, cell1: string, cell2: string, col: number, approx: boolean = false): string | number | null {
    const x = this.COLUMN(cell1);
    const yStart = this.ROW(cell1);
    const yEnd = this.ROW(cell2);

    let result: string | number | null = null;
    let bestMatchValue: string | number | null = null;

    for (let y = yStart; y <= yEnd; y++) {
      const lookupVal = this.getCell(sheet, index2cell(x, y));
      const returnVal = this.getCell(sheet, index2cell(x + col - 1, y));

      if (!approx) {
        if (lookupVal == value) return returnVal;
      } else {
        if (
          typeof value === 'number' &&
          typeof lookupVal === 'number' &&
          lookupVal <= value &&
          (bestMatchValue === null || lookupVal > bestMatchValue)
        ) {
          bestMatchValue = lookupVal;
          result = returnVal;
        }
      }
    }

    return result;
  }

  WVERWEIS(
    sheet: string,
    value: string | number | null,
    cell1: string,
    cell2: string,
    row: number,
    approx: boolean = false
  ): string | number | null {
    const y = this.ROW(cell1);
    const xStart = this.COLUMN(cell1);
    const xEnd = this.COLUMN(cell2);

    let result: string | number | null = null;
    let bestMatchValue: string | number | null = null;

    for (let x = xStart; x <= xEnd; x++) {
      const lookupVal = this.getCell(sheet, index2cell(x, y));
      const returnVal = this.getCell(sheet, index2cell(x, y + row - 1));

      if (!approx) {
        if (lookupVal == value) return returnVal;
      } else {
        if (
          typeof value === 'number' &&
          typeof lookupVal === 'number' &&
          lookupVal <= value &&
          (bestMatchValue === null || lookupVal > bestMatchValue)
        ) {
          bestMatchValue = lookupVal;
          result = returnVal;
        }
      }
    }

    return result;
  }

  HLOOKUP = this.WVERWEIS;
  VLOOKUP = this.SVERWEIS;


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
  INDIREKT_DB_REF(name: string, column: string = ""): (string | number)[] {
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

    let colIndex: number;

    if (column === "") {
      // akzeptiere "" nur, wenn es exakt eine Spalte gibt
      if (headerRow.length !== 1) {
        console.warn('Column name omitted and DB range wider than 1');
        return [];
      }
      colIndex = 0;
    } else {
      colIndex = headerRow.indexOf(column);
      if (colIndex === -1) return [];
    }

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

  WENN<T extends number | string | boolean | null, U extends number | string | boolean | null>(
    cond: boolean, thenVal: T, elseVal: U): T | U {
    return cond ? thenVal : elseVal;
  }

  ODER(...conditions: boolean[]) {
    return conditions.some(cond => cond);
  }

  UND(...conditions: boolean[]) {
    return conditions.every(cond => cond);
  }

  WAHR() {
    return true;
  }
  FALSCH() {
    return false;
  }

  /**
   * Returns the maximum value in a list of values.
   * Implementation of Excel's MAX function.
   */
  MAX(...values: (number | number[])[]): number {
    const flatValues = values.flat().filter(v => typeof v === 'number' && !isNaN(v));
    return Math.max(...flatValues);
  }

  /**
   * Returns the kth largest value in a list of values.
   * Implementation of Excel's LARGE function.
   */
  LARGE(values: number[] | number[][], k: number): number {
    const flatValues = Array.isArray(values[0]) ? (values as number[][]).flat() : values as number[];
    const sortedValues = [...flatValues].sort((a, b) => b - a); // Sort in descending order
    return sortedValues[k - 1] || NaN; // k is 1-indexed in Excel
  }

  /**
   * Returns the kth smallest value in a list of values.
   * Implementation of Excel's SMALL function.
   */
  SMALL(values: number[] | number[][], k: number): number {
    const flatValues = Array.isArray(values[0]) ? (values as number[][]).flat() : values as number[];
    const sortedValues = [...flatValues].sort((a, b) => a - b); // Sort in ascending order
    return sortedValues[k - 1] || NaN; // k is 1-indexed in Excel
  }

  /**
   * Formats a number as text according to a specified format.
   * Implementation of Excel's TEXT function.
   * @param value The number to format
   * @param format The formatting string
   * @returns The formatted number as a string
   */
  TEXT(value: number, format: string): string {
    // Handle basic numeric formats
    if (format === "0") {
      return Math.round(value).toString();
    }

    if (format === "0.0") {
      return value.toFixed(1);
    }

    if (format === "0.00") {
      return value.toFixed(2);
    }

    // More complex formats can be added as needed

    // Default case
    return value.toString();
  }

  /**
   * Returns the last n characters of a string.
   */
  RECHTS(value: string | number, n: number): string {
    return value.toString().slice(-n);
  }

  /**
   * Returns the first n characters of a string.
   */
  LINKS(value: string|number, n: number): string {
    return value.toString().slice(0, n);
  }

  /**
   * Returns the natural logarithm of a number.
   * Implementation of Excel's LN function.
   */
  LN(value: number): number {
    return Math.log(value);
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
   * Returns the minimum value in a list of values.
   * Implementation of Excel's MIN function.
   */
  MIN(...values: (number | number[])[]): number {
    const flatValues = values.flat().filter(v => typeof v === 'number' && !isNaN(v));
    return Math.min(...flatValues);
  }

  /**
   * Returns the position (index) of a specified value in an array.
   * Implementation of Excel's XMATCH function.
   * @param lookupValue The value to look for
   * @param lookupArray The range to search
   * @param matchType 0 = exact match, -1 = exact or next smaller, 1 = exact or next larger
   * @param searchType 1 = first to last, -1 = last to first, 2 = binary search (requires sorted data)
   * @returns The position (1-based) of the matched value or #N/A if not found
   */
  XMATCH(
    lookupValue: string | number,
    lookupArray: (string | number)[],
    matchType: number = 0,
    searchType: number = 1
  ): number {
    // Convert matchType to our enum values
    const matchMode = matchType === 0 ? 'exact' :
                     matchType < 0 ? 'exactOrNextSmaller' : 'exactOrNextLarger';

    // Convert searchType to our enum values
    const searchMode = searchType >= 0 ? 'first' : 'last';

    const indices = [...lookupArray.keys()];
    if (searchMode === 'last') indices.reverse();

    let bestIndex: number | null = null;
    let bestDistance = Number.MAX_VALUE;

    for (const i of indices) {
      const currentValue = lookupArray[i];

      // Exact match case
      if (currentValue == lookupValue) {
        return i + 1; // Excel uses 1-based indexing
      }

      // Next smaller/larger match cases
      if (typeof lookupValue === 'number' && typeof currentValue === 'number') {
        if (matchMode === 'exactOrNextSmaller' && currentValue < lookupValue) {
          const distance = lookupValue - currentValue;
          if (distance < bestDistance) {
            bestDistance = distance;
            bestIndex = i;
          }
        } else if (matchMode === 'exactOrNextLarger' && currentValue > lookupValue) {
          const distance = currentValue - lookupValue;
          if (distance < bestDistance) {
            bestDistance = distance;
            bestIndex = i;
          }
        }
      }
    }

    return bestIndex !== null ? bestIndex + 1 : 0; // Excel uses 1-based indexing, 0 for not found
  }

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

  /**
   * Returns element-wise equality of two arrays or values.
   */
  GLEICH(a: (string | number)[] | string | number, b: (string | number)[] | string | number): boolean[] {
    if (!Array.isArray(a)) a = [a];
    if (!Array.isArray(b)) b = [b];
    const len = Math.max(a.length, b.length);
    return Array.from({length: len}, (_, i) => a[i % a.length] == b[i % b.length]);
  }

  /**
   * Multiplies two vectors elementwise.
   */
  MULT(a: (boolean | number)[], b: (boolean | number)[]): number[] {
    return a.map((v, i) => Number(v) * Number(b[i]));
  }

  /**
   * Element-wise multiplication of boolean arrays (true = 1, false = 0).
   */
  MULTIPLY_ARRAYS(...args: (boolean[] | number[])[]): number[] {
    const [first, ...rest] = args;

    return first.map((val, i) => {
      let product = Number(val);
      for (const arr of rest) {
        product *= Number(arr[i % arr.length]);
      }
      return product;
    });
  }

  DIVIDE_ARRAY(
    numer: (number | string)[],
    denom: number[]
  ): number[] {
    return numer.map((v, i) => {
      const n = typeof v === 'number' ? v : Number(v);
      const d = denom[i] || 0;
      return d !== 0 && !isNaN(n) ? n / d : NaN;
    });
  }

  /**
   * Resolves a range string into a flat array.
   */
  RANGE(range: string, sheet: string): (number | string)[] {
    const [sheetName, coords] = range.includes('!') ? range.split('!') : [sheet, range];
    const [start, end] = coords.split(':');
    return this.getCells(sheetName, start, end).flat();
  }

  MIN_INDEX(values: number[]): number {
    let min = Infinity;
    let idx = -1;
    for (let i = 0; i < values.length; i++) {
      if (values[i] < min) {
        min = values[i];
        idx = i;
      }
    }
    return idx;
  }

  ABS_ARRAY(values: number[]): number[] {
    return values.map(v => Math.abs(v));
  }

  WENN_ARRAY(condition: boolean[], ifTrue: number[], ifFalse: number[] = []): number[] {
    return condition.map((c, i) => c ? ifTrue[i] : (ifFalse[i] ?? 0));
  }

  /**
   * Excel CHOOSE function - returns a value from a list based on index position
   */
  CHOOSE(indexNum: number, ...values: any[]): any {
    if (indexNum < 1 || indexNum > values.length || !Number.isInteger(indexNum)) {
      return null;
    }
    return values[indexNum - 1]; // Excel uses 1-based indexing
  }

  /**
   * Excel FILTER function - filters an array based on a boolean criteria array
   */
  FILTER(array: any[], criteria: boolean[]): any[] {
    return array.filter((_, index) => criteria[index]);
  }

  /**
   * Excel SUMPRODUCT function - multiplies corresponding components and sums the products
   */
  SUMPRODUCT(...arrays: (number[] | boolean[])[]): number {
    if (arrays.length === 0) return 0;

    const length = Math.min(...arrays.map(arr => arr.length));
    let sum = 0;

    for (let i = 0; i < length; i++) {
      let product = 1;
      for (const array of arrays) {
        const value = typeof array[i] === 'boolean' ? (array[i] ? 1 : 0) : Number(array[i]);
        product *= isNaN(value) ? 0 : value;
      }
      sum += product;
    }

    return sum;
  }

  /**
   * Excel COUNTIF function - counts cells that meet a criteria
   */
  COUNTIF(sheet: string, range: string, criteria: string | number |boolean): number {
    const cells = this.getCellRange(sheet, range);
    let count = 0;

    for (const cell of cells) {
      const value = typeof cell === 'number' ? cell : Number(cell);
      if (this.matchesCriteria(value, criteria)) {
        count++;
      }
    }

    return count;
  }

  /**
   * Excel COUNTIFS function - counts cells that meet multiple criteria
   */
  COUNTIFS(sheet: string, ...args: (string | number)[]): number {
    // Args come in pairs: range1, criteria1, range2, criteria2, etc.
    if (args.length % 2 !== 0) return 0;

    const ranges: any[][] = [];
    const criterias: (string | number)[] = [];

    for (let i = 0; i < args.length; i += 2) {
      ranges.push(this.getCellRange(sheet,  args[i] as string));
      criterias.push(args[i + 1]);
    }

    if (ranges.length === 0) return 0;

    const length = ranges[0].length;
    let count = 0;

    for (let i = 0; i < length; i++) {
      let allMatch = true;
      for (let j = 0; j < ranges.length; j++) {
        const value = typeof ranges[j][i] === 'number' ? ranges[j][i] : Number(ranges[j][i]);
        if (!this.matchesCriteria(value, criterias[j])) {
          allMatch = false;
          break;
        }
      }
      if (allMatch) count++;
    }

    return count;
  }

  /**
   * Helper function to check if a value matches Excel-like criteria (e.g., used in COUNTIF)
   */
  private matchesCriteria(value: number | boolean, criteria: string | number | boolean): boolean {
    if (typeof criteria === 'number') {
      return value === criteria;
    }

    if (typeof criteria === 'boolean') {
      return value == criteria; // loose equality to allow 1 == true
    }

    const criteriaStr = criteria.toString().trim();

    // Try to parse value as number for numeric comparisons
    const numericValue = Number(value);
    const isNumeric = !isNaN(numericValue);

    if (criteriaStr.startsWith('>=')) {
      const comp = Number(criteriaStr.substring(2));
      return isNumeric && numericValue >= comp;
    } else if (criteriaStr.startsWith('<=')) {
      const comp = Number(criteriaStr.substring(2));
      return isNumeric && numericValue <= comp;
    } else if (criteriaStr.startsWith('>')) {
      const comp = Number(criteriaStr.substring(1));
      return isNumeric && numericValue > comp;
    } else if (criteriaStr.startsWith('<')) {
      const comp = Number(criteriaStr.substring(1));
      return isNumeric && numericValue < comp;
    } else if (criteriaStr.startsWith('=')) {
      const compStr = criteriaStr.substring(1);
      // Match either numeric or string equality
      if (isNumeric && !isNaN(Number(compStr))) {
        return numericValue === Number(compStr);
      }
      return value.toString() === compStr;
    } else {
      // Default: equality comparison as in COUNTIF without an operator
      if (isNumeric && !isNaN(Number(criteriaStr))) {
        return numericValue === Number(criteriaStr);
      }
      return value.toString() === criteriaStr;
    }
  }


  /**
   * Helper function to get cell range values
   */
  private getCellRange(sheet: string, range: string): any[] {
    const [start, end] = range.split(':');
    if (!end) {
      // Single cell
      return [this.getCell(sheet, start)];
    }

    const startCol = columnNameToColNumber(start);
    const startRow = cellNameToRowNumber(start);
    const endCol = columnNameToColNumber(end);
    const endRow = cellNameToRowNumber(end);

    const values: any[] = [];

    for (let row = startRow; row <= endRow; row++) {
      for (let col = startCol; col <= endCol; col++) {
        values.push(this.getCell(sheet, index2cell(col, row)));
      }
    }

    return values;
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
