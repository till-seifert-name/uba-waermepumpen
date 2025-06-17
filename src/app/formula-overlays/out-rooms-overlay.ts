import {DataGrid} from '../data-grid';
import {CLC_BUILD_COLS, CLC_LOAD_COLS, FormulaOverlay, IN_ROOM_COLS, OUT_ROOMS_COLS} from './base-overlay';

/**
 * OUT_rooms sheet formula overlay
 * Contains formula implementations for the OUT_rooms sheet
 */
export class OutRoomsOverlay implements FormulaOverlay {

  /**
   * Apply OUT_rooms formulas to the data grid
   * @param grid The DataGrid instance to apply formulas to
   */
  applyFormulas(grid: DataGrid): void {
    // Implement formulas for each room column
    for (let i = 0; i < OUT_ROOMS_COLS.length; i++) {
      const inRoomsCol = IN_ROOM_COLS[i];
      const outRoomsCol = OUT_ROOMS_COLS[i];
      const clcBuildCol = CLC_BUILD_COLS[i];
      const clcLoadCol = CLC_LOAD_COLS[i];

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
          `${g.g('TXT_rooms', 'E13')}${g.g('OUT_rooms', `${outRoomsCol}7`)}${g.g('TXT_rooms', 'E14')}`,

          g.n('clc_build', `${clcBuildCol}40`) < 1,
          `${g.g('TXT_rooms', 'E15')}${g.g('OUT_rooms', `${outRoomsCol}8`)}${g.g('TXT_rooms', 'E16')}${g.g('OUT_rooms', `${outRoomsCol}9`)}`,

          g.UND(
            g.n('clc_build', `${clcBuildCol}40`) > 1,
            g.n('clc_build', `${clcBuildCol}39`) < 1
          ),
          `${g.g('TXT_rooms', 'E17')}${g.g('OUT_rooms', `${outRoomsCol}8`)}${g.g('TXT_rooms', 'E18')}`,

          // Default fallback
          g.g('TXT_rooms', 'E19')
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
       * The & operator in Excel concatenates strings, using template strings to match
       */
      grid.setCell('OUT_rooms', `${outRoomsCol}13`, (s, c, g) =>
        `${g.TEXT(g.n('OUT_rooms', `${outRoomsCol}11`), "0")} Watt | ${g.TEXT(g.n('OUT_rooms', `${outRoomsCol}12`), "0")} W/m²`);

      /**
       * Row 14: Leistung Heizkörper IST 55°C [W] with units
       * Excel: "TEXT(clc_build!G37,\"0\") & \" Watt\""
       */
      grid.setCell('OUT_rooms', `${outRoomsCol}14`, (s, c, g) =>
        `${g.TEXT(g.n('clc_build', `${clcBuildCol}37`), "0")} Watt`);

      /**
       * Row 15: Typ 33 max. Leistung Austausch-Heizkörper [W] with units
       * Excel: "TEXT(clc_build!G38,\"0\") & \" Watt\""
       */
      grid.setCell('OUT_rooms', `${outRoomsCol}15`, (s, c, g) =>
        `${g.TEXT(g.n('clc_build', `${clcBuildCol}38`), "0")} Watt`);

      /**
       * Row 16: Deckungsgrad IST 55°C as percentage
       * Excel: "TEXT(clc_build!G39*100,\"0\") & \" % Deckung\""
       */
      grid.setCell('OUT_rooms', `${outRoomsCol}16`, (s, c, g) =>
        `${g.TEXT(g.n('clc_build', `${clcBuildCol}39`) * 100, "0")} % Deckung`);

      /**
       * Row 17: Typ 33 Deckungsgrad as percentage
       * Excel: "TEXT(clc_build!G40*100,\"0\") & \" % Deckung\""
       */
      grid.setCell('OUT_rooms', `${outRoomsCol}17`, (s, c, g) =>
        `${g.TEXT(g.n('clc_build', `${clcBuildCol}40`) * 100, "0")} % Deckung`);

      /**
       * Row 20: Kalkulierte Raumheizlast [W]
       * Excel: TEXT(H11,"0")&" Watt"
       */
      grid.setCell('OUT_rooms', `${outRoomsCol}20`, (s, c, g) =>
        `${g.TEXT(g.n('OUT_rooms', `${outRoomsCol}11`), "0")} Watt`);

      /**
       * Row 21: Titel Raum mit spezifischer Heizlast
       * Excel: IN_rooms!R3&" (Heizlast "&TEXT(H12,"0") & " W/m²)"
       */
      grid.setCell('OUT_rooms', `${outRoomsCol}21`, (s, c, g) =>
        `${g.g('IN_rooms', `${inRoomsCol}3`)} (Heizlast ${g.TEXT(g.n('OUT_rooms', `${outRoomsCol}12`), "0")} W/m²)`);

      /**
       * Row 22: Deckungsgrad (copy from row 16)
       * Excel: H16
       */
      grid.setCell('OUT_rooms', `${outRoomsCol}22`, (s, c, g) =>
        g.g('OUT_rooms', `${outRoomsCol}16`));

      /**
       * Row 23: Heizkörperleistung (copy from row 14)
       * Excel: H14
       */
      grid.setCell('OUT_rooms', `${outRoomsCol}23`, (s, c, g) =>
        g.g('OUT_rooms', `${outRoomsCol}14`));

      /**
       * Row 24: U-Wert Bauteil mit höchsten Verlusten
       * Excel: _xlfn.LET(_xlpm.max_HT_share,MAX(clc_build!G$13,clc_build!G$17,clc_build!G$21,clc_build!G$25,clc_build!G$29,clc_build!G$33),
       *   _xlfn.IFS(clc_build!G$13=_xlpm.max_HT_share,clc_build!G$11,
       *   clc_build!G$17=_xlpm.max_HT_share,clc_build!G$15,
       *   clc_build!G$21=_xlpm.max_HT_share,clc_build!G$19*0.8/2.7,
       *   clc_build!G$25=_xlpm.max_HT_share,clc_build!G$23,
       *   clc_build!G$29=_xlpm.max_HT_share,clc_build!G$27,
       *   clc_build!G$33=_xlpm.max_HT_share,clc_build!G$31
       * ))
       */
      grid.setCell('OUT_rooms', `${outRoomsCol}24`, (s, c, g) => {
        const max_HT_share = g.MAX(
          g.n('clc_build', `${clcBuildCol}13`),
          g.n('clc_build', `${clcBuildCol}17`),
          g.n('clc_build', `${clcBuildCol}21`),
          g.n('clc_build', `${clcBuildCol}25`),
          g.n('clc_build', `${clcBuildCol}29`),
          g.n('clc_build', `${clcBuildCol}33`)
        );

        return g.WENNS(
          g.n('clc_build', `${clcBuildCol}13`) === max_HT_share, g.n('clc_build', `${clcBuildCol}11`),
          g.n('clc_build', `${clcBuildCol}17`) === max_HT_share, g.n('clc_build', `${clcBuildCol}15`),
          g.n('clc_build', `${clcBuildCol}21`) === max_HT_share, g.n('clc_build', `${clcBuildCol}19`) * 0.8 / 2.7,
          g.n('clc_build', `${clcBuildCol}25`) === max_HT_share, g.n('clc_build', `${clcBuildCol}23`),
          g.n('clc_build', `${clcBuildCol}29`) === max_HT_share, g.n('clc_build', `${clcBuildCol}27`),
          g.n('clc_build', `${clcBuildCol}33`) === max_HT_share, g.n('clc_build', `${clcBuildCol}31`),
          // Default fallback
          0
        );
      });

      /**
       * Row 25: Bauteiltausch Empfehlung icon
       * Excel: IF(OR(H24<0.4,H12<50),"",_xlfn.LET(_xlpm.max_HT_share,MAX(clc_build!G$13,clc_build!G$17,clc_build!G$21,clc_build!G$25,clc_build!G$29,clc_build!G$33),
       *   "pic_G2_load_" &
       *   _xlfn.IFS(clc_build!G$13=_xlpm.max_HT_share,"wall",
       *   clc_build!G$17=_xlpm.max_HT_share,"innerwall",
       *   clc_build!G$21=_xlpm.max_HT_share,"win",
       *   clc_build!G$25=_xlpm.max_HT_share,"roof",
       *   clc_build!G$29=_xlpm.max_HT_share,"botceil",
       *   clc_build!G$33=_xlpm.max_HT_share,"topceil"
       * )))
       */
      grid.setCell('OUT_rooms', `${outRoomsCol}25`, (s, c, g) => {
        const u_value = g.n('OUT_rooms', `${outRoomsCol}24`);
        const heat_load = g.n('OUT_rooms', `${outRoomsCol}12`);

        if (u_value < 0.4 || heat_load < 50) {
          return "";
        }

        const max_HT_share = g.MAX(
          g.n('clc_build', `${clcBuildCol}13`),
          g.n('clc_build', `${clcBuildCol}17`),
          g.n('clc_build', `${clcBuildCol}21`),
          g.n('clc_build', `${clcBuildCol}25`),
          g.n('clc_build', `${clcBuildCol}29`),
          g.n('clc_build', `${clcBuildCol}33`)
        );

        const componentType = g.WENNS(
          g.n('clc_build', `${clcBuildCol}13`) === max_HT_share, "wall",
          g.n('clc_build', `${clcBuildCol}17`) === max_HT_share, "innerwall",
          g.n('clc_build', `${clcBuildCol}21`) === max_HT_share, "win",
          g.n('clc_build', `${clcBuildCol}25`) === max_HT_share, "roof",
          g.n('clc_build', `${clcBuildCol}29`) === max_HT_share, "botceil",
          g.n('clc_build', `${clcBuildCol}33`) === max_HT_share, "topceil",
          "wall" // Default
        );

        return `pic_G2_load_${componentType}`;
      });

      /**
       * Row 26: Kategorie Bauteiltausch Empfehlung icon
       * Excel: _xlfn.IFS(AND(H12<50,H12>0),"green",H24>0.8,"red",H24>0.5,"orange",H24>0.35,"yellow",TRUE,"")
       */
      grid.setCell('OUT_rooms', `${outRoomsCol}26`, (s, c, g) =>
        g.WENNS(
          g.UND(
            g.n('OUT_rooms', `${outRoomsCol}12`) < 50,
            g.n('OUT_rooms', `${outRoomsCol}12`) > 0
          ), "green",
          g.n('OUT_rooms', `${outRoomsCol}24`) > 0.8, "red",
          g.n('OUT_rooms', `${outRoomsCol}24`) > 0.5, "orange",
          g.n('OUT_rooms', `${outRoomsCol}24`) > 0.35, "yellow",
          // Default
          ""
        ));

      /**
       * Row 27: Ausgabe schlechtestes Bauteil Raum
       * Excel: _xlfn.IFS(
       *   H12<=0,"",
       *   H12<50,TXT_build!$D$6,
       *   H12<70,TXT_build!$D$7 &OUT_rooms!H4&TXT_build!$D$10,
       *   H12<90,TXT_build!$D$8 &OUT_rooms!H4&TXT_build!$D$10,
       *   TRUE,TXT_build!$D$9 &OUT_rooms!H4&TXT_build!$D$10)
       */
      grid.setCell('OUT_rooms', `${outRoomsCol}27`, (s, c, g) =>
        g.WENNS(
          g.n('OUT_rooms', `${outRoomsCol}12`) <= 0, "",
          g.n('OUT_rooms', `${outRoomsCol}12`) < 50, g.g('TXT_build', 'D6'),
          g.n('OUT_rooms', `${outRoomsCol}12`) < 70, `${g.g('TXT_build', 'D7')}${g.g('OUT_rooms', `${outRoomsCol}4`)}${g.g('TXT_build', 'D10')}`,
          g.n('OUT_rooms', `${outRoomsCol}12`) < 90, `${g.g('TXT_build', 'D8')}${g.g('OUT_rooms', `${outRoomsCol}4`)}${g.g('TXT_build', 'D10')}`,
          // Default case (>= 90)
          `${g.g('TXT_build', 'D9')}${g.g('OUT_rooms', `${outRoomsCol}4`)}${g.g('TXT_build', 'D10')}`
        ));

      /**
       * Row 28: Heizkörpertausch Empfehlung icon
       * Excel: "pic_G2_rad_" &
       *   _xlfn.IFS(clc_build!G40<0.5,"bigger_warning",
       *   clc_build!G40<1,"bigger",
       *   AND(clc_build!G40>=1,clc_build!G39<1),"better",
       *   clc_build!G39>=1,"suff")
       */
      grid.setCell('OUT_rooms', `${outRoomsCol}28`, (s, c, g) =>
        `pic_G2_rad_${g.WENNS(
          g.n('clc_build', `${clcBuildCol}40`) < 0.5, "bigger_warning",
          g.n('clc_build', `${clcBuildCol}40`) < 1, "bigger",
          g.UND(
            g.n('clc_build', `${clcBuildCol}40`) >= 1,
            g.n('clc_build', `${clcBuildCol}39`) < 1
          ), "better",
          g.n('clc_build', `${clcBuildCol}39`) >= 1, "suff",
          // Default
          "suff"
        )}`);

      /**
       * Row 29: Ausgabe Heizkörpertausch Raum
       * Excel: _xlfn.IFS(clc_build!G40<0.5,TXT_build!$D$11,
       *   clc_build!G40<1,TXT_build!$D$12,
       *   AND(clc_build!G40>=1,clc_build!G39<1),TXT_build!$D$13,
       *   clc_build!G39>=1,TXT_build!$D$14)
       */
      grid.setCell('OUT_rooms', `${outRoomsCol}29`, (s, c, g) =>
        g.WENNS(
          g.n('clc_build', `${clcBuildCol}40`) < 0.5, g.g('TXT_build', 'D11'),
          g.n('clc_build', `${clcBuildCol}40`) < 1, g.g('TXT_build', 'D12'),
          g.UND(
            g.n('clc_build', `${clcBuildCol}40`) >= 1,
            g.n('clc_build', `${clcBuildCol}39`) < 1
          ), g.g('TXT_build', 'D13'),
          g.n('clc_build', `${clcBuildCol}39`) >= 1, g.g('TXT_build', 'D14'),
          // Default
          g.g('TXT_build', 'D14')
        ));

      /**
       * Row 30: Color Raumheizlast
       * Excel: _xlfn.IFS(
       *   H12<=0,"",
       *   H12<50,"green",
       *   H12<70,"yellow",
       *   H12<90,"orange",
       *   TRUE,"red")
       */
      grid.setCell('OUT_rooms', `${outRoomsCol}30`, (s, c, g) =>
        g.WENNS(
          g.n('OUT_rooms', `${outRoomsCol}12`) <= 0, "",
          g.n('OUT_rooms', `${outRoomsCol}12`) < 50, "green",
          g.n('OUT_rooms', `${outRoomsCol}12`) < 70, "yellow",
          g.n('OUT_rooms', `${outRoomsCol}12`) < 90, "orange",
          // Default (>= 90)
          "red"
        ));

      /**
       * Row 31: Color Heizkörperleistung
       * Excel: _xlfn.IFS(clc_build!G40<0.5,"red",
       *   clc_build!G40<1,"orange",
       *   AND(clc_build!G40>=1,clc_build!G39<1),"yellow",
       *   clc_build!G39>=1,"green")
       */
      grid.setCell('OUT_rooms', `${outRoomsCol}31`, (s, c, g) =>
        g.WENNS(
          g.n('clc_build', `${clcBuildCol}40`) < 0.5, "red",
          g.n('clc_build', `${clcBuildCol}40`) < 1, "orange",
          g.UND(
            g.n('clc_build', `${clcBuildCol}40`) >= 1,
            g.n('clc_build', `${clcBuildCol}39`) < 1
          ), "yellow",
          g.n('clc_build', `${clcBuildCol}39`) >= 1, "green",
          // Default
          "green"
        ));

      /**
       * Row 32: Maßnahme Heizkörper
       * Excel: _xlfn.IFS(clc_build!G40<0.5,"stark vergrößern",
       *   clc_build!G40<1,"vergrößern",
       *   AND(clc_build!G40>=1,clc_build!G39<1),"verbessern",
       *   clc_build!G39>=1,"")
       */
      grid.setCell('OUT_rooms', `${outRoomsCol}32`, (s, c, g) =>
        g.WENNS(
          g.n('clc_build', `${clcBuildCol}40`) < 0.5, "stark vergrößern",
          g.n('clc_build', `${clcBuildCol}40`) < 1, "vergrößern",
          g.UND(
            g.n('clc_build', `${clcBuildCol}40`) >= 1,
            g.n('clc_build', `${clcBuildCol}39`) < 1
          ), "verbessern",
          g.n('clc_build', `${clcBuildCol}39`) >= 1, "",
          // Default
          ""
        ));

      /**
       * Row 35: Position Marker Skalen - Aktueller Heizkörper
       * Excel:
       * "_xlfn.LET(
       *   _xlpm.deck,clc_build!G$39,
       *   _xlfn.IFS(
       *     1<=clc_build!G$39,
       *       MAX(0, MIN(0.25, (1.5 - _xlpm.deck)*0.25/0.5)),
       *     AND(1>clc_build!G$39,clc_build!G$39>=0.8),
       *       MAX(0.27, MIN(0.5, 0.25 + (1 - _xlpm.deck)*0.25/0.2)),
       *     OR(AND(0.8>clc_build!G$39,clc_build!G$39>=0.6),clc_build!G$38>clc_build!G$7),
       *       MAX(0.52, MIN(0.75, 0.5 + (0.8 - _xlpm.deck)*0.25/0.2)),
       *     AND(clc_build!G$39<0.6,clc_build!G$38<clc_build!G$7),
       *       MAX(0.77, MIN(1, 0.75 + (0.6 - _xlpm.deck)*0.25/0.2))))"
       */
      grid.setCell('OUT_rooms', `${outRoomsCol}35`, (s, c, g) => {
        const deck = g.n('clc_build', `${clcBuildCol}39`);

        return g.WENNS(
          g.n('clc_build', `${clcBuildCol}39`) >= 1,
          Math.max(0, Math.min(0.25, (1.5 - deck) * 0.25 / 0.5)),

          g.UND(
            g.n('clc_build', `${clcBuildCol}39`) < 1,
            g.n('clc_build', `${clcBuildCol}39`) >= 0.8
          ),
          Math.max(0.27, Math.min(0.5, 0.25 + (1 - deck) * 0.25 / 0.2)),

          g.ODER(
            g.UND(
              g.n('clc_build', `${clcBuildCol}39`) < 0.8,
              g.n('clc_build', `${clcBuildCol}39`) >= 0.6
            ),
            g.n('clc_build', `${clcBuildCol}38`) > g.n('clc_build', `${clcBuildCol}7`)
          ),
          Math.max(0.52, Math.min(0.75, 0.5 + (0.8 - deck) * 0.25 / 0.2)),

          g.UND(
            g.n('clc_build', `${clcBuildCol}39`) < 0.6,
            g.n('clc_build', `${clcBuildCol}38`) < g.n('clc_build', `${clcBuildCol}7`)
          ),
          Math.max(0.77, Math.min(1, 0.75 + (0.6 - deck) * 0.25 / 0.2)),

          // Default fallback
          0.125
        );
      });

      /**
       * Row 36: Position Marker Skalen - Besserer Heizkörper
       * Excel:
       * "_xlfn.LET(
       *   _xlpm.deck,clc_build!G$40,
       *   IF(
       *     1<=clc_build!G$40,
       *       MAX(0, MIN(0.25, (1.5 - _xlpm.deck)*0.25/0.5)),
       *       MAX(0.27, MIN(1, 0.25 + (1 - _xlpm.deck) *0.75/0.6))))"
       */
      grid.setCell('OUT_rooms', `${outRoomsCol}36`, (s, c, g) => {
        const deck = g.n('clc_build', `${clcBuildCol}40`);

        return g.WENN(
          g.n('clc_build', `${clcBuildCol}40`) >= 1,
          Math.max(0, Math.min(0.25, (1.5 - deck) * 0.25 / 0.5)),
          Math.max(0.27, Math.min(1, 0.25 + (1 - deck) * 0.75 / 0.6))
        );
      });

      /**
       * Row 37: Position Marker Skalen - Kalkulierte Raumheizlast
       * Excel: "MAX(20,MIN(125,clc_build!G$8))"
       */
      grid.setCell('OUT_rooms', `${outRoomsCol}37`, (s, c, g) =>
        Math.max(30, Math.min(110, g.n('clc_build', `${clcBuildCol}8`))));
    }
  }
}
