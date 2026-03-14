import {DataGrid} from '../data-grid';
import {CLC_BUILD_COLS, CLC_LOAD_COLS, CLC_POWER_COLS, FormulaOverlay, IN_ROOM_COLS, OUT_ROOMS_COLS} from './base-overlay';

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
      const clcPowerCol = CLC_POWER_COLS[i];

      /**
       * Row 3: Ausgabe zur Wärmepumpeneignung
       * Excel:
       * "_xlfn.IFS(
       *   1<=clc_build!G$39,TXT_rooms!$E$5,
       *   OR(AND(1>clc_build!G$39,clc_build!G$39>=0.7), clc_build!G$38>=clc_build!G$7),TXT_rooms!$E$4,
       *   AND(0.7>clc_build!G$39,clc_build!G$39>=0.4, clc_build!G$38<clc_build!G$7),TXT_rooms!$E$3,
       *   AND(clc_build!G$39<0.4,clc_build!G$38<clc_build!G$7),TXT_rooms!$E$2
       * )"
       */
      grid.setCell('OUT_rooms', `${outRoomsCol}3`, (s, c, g) =>
        g.WENNS(
          g.n('clc_build', `${clcBuildCol}39`) >= 1,
          g.g('TXT_rooms', 'E5'),

          g.ODER(
            g.UND(
              g.n('clc_build', `${clcBuildCol}39`) < 1,
              g.n('clc_build', `${clcBuildCol}39`) >= 0.7
            ),
            g.n('clc_build', `${clcBuildCol}38`) >= g.n('clc_build', `${clcBuildCol}7`)
          ),
          g.g('TXT_rooms', 'E4'),

          g.UND(
            g.n('clc_build', `${clcBuildCol}39`) < 0.7,
            g.n('clc_build', `${clcBuildCol}39`) >= 0.4,
            g.n('clc_build', `${clcBuildCol}38`) < g.n('clc_build', `${clcBuildCol}7`)
          ),
          g.g('TXT_rooms', 'E3'),

          g.UND(
            g.n('clc_build', `${clcBuildCol}39`) < 0.4,
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
       *   clc_build!G$39 >= 1,
       *   TXT_rooms!$E$19,
       *   clc_build!G$40<0.5,
       *   TXT_rooms!$E$13 & H7 & TXT_rooms!$E$14,
       *   clc_build!G$40 < 1,
       *   TXT_rooms!$E$15&H$8&TXT_rooms!$E$16 & H$9,
       *   AND(clc_build!G$40 >= 1,clc_build!G$39 < 1),TXT_rooms!$E$17&H$8&TXT_rooms!$E$18
       * )"
       */
      grid.setCell('OUT_rooms', `${outRoomsCol}10`, (s, c, g) =>
        g.WENNS(
          g.n('clc_build', `${clcBuildCol}39`) >= 1,
          String(g.g('TXT_rooms', 'E19')),

          g.n('clc_build', `${clcBuildCol}40`) < 0.5,
          `${g.g('TXT_rooms', 'E13')}${g.g('OUT_rooms', `${outRoomsCol}7`)}${g.g('TXT_rooms', 'E14')}`,

          g.n('clc_build', `${clcBuildCol}40`) < 1,
          `${g.g('TXT_rooms', 'E15')}${g.g('OUT_rooms', `${outRoomsCol}8`)}${g.g('TXT_rooms', 'E16')}${g.g('OUT_rooms', `${outRoomsCol}9`)}`,

          g.UND(
            g.n('clc_build', `${clcBuildCol}40`) >= 1,
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
       * Excel: IF(OR(H24<0.4,H12<50),"pic_G2_load_wall",_xlfn.LET(_xlpm.max_HT_share,MAX(clc_build!G$13,clc_build!G$17,clc_build!G$21,clc_build!G$25,clc_build!G$29,clc_build!G$33),
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
          return "pic_G2_load_wall";
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
          g.n('clc_build', `${clcBuildCol}17`) === max_HT_share, "wall",
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
       *   _xlfn.IFS(clc_build!G39>=1,"suff",
       *   clc_build!G40<0.5,"bigger_warning",
       *   clc_build!G40<1,"bigger",
       *   AND(clc_build!G40>=1,clc_build!G39<1),"better")
       */
      grid.setCell('OUT_rooms', `${outRoomsCol}28`, (s, c, g) =>
        `pic_G2_rad_${g.WENNS(
          g.n('clc_build', `${clcBuildCol}39`) >= 1, "suff",
          g.n('clc_build', `${clcBuildCol}40`) < 0.5, "bigger_warning",
          g.n('clc_build', `${clcBuildCol}40`) < 1, "bigger",
          g.UND(
            g.n('clc_build', `${clcBuildCol}40`) >= 1,
            g.n('clc_build', `${clcBuildCol}39`) < 1
          ), "better",
          // Default
          "better"
        )}`);

      /**
       * Row 29: Ausgabe Heizkörpertausch Raum
       * Excel: _xlfn.IFS(clc_build!G39>=1,TXT_build!$D$14,
       *   clc_build!G40<0.5,TXT_build!$D$11,
       *   clc_build!G40<1,TXT_build!$D$12,
       *   AND(clc_build!G40>=1,clc_build!G39<1),TXT_build!$D$13)
       */
      grid.setCell('OUT_rooms', `${outRoomsCol}29`, (s, c, g) =>
        g.WENNS(
          g.n('clc_build', `${clcBuildCol}39`) >= 1, g.g('TXT_build', 'D14'),
          g.n('clc_build', `${clcBuildCol}40`) < 0.5, g.g('TXT_build', 'D11'),
          g.n('clc_build', `${clcBuildCol}40`) < 1, g.g('TXT_build', 'D12'),
          g.UND(
            g.n('clc_build', `${clcBuildCol}40`) >= 1,
            g.n('clc_build', `${clcBuildCol}39`) < 1
          ), g.g('TXT_build', 'D13'),
          // Default
          g.g('TXT_build', 'D13')
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
       * Excel: _xlfn.IFS(clc_build!G39>=1,"green",
       *   clc_build!G40<0.5,"red",
       *   clc_build!G40<1,"orange",
       *   AND(clc_build!G40>=1,clc_build!G39<1),"yellow")
       */
      grid.setCell('OUT_rooms', `${outRoomsCol}31`, (s, c, g) =>
        g.WENNS(
          g.n('clc_build', `${clcBuildCol}39`) >= 1, "green",
          g.n('clc_build', `${clcBuildCol}40`) < 0.5, "red",
          g.n('clc_build', `${clcBuildCol}40`) < 1, "orange",
          g.UND(
            g.n('clc_build', `${clcBuildCol}40`) >= 1,
            g.n('clc_build', `${clcBuildCol}39`) < 1
          ), "yellow",
          // Default
          "green"
        ));

      /**
       * Row 32: Ausgabetext Maßnahme Heizkörper (unter Heizkörpersymbol)
       * Excel: _xlfn.IFS(clc_build!G39>=1,"ausreichend",
       *   clc_build!G40<0.5,"stark vergrößern",
       *   clc_build!G40<1,"vergrößern",
       *   AND(clc_build!G40>=1,clc_build!G39<1),"verbessern")
       */
      grid.setCell('OUT_rooms', `${outRoomsCol}32`, (s, c, g) =>
        g.WENNS(
          g.n('clc_build', `${clcBuildCol}39`) >= 1, "ausreichend",
          g.n('clc_build', `${clcBuildCol}40`) < 0.5, "stark vergrößern",
          g.n('clc_build', `${clcBuildCol}40`) < 1, "vergrößern",
          g.UND(
            g.n('clc_build', `${clcBuildCol}40`) >= 1,
            g.n('clc_build', `${clcBuildCol}39`) < 1
          ), "verbessern",
          // Default
          "ausreichend"
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
       *     AND(clc_build!G$39<0.6,clc_build!G$38<=clc_build!G$7),
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
            g.n('clc_build', `${clcBuildCol}38`) <= g.n('clc_build', `${clcBuildCol}7`)
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

      /**
       * Row 40: Wall color rating
       * Excel: "_xlfn.IFS(clc_build!G$11=\"\",\"grey\",clc_build!G$11>0.8,\"red\",clc_build!G$11>0.5,\"orange\",clc_build!G$11>0.35,\"yellow\",clc_build!G$11<=0.35,\"green\")"
       */
      grid.setCell('OUT_rooms', `${outRoomsCol}40`, (s, c, g) => {
        return g.WENNS(
          g.g('clc_build', `${clcBuildCol}11`) === "",
          "grey",
          g.n('clc_build', `${clcBuildCol}11`) > 0.8,
          "red",
          g.n('clc_build', `${clcBuildCol}11`) > 0.5,
          "orange",
          g.n('clc_build', `${clcBuildCol}11`) > 0.35,
          "yellow",
          g.n('clc_build', `${clcBuildCol}11`) <= 0.35,
          "green",
          "grey" // Default
        );
      });

      /**
       * Row 41: Window color rating
       * Excel: "_xlfn.IFS(clc_build!G$19=\"\",\"grey\",clc_build!G$19>2.7,\"red\",clc_build!G$19>2.1,\"orange\",clc_build!G$19>(1.7+1.3)/2,\"yellow\",clc_build!G$19<=(1.7+1.3)/2,\"green\")"
       */
      grid.setCell('OUT_rooms', `${outRoomsCol}41`, (s, c, g) => {
        return g.WENNS(
          g.g('clc_build', `${clcBuildCol}19`) === "",
          "grey",
          g.n('clc_build', `${clcBuildCol}19`) > 2.7,
          "red",
          g.n('clc_build', `${clcBuildCol}19`) > 2.1,
          "orange",
          g.n('clc_build', `${clcBuildCol}19`) > (1.7 + 1.3) / 2,
          "yellow",
          g.n('clc_build', `${clcBuildCol}19`) <= (1.7 + 1.3) / 2,
          "green",
          "grey" // Default
        );
      });

      /**
       * Row 42: Roof color rating
       * Excel: "_xlfn.IFS(clc_build!G$23=\"\",\"grey\",clc_build!G$23>0.8,\"red\",clc_build!G$23>0.5,\"orange\",clc_build!G$23>0.3,\"yellow\",clc_build!G$23<=0.3,\"green\")"
       */
      grid.setCell('OUT_rooms', `${outRoomsCol}42`, (s, c, g) => {
        return g.WENNS(
          g.g('clc_build', `${clcBuildCol}23`) === "",
          "grey",
          g.n('clc_build', `${clcBuildCol}23`) > 0.8,
          "red",
          g.n('clc_build', `${clcBuildCol}23`) > 0.5,
          "orange",
          g.n('clc_build', `${clcBuildCol}23`) > 0.3,
          "yellow",
          g.n('clc_build', `${clcBuildCol}23`) <= 0.3,
          "green",
          "grey" // Default
        );
      });

      /**
       * Row 43: Ceiling color rating (average of floor and top ceiling)
       * Excel: "_xlfn.LET(_xlpm.Umean,IF(AND(clc_build!G$27=\"\",clc_build!G$31=\"\"),\"\",(AVERAGE(clc_build!G$27,clc_build!G$31))),_xlfn.IFS(_xlpm.Umean=\"\",\"grey\",_xlpm.Umean>0.8,\"red\",_xlpm.Umean>0.5,\"orange\",_xlpm.Umean>0.4,\"yellow\",_xlpm.Umean<=0.4,\"green\"))"
       */
      grid.setCell('OUT_rooms', `${outRoomsCol}43`, (s, c, g) => {
        const umean = g.WENN(
          g.UND(g.g('clc_build', `${clcBuildCol}27`) === "", g.g('clc_build', `${clcBuildCol}31`) === ""),
          "",
          g.AVERAGE('clc_build', [g.g('clc_build', `${clcBuildCol}27`), g.g('clc_build', `${clcBuildCol}31`)])
        );

        return g.WENNS(
          umean === "",
          "grey",
          umean as number > 0.8,
          "red",
          umean as number > 0.5,
          "orange",
          umean as number > 0.4,
          "yellow",
          umean as number <= 0.4,
          "green",
          "grey" // Default
        );
      });

      /**
       * Row 46: Alternative text for NT-ready scale (accessibility)
       * Excel: "Bewertung der Eignung des Raumes für eine Wärmepumpe. Ein Heizkörper sollte mindestens 100 % der Heizlast decken. \n\nDer aktuelle Heizkörper leistet " & H14 & " und deckt etwa " & TEXT(clc_build!G39*100,"0") &" Prozent der Heizlast. " & IF(H35<=0.25, "Das ist ausreichend.", "Das ist nicht ausreichend. \n\nEin besserer Heizkörper hätte " & H15 & " und würde " & TEXT(clc_build!G40*100,"0") & " Prozent der Heizlast decken. " & IF(H36<=0.25,"Das ist ausreichend.","Das ist nicht ausreichend."))"
       */
      grid.setCell('OUT_rooms', `${outRoomsCol}46`, (s, c, g) => {
        const currentHeaterPerformance = g.g(s, `${outRoomsCol}14`);
        const currentCoverage = g.TEXT(g.n('clc_build', `${clcBuildCol}39`) * 100, "0");
        const isCurrentSufficient = g.g(s, `${outRoomsCol}35`) as number <= 0.25;

        const betterHeaterPerformance = g.g(s, `${outRoomsCol}15`);
        const betterCoverage = g.TEXT(g.n('clc_build', `${clcBuildCol}40`) * 100, "0");
        const isBetterSufficient = g.g(s, `${outRoomsCol}36`) as number <= 0.25;

        return `Bewertung der Eignung des Raumes für eine Wärmepumpe. Ein Heizkörper sollte mindestens 100 % der Heizlast decken.

Der aktuelle Heizkörper leistet ${currentHeaterPerformance} und deckt etwa ${currentCoverage} Prozent der Heizlast. ${isCurrentSufficient ? "Das ist ausreichend." : `Das ist nicht ausreichend.

Ein besserer Heizkörper hätte ${betterHeaterPerformance} und würde ${betterCoverage} Prozent der Heizlast decken. ${isBetterSufficient ? "Das ist ausreichend." : "Das ist nicht ausreichend."}`}`;
      });

      /**
       * Row 47: Alternative text for calculated room heating load scale (accessibility)
       * Excel: "Bewertung der geschätzten Raumheizlast. \n\nDie Raumheizlast beträgt " & H20 & ". Das sind " & TEXT(H12,0) & " Watt je Quadratmeter. Das ist " & _xlfn.IFS(\nH12<=0,"kein plausibler Wert.",\nH12<50,"ein sehr guter Wert.",\nH12<70,"ein guter Wert.",\nH12<90,"ein hoher Wert.",\nTRUE,"ein sehr hoher Wert.")"
       */
      grid.setCell('OUT_rooms', `${outRoomsCol}47`, (s, c, g) => {
        const roomHeatingLoad = g.g(s, `${outRoomsCol}20`);
        const heatingLoadPerSquareMeter = g.TEXT(g.n(s, `${outRoomsCol}12`), "0");
        const heatingLoadValue = g.n(s, `${outRoomsCol}12`);

        const assessment = g.WENNS(
          heatingLoadValue <= 0, "kein plausibler Wert.",
          heatingLoadValue < 50, "ein sehr guter Wert.",
          heatingLoadValue < 70, "ein guter Wert.",
          heatingLoadValue < 90, "ein hoher Wert.",
          g.WAHR(), "ein sehr hoher Wert."
        );

        return `Bewertung der geschätzten Raumheizlast.

Die Raumheizlast beträgt ${roomHeatingLoad}. Das sind ${heatingLoadPerSquareMeter} Watt je Quadratmeter. Das ist ${assessment}`;
      });

      /**
       * Row 50: Berechnung Außenwandlänge (Check if wall length exceeds typical room geometry)
       * Excel: "IN_rooms!R9>0.75*2*(4+1)/SQRT(4)*SQRT(IN_rooms!R4)"
       */
      grid.setCell('OUT_rooms', `${outRoomsCol}50`, (s, c, g) => {
        const wallLength = g.n('IN_rooms', `${inRoomsCol}9`);
        const roomArea = g.n('IN_rooms', `${inRoomsCol}4`);
        const maxTypical = 0.75 * 2 * (4 + 1) / Math.sqrt(4) * Math.sqrt(roomArea);
        return wallLength > maxTypical;
      });

      /**
       * Row 51: Ausgabe Außenwandlänge (Warning message if wall length is unusual)
       * Excel: "IF(H50,\"Warnung Raum \" & IN_rooms!R$3 & \": Die eingegebene Außenwandlänge ist für übliche Raumgeometrien ungewöhnlich groß. Bitte überprüfen Sie die Eingabewerte.\",\"\")"
       */
      grid.setCell('OUT_rooms', `${outRoomsCol}51`, (s, c, g) => {
        const hasWarning = g.g(s, `${outRoomsCol}50`);
        if (!hasWarning) return "";
        const roomName = g.g('IN_rooms', `${inRoomsCol}3`);
        return `Warnung Raum ${roomName}: Die eingegebene Außenwandlänge ist für übliche Raumgeometrien ungewöhnlich groß. Bitte überprüfen Sie die Eingabewerte.`;
      });

      /**
       * Row 52: Berechnung Fensterfläche (Check if window area exceeds net wall area)
       * Excel: "SUM(clc_load!I42,clc_load!I48,clc_load!I54)>IN_rooms!R9*IN_rooms!R5"
       */
      grid.setCell('OUT_rooms', `${outRoomsCol}52`, (s, c, g) => {
        const windowArea = g.SUM('clc_load', [
          g.g('clc_load', `${clcLoadCol}42`),
          g.g('clc_load', `${clcLoadCol}48`),
          g.g('clc_load', `${clcLoadCol}54`)
        ]);
        const wallLength = g.n('IN_rooms', `${inRoomsCol}9`);
        const roomHeight = g.n('IN_rooms', `${inRoomsCol}5`);
        return windowArea > (wallLength * roomHeight);
      });

      /**
       * Row 53: Ausgabe Fensterfläche (Warning message if window area exceeds wall area)
       * Excel: "IF(H52,\"Warnung Raum \" & IN_rooms!R$3 & \": Die berechnete Fensterfläche ist größer als die Netto-Außenwandfläche. Bitte überprüfen Sie die Eingabewerte für Höhe, Breite und Anzahl der Fenster sowie Außenwandlänge und Raumhöhe.\",\"\")"
       */
      grid.setCell('OUT_rooms', `${outRoomsCol}53`, (s, c, g) => {
        const hasWarning = g.g(s, `${outRoomsCol}52`);
        if (!hasWarning) return "";
        const roomName = g.g('IN_rooms', `${inRoomsCol}3`);
        return `Warnung Raum ${roomName}: Die berechnete Fensterfläche ist größer als die Netto-Außenwandfläche. Bitte überprüfen Sie die Eingabewerte für Höhe, Breite und Anzahl der Fenster sowie Außenwandlänge und Raumhöhe.`;
      });

      /**
       * Row 54: Berechnung Dachfensterfläche (Check if roof window area exceeds roof area)
       * Excel: "IF(OR(IN_rooms!R$28=\"Keine\",IN_rooms!R$28=\"\"),FALSE,SUM(clc_load!I60,clc_load!I66)>clc_load!I26)"
       */
      grid.setCell('OUT_rooms', `${outRoomsCol}54`, (s, c, g) => {
        // Check if roof exists
        const roofType = g.g('IN_rooms', `${inRoomsCol}28`);
        const noRoof = g.ODER(roofType === "Keine", roofType === "");

        if (noRoof) {
          return false;
        }

        const roofWindowArea = g.SUM('clc_load', [
          g.g('clc_load', `${clcLoadCol}60`),
          g.g('clc_load', `${clcLoadCol}66`)
        ]);
        const roofArea = g.n('clc_load', `${clcLoadCol}26`);
        return roofWindowArea > roofArea;
      });

      /**
       * Row 55: Ausgabe Dachfensterfläche (Warning message if roof window area exceeds roof area)
       * Excel: "IF(H54,\"Warnung Raum \" & IN_rooms!R$3 & \": Die berechnete Dachfensterfläche ist größer als die Netto-Dachfläche. Bitte überprüfen Sie die Eingabewerte für Höhe, Breite und Anzahl der Dachfenster sowie der Dachfläche(n).\",\"\")"
       */
      grid.setCell('OUT_rooms', `${outRoomsCol}55`, (s, c, g) => {
        const hasWarning = g.g(s, `${outRoomsCol}54`);
        if (!hasWarning) return "";
        const roomName = g.g('IN_rooms', `${inRoomsCol}3`);
        return `Warnung Raum ${roomName}: Die berechnete Dachfensterfläche ist größer als die Netto-Dachfläche. Bitte überprüfen Sie die Eingabewerte für Höhe, Breite und Anzahl der Dachfenster sowie der Dachfläche(n).`;
      });

      /**
       * Row 56: Berechnung Heizkörper fehlt (Check if no heater data entered or power is zero)
       * Excel: "false" (disabled check)
       */
      grid.setCell('OUT_rooms', `${outRoomsCol}56`, (s, c, g) => {
        return false;
      });

      /**
       * Row 57: Ausgabe Heizkörper fehlt (Warning if no heater entered)
       * Excel: "IF(H56,\"Warnung Raum \" & IN_rooms!R$3 & \": Es wurden keine Heizflächen erfasst oder die Eingaben sind unvollständig, bitte prüfen.\")"
       */
      grid.setCell('OUT_rooms', `${outRoomsCol}57`, (s, c, g) => {
        const hasWarning = g.g(s, `${outRoomsCol}56`);
        const roomName = g.g('IN_rooms', `${inRoomsCol}3`);
        return g.WENN(
          hasWarning,
          `Warnung Raum ${roomName}: Es wurden keine Heizflächen erfasst oder die Eingaben sind unvollständig, bitte prüfen.`,
          null
        );
      });

      /**
       * Row 58: Berechnung Kniestock / Drempelwand (Check if knee wall height >= room height)
       * Excel: "IF(OR(IN_rooms!R$28=\"Keine\",IN_rooms!R$28=\"\"),FALSE,IN_rooms!R$34>=IN_rooms!R$5)"
       */
      grid.setCell('OUT_rooms', `${outRoomsCol}58`, (s, c, g) => {
        // Check if roof exists
        const roofType = g.g('IN_rooms', `${inRoomsCol}28`);
        const noRoof = g.ODER(roofType === "Keine", roofType === "");

        if (noRoof) {
          return false;
        }

        const kneeWallHeight = g.n('IN_rooms', `${inRoomsCol}34`);
        const roomHeight = g.n('IN_rooms', `${inRoomsCol}5`);
        return kneeWallHeight >= roomHeight;
      });

      /**
       * Row 59: Ausgabe Kniestock / Drempelwand (Warning if knee wall height is implausible)
       * Excel: "IF(H58,\"Warnung Raum \" & IN_rooms!R$3 & \": Unplausible Eingabe für die Höhe des Kniestocks bzw. der Drempelwand, bitte prüfen.\")"
       */
      grid.setCell('OUT_rooms', `${outRoomsCol}59`, (s, c, g) => {
        const hasWarning = g.g(s, `${outRoomsCol}58`);
        const roomName = g.g('IN_rooms', `${inRoomsCol}3`);
        return g.WENN(
          hasWarning,
          `Warnung Raum ${roomName}: Unplausible Eingabe für die Höhe des Kniestocks bzw. der Drempelwand, bitte prüfen.`,
          null
        );
      });

      /**
       * Row 60: Berechnung Dachfläche Hypotenuse < Ankatete (Check if roof slope dimensions are implausible)
       * Excel:
       * "_xlfn.LET(
       *   _xlpm.no_roof,OR(IN_rooms!R$28=\"Keine\",IN_rooms!R$28=\"\"),
       *   _xlpm.alpha,_xlfn.IFS(
       *     IN_build!$P$4=\"geneigt\",25*PI()/180,
       *     IN_build!$P$4=\"steil\",40*PI()/180,
       *     IN_build!$P$4=\"sehr steil\",55*PI()/180),
       *   _xlpm.b_ceil,IN_rooms!R$32,
       *   _xlpm.h_roof,IN_rooms!R$31,
       *   _xlpm.b_room_max,2*SQRT(IN_rooms!R$4),
       *   IF(_xlpm.no_roof,FALSE,
       *     IF(IN_rooms!R$28=\"Eine\",_xlpm.b_ceil+COS(_xlpm.alpha)*_xlpm.h_roof>_xlpm.b_room_max,
       *       IF(IN_rooms!R$28=\"Zwei (symmetrisch)\",_xlpm.b_ceil+2*COS(_xlpm.alpha)*_xlpm.h_roof>_xlpm.b_room_max,FALSE))))"
       */
      grid.setCell('OUT_rooms', `${outRoomsCol}60`, (s, c, g) => {
        // Check if roof exists
        const roofType = g.g('IN_rooms', `${inRoomsCol}28`);
        const noRoof = g.ODER(roofType === "Keine", roofType === "");

        if (noRoof) {
          return false;
        }

        const roofSlope = g.g('IN_build', 'P4');
        const alpha = g.WENNS(
          roofSlope === "geneigt", 25 * Math.PI / 180,
          roofSlope === "steil", 40 * Math.PI / 180,
          roofSlope === "sehr steil", 55 * Math.PI / 180,
          0
        ) as number;

        const b_ceil = g.n('IN_rooms', `${inRoomsCol}32`);
        const h_roof = g.n('IN_rooms', `${inRoomsCol}31`);
        const b_room_max = 2 * Math.sqrt(g.n('IN_rooms', `${inRoomsCol}4`));

        return g.WENN(
          roofType === "Eine",
          b_ceil + Math.cos(alpha) * h_roof > b_room_max,
          g.WENN(
            roofType === "Zwei (symmetrisch)",
            b_ceil + 2 * Math.cos(alpha) * h_roof > b_room_max,
            false
          )
        );
      });

      /**
       * Row 61: Ausgabe Dachfläche Hypotenuse < Ankatete
       * Excel: "IF(H60,\"Warnung Raum \" & IN_rooms!R$3 & \": Die eingegebene Höhe der Dachschräge ist unplausibel groß, bitte prüfen.\",\"\")"
       */
      grid.setCell('OUT_rooms', `${outRoomsCol}61`, (s, c, g) => {
        const hasWarning = g.g(s, `${outRoomsCol}60`);
        if (!hasWarning) return "";
        const roomName = g.g('IN_rooms', `${inRoomsCol}3`);
        return `Warnung Raum ${roomName}: Die eingegebene Höhe der Dachschräge ist unplausibel groß, bitte prüfen.`;
      });

      /**
       * Row 62: Berechnung unplausible Dachflächenhöhe (Check if total roof height exceeds room height)
       * Excel:
       * "_xlfn.LET(
       *   _xlpm.no_roof,OR(IN_rooms!R$28=\"Keine\",IN_rooms!R$28=\"\"),
       *   _xlpm.alpha,_xlfn.IFS(
       *     IN_build!$P$4=\"geneigt\",25*PI()/180,
       *     IN_build!$P$4=\"steil\",40*PI()/180,
       *     IN_build!$P$4=\"sehr steil\",55*PI()/180),
       *   _xlpm.h_jamb,IN_rooms!R$34,
       *   _xlpm.h_roof,IN_rooms!R$31,
       *   _xlpm.h_room,IN_rooms!R$5,
       *   IF(_xlpm.no_roof,FALSE,_xlpm.h_jamb + SIN(_xlpm.alpha)*_xlpm.h_roof>1.2*_xlpm.h_room))"
       */
      grid.setCell('OUT_rooms', `${outRoomsCol}62`, (s, c, g) => {
        // Check if roof exists
        const roofType = g.g('IN_rooms', `${inRoomsCol}28`);
        const noRoof = g.ODER(roofType === "Keine", roofType === "");

        if (noRoof) {
          return false;
        }

        const roofSlope = g.g('IN_build', 'P4');
        const alpha = g.WENNS(
          roofSlope === "geneigt", 25 * Math.PI / 180,
          roofSlope === "steil", 40 * Math.PI / 180,
          roofSlope === "sehr steil", 55 * Math.PI / 180,
          0
        ) as number;

        const h_jamb = g.n('IN_rooms', `${inRoomsCol}34`);
        const h_roof = g.n('IN_rooms', `${inRoomsCol}31`);
        const h_room = g.n('IN_rooms', `${inRoomsCol}5`);

        return h_jamb + Math.sin(alpha) * h_roof > 1.2 * h_room;
      });

      /**
       * Row 63: Ausgabe unplausible Dachflächenhöhe
       * Excel: "IF(H62,\"Warnung Raum \" & IN_rooms!R$3 & \": Die Höhe der Dachschräge und die höhe der Drempelwand / Kniestock sind zu groß für die angegebene Raumhöhe, bitte prüfen.\",\"\")"
       */
      grid.setCell('OUT_rooms', `${outRoomsCol}63`, (s, c, g) => {
        const hasWarning = g.g(s, `${outRoomsCol}62`);
        if (!hasWarning) return "";
        const roomName = g.g('IN_rooms', `${inRoomsCol}3`);
        return `Warnung Raum ${roomName}: Die Höhe der Dachschräge und die höhe der Drempelwand / Kniestock sind zu groß für die angegebene Raumhöhe, bitte prüfen.`;
      });

      /**
       * Row 64: Berechnung Raumtemperatur (Check if room temperature is too high)
       * Excel: "IF(OR(ISNUMBER(SEARCH(\"bad\",IN_rooms!R$3)),ISNUMBER(SEARCH(\"wc\",IN_rooms!R$3))),IN_rooms!R$6>24,IN_rooms!R$6>21)"
       */
      grid.setCell('OUT_rooms', `${outRoomsCol}64`, (s, c, g) => {
        const roomName = String(g.g('IN_rooms', `${inRoomsCol}3`)).toLowerCase();
        const roomTemp = g.n('IN_rooms', `${inRoomsCol}6`);
        const isBathroom = roomName.includes('bad') || roomName.includes('wc');

        return g.WENN(
          isBathroom,
          roomTemp > 24,
          roomTemp > 21
        );
      });

      /**
       * Row 65: Ausgabe Raumtemperatur (Info message if room temperature is high)
       * Excel: "IF(H64,\"Hinweis Raum \" & IN_rooms!R$3 & \": Die Raumtemperatur ist vergleichsweise hoch. Nach Norm werden 20 °C in Wohnräumen und 24 °C in Bädern angesetzt.\",\"\")"
       */
      grid.setCell('OUT_rooms', `${outRoomsCol}65`, (s, c, g) => {
        const hasWarning = g.g(s, `${outRoomsCol}64`);
        if (!hasWarning) return "";
        const roomName = g.g('IN_rooms', `${inRoomsCol}3`);
        return `Hinweis Raum ${roomName}: Die Raumtemperatur ist vergleichsweise hoch. Nach Norm werden 20 °C in Wohnräumen und 24 °C in Bädern angesetzt.`;
      });
    }
  }
}
