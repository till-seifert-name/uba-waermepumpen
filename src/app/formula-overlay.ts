import {DataGrid} from './data-grid';

/**
 * Formula Overlay - Replace Excel formulas with TypeScript closures
 *
 * This module provides TypeScript closures that implement Excel formula logic for the DataGrid.
 * The implementation follows Excel formula syntax as exactly as possible.
 *
 * Parameters are shortened for closer matching to Excel formulas:
 * s = sheet, c = cell, g = grid
 */

// Define room columns (R to AF for rooms 1-15)
const roomColumns = ['R', 'S', 'T', 'U', 'V', 'W', 'X', 'Y', 'Z', 'AA', 'AB', 'AC', 'AD', 'AE', 'AF'] as const;

/**
 * Apply all formula overlays to the data grid
 * @param grid DataGrid instance to apply formulas to
 */
export function applyFormulaOverlays(grid: DataGrid): void {

  // Add formulas for each room column
  roomColumns.forEach(col => {

    /**
     * Modernization year for walls (e.g., R73, S73, etc.)
     * Original Excel formula:
     * =IF(OR(R$10=Daten!$B$19,R$10=""),IF(IN_build!Q7="Ja",IN_build!$S$7,IN_build!$P$5),IF(OR(R$10<IN_build!$P$5,R$10=Daten!$B$20),IN_build!$P$5,R$10))
     */
    grid.setCell('IN_rooms', `${col}73`, (s, c, g) => {
      return g.WENN(
        g.ODER(
          g.g(s, `${col}10`) === g.g('Daten', 'B19'),
          g.g(s, `${col}10`) === ""
        ),
        g.WENN(
          g.g('IN_build', 'Q7') === "Ja",
          g.g('IN_build', 'S7'),
          g.g('IN_build', 'P5')
        ),
        g.WENN(
          g.ODER(
            g.g(s, `${col}10`) < g.g('IN_build', 'P5'),
            g.g(s, `${col}10`) === g.g('Daten', 'B20')
          ),
          g.g('IN_build', 'P5'),
          g.g(s, `${col}10`)
        )
      );
    });

    /**
     * Wall insulation thickness (e.g., R74, S74, etc.)
     * Original Excel formula:
     * =IF(R73=IN_build!$P$5, 0, _xlfn.XLOOKUP(1,
     *   (INDIRECT("UWert_Mod[Bauteil]")="Außenwand") *
     *   (INDIRECT("UWert_Mod[Modernisierungsjahr]")=R73),
     *   INDIRECT("UWert_Mod[d_ins]")
     * ))
     */
    grid.setCell('IN_rooms', `${col}74`, (s, c, g) => {
      return g.WENN(
        g.g(s, `${col}73`) === g.g('IN_build', 'P5'),
        0,
        g.XVERWEIS(
          1,
          g.MULT(
            g.GLEICH(g.INDIREKT_DB_REF("UWert_Mod", "Bauteil"), "Außenwand"),
            g.GLEICH(g.INDIREKT_DB_REF("UWert_Mod", "Modernisierungsjahr"), g.g(s, `${col}73`))
          ),
          g.INDIREKT_DB_REF("UWert_Mod", "d_ins")
        )
      );
    });
  });

  // Implement Daten sheet formulas for R63 to R86
  // These formulas calculate insulation thickness based on U-values
  for (let i = 63; i <= 86; i++) {
    grid.setCell('Daten', `R${i}`, (s, c, g) => (
      (1 / Number(g.DB_THIS_ROW(c, "UWert_Mod", "U-Wert")) -
       1 / Number(g.DB_THIS_ROW(c, "UWert_Mod", "U_no_ins")))
      * Number(g.INDIREKT_DB_REF("PAR", "lambda_ins_thick")[0])
      * 100
    ));
  }
}
