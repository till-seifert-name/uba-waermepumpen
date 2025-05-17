import { CellFunc, DataGrid } from '../data-grid';

/**
 * Base interface for formula overlays
 * Each sheet's formula overlay should implement this interface
 */
export interface FormulaOverlay {
  /**
   * Apply formulas to the data grid
   * @param grid The DataGrid instance to apply formulas to
   */
  applyFormulas(grid: DataGrid): void;
}

/**
 * Constants used across formula overlays
 */
export const roomColumns = ['R', 'S', 'T', 'U', 'V', 'W', 'X', 'Y', 'Z', 'AA', 'AB', 'AC', 'AD', 'AE', 'AF'] as const;