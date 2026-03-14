import { DataGrid } from '../data-grid';
import { FormulaOverlay } from './base-overlay';

/**
 * Daten sheet formula overlay
 * Contains formula implementations for the Daten sheet
 */
export class DatenOverlay implements FormulaOverlay {
  /**
   * Apply Daten formulas to the data grid
   * @param grid The DataGrid instance to apply formulas to
   */
  applyFormulas(grid: DataGrid): void {
    // Implement Daten sheet formulas for R63 to R86
    // Formula: (1/UWert_Mod[[#This Row],[U-Wert]]-1/UWert_Mod[[#This Row],[U_no_ins]])*INDEX(PAR[lambda_ins_thick],1)*100
    for (let i = 63; i <= 86; i++) {
      grid.setCell('Daten', `R${i}`, (s, c, g) => 
        (1 / Number(g.DB_THIS_ROW(c, "UWert_Mod", "U-Wert")) -
         1 / Number(g.DB_THIS_ROW(c, "UWert_Mod", "U_no_ins")))
        * Number(g.INDIREKT_DB_REF("PAR", "lambda_ins_thick")[0])
        * 100
      );
    }
  }
}