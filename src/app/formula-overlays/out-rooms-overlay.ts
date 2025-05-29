import { DataGrid } from '../data-grid';
import { FormulaOverlay } from './base-overlay';

/**
 * OUT_rooms sheet formula overlay
 * Contains formula implementations for the OUT_rooms sheet
 */
export class OutRoomsOverlay implements FormulaOverlay {
  // Columns H-V for rooms 1-15
  private outRoomsCols = ['H', 'I', 'J', 'K', 'L', 'M', 'N', 'O', 'P', 'Q', 'R', 'S', 'T', 'U', 'V'];
  // Columns G-U in clc_build for rooms 1-15
  private clcBuildCols = ['G', 'H', 'I', 'J', 'K', 'L', 'M', 'N', 'O', 'P', 'Q', 'R', 'S', 'T', 'U'];
  // Columns I-W in clc_load for rooms 1-15
  private clcLoadCols = ['I', 'J', 'K', 'L', 'M', 'N', 'O', 'P', 'Q', 'R', 'S', 'T', 'U', 'V', 'W'];

  /**
   * Apply OUT_rooms formulas to the data grid
   * @param grid The DataGrid instance to apply formulas to
   */
  applyFormulas(grid: DataGrid): void {
    // Implement formulas for each room column
    for (let i = 0; i < this.outRoomsCols.length; i++) {
      const outRoomsCol = this.outRoomsCols[i];
      const clcBuildCol = this.clcBuildCols[i];
      const clcLoadCol = this.clcLoadCols[i];

      /**
       * Row 3: Ausgabe zur Wärmepumpeneignung
       * Excel:
       * "_xlfn.IFS(
       *   1<=clc_build!G$39,TXT_rooms!$E$5,
       *   AND(1>clc_build!G$39,clc_build!G$39>=0.8),TXT_rooms!$E$4,
       *   OR(AND(0.8>clc_build!G$39,clc_build!G$39>=0.6),clc_build!G$38>clc_build!G$7),TXT_rooms!$E$3,
       *   AND(clc_build!G$39<0.6,clc_build!G$38<clc_build!G$7),TXT_rooms!$E$2
       * )"
       */
      grid.setCell('OUT_rooms', `${outRoomsCol}3`, (s, c, g) =>
        g.WENNS(
          g.n('clc_build', `${clcBuildCol}39`) >= 1,
          g.g('TXT_rooms', 'E5'),

          g.UND(
            g.n('clc_build', `${clcBuildCol}39`) < 1,
            g.n('clc_build', `${clcBuildCol}39`) >= 0.8
          ),
          g.g('TXT_rooms', 'E4'),

          g.ODER(
            g.UND(
              g.n('clc_build', `${clcBuildCol}39`) < 0.8,
              g.n('clc_build', `${clcBuildCol}39`) >= 0.6
            ),
            g.n('clc_build', `${clcBuildCol}38`) > g.n('clc_build', `${clcBuildCol}7`)
          ),
          g.g('TXT_rooms', 'E3'),

          g.UND(
            g.n('clc_build', `${clcBuildCol}39`) < 0.6,
            g.n('clc_build', `${clcBuildCol}38`) < g.n('clc_build', `${clcBuildCol}7`)
          ),
          g.g('TXT_rooms', 'E2'),

          // Default fallback
          g.g('TXT_rooms', 'E2')
        ));

      /**
       * Row 4: Lückentext Bauteilbewertung Raumebene 1
       * Excel:
       * "_xlfn.LET(_xlpm.max_HT_share,MAX(clc_build!G$13,clc_build!G$17,clc_build!G$21,clc_build!G$25,clc_build!G$29,clc_build!G$33),
       *   _xlfn.IFS(clc_load!I$18=_xlpm.max_HT_share,' Außenwand ',
       *   clc_load!I$23=_xlpm.max_HT_share,' Innenwand ',
       *   clc_load!I$30=_xlpm.max_HT_share,' Dachfläche ',
       *   clc_load!I$36=_xlpm.max_HT_share,' Decke ',
       *   clc_load!I$41=_xlpm.max_HT_share,' Fußbodenfläche ',
       *   clc_build!G$21,' Fenster '
       *   ))"
       */
      grid.setCell('OUT_rooms', `${outRoomsCol}4`, (s, c, g) => {
        const max_HT_share = g.MAX(
          g.n('clc_build', `${clcBuildCol}13`),
          g.n('clc_build', `${clcBuildCol}17`),
          g.n('clc_build', `${clcBuildCol}21`),
          g.n('clc_build', `${clcBuildCol}25`),
          g.n('clc_build', `${clcBuildCol}29`),
          g.n('clc_build', `${clcBuildCol}33`)
        );

        return g.WENNS(
          g.n('clc_load', `${clcLoadCol}18`) === max_HT_share, ' Außenwand ',
          g.n('clc_load', `${clcLoadCol}23`) === max_HT_share, ' Innenwand ',
          g.n('clc_load', `${clcLoadCol}30`) === max_HT_share, ' Dachfläche ',
          g.n('clc_load', `${clcLoadCol}36`) === max_HT_share, ' Decke ',
          g.n('clc_load', `${clcLoadCol}41`) === max_HT_share, ' Fußbodenfläche ',
          g.n('clc_build', `${clcBuildCol}21`), ' Fenster ',

          // Default fallback
          ' Fenster '
        );
      });

      /**
       * Row 5: Lückentext Bauteilbewertung Raumebene 2
       * Excel:
       * "_xlfn.LET(
       *   _xlpm.second_HT_share,LARGE((clc_build!G$13,clc_build!G$17,clc_build!G$21,clc_build!G$25,clc_build!G$29,clc_build!G$33),2),
       *   _xlfn.IFS(clc_load!I$18=_xlpm.second_HT_share,' Außenwand ',
       *   clc_load!I$23=_xlpm.second_HT_share,' Innenwand ',
       *   clc_load!I$30=_xlpm.second_HT_share,' Dachfläche ',
       *   clc_load!I$36=_xlpm.second_HT_share,' Decke ',
       *   clc_load!I$41=_xlpm.second_HT_share,' Fußbodenfläche ',
       *   clc_build!G$21=_xlpm.second_HT_share,' Fenster '))"
       */
      grid.setCell('OUT_rooms', `${outRoomsCol}5`, (s, c, g) => {
        // Create array of heat transfer shares
        const htShares = [
          g.n('clc_build', `${clcBuildCol}13`),
          g.n('clc_build', `${clcBuildCol}17`),
          g.n('clc_build', `${clcBuildCol}21`),
          g.n('clc_build', `${clcBuildCol}25`),
          g.n('clc_build', `${clcBuildCol}29`),
          g.n('clc_build', `${clcBuildCol}33`)
        ];

        const second_HT_share = g.LARGE(htShares, 2); // 2nd largest value

        return g.WENNS(
          g.n('clc_load', `${clcLoadCol}18`) === second_HT_share, ' Außenwand ',
          g.n('clc_load', `${clcLoadCol}23`) === second_HT_share, ' Innenwand ',
          g.n('clc_load', `${clcLoadCol}30`) === second_HT_share, ' Dachfläche ',
          g.n('clc_load', `${clcLoadCol}36`) === second_HT_share, ' Decke ',
          g.n('clc_load', `${clcLoadCol}41`) === second_HT_share, ' Fußbodenfläche ',
          g.n('clc_build', `${clcBuildCol}21`) === second_HT_share, ' Fenster ',

          // Default fallback
          ' Fenster '
        );
      });

      /**
       * Row 6: Ausgabe Bauteilbewertung Raumebene
       * Excel:
       * "_xlfn.IFS(
       *   clc_build!G$8<50,TXT_rooms!$E$6,
       *   AND(clc_build!G$8>=50,clc_build!G$8<70),TXT_rooms!$E$7&OUT_rooms!H$4&TXT_rooms!$E$8,
       *   AND(clc_build!G$8>=70,clc_build!G$8<90),TXT_rooms!$E$9&OUT_rooms!H$4&TXT_rooms!$E$10,
       *   clc_build!G$8>=90,TXT_rooms!$E$11&OUT_rooms!H$4&'und die'&H$5&TXT_rooms!$E$12
       * )"
       */
      grid.setCell('OUT_rooms', `${outRoomsCol}6`, (s, c, g) =>
        g.WENNS(
          g.n('clc_build', `${clcBuildCol}8`) < 50,
          g.g('TXT_rooms', 'E6'),

          g.UND(
            g.n('clc_build', `${clcBuildCol}8`) >= 50,
            g.n('clc_build', `${clcBuildCol}8`) < 70
          ),
          `${g.g('TXT_rooms', 'E7')}${g.g('OUT_rooms', `${outRoomsCol}4`)}${g.g('TXT_rooms', 'E8')}`,

          g.UND(
            g.n('clc_build', `${clcBuildCol}8`) >= 70,
            g.n('clc_build', `${clcBuildCol}8`) < 90
          ),
          `${g.g('TXT_rooms', 'E9')}${g.g('OUT_rooms', `${outRoomsCol}4`)}${g.g('TXT_rooms', 'E10')}`,

          g.n('clc_build', `${clcBuildCol}8`) >= 90,
          `${g.g('TXT_rooms', 'E11')}${g.g('OUT_rooms', `${outRoomsCol}4`)} und die ${g.g('OUT_rooms', `${outRoomsCol}5`)}${g.g('TXT_rooms', 'E12')}`,

          // Default fallback
          g.g('TXT_rooms', 'E6')
        ));

      /**
       * Row 7: Lückentext Bewertung Heizkörpertausch Raumebene 1
       * Excel:
       * " _xlfn.IFS(
       *     clc_build!G$39>0.5,
       *   ' größerer ',
       *     AND(clc_build!G$39 >0.45,clc_build!G$39<=0.5),
       *   ' mindestens doppelt so großer ',
       *     AND(clc_build!G$39 >0.34,clc_build!G$39<=0.45),
       *   ' dreimal so großer ',
       *    clc_build!G$39<=0.34,
       *   ' sehr viel größerer '
       * )"
       */
      grid.setCell('OUT_rooms', `${outRoomsCol}7`, (s, c, g) =>
        g.WENNS(
          g.n('clc_build', `${clcBuildCol}39`) > 0.5,
          ' größerer ',

          g.UND(
            g.n('clc_build', `${clcBuildCol}39`) > 0.45,
            g.n('clc_build', `${clcBuildCol}39`) <= 0.5
          ),
          ' mindestens doppelt so großer ',

          g.UND(
            g.n('clc_build', `${clcBuildCol}39`) > 0.34,
            g.n('clc_build', `${clcBuildCol}39`) <= 0.45
          ),
          ' dreimal so großer ',

          g.n('clc_build', `${clcBuildCol}39`) <= 0.34,
          ' sehr viel größerer ',

          // Default fallback
          ' größerer '
        ));

      /**
       * Row 8: Lückentext Bewertung Heizkörpertausch Raumebene 2
       * Assuming this contains additional text substitutions based on other conditions
       */
      grid.setCell('OUT_rooms', `${outRoomsCol}8`, (s, c, g) => {
        // Implement based on specific requirements
        // Placeholder implementation
        return '';
      });

      /**
       * Row 9: Lückentext Bewertung Heizkörpertausch Raumebene 3
       * Assuming this contains additional text substitutions based on other conditions
       */
      grid.setCell('OUT_rooms', `${outRoomsCol}9`, (s, c, g) => {
        // Implement based on specific requirements
        // Placeholder implementation
        return '';
      });

      /**
       * Row 10: Ausgabe Heizkörpertausch Raumebene
       * Excel:
       * "_xlfn.IFS(
       *   clc_build!G$39 > 1,
       *   TXT_rooms!$E$19,
       *   clc_build!G$40<0.5,
       *   TXT_rooms!$E$13 & H7 & TXT_rooms!$E$14,
       *   clc_build!G$40 < 1,
       *   TXT_rooms!$E$15&H$8&TXT_rooms!$E$16 & H$9,
       *   AND(clc_build!G$40 > 1,clc_build!G$39 < 1),TXT_rooms!$E$17&H$8&TXT_rooms!$E$18
       * )"
       */
      grid.setCell('OUT_rooms', `${outRoomsCol}10`, (s, c, g) =>
        g.WENNS(
          g.n('clc_build', `${clcBuildCol}39`) > 1,
          String(g.g('TXT_rooms', 'E19')),

          g.n('clc_build', `${clcBuildCol}40`) < 0.5,
          String(g.g('TXT_rooms', 'E13')) + String(g.g('OUT_rooms', `${outRoomsCol}7`)) + String(g.g('TXT_rooms', 'E14')),

          g.n('clc_build', `${clcBuildCol}40`) < 1,
          String(g.g('TXT_rooms', 'E15')) + String(g.g('OUT_rooms', `${outRoomsCol}8`)) + String(g.g('TXT_rooms', 'E16')) + String(g.g('OUT_rooms', `${outRoomsCol}9`)),

          g.UND(
            g.n('clc_build', `${clcBuildCol}40`) > 1,
            g.n('clc_build', `${clcBuildCol}39`) < 1
          ),
          String(g.g('TXT_rooms', 'E17')) + String(g.g('OUT_rooms', `${outRoomsCol}8`)) + String(g.g('TXT_rooms', 'E18')),

          // Default fallback
          String(g.g('TXT_rooms', 'E19'))
        ));

      /**
       * Row 11: Heizlast mit Abschlag / Qdot_room_cor [W]
       * Excel: "clc_build!G7"
       */
      grid.setCell('OUT_rooms', `${outRoomsCol}11`, (s, c, g) =>
        g.n('clc_build', `${clcBuildCol}7`));

      /**
       * Row 12: Heizlast_spez mit Abschlag / qdot_room_cor [W/m²]
       * Excel: "clc_build!G8"
       */
      grid.setCell('OUT_rooms', `${outRoomsCol}12`, (s, c, g) =>
        g.n('clc_build', `${clcBuildCol}8`));

      /**
       * Row 13: Formatted heat load with unit
       * Excel: "TEXT(H11,\"0\")&\" Watt | \" & TEXT(H12,\"0\") & \" W/m²\""
       * The & operator in Excel concatenates strings, in JS we use + but need to ensure string coercion
       */
      grid.setCell('OUT_rooms', `${outRoomsCol}13`, (s, c, g) =>
        g.TEXT(g.n('OUT_rooms', `${outRoomsCol}11`), "0") + " Watt | " +
        g.TEXT(g.n('OUT_rooms', `${outRoomsCol}12`), "0") + " W/m²");

      /**
       * Row 14: Leistung Heizkörper IST 55°C [W] with units
       * Excel: "TEXT(clc_build!G37,\"0\") & \" Watt\""
       */
      grid.setCell('OUT_rooms', `${outRoomsCol}14`, (s, c, g) =>
        g.TEXT(g.n('clc_build', `${clcBuildCol}37`), "0") + " Watt");

      /**
       * Row 15: Typ 33 max. Leistung Austausch-Heizkörper [W] with units
       * Excel: "TEXT(clc_build!G38,\"0\") & \" Watt\""
       */
      grid.setCell('OUT_rooms', `${outRoomsCol}15`, (s, c, g) =>
        g.TEXT(g.n('clc_build', `${clcBuildCol}38`), "0") + " Watt");

      /**
       * Row 16: Deckungsgrad IST 55°C as percentage
       * Excel: "TEXT(clc_build!G39*100,\"0\") & \" % Deckung\""
       */
      grid.setCell('OUT_rooms', `${outRoomsCol}16`, (s, c, g) =>
        g.TEXT(g.n('clc_build', `${clcBuildCol}39`) * 100, "0") + " % Deckung");

      /**
       * Row 17: Typ 33 Deckungsgrad as percentage
       * Excel: "TEXT(clc_build!G40*100,\"0\") & \" % Deckung\""
       */
      grid.setCell('OUT_rooms', `${outRoomsCol}17`, (s, c, g) =>
        g.TEXT(g.n('clc_build', `${clcBuildCol}40`) * 100, "0") + " % Deckung");

      /**
       * Row 35: Position Marker Skalen - Aktueller Heizkörper
       * Excel:
       * "_xlfn.LET(
       *   _xlpm.deck_ist,clc_build!G$39,
       *   _xlfn.IFS(
       *     _xlpm.deck_ist>=1,0.125,
       *     0.8>=_xlpm.deck_ist<1, _xlpm.deck_ist*0.245,
       *     0.8<_xlpm.deck_ist>=0.6, _xlpm.deck_ist*0.495,
       *     0.6<_xlpm.deck_ist, _xlpm.deck_ist*0.745))"
       */
      grid.setCell('OUT_rooms', `${outRoomsCol}35`, (s, c, g) => {
        const deck_ist = g.n('clc_build', `${clcBuildCol}39`);

        return g.WENNS(
          deck_ist >= 1, 0.125,
          g.UND(deck_ist <= 0.8, deck_ist >= 1), deck_ist * 0.245,
          g.UND(deck_ist < 0.8, deck_ist >= 0.6), deck_ist * 0.495,
          deck_ist < 0.6, deck_ist * 0.745,

          // Default fallback
          0.125
        );
      });

      /**
       * Row 36: Position Marker Skalen - Besserer Heizkörper
       * Excel:
       * "_xlfn.LET(
       *   _xlpm.deck_Typ33,clc_build!H$40,
       *   _xlfn.IFS(
       *     _xlpm.deck_Typ33>1,0.125,
       *     0.8>=_xlpm.deck_Typ33<1, _xlpm.deck_Typ33*0.245,
       *     0.8<_xlpm.deck_Typ33>=0.6, _xlpm.deck_Typ33*0.495,
       *     0.6<_xlpm.deck_Typ33, _xlpm.deck_Typ33*0.745))"
       */
      grid.setCell('OUT_rooms', `${outRoomsCol}36`, (s, c, g) => {
        const deck_Typ33 = g.n('clc_build', `${clcBuildCol}40`);

        return g.WENNS(
          deck_Typ33 > 1, 0.125,
          g.UND(deck_Typ33 <= 0.8, deck_Typ33 >= 1), deck_Typ33 * 0.245,
          g.UND(deck_Typ33 < 0.8, deck_Typ33 >= 0.6), deck_Typ33 * 0.495,
          deck_Typ33 < 0.6, deck_Typ33 * 0.745,

          // Default fallback
          0.125
        );
      });

      /**
       * Row 37: Position Marker Skalen - Kalkulierte Raumheizlast
       * Excel:
       * "_xlfn.IFS(
       *   clc_load!I$75<20,20,
       *   clc_load!I$75>125,125,
       *   20<=clc_load!I$75<=125,clc_load!I$75)"
       */
      grid.setCell('OUT_rooms', `${outRoomsCol}37`, (s, c, g) =>
        g.WENNS(
          g.n('clc_load', `${clcLoadCol}75`) < 20, 20,
          g.n('clc_load', `${clcLoadCol}75`) > 125, 125,
          g.UND(
            g.n('clc_load', `${clcLoadCol}75`) >= 20,
            g.n('clc_load', `${clcLoadCol}75`) <= 125
          ), g.n('clc_load', `${clcLoadCol}75`),

          // Default fallback
          g.n('clc_load', `${clcLoadCol}75`)
        ));
    }
  }
}
