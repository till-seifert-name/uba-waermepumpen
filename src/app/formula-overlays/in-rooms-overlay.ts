import {DataGrid} from '../data-grid';
import {FormulaOverlay, IN_ROOM_COLS} from './base-overlay';

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
    IN_ROOM_COLS.forEach(col => {
      /**
       * Row 3: Empty string
       * Excel:
       * =""
       */
      grid.setCell('IN_rooms', `${col}3`, (s, c, g) => "");

      /**
       * Row 5: Copy from column Q
       * Excel:
       * =$Q$5
       */
      grid.setCell('IN_rooms', `${col}5`, (s, c, g) =>
        g.g(s, 'Q5')
      );

      /**
       * Row 6: Copy from column Q
       * Excel:
       * =$Q$6
       */
      grid.setCell('IN_rooms', `${col}6`, (s, c, g) =>
        g.g(s, 'Q6')
      );

      /**
       * Row 7: Copy from column Q
       * Excel:
       * =$Q7
       */
      grid.setCell('IN_rooms', `${col}7`, (s, c, g) =>
        g.g(s, 'Q7')
      );

      /**
       * Row 8: Copy from column Q
       * Excel:
       * =$Q8
       */
      grid.setCell('IN_rooms', `${col}8`, (s, c, g) =>
        g.g(s, 'Q8')
      );

      /**
       * Row 12: Copy from column Q
       * Excel:
       * =$Q12
       */
      grid.setCell('IN_rooms', `${col}12`, (s, c, g) =>
        g.g(s, 'Q12')
      );

      /**
       * Row 16: Copy from column Q
       * Excel:
       * =$Q16
       */
      grid.setCell('IN_rooms', `${col}16`, (s, c, g) =>
        g.g(s, 'Q16')
      );

      /**
       * Row 20: Copy from column Q
       * Excel:
       * =$Q20
       */
      grid.setCell('IN_rooms', `${col}20`, (s, c, g) =>
        g.g(s, 'Q20')
      );

      /**
       * Row 24: Copy from column Q
       * Excel:
       * =$Q24
       */
      grid.setCell('IN_rooms', `${col}24`, (s, c, g) =>
        g.g(s, 'Q24')
      );

      /**
       * Row 25: Copy from column Q
       * Excel:
       * =$Q25
       */
      grid.setCell('IN_rooms', `${col}25`, (s, c, g) =>
        g.g(s, 'Q25')
      );

      /**
       * Row 27: Copy from column Q
       * Excel:
       * =$Q$27
       */
      grid.setCell('IN_rooms', `${col}27`, (s, c, g) =>
        g.g(s, 'Q27')
      );

      /**
       * Row 29: Copy from column Q
       * Excel:
       * =$Q$29
       */
      grid.setCell('IN_rooms', `${col}29`, (s, c, g) =>
        g.g(s, 'Q29')
      );

      /**
       * Row 35: Copy from column Q
       * Excel:
       * =$Q$35
       */
      grid.setCell('IN_rooms', `${col}35`, (s, c, g) =>
        g.g(s, 'Q35')
      );

      /**
       * Row 36: EXIST_roof_knee_eff - Checks if room has knee wall
       * Excel:
       * =IF(R$35="Nein","Ja","Nein")
       *
       * This formula checks if the room's "Klopfen Sie gegen die senkrechte Wand unter der Dachschräge. Klingt es hohl?" is "Nein"
       * If it's "Nein", then roof knee wall exists ("Ja"), otherwise it doesn't ("Nein")
       */
      grid.setCell('IN_rooms', `${col}36`, (s, c, g) =>
        g.WENN(
          g.g(s, `${col}35`) === "Nein",
          "Ja",
          "Nein"
        )
      );

      /**
       * Row 37: L_roof_knee_hei_eff - Effective knee wall height
       * Excel:
       * =IF(R$35="Ja",0,R$34)
       *
       * If the wall is hollow ("Ja" in cell 35), then height is 0
       * Otherwise, use the height value from cell 34
       */
      grid.setCell('IN_rooms', `${col}37`, (s, c, g) =>
        g.WENN(
          g.g(s, `${col}35`) === "Ja",
          0,
          g.g(s, `${col}34`)
        )
      );

      /**
       * Row 38: EXIST_roof_jamb_eff - Checks if room has hollow knee wall
       * Excel:
       * =IF(R$35="Nein","Nein","Ja")
       *
       * This formula is the opposite of row 36 (knee wall existence)
       * If wall is not hollow ("Nein" in cell 35), then hollow knee wall doesn't exist ("Nein")
       * Otherwise, hollow knee wall exists ("Ja")
       */
      grid.setCell('IN_rooms', `${col}38`, (s, c, g) =>
        g.WENN(
          g.g(s, `${col}35`) === "Nein",
          "Nein",
          "Ja"
        )
      );

      /**
       * Row 39: L_roof_jamb_hei_eff - Effective hollow knee wall height
       * Excel:
       * =IF(R$35="Nein",0,R$34)
       *
       * If the wall is not hollow ("Nein" in cell 35), then hollow height is 0
       * Otherwise, use the height value from cell 34
       */
      grid.setCell('IN_rooms', `${col}39`, (s, c, g) =>
        g.WENN(
          g.g(s, `${col}35`) === "Nein",
          0,
          g.g(s, `${col}34`)
        )
      );

      /**
       * Row 48: Copy from column Q
       * Excel:
       * =$Q48
       */
      grid.setCell('IN_rooms', `${col}48`, (s, c, g) =>
        g.g(s, 'Q48')
      );

      /**
       * Row 55: Copy from column Q
       * Excel:
       * =$Q$55
       */
      grid.setCell('IN_rooms', `${col}55`, (s, c, g) =>
        g.g(s, 'Q55')
      );

      /**
       * Row 62: Copy from column Q
       * Excel:
       * =$Q$62
       */
      grid.setCell('IN_rooms', `${col}62`, (s, c, g) =>
        g.g(s, 'Q62')
      );

      /**
       * Row 69: Copy from column Q
       * Excel:
       * =$Q$69
       */
      grid.setCell('IN_rooms', `${col}69`, (s, c, g) =>
        g.g(s, 'Q69')
      );

      /**
       * Modernization year for walls (e.g., R73, S73, etc.)
       * Excel:
       * =IF(OR(R$10=Daten!$B$19,R$10=""),IF(IN_build!$Q$7="Ja",IN_build!$R$7,IN_build!$P$5),IF(OR(R$10<IN_build!$P$5,R$10=Daten!$B$20),IN_build!$P$5,R$10))
       */
      grid.setCell('IN_rooms', `${col}73`, (s, c, g) =>
        g.WENN(
          g.ODER(
            g.g(s, `${col}10`) === g.g('Daten', 'B19'),
            g.g(s, `${col}10`) === ""
          ),
          g.WENN(
            g.g('IN_build', 'Q7') === "Ja",
            g.g('IN_build', 'R7'),
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
       * Excel:
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
       * Excel:
       * =IF(R$11<=0,R$74,R$11)
       */
      grid.setCell('IN_rooms', `${col}75`, (s, c, g) =>
        g.WENN(
          g.n(s, `${col}11`) <= 0,
          g.n(s, `${col}74`),
          g.n(s, `${col}11`)
        )
      );

      /**
       * Window type 1 modernization year (e.g., R76, S76, etc.)
       * Excel:
       * =IF(OR(R$15=Daten!$E$17,R$15=""),IN_build!$R$8,IF(OR(R$15=Daten!$E$18,R$15<IN_build!$P$5),IN_build!$P$5,R$15))
       */
      grid.setCell('IN_rooms', `${col}76`, (s, c, g) =>
        g.WENN(
          g.ODER(
            g.g(s, `${col}15`) === g.g('Daten', 'E17'),
            g.g(s, `${col}15`) === ""
          ),
          g.g('IN_build', 'R8'),
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
       * Excel:
       * =IF(OR(R$19=Daten!$E$17,R$19=""),IN_build!$R$8,IF(OR(R$19=Daten!$E$18,R$19<IN_build!$P$5),IN_build!$P$5,R$19))
       */
      grid.setCell('IN_rooms', `${col}77`, (s, c, g) =>
        g.WENN(
          g.ODER(
            g.g(s, `${col}19`) === g.g('Daten', 'E17'),
            g.g(s, `${col}19`) === ""
          ),
          g.g('IN_build', 'R8'),
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
       * Excel:
       * =IF(OR(R$23=Daten!$E$17,R$23=""),IN_build!$R$8,IF(OR(R$23=Daten!$E$18,R$23<IN_build!$P$5),IN_build!$P$5,R$23))
       */
      grid.setCell('IN_rooms', `${col}78`, (s, c, g) =>
        g.WENN(
          g.ODER(
            g.g(s, `${col}23`) === g.g('Daten', 'E17'),
            g.g(s, `${col}23`) === ""
          ),
          g.g('IN_build', 'R8'),
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
       * Excel:
       * =IF(OR(R$43=Daten!$E$17,R$43=""),IF(IN_build!$R$8>=IN_build!$R$9,IN_build!$R$8,IN_build!$R$9),IF(OR(R$43=Daten!$E$18,R$43<IN_build!$P$5),IN_build!$P$5,R$43))
       */
      grid.setCell('IN_rooms', `${col}79`, (s, c, g) =>
        g.WENN(
          g.ODER(
            g.g(s, `${col}43`) === g.g('Daten', 'E17'),
            g.g(s, `${col}43`) === ""
          ),
          g.WENN(
            g.g('IN_build', 'R8') >= g.g('IN_build', 'R9'),
            g.g('IN_build', 'R8'),
            g.g('IN_build', 'R9')
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
       * Excel:
       * =IF(OR(R$47=Daten!$E$17,R$47=""),IF(IN_build!$R$8>=IN_build!$R$9,IN_build!$R$8,IN_build!$R$9),IF(OR(R$47=Daten!$E$18,R$47<IN_build!$P$5),IN_build!$P$5,R$47))
       */
      grid.setCell('IN_rooms', `${col}80`, (s, c, g) =>
        g.WENN(
          g.ODER(
            g.g(s, `${col}47`) === g.g('Daten', 'E17'),
            g.g(s, `${col}47`) === ""
          ),
          g.WENN(
            g.g('IN_build', 'R8') >= g.g('IN_build', 'R9'),
            g.g('IN_build', 'R8'),
            g.g('IN_build', 'R9')
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
