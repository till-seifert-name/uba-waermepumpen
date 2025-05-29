import { DataGrid } from '../data-grid';


// Common column arrays for rooms 1-15
export const IN_ROOM_COLS = ['R', 'S', 'T', 'U', 'V', 'W', 'X', 'Y', 'Z', 'AA', 'AB', 'AC', 'AD', 'AE', 'AF'] as const;
export const CLC_LOAD_COLS = ['I', 'J', 'K', 'L', 'M', 'N', 'O', 'P', 'Q', 'R', 'S', 'T', 'U', 'V', 'W'] as const;
export const CLC_BUILD_COLS = ['G', 'H', 'I', 'J', 'K', 'L', 'M', 'N', 'O', 'P', 'Q', 'R', 'S', 'T', 'U'] as const;
export const CLC_POWER_COLS = ['G', 'H', 'I', 'J', 'K', 'L', 'M', 'N', 'O', 'P', 'Q', 'R', 'S', 'T', 'U'] as const;
export const OUT_ROOMS_COLS = ['H', 'I', 'J', 'K', 'L', 'M', 'N', 'O', 'P', 'Q', 'R', 'S', 'T', 'U', 'V'] as const;

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
