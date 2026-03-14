import {DataGrid} from '../data-grid';
import {FormulaOverlay} from './base-overlay';

/**
 * OUT_build sheet formula overlay
 * Contains formula implementations for the OUT_build sheet
 */
export class OutBuildOverlay implements FormulaOverlay {

  /**
   * Apply OUT_build formulas to the data grid
   * @param grid The DataGrid instance to apply formulas to
   */
  applyFormulas(grid: DataGrid): void {

    /**
     * Row 2: Real Wert Position NT-readiness Skala
     * Excel: "IF(clc_build!G81<=0,0.125,MIN(clc_build!G81+0.25,0.875))"
     */
    grid.setCell('OUT_build', 'H2', (s, c, g) =>
      g.WENN(
        g.n('clc_build', 'G81') <= 0,
        0.125,
        g.MIN(g.n('clc_build', 'G81') + 0.25, 0.875)
      )
    );

    /**
     * Row 3: NT-Readiness Gesamtgebäude
     * Excel: "_xlfn.IFS(OR(clc_build!G73>=0.5,clc_build!G75>=0.75),TXT_build!D2,
     * OR(clc_build!G66>0,clc_build!G76>=0.75),TXT_build!D3,
     * clc_build!G68>0,TXT_build!D4,
     * clc_build!G78>=1,TXT_build!D5)"
     */
    grid.setCell('OUT_build', 'H3', (s, c, g) =>
      g.WENNS(
        g.ODER(
          g.n('clc_build', 'G73') >= 0.5,
          g.n('clc_build', 'G75') >= 0.75
        ),
        g.g('TXT_build', 'D2'),

        g.ODER(
          g.n('clc_build', 'G66') > 0,
          g.n('clc_build', 'G76') >= 0.75
        ),
        g.g('TXT_build', 'D3'),

        g.n('clc_build', 'G68') > 0,
        g.g('TXT_build', 'D4'),

        g.n('clc_build', 'G78') >= 1,
        g.g('TXT_build', 'D5')
      )
    );

    /**
     * Row 4: Anzahl betroffene Räume HK-Tausch
     * Excel: "IF(clc_build!G76=1,\"Alle \",TEXT(clc_build!$G$66,\"0\")&\" von \"&TEXT(clc_build!$G$49,\"0\")&\" der \")"
     */
    grid.setCell('OUT_build', 'H4', (s, c, g) =>
      g.WENN(
        g.n('clc_build', 'G76') === 1,
        "Alle ",
        `${g.TEXT(g.n('clc_build', 'G66'), "0")} von ${g.TEXT(g.n('clc_build', 'G49'), "0")} der `
      )
    );

    /**
     * Row 5: Heizkörpertausch
     * Excel: "_xlfn.IFS(
     * OR(clc_build!$G$73>=0.5,AND(clc_build!$G$74>=0.75,clc_build!$G$71>=1)),TXT_build!$D$15&H4&TXT_build!$D$16,
     * clc_build!$G$74>=0.25,TXT_build!$D$17,
     * clc_build!$G$68>=1,TXT_build!$D$18,
     * clc_build!$G$78>1,TXT_build!$D$19,
     * TRUE,\"FEHLER - keine eindeutige Bewertung der Heizkörper möglich\")"
     */
    grid.setCell('OUT_build', 'H5', (s, c, g) =>
      g.WENNS(
        g.ODER(
          g.n('clc_build', 'G73') >= 0.5,
          g.UND(
            g.n('clc_build', 'G74') >= 0.75,
            g.n('clc_build', 'G71') >= 1
          )
        ),
        `${g.g('TXT_build', 'D15')}${g.g(s, 'H4')}${g.g('TXT_build', 'D16')}`,

        g.n('clc_build', 'G74') >= 0.25,
        g.g('TXT_build', 'D17'),

        g.n('clc_build', 'G68') >= 1,
        g.g('TXT_build', 'D18'),

        g.n('clc_build', 'G78') > 1,
        g.g('TXT_build', 'D19'),

        g.WAHR(),
        "FEHLER - keine eindeutige Bewertung der Heizkörper möglich"
      )
    );

    /**
     * Row 6: summiert Transmissionswärmeverluste
     * Excel: "SUM(clc_build!G3:AA3)"
     */
    grid.setCell('OUT_build', 'H6', (s, c, g) =>
      g.SUM('clc_build', g.RANGE('G3:AA3', 'clc_build'))
    );

    /**
     * Row 7: Bauteil max. Heizlast
     * Excel: " MAX(SUM(clc_build!$G$12:$AA$12), SUM(clc_build!$G$16:$AA$16),SUM(clc_build!$G$20:$AA$20), SUM(clc_build!$G$24:$AA$24), SUM(clc_build!$G$28:$AA$28), SUM(clc_build!$G$32:$AA$32))"
     */
    grid.setCell('OUT_build', 'H7', (s, c, g) =>
      g.MAX(
        g.SUM('clc_build', g.RANGE('G12:AA12', 'clc_build')),
        g.SUM('clc_build', g.RANGE('G16:AA16', 'clc_build')),
        g.SUM('clc_build', g.RANGE('G20:AA20', 'clc_build')),
        g.SUM('clc_build', g.RANGE('G24:AA24', 'clc_build')),
        g.SUM('clc_build', g.RANGE('G28:AA28', 'clc_build')),
        g.SUM('clc_build', g.RANGE('G32:AA32', 'clc_build'))
      )
    );

    /**
     * Row 8: Bauteil 2. größte Heizlast
     * Excel: "LARGE(CHOOSE({1,2,3,4,5,6},
     * SUM(clc_build!$G$12:$AA$12),
     * SUM(clc_build!$G$16:$AA$16),
     * SUM(clc_build!$G$20:$AA$20),
     * SUM(clc_build!$G$24:$AA$24),
     * SUM(clc_build!$G$28:$AA$28),
     * SUM(clc_build!$G$32:$AA$32)
     * ),2)"
     */
    grid.setCell('OUT_build', 'H8', (s, c, g) => {
      const values = [
        g.SUM('clc_build', g.RANGE('G12:AA12', 'clc_build')),
        g.SUM('clc_build', g.RANGE('G16:AA16', 'clc_build')),
        g.SUM('clc_build', g.RANGE('G20:AA20', 'clc_build')),
        g.SUM('clc_build', g.RANGE('G24:AA24', 'clc_build')),
        g.SUM('clc_build', g.RANGE('G28:AA28', 'clc_build')),
        g.SUM('clc_build', g.RANGE('G32:AA32', 'clc_build'))
      ];
      return g.LARGE(values, 2);
    });

    /**
     * Row 9: Bauteil 3. größte Heizlast
     * Excel: "LARGE(CHOOSE({1,2,3,4,5,6},
     * SUM(clc_build!$G$12:$AA$12),
     * SUM(clc_build!$G$16:$AA$16),
     * SUM(clc_build!$G$20:$AA$20),
     * SUM(clc_build!$G$24:$AA$24),
     * SUM(clc_build!$G$28:$AA$28),
     * SUM(clc_build!$G$32:$AA$32)
     * ),3)"
     */
    grid.setCell('OUT_build', 'H9', (s, c, g) => {
      const values = [
        g.SUM('clc_build', g.RANGE('G12:AA12', 'clc_build')),
        g.SUM('clc_build', g.RANGE('G16:AA16', 'clc_build')),
        g.SUM('clc_build', g.RANGE('G20:AA20', 'clc_build')),
        g.SUM('clc_build', g.RANGE('G24:AA24', 'clc_build')),
        g.SUM('clc_build', g.RANGE('G28:AA28', 'clc_build')),
        g.SUM('clc_build', g.RANGE('G32:AA32', 'clc_build'))
      ];
      return g.LARGE(values, 3);
    });

    /**
     * Row 10: Außenwand Anteil Heizlast
     * Excel: "IF(ROUND(SUM(clc_build!$G$12:$AA$12)/H6,1)<0.15,\"unter 10 Prozent\", TEXT(ROUND(SUM(clc_build!$G$12:$AA$12)/H6,1)*100,0)&\" Prozent\")"
     */
    grid.setCell('OUT_build', 'H10', (s, c, g) => {
      const ratio = Math.round((g.SUM('clc_build', g.RANGE('G12:AA12', 'clc_build')) / g.n(s, 'H6')) * 10) / 10;
      return g.WENN(
        ratio < 0.15,
        "unter 10 Prozent",
        `${g.TEXT(ratio * 100, "0")} Prozent`
      );
    });

    /**
     * Row 11: Innenwand Anteil Heizlast
     * Excel: "IF(ROUND(SUM(clc_build!$G$16:$AA$16)/H6,1)<0.15,\"unter 10 Prozent\", TEXT(ROUND(SUM(clc_build!$G$16:$AA$16)/H6,1)*100,0)&\" Prozent\")"
     */
    grid.setCell('OUT_build', 'H11', (s, c, g) => {
      const ratio = Math.round((g.SUM('clc_build', g.RANGE('G16:AA16', 'clc_build')) / g.n(s, 'H6')) * 10) / 10;
      return g.WENN(
        ratio < 0.15,
        "unter 10 Prozent",
        `${g.TEXT(ratio * 100, "0")} Prozent`
      );
    });

    /**
     * Row 12: Fenster Anteil Heizlast
     * Excel: "IF(ROUND(SUM(clc_build!$G$20:$AA$20)/H6,1)<0.15,\"unter 10 Prozent\", TEXT(ROUND(SUM(clc_build!$G$20:$AA$20)/H6,1)*100,0)&\" Prozent\")"
     */
    grid.setCell('OUT_build', 'H12', (s, c, g) => {
      const ratio = Math.round((g.SUM('clc_build', g.RANGE('G20:AA20', 'clc_build')) / g.n(s, 'H6')) * 10) / 10;
      return g.WENN(
        ratio < 0.15,
        "unter 10 Prozent",
        `${g.TEXT(ratio * 100, "0")} Prozent`
      );
    });

    /**
     * Row 13: Dach Anteil Heizlast
     * Excel: "IF(ROUND(SUM(clc_build!$G$24:$AA$24)/H6,1)<0.15,\"unter 10 Prozent\", TEXT(ROUND(SUM(clc_build!$G$24:$AA$24)/H6,1)*100,0)&\" Prozent\")"
     */
    grid.setCell('OUT_build', 'H13', (s, c, g) => {
      const ratio = Math.round((g.SUM('clc_build', g.RANGE('G24:AA24', 'clc_build')) / g.n(s, 'H6')) * 10) / 10;
      return g.WENN(
        ratio < 0.15,
        "unter 10 Prozent",
        `${g.TEXT(ratio * 100, "0")} Prozent`
      );
    });

    /**
     * Row 14: Fußboden Anteil Heizlast
     * Excel: "IF(ROUND(SUM(clc_build!$G$28:$AA$28)/H6,1)<0.15,\"unter 10 Prozent\", TEXT(ROUND(SUM(clc_build!$G$28:$AA$28)/H6,1)*100,0)&\" Prozent\")"
     */
    grid.setCell('OUT_build', 'H14', (s, c, g) => {
      const ratio = Math.round((g.SUM('clc_build', g.RANGE('G28:AA28', 'clc_build')) / g.n(s, 'H6')) * 10) / 10;
      return g.WENN(
        ratio < 0.15,
        "unter 10 Prozent",
        `${g.TEXT(ratio * 100, "0")} Prozent`
      );
    });

    /**
     * Row 15: Decke Anteil Heizlast
     * Excel: "IF(ROUND(SUM(clc_build!$G$32:$AA$32)/H6,1)<0.15,\"unter 10 Prozent\", TEXT(ROUND(SUM(clc_build!$G$32:$AA$32)/H6,1)*100,0)&\" Prozent\")"
     */
    grid.setCell('OUT_build', 'H15', (s, c, g) => {
      const ratio = Math.round((g.SUM('clc_build', g.RANGE('G32:AA32', 'clc_build')) / g.n(s, 'H6')) * 10) / 10;
      return g.WENN(
        ratio < 0.15,
        "unter 10 Prozent",
        `${g.TEXT(ratio * 100, "0")} Prozent`
      );
    });

    /**
     * Row 17: Mittlerer U-Wert Außenwand
     * Excel: "AVERAGE(clc_build!G11:'clc_build'!AA11)"
     */
    grid.setCell('OUT_build', 'H17', (s, c, g) =>
      g.AVERAGE('clc_build', g.RANGE('G11:AA11', 'clc_build'))
    );

    /**
     * Row 18: Mittlerer U-Wert Fenster
     * Excel: "AVERAGE(clc_build!G19:'clc_build'!AA19)"
     */
    grid.setCell('OUT_build', 'H18', (s, c, g) =>
      g.AVERAGE('clc_build', g.RANGE('G19:AA19', 'clc_build'))
    );

    /**
     * Row 19: Mittelwert U-Wert Dach
     * Excel: "AVERAGE(clc_build!G23:'clc_build'!AA23)"
     */
    grid.setCell('OUT_build', 'H19', (s, c, g) =>
      g.AVERAGE('clc_build', g.RANGE('G23:AA23', 'clc_build'))
    );

    /**
     * Row 20: Mittelwert U-Wert Fußboden
     * Excel: "AVERAGE(clc_build!G27:'clc_build'!AA27)"
     */
    grid.setCell('OUT_build', 'H20', (s, c, g) =>
      g.AVERAGE('clc_build', g.RANGE('G27:AA27', 'clc_build'))
    );

    /**
     * Row 21: Mittelwert U-Wert Decke
     * Excel: "AVERAGE(clc_build!G31:'clc_build'!AA31)"
     */
    grid.setCell('OUT_build', 'H21', (s, c, g) =>
      g.AVERAGE('clc_build', g.RANGE('G31:AA31', 'clc_build'))
    );

    /**
     * Row 16: Complex LET formula for worst building component
     * Excel: "_xlfn.LET(
     *   _xlpm.Bauteil1, _xlfn.IFS(
     *     SUM(clc_build!$G$12:$AA$12)=H7, \"Außenwand\",
     *     SUM(clc_build!$G$20:$AA$20)=H7, \"Fenster\",
     *     SUM(clc_build!$G$24:$AA$24)=H7, \"Dach\",
     *     SUM(clc_build!$G$28:$AA$28)=H7, \"Fußboden\",
     *     SUM(clc_build!$G$32:$AA$32)=H7, \"Decke\"
     *   ),
     *   _xlpm.Bauteil2, _xlfn.IFS(
     *     SUM(clc_build!$G$12:$AA$12)=H8, \"Außenwand\",
     *     SUM(clc_build!$G$20:$AA$20)=H8, \"Fenster\",
     *     SUM(clc_build!$G$24:$AA$24)=H8, \"Dach\",
     *     SUM(clc_build!$G$28:$AA$28)=H8, \"Fußboden\",
     *     SUM(clc_build!$G$32:$AA$32)=H8, \"Decke\"
     *   ),
     *   _xlpm.Bauteil3, _xlfn.IFS(
     *     SUM(clc_build!$G$12:$AA$12)=H9, \"Außenwand\",
     *     SUM(clc_build!$G$20:$AA$20)=H9, \"Fenster\",
     *     SUM(clc_build!$G$24:$AA$24)=H9, \"Dach\",
     *     SUM(clc_build!$G$28:$AA$28)=H9, \"Fußboden\",
     *     SUM(clc_build!$G$32:$AA$32)=H9, \"Decke\"
     *   ),
     *   _xlpm.GedA, INDEX(IN_build!Q7:Q11, MATCH(_xlpm.Bauteil1, IN_build!E7:E11, 0)),
     *   _xlpm.GedB, INDEX(IN_build!Q7:Q11, MATCH(_xlpm.Bauteil2, IN_build!E7:E11, 0)),
     *   _xlpm.GedC, INDEX(IN_build!Q7:Q11, MATCH(_xlpm.Bauteil3, IN_build!E7:E11, 0)),
     *   _xlpm.output, IF(_xlpm.GedA<>\"Ja\", _xlpm.Bauteil1,IF(_xlpm.GedB<>\"Ja\", _xlpm.Bauteil2,IF(_xlpm.GedC<>\"Ja\", _xlpm.Bauteil3, \"\"))),
     *   _xlfn.IFS(
     *     _xlpm.output=\"Außenwand\", \" hat die Außenwand.\",
     *     _xlpm.output=\"Innenwand\", \" hat die Innenwand.\",
     *     _xlpm.output=\"Fenster\", \" haben die Fenster.\",
     *     _xlpm.output=\"Dach\", \" hat das Dach.\",
     *     _xlpm.output=\"Fußboden\", \" hat der Fußboden.\",
     *     _xlpm.output=\"Decke\", \" hat die Decke.\"
     *   ))"
     */
    grid.setCell('OUT_build', 'H16', (s, c, g) => {
      // LET variables equivalent to Excel
      const Bauteil1 = g.WENNS(
        g.SUM('clc_build', g.RANGE('G12:AA12', 'clc_build')) === g.n(s, 'H7'), "Außenwand",
        g.SUM('clc_build', g.RANGE('G20:AA20', 'clc_build')) === g.n(s, 'H7'), "Fenster",
        g.SUM('clc_build', g.RANGE('G24:AA24', 'clc_build')) === g.n(s, 'H7'), "Dach",
        g.SUM('clc_build', g.RANGE('G28:AA28', 'clc_build')) === g.n(s, 'H7'), "Fußboden",
        g.SUM('clc_build', g.RANGE('G32:AA32', 'clc_build')) === g.n(s, 'H7'), "Decke",
        g.WAHR(), ""
      );

      const Bauteil2 = g.WENNS(
        g.SUM('clc_build', g.RANGE('G12:AA12', 'clc_build')) === g.n(s, 'H8'), "Außenwand",
        g.SUM('clc_build', g.RANGE('G20:AA20', 'clc_build')) === g.n(s, 'H8'), "Fenster",
        g.SUM('clc_build', g.RANGE('G24:AA24', 'clc_build')) === g.n(s, 'H8'), "Dach",
        g.SUM('clc_build', g.RANGE('G28:AA28', 'clc_build')) === g.n(s, 'H8'), "Fußboden",
        g.SUM('clc_build', g.RANGE('G32:AA32', 'clc_build')) === g.n(s, 'H8'), "Decke",
        g.WAHR(), ""
      );

      const Bauteil3 = g.WENNS(
        g.SUM('clc_build', g.RANGE('G12:AA12', 'clc_build')) === g.n(s, 'H9'), "Außenwand",
        g.SUM('clc_build', g.RANGE('G20:AA20', 'clc_build')) === g.n(s, 'H9'), "Fenster",
        g.SUM('clc_build', g.RANGE('G24:AA24', 'clc_build')) === g.n(s, 'H9'), "Dach",
        g.SUM('clc_build', g.RANGE('G28:AA28', 'clc_build')) === g.n(s, 'H9'), "Fußboden",
        g.SUM('clc_build', g.RANGE('G32:AA32', 'clc_build')) === g.n(s, 'H9'), "Decke",
        g.WAHR(), ""
      );

      // INDEX(IN_build!Q7:Q11, MATCH(_xlpm.Bauteil1, IN_build!E7:E11, 0))
      const GedA = g.INDEX('IN_build', 'Q7', 'Q11', 
        g.XMATCH(Bauteil1, g.RANGE('E7:E11', 'IN_build')), 1);

      const GedB = g.INDEX('IN_build', 'Q7', 'Q11', 
        g.XMATCH(Bauteil2, g.RANGE('E7:E11', 'IN_build')), 1);

      const GedC = g.INDEX('IN_build', 'Q7', 'Q11', 
        g.XMATCH(Bauteil3, g.RANGE('E7:E11', 'IN_build')), 1);

      // IF(_xlpm.GedA<>"Ja", _xlpm.Bauteil1,IF(_xlpm.GedB<>"Ja", _xlpm.Bauteil2,IF(_xlpm.GedC<>"Ja", _xlpm.Bauteil3, "")))
      const output = g.WENN(
        GedA !== "Ja", Bauteil1,
        g.WENN(
          GedB !== "Ja", Bauteil2,
          g.WENN(
            GedC !== "Ja", Bauteil3,
            ""
          )
        )
      );

      // Final IFS for output text
      return g.WENNS(
        output === "Außenwand", " hat die Außenwand.",
        output === "Innenwand", " hat die Innenwand.",
        output === "Fenster", " haben die Fenster.",
        output === "Dach", " hat das Dach.",
        output === "Fußboden", " hat der Fußboden.",
        output === "Decke", " hat die Decke.",
        g.WAHR(), ""
      );
    });

    /**
     * Row 22: Bildunterschrift - Außenwand Anteil Heizlast
     * Excel: "IF(ROUND(SUM(clc_build!$G$12:$AA$12)/H6,1)<0.15,\"< 10 % der Verluste\", TEXT(ROUND(SUM(clc_build!$G$12:$AA$12)/H6,1)*100,0)&\" % der Verluste\")"
     */
    grid.setCell('OUT_build', 'H22', (s, c, g) => {
      const ratio = Math.round((g.SUM('clc_build', g.RANGE('G12:AA12', 'clc_build')) / g.n(s, 'H6')) * 10) / 10;
      return g.WENN(
        ratio < 0.15,
        "< 10 % der Verluste",
        `${g.TEXT(ratio * 100, "0")} % der Verluste`
      );
    });

    /**
     * Row 23: Bildunterschrift - Fenster Anteil Heizlast
     * Excel: "IF(ROUND(SUM(clc_build!$G$20:$AA$20)/H6,1)<0.15,\"< 10 % der Verluste\", TEXT(ROUND(SUM(clc_build!$G$20:$AA$20)/H6,1)*100,0)&\" % der Verluste\")"
     */
    grid.setCell('OUT_build', 'H23', (s, c, g) => {
      const ratio = Math.round((g.SUM('clc_build', g.RANGE('G20:AA20', 'clc_build')) / g.n(s, 'H6')) * 10) / 10;
      return g.WENN(
        ratio < 0.15,
        "< 10 % der Verluste",
        `${g.TEXT(ratio * 100, "0")} % der Verluste`
      );
    });

    /**
     * Row 24: Bildunterschrift - Dach Anteil Heizlast
     * Excel: "IF(ROUND(SUM(clc_build!$G$24:$AA$24)/H6,1)<0.15,\"< 10 % der Verluste\", TEXT(ROUND(SUM(clc_build!$G$24:$AA$24)/H6,1)*100,0)&\" % der Verluste\")"
     */
    grid.setCell('OUT_build', 'H24', (s, c, g) => {
      const ratio = Math.round((g.SUM('clc_build', g.RANGE('G24:AA24', 'clc_build')) / g.n(s, 'H6')) * 10) / 10;
      return g.WENN(
        ratio < 0.15,
        "< 10 % der Verluste",
        `${g.TEXT(ratio * 100, "0")} % der Verluste`
      );
    });

    /**
     * Row 25: Bildunterschrift - Fußboden + Decke Anteil Heizlast
     * Excel: "IF(ROUND((SUM(clc_build!$G$28:$AA$28)+SUM(clc_build!$G$32:$AA$32))/H6,1)<0.15,\"< 10 % der Verluste\", TEXT(ROUND((SUM(clc_build!$G$28:$AA$28)+SUM(clc_build!$G$32:$AA$32))/H6,1)*100,0)&\" % der Verluste\")"
     */
    grid.setCell('OUT_build', 'H25', (s, c, g) => {
      const sumFloorCeiling = g.SUM('clc_build', g.RANGE('G28:AA28', 'clc_build')) + g.SUM('clc_build', g.RANGE('G32:AA32', 'clc_build'));
      const ratio = Math.round((sumFloorCeiling / g.n(s, 'H6')) * 10) / 10;
      return g.WENN(
        ratio < 0.15,
        "< 10 % der Verluste",
        `${g.TEXT(ratio * 100, "0")} % der Verluste`
      );
    });

    /**
     * Row 26: Traffic Light Color for Heat Pump
     * Excel: "_xlfn.IFS(clc_build!G88>=0.75,\"red\",
     * OR(clc_build!G88>=0.5,clc_build!G87>=0.75),\"orange\",
     * OR(clc_build!G88>0,(clc_build!G87+clc_build!G88)>=0.25,clc_build!G83<0.5),\"yellow\",
     * TRUE,\"green\")"
     */
    grid.setCell('OUT_build', 'H26', (s, c, g) =>
      g.WENNS(
        g.n('clc_build', 'G88') >= 0.75,
        "red",

        g.ODER(
          g.n('clc_build', 'G88') >= 0.5,
          g.n('clc_build', 'G87') >= 0.75
        ),
        "orange",

        g.ODER(
          g.n('clc_build', 'G88') > 0,
          (g.n('clc_build', 'G87') + g.n('clc_build', 'G88')) >= 0.25,
          g.n('clc_build', 'G83') < 0.5
        ),
        "yellow",

        g.WAHR(),
        "green"
      )
    );

    /**
     * Row 27: Traffic Light Color for Außenwand
     * Excel: "IFERROR(_xlfn.IFS(H17>0.8,\"red\",
     * H17>0.5,\"orange\",
     * H17>0.35,\"yellow\",
     * H17<=0.35,\"green\"),\"grey\")"
     */
    grid.setCell('OUT_build', 'H27', (s, c, g) =>
      g.IFERROR(
        g.WENNS(
          g.n(s, 'H17') > 0.8, "red",
          g.n(s, 'H17') > 0.5, "orange",
          g.n(s, 'H17') > 0.35, "yellow",
          g.n(s, 'H17') <= 0.35, "green",
          g.WAHR(), "green"
        ),
        "grey"
      )
    );

    /**
     * Row 28: Traffic Light Color for Fenster
     * Excel: "_xlfn.LET(
     * _xlpm.r_win_27, COUNTIF(clc_build!G19:AA19,\">2,7\")/clc_build!$G$49,
     * _xlpm.r_win_21, COUNTIF(clc_build!G19:AA19,\">2,1\")/clc_build!$G$49,
     * _xlpm.r_win_17,COUNTIF(clc_build!G19:AA19,\">1,3\")/clc_build!$G$49,
     * _xlpm.r_win_13,COUNTIF(clc_build!G19:AA19,\"<=1,3\")/clc_build!$G$49,
     * _xlfn.IFS(
     * _xlpm.r_win_27>=0.5,\"red\",
     * OR(_xlpm.r_win_27>=0.25,_xlpm.r_win_21>=0.5),\"orange\",
     * OR(_xlpm.r_win_21>=0.1,_xlpm.r_win_17>=0.5),\"yellow\",
     * TRUE,\"green\"))"
     */
    grid.setCell('OUT_build', 'H28', (s, c, g) => {
      const r_win_27 = g.COUNTIF('clc_build', 'G19:AA19', '>2.7') / g.n('clc_build', 'G49');
      const r_win_21 = g.COUNTIF('clc_build', 'G19:AA19', '>2.1') / g.n('clc_build', 'G49');
      const r_win_17 = g.COUNTIF('clc_build', 'G19:AA19', '>1.3') / g.n('clc_build', 'G49');
      const r_win_13 = g.COUNTIF('clc_build', 'G19:AA19', '<=1.3') / g.n('clc_build', 'G49');

      return g.WENNS(
        r_win_27 >= 0.5, "red",
        g.ODER(r_win_27 >= 0.25, r_win_21 >= 0.5), "orange",
        g.ODER(r_win_21 >= 0.1, r_win_17 >= 0.5), "yellow",
        g.WAHR(), "green"
      );
    });

    /**
     * Row 29: Traffic Light Color for Dach
     * Excel: "IFERROR(_xlfn.IFS(H19>0.8,\"red\",
     * H19>0.5,\"orange\",
     * H19>0.3,\"yellow\",
     * H19<=0.3,\"green\"),\"grey\")"
     */
    grid.setCell('OUT_build', 'H29', (s, c, g) =>
      g.IFERROR(
        g.WENNS(
          g.n(s, 'H19') > 0.8, "red",
          g.n(s, 'H19') > 0.5, "orange",
          g.n(s, 'H19') > 0.3, "yellow",
          g.n(s, 'H19') <= 0.3, "green",
          g.WAHR(), "green"
        ),
        "grey"
      )
    );

    /**
     * Row 30: Traffic Light Color for Fußboden
     * Excel: "IFERROR(_xlfn.IFS(AND(H20>0.8,NOT(LEFT(H14,1)=\"u\")),\"red\",
     * H20>0.5,\"orange\",
     * H20>0.4,\"yellow\",
     * H20<=0.4,\"green\"),\"grey\")"
     */
    grid.setCell('OUT_build', 'H30', (s, c, g) =>
      g.IFERROR(
        g.WENNS(
          g.UND(
            g.n(s, 'H20') > 0.8,
            g.LINKS(g.g(s, 'H14'), 1) !== "u"
          ), "red",

          g.n(s, 'H20') > 0.5, "orange",

          g.n(s, 'H20') > 0.4, "yellow",
          g.n(s, 'H20') <= 0.4, "green",
          g.WAHR(), "green"
        ),
        "grey"
      )
    );

    /**
     * Row 31: Traffic Light Color for Decke
     * Excel: "IFERROR(_xlfn.IFS(AND(H21>0.8,NOT(LEFT(H15,1)=\"u\")),\"red\",
     * H21>0.5,\"orange\",
     * H21>0.3,\"yellow\",
     * H21<=0.3,\"green\"),\"grey\")"
     */
    grid.setCell('OUT_build', 'H31', (s, c, g) =>
      g.IFERROR(
        g.WENNS(
          g.UND(
            g.n(s, 'H21') > 0.8,
            g.LINKS(g.g(s, 'H15'), 1) !== "u"
          ), "red",

          g.n(s, 'H21') > 0.5, "orange",

          g.n(s, 'H21') > 0.3, "yellow",
          g.n(s, 'H21') <= 0.3, "green",
          g.WAHR(), "green"
        ),
        "grey"
      )
    );

    /**
     * Row 32: Combined Traffic Light Color for Fußboden + Decke
     * Excel: "IFERROR(_xlfn.IFS(AND(H30=\"red\",H31=\"red\"),\"red\",
     * OR(H30=\"red\",H31=\"red\",H30=\"orange\",H31=\"orange\"),\"orange\",
     * OR(H30=\"yellow\",H31=\"yellow\"),\"yellow\",
     * TRUE,\"green\"),\"grey\")"
     */
    grid.setCell('OUT_build', 'H32', (s, c, g) =>
      g.IFERROR(
        g.WENNS(
          g.UND(
            g.g(s, 'H30') === "red",
            g.g(s, 'H31') === "red"
          ), "red",

          g.ODER(
            g.g(s, 'H30') === "red",
            g.g(s, 'H31') === "red",
            g.g(s, 'H30') === "orange",
            g.g(s, 'H31') === "orange"
          ), "orange",

          g.ODER(
            g.g(s, 'H30') === "yellow",
            g.g(s, 'H31') === "yellow"
          ), "yellow",

          g.WAHR(), "green"
        ),
        "grey"
      )
    );

    /**
     * Row 33: Heat Pump Assessment Text
     * Excel: "_xlfn.IFS(H26=\"red\",TXT_build!D20&H16,
     * H26=\"orange\",TXT_build!D22&H16,
     * H26=\"yellow\",TXT_build!D24&H16,
     * TRUE,TXT_build!D26)"
     */
    grid.setCell('OUT_build', 'H33', (s, c, g) =>
      g.WENNS(
        g.g(s, 'H26') === "red", `${g.g('TXT_build', 'D20')}${g.g(s, 'H16')}`,
        g.g(s, 'H26') === "orange", `${g.g('TXT_build', 'D22')}${g.g(s, 'H16')}`,
        g.g(s, 'H26') === "yellow", `${g.g('TXT_build', 'D24')}${g.g(s, 'H16')}`,
        g.WAHR(), g.g('TXT_build', 'D26')
      )
    );

    /**
     * Row 34: Außenwand Assessment Text
     * Excel: "_xlfn.IFS(OR(H27=\"grey\", LEFT(H10,1)=\"u\"),TXT_build!D64,
     * H27=\"red\",TXT_build!D28&H10&TXT_build!D29,
     * H27=\"orange\",TXT_build!D30&H10&TXT_build!D31,
     * H27=\"yellow\",TXT_build!D32&H10&TXT_build!D33,
     * H27=\"green\",TXT_build!D34)"
     */
    grid.setCell('OUT_build', 'H34', (s, c, g) =>
      g.WENNS(
        g.ODER(
          g.g(s, 'H27') === "grey",
          g.LINKS(g.g(s, 'H10'), 1) === "u"
        ), g.g('TXT_build', 'D64'),
        g.g(s, 'H27') === "red", `${g.g('TXT_build', 'D28')}${g.g(s, 'H10')}${g.g('TXT_build', 'D29')}`,
        g.g(s, 'H27') === "orange", `${g.g('TXT_build', 'D30')}${g.g(s, 'H10')}${g.g('TXT_build', 'D31')}`,
        g.g(s, 'H27') === "yellow", `${g.g('TXT_build', 'D32')}${g.g(s, 'H10')}${g.g('TXT_build', 'D33')}`,
        g.g(s, 'H27') === "green", g.g('TXT_build', 'D34')
      )
    );

    /**
     * Row 35: Fenster Assessment Text
     * Excel: "_xlfn.IFS(OR(H28=\"grey\", LEFT(H12,1)=\"u\"),TXT_build!D65,
     * H28=\"red\",TXT_build!D35&H12&TXT_build!D36,
     * H28=\"orange\",TXT_build!D37&H12&TXT_build!D38,
     * H28=\"yellow\",TXT_build!D39,
     * TRUE,TXT_build!D40)"
     */
    grid.setCell('OUT_build', 'H35', (s, c, g) =>
      g.WENNS(
        g.ODER(
          g.g(s, 'H28') === "grey",
          g.LINKS(g.g(s, 'H12'), 1) === "u"
        ), g.g('TXT_build', 'D65'),
        g.g(s, 'H28') === "red", `${g.g('TXT_build', 'D35')}${g.g(s, 'H12')}${g.g('TXT_build', 'D36')}`,
        g.g(s, 'H28') === "orange", `${g.g('TXT_build', 'D37')}${g.g(s, 'H12')}${g.g('TXT_build', 'D38')}`,
        g.g(s, 'H28') === "yellow", g.g('TXT_build', 'D39'),
        g.WAHR(), g.g('TXT_build', 'D40')
      )
    );

    /**
     * Row 36: Dach Assessment Text
     * Excel: "_xlfn.IFS(OR(H29=\"grey\", LEFT(H13,1)=\"u\"),TXT_build!D66,
     * H29=\"red\",TXT_build!D41&H13&TXT_build!D42,
     * H29=\"orange\",TXT_build!D43&H13&TXT_build!D44,
     * H29=\"yellow\",TXT_build!D45,
     * H29=\"green\",TXT_build!D46)"
     */
    grid.setCell('OUT_build', 'H36', (s, c, g) =>
      g.WENNS(
        g.ODER(
          g.g(s, 'H29') === "grey",
          g.LINKS(g.g(s, 'H13'), 1) === "u"
        ), g.g('TXT_build', 'D66'),
        g.g(s, 'H29') === "red", `${g.g('TXT_build', 'D41')}${g.g(s, 'H13')}${g.g('TXT_build', 'D42')}`,
        g.g(s, 'H29') === "orange", `${g.g('TXT_build', 'D43')}${g.g(s, 'H13')}${g.g('TXT_build', 'D44')}`,
        g.g(s, 'H29') === "yellow", g.g('TXT_build', 'D45'),
        g.g(s, 'H29') === "green", g.g('TXT_build', 'D46')
      )
    );

    /**
     * Row 37: Fußboden Assessment Text
     * Excel: "_xlfn.IFS(OR(H30=\"grey\", LEFT(H14,1)=\"u\"),TXT_build!D68,
     * H30=\"red\",TXT_build!D51&H14&TXT_build!D52,
     * H30=\"orange\",TXT_build!D53&H14&TXT_build!D54,
     * H30=\"yellow\",TXT_build!D55,
     * H30=\"green\",TXT_build!D56)"
     */
    grid.setCell('OUT_build', 'H37', (s, c, g) =>
      g.WENNS(
        g.ODER(
          g.g(s, 'H30') === "grey",
          g.LINKS(g.g(s, 'H14'), 1) === "u"
        ), g.g('TXT_build', 'D68'),
        g.g(s, 'H30') === "red", `${g.g('TXT_build', 'D51')}${g.g(s, 'H14')}${g.g('TXT_build', 'D52')}`,
        g.g(s, 'H30') === "orange", `${g.g('TXT_build', 'D53')}${g.g(s, 'H14')}${g.g('TXT_build', 'D54')}`,
        g.g(s, 'H30') === "yellow", g.g('TXT_build', 'D55'),
        g.g(s, 'H30') === "green", g.g('TXT_build', 'D56')
      )
    );

    /**
     * Row 38: Decke Assessment Text
     * Excel: "_xlfn.IFS(OR(H31=\"grey\", LEFT(H15,1)=\"u\"),TXT_build!D67,
     * H31=\"red\",TXT_build!D57&H15&TXT_build!D58,
     * H31=\"orange\",TXT_build!D59&H15&TXT_build!D60,
     * H31=\"yellow\",TXT_build!D61,
     * H31=\"green\",TXT_build!D62)"
     */
    grid.setCell('OUT_build', 'H38', (s, c, g) =>
      g.WENNS(
        g.ODER(
          g.g(s, 'H31') === "grey",
          g.LINKS(g.g(s, 'H15'), 1) === "u"
        ), g.g('TXT_build', 'D67'),
        g.g(s, 'H31') === "red", `${g.g('TXT_build', 'D57')}${g.g(s, 'H15')}${g.g('TXT_build', 'D58')}`,
        g.g(s, 'H31') === "orange", `${g.g('TXT_build', 'D59')}${g.g(s, 'H15')}${g.g('TXT_build', 'D60')}`,
        g.g(s, 'H31') === "yellow", g.g('TXT_build', 'D61'),
        g.g(s, 'H31') === "green", g.g('TXT_build', 'D62')
      )
    );

    /**
     * Row 39: Combined Assessment Text
     * Excel: "_xlfn.IFS(OR(H32=\"grey\", AND(LEFT(H14,1)=\"u\",LEFT(H15,1)=\"u\")),TXT_build!D69,
     * H32=\"red\",TXT_build!D47 & H38 & H37,
     * H32=\"orange\",TXT_build!D48 & H38 & H37,
     * H32=\"yellow\",TXT_build!D49 & H38 & H37,
     * TRUE,TXT_build!D50 & H38 & H37)"
     */
    grid.setCell('OUT_build', 'H39', (s, c, g) => {
      return g.WENNS(
        g.ODER(
          g.g(s, 'H32') === "grey",
          g.UND(
            g.LINKS(g.g(s, 'H14'), 1) === "u",
            g.LINKS(g.g(s, 'H15'), 1) === "u"
          )
        ), g.g('TXT_build', 'D69'),
        g.g(s, 'H32') === "red", `${g.g('TXT_build', 'D47')} ${g.g(s, 'H38')} ${g.g(s, 'H37')}`,
        g.g(s, 'H32') === "orange", `${g.g('TXT_build', 'D48')} ${g.g(s, 'H38')} ${g.g(s, 'H37')}`,
        g.g(s, 'H32') === "yellow", `${g.g('TXT_build', 'D49')} ${g.g(s, 'H38')} ${g.g(s, 'H37')}`,
        g.WAHR(), `${g.g('TXT_build', 'D50')} ${g.g(s, 'H38')} ${g.g(s, 'H37')}`
      );
    });

    /**
     * Row 43: Real Wert Position NT-readiness Skala bei Typ 33 (Building scale marker for Typ 33 replacement heater assessment)
     * Excel: "IF(clc_build!H81<=0,0.125,MIN(clc_build!H81+0.25,0.875))"
     */
    grid.setCell('OUT_build', 'H43', (s, c, g) =>
      g.WENN(
        g.n('clc_build', 'H81') <= 0,
        0.125,
        g.MIN(g.n('clc_build', 'H81') + 0.25, 0.875)
      )
    );

    /**
     * Row 44: Grafik Heizkörpertausch (Heater replacement graphic name)
     * Excel: IF(clc_build!$G$76>=1,"pic_G3_all_rad_suff","pic_G3_any_rad_notsuff")
     */
    grid.setCell('OUT_build', 'H44', (s, c, g) =>
      g.WENN(
        g.n('clc_build', 'G76') >= 1,
        'pic_G3_all_rad_suff',
        'pic_G3_any_rad_notsuff'
      )
    );

    /**
     * Row 45: Alternativtext Skala NT-ready Gebäudebewertung (accessibility)
     * Excel: "Bewertung der Eignung des Gebäudes für eine Wärmepumpe anhand der eingegebenen Räume. Die Heizkörper sollten mindestens 100 Prozent der Heizlast decken. \n\nMit den aktuellen Heizkörpern wird bei 55 °C Vorlauftemperatur etwa " & TEXT(ROUND(1-clc_build!G81,1)*100,"0") &" Prozent der Heizlast gedeckt. " & IF(clc_build!G81<=0, "Das ist ausreichend.", "Das ist nicht ausreichend. \n\nBei Austausch mit besseren Heizkörpern könnten " & TEXT(ROUND(1-clc_build!H81,1)*100,"0") & " Prozent der Heizlast gedeckt werden. " & _xlfn.IFS(clc_build!H81<=0,"Das ist ausreichend.",clc_build!H81<=0.15,"Das ist fast ausreichend.",AND(clc_build!G81-clc_build!H81>0.2,clc_build!H81<0.2),"Das ist deutlich besser, aber voraussichtlich noch nicht ausreichend.",TRUE,"Das ist noch nicht ausreichend."))"
     */
    grid.setCell('OUT_build', 'H45', (s, c, g) => {
      const currentCoverage = g.TEXT(g.ROUND((1 - g.n('clc_build', 'G81')) * 100, 1), "0");
      const isCurrentSufficient = g.n('clc_build', 'G81') <= 0;

      if (isCurrentSufficient) {
        return `Bewertung der Eignung des Gebäudes für eine Wärmepumpe anhand der eingegebenen Räume. Die Heizkörper sollten mindestens 100 Prozent der Heizlast decken.

Mit den aktuellen Heizkörpern wird bei 55 °C Vorlauftemperatur etwa ${currentCoverage} Prozent der Heizlast gedeckt. Das ist ausreichend.`;
      }

      const betterCoverage = g.TEXT(g.ROUND((1 - g.n('clc_build', 'H81')) * 100, 1), "0");
      const h81Value = g.n('clc_build', 'H81');
      const g81Value = g.n('clc_build', 'G81');

      const betterAssessment = g.WENNS(
        h81Value <= 0, "Das ist ausreichend.",
        h81Value <= 0.15, "Das ist fast ausreichend.",
        g.UND(g81Value - h81Value > 0.2, h81Value < 0.2), "Das ist deutlich besser, aber voraussichtlich noch nicht ausreichend.",
        g.WAHR(), "Das ist noch nicht ausreichend."
      );

      return `Bewertung der Eignung des Gebäudes für eine Wärmepumpe anhand der eingegebenen Räume. Die Heizkörper sollten mindestens 100 Prozent der Heizlast decken.

Mit den aktuellen Heizkörpern wird bei 55 °C Vorlauftemperatur etwa ${currentCoverage} Prozent der Heizlast gedeckt. Das ist nicht ausreichend.

Bei Austausch mit besseren Heizkörpern könnten ${betterCoverage} Prozent der Heizlast gedeckt werden. ${betterAssessment}`;
    });

    /**
     * Row 46: color Grafik Heizkörpertausch (Color for heater replacement graphic)
     * Excel: "IF(clc_build!$G$76>=1,\"rating-green\",\"rating-orange\")"
     */
    grid.setCell('OUT_build', 'H46', (s, c, g) =>
      g.WENN(
        g.n('clc_build', 'G76') >= 1,
        'rating-green',
        'rating-orange'
      )
    );
  }
}
