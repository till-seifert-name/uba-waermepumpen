import { DataGrid } from '../data-grid';
import { FormulaOverlay, roomColumns } from './base-overlay';

/**
 * IN_rooms sheet formula overlay
 * Contains formula implementations for the IN_rooms sheet
 */
export class InRoomsOverlay implements FormulaOverlay {
  /**
   * Apply IN_rooms formulas to the data grid
   * @param grid The DataGrid instance to apply formulas to
   */
  applyFormulas(grid: DataGrid): void {
    // Add formulas for each room column
    roomColumns.forEach(col => {
      /**
       * Modernization year for walls (e.g., R73, S73, etc.)
       * Original Excel formula:
       * =IF(OR(R$10=Daten!$B$19,R$10=""),IF(IN_build!Q7="Ja",IN_build!$S$7,IN_build!$P$5),IF(OR(R$10<IN_build!$P$5,R$10=Daten!$B$20),IN_build!$P$5,R$10))
       */
      grid.setCell('IN_rooms', `${col}73`, (s, c, g) =>
        g.WENN(
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
        )
      );

      /**
       * Wall insulation thickness (e.g., R74, S74, etc.)
       * Original Excel formula:
       * =IF(R73=IN_build!$P$5, 0, _xlfn.XLOOKUP(1,
       *   (INDIRECT("UWert_Mod[Bauteil]")="Außenwand") *
       *   (INDIRECT("UWert_Mod[Modernisierungsjahr]")=R73),
       *   INDIRECT("UWert_Mod[d_ins]")
       * ))
       */
      grid.setCell('IN_rooms', `${col}74`, (s, c, g) =>
        g.WENN(
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
        )
      );

      /**
       * Wall insulation override (e.g., R75, S75, etc.)
       * Original Excel formula:
       * =IF(R$11<=0,R$74,R$11)
       */
      grid.setCell('IN_rooms', `${col}75`, (s, c, g) =>
        g.WENN(
          g.n(s, `${col}11`) <= 0,
          g.g(s, `${col}74`),
          g.g(s, `${col}11`)
        )
      );

      /**
       * Window type 1 modernization year (e.g., R76, S76, etc.)
       * Original Excel formula:
       * =IF(OR(R$15=Daten!$E$17,R$15=""),IN_build!$S$8,IF(OR(R$15=Daten!$E$18,R$15<IN_build!$P$5),IN_build!$P$5,R$15))
       */
      grid.setCell('IN_rooms', `${col}76`, (s, c, g) =>
        g.WENN(
          g.ODER(
            g.g(s, `${col}15`) === g.g('Daten', 'E17'),
            g.g(s, `${col}15`) === ""
          ),
          g.g('IN_build', 'S8'),
          g.WENN(
            g.ODER(
              g.g(s, `${col}15`) === g.g('Daten', 'E18'),
              g.g(s, `${col}15`) < g.g('IN_build', 'P5')
            ),
            g.g('IN_build', 'P5'),
            g.g(s, `${col}15`)
          )
        )
      );

      /**
       * Window type 2 modernization year (e.g., R77, S77, etc.)
       * Original Excel formula:
       * =IF(OR(R$19=Daten!$E$17,R$19=""),IN_build!$S$8,IF(OR(R$19=Daten!$E$18,R$19<IN_build!$P$5),IN_build!$P$5,R$19))
       */
      grid.setCell('IN_rooms', `${col}77`, (s, c, g) =>
        g.WENN(
          g.ODER(
            g.g(s, `${col}19`) === g.g('Daten', 'E17'),
            g.g(s, `${col}19`) === ""
          ),
          g.g('IN_build', 'S8'),
          g.WENN(
            g.ODER(
              g.g(s, `${col}19`) === g.g('Daten', 'E18'),
              g.g(s, `${col}19`) < g.g('IN_build', 'P5')
            ),
            g.g('IN_build', 'P5'),
            g.g(s, `${col}19`)
          )
        )
      );

      /**
       * Window type 3 modernization year (e.g., R78, S78, etc.)
       * Original Excel formula:
       * =IF(OR(R$23=Daten!$E$17,R$23=""),IN_build!$S$8,IF(OR(R$23=Daten!$E$18,R$23<IN_build!$P$5),IN_build!$P$5,R$23))
       */
      grid.setCell('IN_rooms', `${col}78`, (s, c, g) =>
        g.WENN(
          g.ODER(
            g.g(s, `${col}23`) === g.g('Daten', 'E17'),
            g.g(s, `${col}23`) === ""
          ),
          g.g('IN_build', 'S8'),
          g.WENN(
            g.ODER(
              g.g(s, `${col}23`) === g.g('Daten', 'E18'),
              g.g(s, `${col}23`) < g.g('IN_build', 'P5')
            ),
            g.g('IN_build', 'P5'),
            g.g(s, `${col}23`)
          )
        )
      );

      /**
       * Roof window type 1 modernization year (e.g., R79, S79, etc.)
       * Original Excel formula:
       * =IF(OR(R$43=Daten!$E$17,R$43=""),IF(IN_build!$S$8>=IN_build!$S$9,IN_build!$S$8,IN_build!$S$9),IF(OR(R$43=Daten!$E$18,R$43<IN_build!$P$5),IN_build!$P$5,R$43))
       */
      grid.setCell('IN_rooms', `${col}79`, (s, c, g) =>
        g.WENN(
          g.ODER(
            g.g(s, `${col}43`) === g.g('Daten', 'E17'),
            g.g(s, `${col}43`) === ""
          ),
          g.WENN(
            g.g('IN_build', 'S8') >= g.g('IN_build', 'S9'),
            g.g('IN_build', 'S8'),
            g.g('IN_build', 'S9')
          ),
          g.WENN(
            g.ODER(
              g.g(s, `${col}43`) === g.g('Daten', 'E18'),
              g.g(s, `${col}43`) < g.g('IN_build', 'P5')
            ),
            g.g('IN_build', 'P5'),
            g.g(s, `${col}43`)
          )
        )
      );

      /**
       * Roof window type 2 modernization year (e.g., R80, S80, etc.)
       * Original Excel formula:
       * =IF(OR(R$47=Daten!$E$17,R$47=""),IF(IN_build!$S$8>=IN_build!$S$9,IN_build!$S$8,IN_build!$S$9),IF(OR(R$47=Daten!$E$18,R$47<IN_build!$P$5),IN_build!$P$5,R$47))
       */
      grid.setCell('IN_rooms', `${col}80`, (s, c, g) =>
        g.WENN(
          g.ODER(
            g.g(s, `${col}47`) === g.g('Daten', 'E17'),
            g.g(s, `${col}47`) === ""
          ),
          g.WENN(
            g.g('IN_build', 'S8') >= g.g('IN_build', 'S9'),
            g.g('IN_build', 'S8'),
            g.g('IN_build', 'S9')
          ),
          g.WENN(
            g.ODER(
              g.g(s, `${col}47`) === g.g('Daten', 'E18'),
              g.g(s, `${col}47`) < g.g('IN_build', 'P5')
            ),
            g.g('IN_build', 'P5'),
            g.g(s, `${col}47`)
          )
        )
      );
    });
  }
}
