import {DataGrid} from '../data-grid';
import {FormulaOverlay} from './base-overlay';

/**
 * clc_load sheet formula overlay
 * Contains formula implementations for the clc_load sheet
 */
export class ClcLoadOverlay implements FormulaOverlay {
  // Columns I-W for rooms 1-15
  private clcLoadCols = ['I', 'J', 'K', 'L', 'M', 'N', 'O', 'P', 'Q', 'R', 'S', 'T', 'U', 'V', 'W'];
  // Columns R-AF for rooms 1-15
  private roomCols = ['R', 'S', 'T', 'U', 'V', 'W', 'X', 'Y', 'Z', 'AA', 'AB', 'AC', 'AD', 'AE', 'AF'];

  /**
   * Apply clc_load formulas to the data grid
   * @param grid The DataGrid instance to apply formulas to
   */
  applyFormulas(grid: DataGrid): void {
    // Implement formulas for each room column
    for (let i = 0; i < this.clcLoadCols.length; i++) {
      const clcLoadCol = this.clcLoadCols[i];
      const roomCol = this.roomCols[i];

      /**
       * Row 2: Room ID
       * Original Excel formula: "IN_rooms!R2"
       */
      grid.setCell('clc_load', `${clcLoadCol}2`, (s, c, g) =>
        g.g('IN_rooms', `${roomCol}2`));

      /**
       * Row 3: Building type
       * Original Excel formula: "IN_build!$P$3"
       */
      grid.setCell('clc_load', `${clcLoadCol}3`, (s, c, g) =>
        g.g('IN_build', 'P3'));

      /**
       * Row 4: Building year
       * Original Excel formula: "IN_build!$P$5"
       */
      grid.setCell('clc_load', `${clcLoadCol}4`, (s, c, g) =>
        g.g('IN_build', 'P5'));

      /**
       * Row 5: Room name
       * Original Excel formula: "IN_rooms!R3"
       */
      grid.setCell('clc_load', `${clcLoadCol}5`, (s, c, g) =>
        g.g('IN_rooms', `${roomCol}3`));

      /**
       * Row 6: Room volume
       * Original Excel formula: "IN_rooms!R$4*IN_rooms!R$5"
       */
      grid.setCell('clc_load', `${clcLoadCol}6`, (s, c, g) =>
        g.n('IN_rooms', `${roomCol}4`) * g.n('IN_rooms', `${roomCol}5`));

      /**
       * Row 7: Luftwechselrate
       * Original Excel formula: "0.5"
       */
      grid.setCell('clc_load', `${clcLoadCol}7`, (s, c, g) => 0.5);

      /**
       * Row 8: Wärmebrückenkoeffizient ∆U,TB
       * Original Excel formula:
       * "IF(AND(I$16<=U_GEG_A.7!$C$10,
       * I$28<=AVERAGE(U_GEG_A.7!$C$21:$C$22,
       * I$34<=U_GEG_A.7!$C$21,I$39<=U_GEG_A.7!$C$25),
       * I$45<=U_GEG_A.7!$C$11,
       * I$63<=U_GEG_A.7!$C$12,
       * I$69<=U_GEG_A.7!$C$12),
       * 0.05,0.1)"
       */
      grid.setCell('clc_load', `${clcLoadCol}8`, (s, c, g) =>
        g.WENN(
          g.UND(
            g.n('clc_load', `${clcLoadCol}16`) <= g.n('U_GEG_A.7', 'C10'),
            g.n('clc_load', `${clcLoadCol}28`) <= (g.n('U_GEG_A.7', 'C21') + g.n('U_GEG_A.7', 'C22')) / 2,
            g.n('clc_load', `${clcLoadCol}34`) <= g.n('U_GEG_A.7', 'C21'),
            g.n('clc_load', `${clcLoadCol}39`) <= g.n('U_GEG_A.7', 'C25'),
            g.n('clc_load', `${clcLoadCol}45`) <= g.n('U_GEG_A.7', 'C11'),
            g.n('clc_load', `${clcLoadCol}63`) <= g.n('U_GEG_A.7', 'C12'),
            g.n('clc_load', `${clcLoadCol}69`) <= g.n('U_GEG_A.7', 'C12')
          ),
          0.05,
          0.1
        ));

      /**
       * Row 9: ρ*cp pauschal nach 12831
       * Original Excel formula: "0.34"
       */
      grid.setCell('clc_load', `${clcLoadCol}9`, (s, c, g) => 0.34);

      /**
       * Row 10: Berechnungs-Raumtemperatur
       * Original Excel formula: "IF(IN_rooms!R$6<>20,IN_rooms!R$6,20)"
       */
      grid.setCell('clc_load', `${clcLoadCol}10`, (s, c, g) =>
        g.WENN(g.g('IN_rooms', `${roomCol}6`) != 20,
              g.g('IN_rooms', `${roomCol}6`),
              20));

      /**
       * Row 11: Mindes-Luftvolumenstrom qv,min
       * Original Excel formula: "I$7*I$6"
       */
      grid.setCell('clc_load', `${clcLoadCol}11`, (s, c, g) =>
        g.n('clc_load', `${clcLoadCol}7`) * g.n('clc_load', `${clcLoadCol}6`));

      /**
       * Row 12: Heizlast Ventilation [W]
       * Original Excel formula: "I$9*I$11*(I$10-Normaußentemperatur_12831!$B$6)"
       */
      grid.setCell('clc_load', `${clcLoadCol}12`, (s, c, g) =>
        g.n('clc_load', `${clcLoadCol}9`) *
        g.n('clc_load', `${clcLoadCol}11`) *
        (g.n('clc_load', `${clcLoadCol}10`) - g.n('Normaußentemperatur_12831', 'B6')));

      /**
       * Row 13: Anteil an Raumheizlast
       * Original Excel formula: "I$12/I$72"
       */
      grid.setCell('clc_load', `${clcLoadCol}13`, (s, c, g) =>
        g.n('clc_load', `${clcLoadCol}12`) / g.n('clc_load', `${clcLoadCol}72`));

      /**
       * Row 14: Wand-Außenfläche [m²]
       * Original Excel formula:
       * "IF(
       *     OR(IN_rooms!R$28=\"Nein\",IN_rooms!R$31=0,IN_rooms!R$30 = 0,  IN_rooms!R$9 = 0,IN_build!$P$4 = \"Flach bzw. Flachdach\"),
       *     IN_rooms!R$9 * IN_rooms!R$5 - (IN_rooms!R$13 * IN_rooms!R$14 +
       *     IN_rooms!R$17 * IN_rooms!R$18 + IN_rooms!R$21 * IN_rooms!R$22),
       * _xlfn.LET(
       *   _xlpm.b_ceil, IN_rooms!R$32,
       *   _xlpm.b_room, IF(IN_rooms!R$29=\"Nein\", IN_rooms!R$4 / IN_rooms!R$30, 2 * IN_rooms!R$4 / IN_rooms!R$30),
       *   _xlpm.L_wall, IN_rooms!R$9,
       *   _xlpm.L_giebel, IF(_xlpm.L_wall / 1.5 <= _xlpm.b_room, _xlpm.L_wall, _xlpm.L_wall / 2),
       *   _xlpm.h_knee, IF(IN_rooms!R$37 > 0, IN_rooms!R$37, IN_rooms!R$39),
       *   _xlpm.h_roof, IN_rooms!R$31,
       *   _xlpm.is_jamb, IN_rooms!R$35=\"Ja\",
       *   _xlpm.h_room, IN_rooms!R$5,
       *   _xlpm.alpha, _xlfn.IFS(
       *     IN_build!$P$4 = \"Geneigt\", 25,
       *     IN_build!$P$4 = \"Steil\", 40,
       *     IN_build!$P$4 = \"Sehr steil\", 55),
       *   _xlpm.A_win, (IN_rooms!R$13 * IN_rooms!R$14 + IN_rooms!R$17 * IN_rooms!R$18 + IN_rooms!R$21 * IN_rooms!R$22),
       *   _xlpm.A_no_slop, IN_rooms!R$9 * IN_rooms!R$5 - _xlpm.A_win,
       *    _xlpm.A_big_rect, _xlpm.h_roof * _xlpm.b_ceil,
       *   _xlpm.A_triangle, IF(_xlpm.h_roof < _xlpm.L_giebel - _xlpm.b_ceil,0, 1/2 * (_xlpm.L_giebel - _xlpm.b_ceil) * SQRT(_xlpm.h_roof^2 - (_xlpm.L_giebel - _xlpm.b_ceil)^2)),
       *   _xlpm.A_small_rect, _xlpm.h_knee * _xlpm.h_roof * COS(_xlpm.alpha*PI()/180),
       *   _xlpm.A_triangle_jamb, 1/2 * _xlpm.h_knee^2 * _xlfn.COT(_xlpm.alpha*PI()/180),
       *   _xlpm.A_slop_tot, _xlpm.A_triangle + _xlpm.A_small_rect + IF(_xlpm.is_jamb, _xlpm.A_triangle_jamb,0),
       *
       *   _xlpm.giebel_1_slop_1, AND(IN_rooms!R$29 = \"Nein\", _xlpm.L_wall / 1.5 <= _xlpm.b_room),
       *   _xlpm.giebel_2_slop_1, AND(IN_rooms!R$29 = \"Nein\", _xlpm.L_wall / 1.5 > _xlpm.b_room),
       *   _xlpm.giebel_1_slop_2, AND(IN_rooms!R$29 = \"Ja\", _xlpm.L_wall / 1.5 <= _xlpm.b_room),
       *   _xlpm.giebel_2_slop_2, AND(IN_rooms!R$29 = \"Ja\", _xlpm.L_wall / 1.5 > _xlpm.b_room),
       *
       *   MIN(_xlfn.IFS(
       *     _xlpm.giebel_1_slop_1, _xlpm.A_big_rect + _xlpm.A_slop_tot - _xlpm.A_win,
       *     _xlpm.giebel_2_slop_1, 2 * (_xlpm.A_big_rect + _xlpm.A_slop_tot) - _xlpm.A_win,
       *     _xlpm.giebel_1_slop_2, _xlpm.A_big_rect + 2 * _xlpm.A_slop_tot - _xlpm.A_win,
       *     _xlpm.giebel_2_slop_2, 2 * (_xlpm.A_big_rect + 2 * _xlpm.A_slop_tot) - _xlpm.A_win,
       *     TRUE, _xlpm.A_no_slop),_xlpm.A_no_slop)
       * ))"
       */
      grid.setCell('clc_load', `${clcLoadCol}14`, (s, c, g) => {
        return g.WENN(
          g.ODER(
            g.g('IN_rooms', `${roomCol}28`) === 'Nein',
            g.n('IN_rooms', `${roomCol}31`) === 0,
            g.n('IN_rooms', `${roomCol}30`) === 0,
            g.n('IN_rooms', `${roomCol}9`) === 0,
            g.g('IN_build', 'P4') === 'Flach bzw. Flachdach'
          ),
          (() =>
            g.n('IN_rooms', `${roomCol}9`) * g.n('IN_rooms', `${roomCol}5`)
            - (
              g.n('IN_rooms', `${roomCol}13`) * g.n('IN_rooms', `${roomCol}14`)
              + g.n('IN_rooms', `${roomCol}17`) * g.n('IN_rooms', `${roomCol}18`)
              + g.n('IN_rooms', `${roomCol}21`) * g.n('IN_rooms', `${roomCol}22`)
            ))(),

          (() => {
            let b_ceil = g.n('IN_rooms', `${roomCol}32`);
            let b_room = g.WENN(
              g.g('IN_rooms', `${roomCol}29`) === 'Nein',
              g.n('IN_rooms', `${roomCol}4`) / g.n('IN_rooms', `${roomCol}30`),
              2 * g.n('IN_rooms', `${roomCol}4`) / g.n('IN_rooms', `${roomCol}30`)
            );
            let L_wall = g.n('IN_rooms', `${roomCol}9`);
            let L_giebel = L_wall / 1.5 <= b_room ? L_wall : L_wall / 2;
            let h_knee = g.n('IN_rooms', `${roomCol}37`) > 0 ? g.n('IN_rooms', `${roomCol}37`) : g.n('IN_rooms', `${roomCol}39`);
            let h_roof = g.n('IN_rooms', `${roomCol}31`);
            let h_room = g.n('IN_rooms', `${roomCol}5`);
            let is_jamb = g.g('IN_rooms', `${roomCol}35`) === 'Ja';

            let roofType = g.g('IN_build', 'P4');
            let alpha = g.WENNS(
              roofType === 'Geneigt', 25,
              roofType === 'Steil', 40,
              roofType === 'Sehr steil', 55,
              g.WAHR(), 0
            );
            let alphaRad = (alpha * Math.PI) / 180;

            let win1 = g.n('IN_rooms', `${roomCol}13`) * g.n('IN_rooms', `${roomCol}14`);
            let win2 = g.n('IN_rooms', `${roomCol}17`) * g.n('IN_rooms', `${roomCol}18`);
            let win3 = g.n('IN_rooms', `${roomCol}21`) * g.n('IN_rooms', `${roomCol}22`);
            let A_win = (win1 + win2 + win3);

            let A_no_slop = L_wall * h_room - A_win;
            let A_big_rect = h_roof * b_ceil;

            let triangleBase = L_giebel - b_ceil;
            let A_triangle = h_roof < triangleBase ? 0 : 0.5 * triangleBase * Math.sqrt(h_roof ** 2 - triangleBase ** 2);
            let A_small_rect = h_knee * h_roof * Math.cos(alphaRad);
            let A_triangle_jamb = 0.5 * h_knee ** 2 / Math.tan(alphaRad);
            let A_slop_tot = A_triangle + A_small_rect + (is_jamb ? A_triangle_jamb : 0);

            // Check different roof configurations
            let giebel_1_slop_1 = g.g('IN_rooms', `${roomCol}29`) === 'Nein' && L_wall / 1.5 <= b_room;
            let giebel_2_slop_1 = g.g('IN_rooms', `${roomCol}29`) === 'Nein' && L_wall / 1.5 > b_room;
            let giebel_1_slop_2 = g.g('IN_rooms', `${roomCol}29`) === 'Ja' && L_wall / 1.5 <= b_room;
            let giebel_2_slop_2 = g.g('IN_rooms', `${roomCol}29`) === 'Ja' && L_wall / 1.5 > b_room;

            return Math.min(g.WENNS(
              giebel_1_slop_1, A_big_rect + A_slop_tot - A_win,
              giebel_2_slop_1, 2 * (A_big_rect + A_slop_tot) - A_win,
              giebel_1_slop_2, A_big_rect + 2 * A_slop_tot - A_win,
              giebel_2_slop_2, 2 * (A_big_rect + 2 * A_slop_tot) - A_win,
              g.WAHR(), A_no_slop
            ), A_no_slop)
          })()
        );
      });

      /**
       * Row 15: U-Wert Außenwand [W/(m²K)]
       * Original Excel formula: "IF(I14=0,0,_xlfn.AGGREGATE(15,6,U_Werte_IWU!$F$30:$F$262/((U_Werte_IWU!$E$30:$E$262=LEFT($A$14,9))*(U_Werte_IWU!$D$30:$D$262=clc_load!I4)*(U_Werte_IWU!$C$30:$C$262=clc_load!I3)),1))"
       */
      grid.setCell('clc_load', `${clcLoadCol}15`, (s, c, g) => {
        return g.WENN(
          g.n(s, `${clcLoadCol}14`) === 0,
          0,
          g.AGGREGATE(
            15, // SMALL
            g.DIVIDE(
              g.RANGE('U_Werte_IWU!F30:F262', s),
              g.MULTIPLY(
                g.GLEICH(g.RANGE('U_Werte_IWU!E30:E262', s), g.LINKS(g.g(s, `A14`), 9)),
                g.MULTIPLY(
                  g.GLEICH(g.RANGE('U_Werte_IWU!D30:D262', s), g.g(s, `${clcLoadCol}4`)),
                  g.GLEICH(g.RANGE('U_Werte_IWU!C30:C262', s), g.g(s, `${clcLoadCol}3`))
                )
              )
            ),
            s,
            1
          )
        );
      });

      /**
       * Row 16: U-Wert Außenwand (mit Dämmung) [W/(m²K)]
       * Original Excel formula:
       * "_xlfn.LET(
       * _xlpm.U_no_ins, _xlfn.XLOOKUP(1,
       *   (INDIRECT(\"UWert_Mod[Bauteil]\")=$A$16)*
       *   (INDIRECT(\"UWert_Mod[Modernisierungsjahr]\")=\"1983 - 1994\"),
       *   INDIRECT(\"UWert_Mod[U_no_ins]\")),
       * _xlpm.U_IWU, I$15,
       * _xlpm.d_ins,IN_rooms!R$75,
       * IF(_xlpm.d_ins>0,1/(1/_xlpm.U_no_ins+_xlpm.d_ins*0.01/INDEX(INDIRECT(\"PAR[lambda_ins_thick]\"), 1)),_xlpm.U_IWU))"
       */
      grid.setCell('clc_load', `${clcLoadCol}16`, (s, c, g) => {
        // Similar pattern to what is used in IN_rooms overlay
        const U_no_ins = g.XVERWEIS(
          1,
          g.MULT(
            g.GLEICH(g.INDIREKT_DB_REF("UWert_Mod", "Bauteil"), g.g('clc_load', 'A16')),
            g.GLEICH(g.INDIREKT_DB_REF("UWert_Mod", "Modernisierungsjahr"), "1983 - 1994")
          ),
          g.INDIREKT_DB_REF("UWert_Mod", "U_no_ins")
        );

        const U_IWU = g.n('clc_load', `${clcLoadCol}15`);
        const d_ins = g.n('IN_rooms', `${roomCol}75`);

        if(typeof U_no_ins != 'number') return NaN;

        return g.WENN(
          d_ins > 0,
          1 / (1/U_no_ins + d_ins * 0.01 / (g.INDIREKT_DB_REF('PAR', 'lambda_ins_thick')[0] as number)),
          U_IWU
        );
      });

      /**
       * Row 17: Heizlast Außenwand [W]
       * Original Excel formula:
       * "IF(I14=0,0,I14*(I16+I$8)*_xlfn.XLOOKUP(IN_rooms!R12,Daten!$E$106:$E$109,Daten!$F$106:$F$109,\"FEHLER\",0,1)*(I$10-Normaußentemperatur_12831!$B$6))"
       */
      grid.setCell('clc_load', `${clcLoadCol}17`, (s, c, g) => {
        return g.WENN(
          g.g(s, `${clcLoadCol}14`) == 0,
          0,
          g.n(s, `${clcLoadCol}14`) *
          (g.n(s, `${clcLoadCol}16`) + g.n(s, `${clcLoadCol}8`)) *
          (g.XVERWEIS(
            g.g('IN_rooms', `${roomCol}12`),
            g.getCells('Daten', 'E106', 'E109').flat(1),
            g.getCells('Daten', 'F106', 'F109').flat(1),
            {ifNotFound: 'FEHLER', matchMode: 'exact', searchMode: 'first'}
          ) as number) *
          (g.n(s, `${clcLoadCol}10`) - g.n('Normaußentemperatur_12831', 'B6'))
        );
      });

      /**
       * Row 18: Anteil an Raumheizlast
       * Original Excel formula: "I$17/I$72"
       */
      grid.setCell('clc_load', `${clcLoadCol}18`, (s, c, g) =>
        g.n(s, `${clcLoadCol}17`) / g.n(s, `${clcLoadCol}72`));

      /**
       * Row 19: Fläche [m²]
       * Original Excel formula: "IF(IN_rooms!R25=\"Nein\",0,IN_rooms!R26*IN_rooms!R5)"
       */
      grid.setCell('clc_load', `${clcLoadCol}19`, (s, c, g) =>
        g.WENN(
          g.g('IN_rooms', `${roomCol}25`) === 'Nein',
          0,
          g.n('IN_rooms', `${roomCol}26`) * g.n('IN_rooms', `${roomCol}5`)
        ));

      /**
       * Row 20: U-Wert_IWU
       * Original Excel formula: "INDEX(INDIRECT(\"PAR[U_inwall]\"),1)"
       */
      grid.setCell('clc_load', `${clcLoadCol}20`, (s, c, g) =>
        (g.INDIREKT_DB_REF('PAR', 'U_inwall')[0] as number));

      /**
       * Row 21: U-Wert_Berechnung
       * Original Excel formula: "IF(IN_rooms!R$27>0,1/(1/I$20+IN_rooms!R$27*0.01/INDEX(INDIRECT(\"PAR[lambda_ins_thick]\"),1)),I$20)"
       */
      grid.setCell('clc_load', `${clcLoadCol}21`, (s, c, g) => {
        return g.WENN(
          g.n('IN_rooms', `${roomCol}27`) > 0,
          1 / (
            1 / g.n(s, `${clcLoadCol}20`) +
            g.n('IN_rooms', `${roomCol}27`) * 0.01 /
            (g.INDIREKT_DB_REF('PAR', 'lambda_ins_thick')[0] as number)
          ),
          g.n(s, `${clcLoadCol}20`)
        );
      });

      /**
       * Row 22: Heizlast Transmission
       * Original Excel formula: "IF(I19=0,0,(I19*(I21+I$8)*0.5*(I$10-IF(IN_rooms!R$28=\"Ja\",15,5))))"
       */
      grid.setCell('clc_load', `${clcLoadCol}22`, (s, c, g) => {
        return g.WENN(
          g.n(s, `${clcLoadCol}19`) === 0,
          0,
          g.n(s, `${clcLoadCol}19`) *
          (g.n(s, `${clcLoadCol}21`) + g.n(s, `${clcLoadCol}8`)) *
          0.5 *
          (g.n(s, `${clcLoadCol}10`) - g.WENN(g.g('IN_rooms', `${roomCol}28`) === 'Ja', 15, 5))
        );
      });

      /**
       * Row 23: Anteil an Raumheizlast
       * Original Excel formula: "IF(I$22=0,0,I$22/I$72)"
       */
      grid.setCell('clc_load', `${clcLoadCol}23`, (s, c, g) =>
        g.WENN(
          g.n(s, `${clcLoadCol}22`) === 0,
          0,
          g.n(s, `${clcLoadCol}22`) / g.n(s, `${clcLoadCol}72`)
        ));

      /**
       * Row 24: ZWISCHENERGEBNIS Heizlast Transmission
       * Original Excel formula: "IF(I$25<=0,0,0.3239*I$28^(2)-1.3851*I$28+3.0537)"
       */
      grid.setCell('clc_load', `${clcLoadCol}24`, (s, c, g) =>
        g.WENN(
          g.n(s, `${clcLoadCol}25`) <= 0,
          0,
          0.3239 * Math.pow(g.n(s, `${clcLoadCol}28`), 2) - 1.3851 * g.n(s, `${clcLoadCol}28`) + 3.0537
        ));

      /**
       * Row 25: Volumen Gaube
       * Original Excel formula: "IF(IN_rooms!R$40=\"Ja\",MAX(0,0.4183*I$26-1.3793,0),0)"
       */
      grid.setCell('clc_load', `${clcLoadCol}25`, (s, c, g) =>
        g.WENN(
          g.g('IN_rooms', `${roomCol}40`) === 'Ja',
          Math.max(0, 0.4183 * g.n(s, `${clcLoadCol}26`) - 1.3793, 0),
          0
        ));

      /**
       * Row 26: Fläche [m²]
       * Original Excel formula:
       * "_xlfn.IFS(\n   IN_rooms!R$28<>\"Ja\",\n    0,\n    IN_build!$P$4 = \"Flach bzw. Flachdach\",\n      IN_rooms!R$4     - (IN_rooms!R$41 * IN_rooms!R$42 / 10000)\n      - (IN_rooms!R$45 * IN_rooms!R$46 / 10000),\n  IN_rooms!R$39>0,\n    IN_rooms!R$30 * IN_rooms!R$31\n      * IF(IN_rooms!R$29=\"Nein\",1,2)\n    + IN_rooms!R$39\n      / SIN(\n          _xlfn.IFS(\n            IN_build!$P$4=\"Geneigt\",   25,\n            IN_build!$P$4=\"Steil\",     40,\n            IN_build!$P$4=\"Sehr steil\",55\n          )\n          * PI() / 180\n        )\n      * IN_rooms!R$30\n    - (IN_rooms!R$41 * IN_rooms!R$42 / 10000)\n    - (IN_rooms!R$45 * IN_rooms!R$46 / 10000),\n\n  OR(\n    IN_rooms!R$39=0,\n    IN_rooms!R$37>0\n  ),\n    IN_rooms!R$30 * IN_rooms!R$31\n    - (IN_rooms!R$41 * IN_rooms!R$42 / 10000)\n    - (IN_rooms!R$45 * IN_rooms!R$46 / 10000)\n)"
       */
      grid.setCell('clc_load', `${clcLoadCol}26`, (s, c, g) => {
        return g.WENNS(
          g.g('IN_rooms', `${roomCol}28`) !== 'Ja',
          0,

          g.g('IN_build', 'P4') === 'Flach bzw. Flachdach',
          g.n('IN_rooms', `${roomCol}4`) -
            (g.n('IN_rooms', `${roomCol}41`) * g.n('IN_rooms', `${roomCol}42`) / 10000) -
            (g.n('IN_rooms', `${roomCol}45`) * g.n('IN_rooms', `${roomCol}46`) / 10000),

          g.n('IN_rooms', `${roomCol}39`) > 0,
          (() => {
            const roofAngle = g.WENNS(
              g.g('IN_build', 'P4') === 'Geneigt', 25,
              g.g('IN_build', 'P4') === 'Steil', 40,
              g.g('IN_build', 'P4') === 'Sehr steil', 55,
              g.WAHR(), 0 // Default fallback
            );

            return g.n('IN_rooms', `${roomCol}30`) * g.n('IN_rooms', `${roomCol}31`) *
              g.WENN(g.g('IN_rooms', `${roomCol}29`) === 'Nein', 1, 2) +
              g.n('IN_rooms', `${roomCol}39`) /
              Math.sin(roofAngle * Math.PI / 180) *
              g.n('IN_rooms', `${roomCol}30`) -
              (g.n('IN_rooms', `${roomCol}41`) * g.n('IN_rooms', `${roomCol}42`) / 10000) -
              (g.n('IN_rooms', `${roomCol}45`) * g.n('IN_rooms', `${roomCol}46`) / 10000);
          })(),

          g.ODER(
            g.n('IN_rooms', `${roomCol}39`) === 0,
            g.n('IN_rooms', `${roomCol}37`) > 0
          ),
          g.n('IN_rooms', `${roomCol}30`) * g.n('IN_rooms', `${roomCol}31`) -
            (g.n('IN_rooms', `${roomCol}41`) * g.n('IN_rooms', `${roomCol}42`) / 10000) -
            (g.n('IN_rooms', `${roomCol}45`) * g.n('IN_rooms', `${roomCol}46`) / 10000),

          // Default fallback
          0
        );
      });

      /**
       * Row 27: U-Wert_IWU
       * Original Excel formula:
       * "_xlfn.AGGREGATE(15,6,U_Werte_IWU!$F$30:$F$262/((U_Werte_IWU!$E$30:$E$262=LEFT($A27,4))*(U_Werte_IWU!$D$30:$D$262=clc_load!I4)*(U_Werte_IWU!$C$30:$C$262=clc_load!I3)),1)"
       */
      grid.setCell('clc_load', `${clcLoadCol}27`, (s, c, g) => {
        return g.AGGREGATE(
          15, // SMALL
          g.MULTIPLY(
            g.DIVIDE(
              g.RANGE('U_Werte_IWU!F30:F262', s),
              g.MULTIPLY(
                g.GLEICH(g.RANGE('U_Werte_IWU!E30:E262', s), g.LINKS(g.g('clc_load', 'A27'), 4)),
                g.MULTIPLY(
                  g.GLEICH(g.RANGE('U_Werte_IWU!D30:D262', s), g.g(s, `${clcLoadCol}4`)),
                  g.GLEICH(g.RANGE('U_Werte_IWU!C30:C262', s), g.g(s, `${clcLoadCol}3`))
                )
              )
            )
          ),
          s,
          1
        );
      });

      /**
       * Row 28: U-Wert_Berechnung
       * Original Excel formula:
       * "_xlfn.LET(\n_xlpm.U_no_ins, _xlfn.XLOOKUP(1,\n  (INDIRECT(\"UWert_Mod[Bauteil]\")=\"Dach\")*\n  (INDIRECT(\"UWert_Mod[Modernisierungsjahr]\")=\"1983 - 1994\"),\n  INDIRECT(\"UWert_Mod[U_no_ins]\")),\n_xlpm.U_IWU, I$27,\n_xlpm.d_ins,IN_build!U$9,\nIF(_xlpm.d_ins>0,1/(1/_xlpm.U_no_ins+_xlpm.d_ins*0.01/INDEX(INDIRECT(\"PAR[lambda_ins_thick]\"), 1)),_xlpm.U_IWU))"
       */
      grid.setCell('clc_load', `${clcLoadCol}28`, (s, c, g) => {
        const U_no_ins = g.XVERWEIS(
          1,
          g.MULT(
            g.GLEICH(g.INDIREKT_DB_REF("UWert_Mod", "Bauteil"), "Dach"),
            g.GLEICH(g.INDIREKT_DB_REF("UWert_Mod", "Modernisierungsjahr"), "1983 - 1994")
          ),
          g.INDIREKT_DB_REF("UWert_Mod", "U_no_ins")
        );

        const U_IWU = g.n(s, `${clcLoadCol}27`);
        const d_ins = g.n('IN_build', 'U9');

        if(typeof U_no_ins != 'number') return NaN;

        return g.WENN(
          d_ins > 0,
          1 / (1/U_no_ins + d_ins * 0.01 / (g.INDIREKT_DB_REF('PAR', 'lambda_ins_thick')[0] as number)),
          U_IWU
        );
      });

      /**
       * Row 29: Heizlast Transmission
       * Original Excel formula: "IF(I26=0,0,I26*(I28+I$8)*(I$10-Normaußentemperatur_12831!$B$6)+I$24)"
       */
      grid.setCell('clc_load', `${clcLoadCol}29`, (s, c, g) =>
        g.WENN(
          g.n(s, `${clcLoadCol}26`) === 0,
          0,
          g.n(s, `${clcLoadCol}26`) *
          (g.n(s, `${clcLoadCol}28`) + g.n(s, `${clcLoadCol}8`)) *
          (g.n(s, `${clcLoadCol}10`) - g.n('Normaußentemperatur_12831', 'B6')) +
          g.n(s, `${clcLoadCol}24`)
        ));

      /**
       * Row 30: Anteil an Raumheizlast
       * Original Excel formula: "I$29/I$72"
       */
      grid.setCell('clc_load', `${clcLoadCol}30`, (s, c, g) =>
        g.n(s, `${clcLoadCol}29`) / g.n(s, `${clcLoadCol}72`));

      /**
       * Row 31: Abzgl. Dachschräge vorhandene Deckenfläche
       * Original Excel formula: "IF(IN_rooms!R$28=\"Nein\",IN_rooms!R$4,IN_rooms!R$32*IN_rooms!R$33)"
       */
      grid.setCell('clc_load', `${clcLoadCol}31`, (s, c, g) =>
        g.WENN(
          g.g('IN_rooms', `${roomCol}28`) === 'Nein',
          g.n('IN_rooms', `${roomCol}4`),
          g.n('IN_rooms', `${roomCol}32`) * g.n('IN_rooms', `${roomCol}33`)
        ));

      /**
       * Row 32: Fläche [m²]
       * Original Excel formula: "IF(AND(IN_build!$P$4=\"Flach bzw. Flachdach\",IN_rooms!R28=\"Ja\"),0,clc_load!I$31)"
       */
      grid.setCell('clc_load', `${clcLoadCol}32`, (s, c, g) =>
        g.WENN(
          g.UND(
            g.g('IN_build', 'P4') === 'Flach bzw. Flachdach',
            g.g('IN_rooms', `${roomCol}28`) === 'Ja'
          ),
          0,
          g.n(s, `${clcLoadCol}31`)
        ));

      /**
       * Row 33: U-Wert_IWU
       * Original Excel formula: "IF(I$32=0,0,_xlfn.AGGREGATE(15,6,U_Werte_IWU!$F$30:$F$262/((U_Werte_IWU!$E$30:$E$262=LEFT($A33,5))*(U_Werte_IWU!$D$30:$D$262=clc_load!I$4)*(U_Werte_IWU!$C$30:$C$262=clc_load!I$3)),1))"
       */
      grid.setCell('clc_load', `${clcLoadCol}33`, (s, c, g) => {
        return g.WENN(
          g.n(s, `${clcLoadCol}32`) === 0,
          0,
          g.AGGREGATE(
            15, // SMALL
            g.MULTIPLY(
              g.DIVIDE(
                g.RANGE('U_Werte_IWU!F30:F262', s),
                g.MULTIPLY(
                  g.GLEICH(g.RANGE('U_Werte_IWU!E30:E262', s), g.LINKS(g.g('clc_load', 'A33'), 5)),
                  g.MULTIPLY(
                    g.GLEICH(g.RANGE('U_Werte_IWU!D30:D262', s), g.g(s, `${clcLoadCol}4`)),
                    g.GLEICH(g.RANGE('U_Werte_IWU!C30:C262', s), g.g(s, `${clcLoadCol}3`))
                  )
                )
              )
            ),
            s,
            1
          )
        );
      });

      /**
       * Row 34: U-Wert_Berechnung
       * Original Excel formula:
       * "_xlfn.LET(\n_xlpm.U_no_ins, _xlfn.XLOOKUP(1,\n  (INDIRECT(\"UWert_Mod[Bauteil]\")=$A$34)*\n  (INDIRECT(\"UWert_Mod[Modernisierungsjahr]\")=\"1983 - 1994\"),\n  INDIRECT(\"UWert_Mod[U_no_ins]\")),\n_xlpm.U_IWU, I$33,\n_xlpm.d_ins,IN_build!U$11,\nIF(_xlpm.d_ins>0,1/(1/_xlpm.U_no_ins+_xlpm.d_ins*0.01/INDEX(INDIRECT(\"PAR[lambda_ins_thick]\"), 1)),_xlpm.U_IWU))"
       */
      grid.setCell('clc_load', `${clcLoadCol}34`, (s, c, g) => {
        const U_no_ins = g.XVERWEIS(
          1,
          g.MULT(
            g.GLEICH(g.INDIREKT_DB_REF("UWert_Mod", "Bauteil"), g.g('clc_load', 'A34')),
            g.GLEICH(g.INDIREKT_DB_REF("UWert_Mod", "Modernisierungsjahr"), "1983 - 1994")
          ),
          g.INDIREKT_DB_REF("UWert_Mod", "U_no_ins")
        );

        const U_IWU = g.n(s, `${clcLoadCol}33`);
        const d_ins = g.n('IN_build', 'U11');

        if(typeof U_no_ins != 'number') return NaN;

        return g.WENN(
          d_ins > 0,
          1 / (1/U_no_ins + d_ins * 0.01 / (g.INDIREKT_DB_REF('PAR', 'lambda_ins_thick')[0] as number)),
          U_IWU
        );
      });

      /**
       * Row 35: Heizlast Transmission
       * Original Excel formula: "IF(OR(I$32=\"entfällt\",I$32=0),0,(I$32*(I$34+I$8)*_xlfn.XLOOKUP(IN_rooms!R$7,Daten!$E$106:$E$109,Daten!$F$106:$F$109,\"FEHLER\",0,1))*(I$10-Normaußentemperatur_12831!$B$6))"
       */
      grid.setCell('clc_load', `${clcLoadCol}35`, (s, c, g) => {
        return g.WENN(
          g.ODER(
            g.g(s, `${clcLoadCol}32`) === 'entfällt',
            g.n(s, `${clcLoadCol}32`) === 0
          ),
          0,
          (g.n(s, `${clcLoadCol}32`) *
           (g.n(s, `${clcLoadCol}34`) + g.n(s, `${clcLoadCol}8`)) *
           (g.XVERWEIS(
              g.g('IN_rooms', `${roomCol}7`),
              g.getCells('Daten', 'E106', 'E109').flat(1),
              g.getCells('Daten', 'F106', 'F109').flat(1),
              {ifNotFound: 'FEHLER', matchMode: 'exact', searchMode: 'first'}
            ) as number)) *
           (g.n(s, `${clcLoadCol}10`) - g.n('Normaußentemperatur_12831', 'B6'))
        );
      });

      /**
       * Row 36: Anteil an Raumheizlast
       * Original Excel formula: "I$35/I$72"
       */
      grid.setCell('clc_load', `${clcLoadCol}36`, (s, c, g) =>
        g.n(s, `${clcLoadCol}35`) / g.n(s, `${clcLoadCol}72`));

      /**
       * Row 37: Fläche [m²]
       * Original Excel formula: "IF(IN_rooms!R$39=0,IN_rooms!R$4,IN_rooms!R$4+IN_rooms!R$39/TAN(_xlfn.IFS(IN_build!$P$4=\"Flach bzw. Flachdach\",90,IN_build!$P$4=\"Geneigt\",25,IN_build!$P$4=\"Steil\",40,IN_build!$P$4=\"Sehr steil\",55)*PI()/180)*IN_rooms!R$30)"
       */
      grid.setCell('clc_load', `${clcLoadCol}37`, (s, c, g) => {
        const roofAngle = g.WENNS(
          g.g('IN_build', 'P4') === 'Flach bzw. Flachdach', 90,
          g.g('IN_build', 'P4') === 'Geneigt', 25,
          g.g('IN_build', 'P4') === 'Steil', 40,
          g.g('IN_build', 'P4') === 'Sehr steil', 55,
          g.WAHR(), 0 // Default fallback
        );

        return g.WENN(
          g.n('IN_rooms', `${roomCol}39`) === 0,
          g.n('IN_rooms', `${roomCol}4`),
          g.n('IN_rooms', `${roomCol}4`) +
            g.n('IN_rooms', `${roomCol}39`) /
            Math.tan(roofAngle * Math.PI / 180) *
            g.n('IN_rooms', `${roomCol}30`)
        );
      });

      /**
       * Row 38: U-Wert_IWU
       * Original Excel formula: "_xlfn.AGGREGATE(15,6,U_Werte_IWU!$F$30:$F$262/((U_Werte_IWU!$E$30:$E$262=clc_load!$A38)*(U_Werte_IWU!$D$30:$D$262=clc_load!$I$4)*(U_Werte_IWU!$C$30:$C$262=clc_load!$I$3)),1)"
       */
      grid.setCell('clc_load', `${clcLoadCol}38`, (s, c, g) => {
        return g.AGGREGATE(
          15, // SMALL
          g.MULTIPLY(
            g.DIVIDE(
              g.RANGE('U_Werte_IWU!F30:F262', s),
              g.MULTIPLY(
                g.GLEICH(g.RANGE('U_Werte_IWU!E30:E262', s), g.g('clc_load', 'A38')),
                g.MULTIPLY(
                  g.GLEICH(g.RANGE('U_Werte_IWU!D30:D262', s), g.g(s, `${clcLoadCol}4`)),
                  g.GLEICH(g.RANGE('U_Werte_IWU!C30:C262', s), g.g(s, `${clcLoadCol}3`))
                )
              )
            )
          ),
          s,
          1
        );
      });

      /**
       * Row 39: U-Wert Berechnung
       * Original Excel formula:
       * "_xlfn.LET(\n_xlpm.U_no_ins, _xlfn.XLOOKUP(1,\n  (INDIRECT(\"UWert_Mod[Bauteil]\")=$A$39)*\n  (INDIRECT(\"UWert_Mod[Modernisierungsjahr]\")=\"1983 - 1994\"),\n  INDIRECT(\"UWert_Mod[U_no_ins]\")),\n_xlpm.U_IWU, I$38,\n_xlpm.d_ins,IN_build!U$10,\nIF(_xlpm.d_ins>0,1/(1/_xlpm.U_no_ins+_xlpm.d_ins*0.01/INDEX(INDIRECT(\"PAR[lambda_ins_thick]\"), 1)),_xlpm.U_IWU))"
       */
      grid.setCell('clc_load', `${clcLoadCol}39`, (s, c, g) => {
        const U_no_ins = g.XVERWEIS(
          1,
          g.MULT(
            g.GLEICH(g.INDIREKT_DB_REF("UWert_Mod", "Bauteil"), g.g('clc_load', 'A39')),
            g.GLEICH(g.INDIREKT_DB_REF("UWert_Mod", "Modernisierungsjahr"), "1983 - 1994")
          ),
          g.INDIREKT_DB_REF("UWert_Mod", "U_no_ins")
        );

        const U_IWU = g.n(s, `${clcLoadCol}38`);
        const d_ins = g.n('IN_build', 'U10');

        if(typeof U_no_ins != 'number') return NaN;

        return g.WENN(
          d_ins > 0,
          1 / (1/U_no_ins + d_ins * 0.01 / (g.INDIREKT_DB_REF('PAR', 'lambda_ins_thick')[0] as number)),
          U_IWU
        );
      });

      /**
       * Row 40: Heizlast Transmission
       * Original Excel formula: "I$37*(I$38+I$8)*_xlfn.XLOOKUP(IN_rooms!R8,Daten!$E$106:$E$109,Daten!$F$106:$F$109,\"FEHLER\",0,1)*(I$10-Normaußentemperatur_12831!$B$6)"
       */
      grid.setCell('clc_load', `${clcLoadCol}40`, (s, c, g) => {
        return g.n(s, `${clcLoadCol}37`) *
          (g.n(s, `${clcLoadCol}38`) + g.n(s, `${clcLoadCol}8`)) *
          (g.XVERWEIS(
            g.g('IN_rooms', `${roomCol}8`),
            g.getCells('Daten', 'E106', 'E109').flat(1),
            g.getCells('Daten', 'F106', 'F109').flat(1),
            {ifNotFound: 'FEHLER', matchMode: 'exact', searchMode: 'first'}
          ) as number) *
          (g.n(s, `${clcLoadCol}10`) - g.n('Normaußentemperatur_12831', 'B6'));
      });

      /**
       * Row 41: Anteil an Raumheizlast
       * Original Excel formula: "I$40/I$72"
       */
      grid.setCell('clc_load', `${clcLoadCol}41`, (s, c, g) =>
        g.n(s, `${clcLoadCol}40`) / g.n(s, `${clcLoadCol}72`));

      /**
       * Row 42: Fläche
       * Original Excel formula: "IN_rooms!R$13*IN_rooms!R$14*IN_rooms!R$16"
       */
      grid.setCell('clc_load', `${clcLoadCol}42`, (s, c, g) =>
        g.n('IN_rooms', `${roomCol}13`) *
        g.n('IN_rooms', `${roomCol}14`) *
        g.n('IN_rooms', `${roomCol}16`));

      /**
       * Row 43: U-Wert_IWU
       * Original Excel formula: "_xlfn.AGGREGATE(15,6,U_Werte_IWU!$F$30:$F$262/((U_Werte_IWU!$E$30:$E$262=clc_load!$A43)*(U_Werte_IWU!$D$30:$D$262=clc_load!$I$4)*(U_Werte_IWU!$C$30:$C$262=clc_load!$I$3)),1)"
       */
      grid.setCell('clc_load', `${clcLoadCol}43`, (s, c, g) => {
        return g.AGGREGATE(
          15, // SMALL
          g.MULTIPLY(
            g.DIVIDE(
              g.RANGE('U_Werte_IWU!F30:F262', s),
              g.MULTIPLY(
                g.GLEICH(g.RANGE('U_Werte_IWU!E30:E262', s), g.g('clc_load', 'A43')),
                g.MULTIPLY(
                  g.GLEICH(g.RANGE('U_Werte_IWU!D30:D262', s), g.g(s, `${clcLoadCol}4`)),
                  g.GLEICH(g.RANGE('U_Werte_IWU!C30:C262', s), g.g(s, `${clcLoadCol}3`))
                )
              )
            )
          ),
          s,
          1
        );
      });

      /**
       * Row 44: U-Wert ausgetauschte Fenster
       * Original Excel formula: "IF(IN_build!$S$8=0,0,_xlfn.AGGREGATE(15,6,U_Werte_IWU!$F$30:$F$262/((U_Werte_IWU!$E$30:$E$262=clc_load!$A44)*(clc_load!$I$3=U_Werte_IWU!$C$30:$C$262)*(U_Werte_IWU!$D$30:$D$262=IN_build!$S$8)),1))"
       * Updated Excel formula: "_xlfn.AGGREGATE(15,6,U_Werte_IWU!$F$30:$F$267/((U_Werte_IWU!$E$30:$E$267=clc_load!$A44)*(U_Werte_IWU!$D$30:$D$267=IN_rooms!R$76)*(U_Werte_IWU!$C$30:$C$267=clc_load!$I$3)),1)"
       */
      grid.setCell('clc_load', `${clcLoadCol}44`, (s, c, g) => {
        return g.AGGREGATE(
          15, // SMALL
          g.MULTIPLY(
            g.DIVIDE(
              g.RANGE('U_Werte_IWU!F30:F267', s),
              g.MULTIPLY(
                g.GLEICH(g.RANGE('U_Werte_IWU!E30:E267', s), g.g('clc_load', 'A44')),
                g.MULTIPLY(
                  g.GLEICH(g.RANGE('U_Werte_IWU!D30:D267', s), g.g('IN_rooms', `${roomCol}76`)),
                  g.GLEICH(g.RANGE('U_Werte_IWU!C30:C267', s), g.g(s, `${clcLoadCol}3`))
                )
              )
            )
          ),
          s,
          1
        );
      });

      /**
       * Row 45: U-Wert_Berechnung
       * Original Excel formula: "IF(I44>0,I44,MIN(I44,I43))"
       */
      grid.setCell('clc_load', `${clcLoadCol}45`, (s, c, g) =>
        g.WENN(
          g.n(s, `${clcLoadCol}44`) > 0,
          g.n(s, `${clcLoadCol}44`),
          Math.min(g.n(s, `${clcLoadCol}44`), g.n(s, `${clcLoadCol}43`))
        ));

      /**
       * Row 46: Heizlast Transmission
       * Original Excel formula: "IF(I$42=0,0,I$42*(I$45+I$8)*(I$10-Normaußentemperatur_12831!$B$6))"
       */
      grid.setCell('clc_load', `${clcLoadCol}46`, (s, c, g) =>
        g.WENN(
          g.n(s, `${clcLoadCol}42`) === 0,
          0,
          g.n(s, `${clcLoadCol}42`) *
          (g.n(s, `${clcLoadCol}45`) + g.n(s, `${clcLoadCol}8`)) *
          (g.n(s, `${clcLoadCol}10`) - g.n('Normaußentemperatur_12831', 'B6'))
        ));

      /**
       * Row 47: Anteil an Raumheizlast
       * Original Excel formula: "I$46/I$72"
       */
      grid.setCell('clc_load', `${clcLoadCol}47`, (s, c, g) =>
        g.n(s, `${clcLoadCol}46`) / g.n(s, `${clcLoadCol}72`));

      /**
       * Row 48: Fläche
       * Original Excel formula: "IN_rooms!R$17*IN_rooms!R$18*IN_rooms!R$20"
       */
      grid.setCell('clc_load', `${clcLoadCol}48`, (s, c, g) =>
        g.n('IN_rooms', `${roomCol}17`) *
        g.n('IN_rooms', `${roomCol}18`) *
        g.n('IN_rooms', `${roomCol}20`));

      /**
       * Row 49: U-Wert_IWU
       * Original Excel formula: "_xlfn.AGGREGATE(15,6,U_Werte_IWU!$F$30:$F$262/((U_Werte_IWU!$E$30:$E$262=clc_load!$A49)*(U_Werte_IWU!$D$30:$D$262=clc_load!$I$4)*(U_Werte_IWU!$C$30:$C$262=clc_load!$I$3)),1)"
       */
      grid.setCell('clc_load', `${clcLoadCol}49`, (s, c, g) => {
        return g.AGGREGATE(
          15, // SMALL
          g.MULTIPLY(
            g.DIVIDE(
              g.RANGE('U_Werte_IWU!F30:F262', s),
              g.MULTIPLY(
                g.GLEICH(g.RANGE('U_Werte_IWU!E30:E262', s), g.g('clc_load', 'A49')),
                g.MULTIPLY(
                  g.GLEICH(g.RANGE('U_Werte_IWU!D30:D262', s), g.g(s, `${clcLoadCol}4`)),
                  g.GLEICH(g.RANGE('U_Werte_IWU!C30:C262', s), g.g(s, `${clcLoadCol}3`))
                )
              )
            )
          ),
          s,
          1
        );
      });

      /**
       * Row 50: U-Wert ausgetauschte Fenster
       * Original Excel formula: "IF(IN_build!$S$8=0,0,_xlfn.AGGREGATE(15,6,U_Werte_IWU!$F$30:$F$262/((U_Werte_IWU!$E$30:$E$262=clc_load!$A50)*(clc_load!$I$3=U_Werte_IWU!$C$30:$C$262)*(U_Werte_IWU!$D$30:$D$262=IN_build!$S$8)),1))"
       * Updated Excel formula: "_xlfn.AGGREGATE(15,6,U_Werte_IWU!$F$30:$F$267/((U_Werte_IWU!$E$30:$E$267=clc_load!$A50)*(U_Werte_IWU!$D$30:$D$267=IN_rooms!R$77)*(U_Werte_IWU!$C$30:$C$267=clc_load!$I$3)),1)"
       */
      grid.setCell('clc_load', `${clcLoadCol}50`, (s, c, g) => {
        return g.AGGREGATE(
          15, // SMALL
          g.MULTIPLY(
            g.DIVIDE(
              g.RANGE('U_Werte_IWU!F30:F267', s),
              g.MULTIPLY(
                g.GLEICH(g.RANGE('U_Werte_IWU!E30:E267', s), g.g('clc_load', 'A50')),
                g.MULTIPLY(
                  g.GLEICH(g.RANGE('U_Werte_IWU!D30:D267', s), g.g('IN_rooms', `${roomCol}77`)),
                  g.GLEICH(g.RANGE('U_Werte_IWU!C30:C267', s), g.g(s, `${clcLoadCol}3`))
                )
              )
            )
          ),
          s,
          1
        );
      });

      /**
       * Row 51: U-Wert_Berechnung
       * Original Excel formula: "IF(I$50>0,I$50,MIN(I$50,I$49))"
       */
      grid.setCell('clc_load', `${clcLoadCol}51`, (s, c, g) =>
        g.WENN(
          g.n(s, `${clcLoadCol}50`) > 0,
          g.n(s, `${clcLoadCol}50`),
          Math.min(g.n(s, `${clcLoadCol}50`), g.n(s, `${clcLoadCol}49`))
        ));

      /**
       * Row 52: Heizlast Transmission
       * Original Excel formula: "IF(I$48=0,0,I$48*(I$50+I$8)*(I$10-Normaußentemperatur_12831!$B$6))"
       */
      grid.setCell('clc_load', `${clcLoadCol}52`, (s, c, g) =>
        g.WENN(
          g.n(s, `${clcLoadCol}48`) === 0,
          0,
          g.n(s, `${clcLoadCol}48`) *
          (g.n(s, `${clcLoadCol}50`) + g.n(s, `${clcLoadCol}8`)) *
          (g.n(s, `${clcLoadCol}10`) - g.n('Normaußentemperatur_12831', 'B6'))
        ));

      /**
       * Row 53: Anteil an Raumheizlast
       * Original Excel formula: "I$52/I$72"
       */
      grid.setCell('clc_load', `${clcLoadCol}53`, (s, c, g) =>
        g.n(s, `${clcLoadCol}52`) / g.n(s, `${clcLoadCol}72`));

      /**
       * Row 54: Fläche
       * Original Excel formula: "IN_rooms!R$21*IN_rooms!R$22*IN_rooms!R$24"
       */
      grid.setCell('clc_load', `${clcLoadCol}54`, (s, c, g) =>
        g.n('IN_rooms', `${roomCol}21`) *
        g.n('IN_rooms', `${roomCol}22`) *
        g.n('IN_rooms', `${roomCol}24`));

      /**
       * Row 55: U-Wert_IWU
       * Original Excel formula: "_xlfn.AGGREGATE(15,6,U_Werte_IWU!$F$30:$F$262/((U_Werte_IWU!$E$30:$E$262=clc_load!$A55)*(U_Werte_IWU!$D$30:$D$262=clc_load!$I$4)*(U_Werte_IWU!$C$30:$C$262=clc_load!$I$3)),1)"
       */
      grid.setCell('clc_load', `${clcLoadCol}55`, (s, c, g) => {
        return g.AGGREGATE(
          15, // SMALL
          g.MULTIPLY(
            g.DIVIDE(
              g.RANGE('U_Werte_IWU!F30:F262', s),
              g.MULTIPLY(
                g.GLEICH(g.RANGE('U_Werte_IWU!E30:E262', s), g.g('clc_load', 'A55')),
                g.MULTIPLY(
                  g.GLEICH(g.RANGE('U_Werte_IWU!D30:D262', s), g.g(s, `${clcLoadCol}4`)),
                  g.GLEICH(g.RANGE('U_Werte_IWU!C30:C262', s), g.g(s, `${clcLoadCol}3`))
                )
              )
            )
          ),
          s,
          1
        );
      });

      /**
       * Row 56: U-Wert ausgetauschte Fenster
       * Original Excel formula: "IF(IN_build!$S$8=0,0,_xlfn.AGGREGATE(15,6,U_Werte_IWU!$F$30:$F$262/((U_Werte_IWU!$E$30:$E$262=clc_load!$A56)*(clc_load!$I$3=U_Werte_IWU!$C$30:$C$262)*(U_Werte_IWU!$D$30:$D$262=IN_build!$S$8)),1))"
       * Updated Excel formula: "_xlfn.AGGREGATE(15,6,U_Werte_IWU!$F$30:$F$267/((U_Werte_IWU!$E$30:$E$267=clc_load!$A56)*(U_Werte_IWU!$D$30:$D$267=IN_rooms!R$78)*(U_Werte_IWU!$C$30:$C$267=clc_load!$I$3)),1)"
       */
      grid.setCell('clc_load', `${clcLoadCol}56`, (s, c, g) => {
        return g.AGGREGATE(
          15, // SMALL
          g.MULTIPLY(
            g.DIVIDE(
              g.RANGE('U_Werte_IWU!F30:F267', s),
              g.MULTIPLY(
                g.GLEICH(g.RANGE('U_Werte_IWU!E30:E267', s), g.g('clc_load', 'A56')),
                g.MULTIPLY(
                  g.GLEICH(g.RANGE('U_Werte_IWU!D30:D267', s), g.g('IN_rooms', `${roomCol}78`)),
                  g.GLEICH(g.RANGE('U_Werte_IWU!C30:C267', s), g.g(s, `${clcLoadCol}3`))
                )
              )
            )
          ),
          s,
          1
        );
      });

      /**
       * Row 57: U-Wert_Berechnung
       * Original Excel formula: "IF(I$56>0,I$56,MIN(I$56,I$55))"
       */
      grid.setCell('clc_load', `${clcLoadCol}57`, (s, c, g) =>
        g.WENN(
          g.n(s, `${clcLoadCol}56`) > 0,
          g.n(s, `${clcLoadCol}56`),
          Math.min(g.n(s, `${clcLoadCol}56`), g.n(s, `${clcLoadCol}55`))
        ));

      /**
       * Row 58: Heizlast Transmission
       * Original Excel formula: "IF(I$54=0,0,I$42*(I$57+I$8)*(I$10-Normaußentemperatur_12831!$B$6))"
       */
      grid.setCell('clc_load', `${clcLoadCol}58`, (s, c, g) =>
        g.WENN(
          g.n(s, `${clcLoadCol}54`) === 0,
          0,
          g.n(s, `${clcLoadCol}42`) *
          (g.n(s, `${clcLoadCol}57`) + g.n(s, `${clcLoadCol}8`)) *
          (g.n(s, `${clcLoadCol}10`) - g.n('Normaußentemperatur_12831', 'B6'))
        ));

      /**
       * Row 59: Anteil an Raumheizlast
       * Original Excel formula: "I$58/I$72"
       */
      grid.setCell('clc_load', `${clcLoadCol}59`, (s, c, g) =>
        g.n(s, `${clcLoadCol}58`) / g.n(s, `${clcLoadCol}72`));

      /**
       * Row 60: Fläche
       * Original Excel formula: "IN_rooms!R$41*IN_rooms!R$42*IN_rooms!R$44"
       */
      grid.setCell('clc_load', `${clcLoadCol}60`, (s, c, g) =>
        g.n('IN_rooms', `${roomCol}41`) *
        g.n('IN_rooms', `${roomCol}42`) *
        g.n('IN_rooms', `${roomCol}44`));

      /**
       * Row 61: U-Wert_IWU
       * Original Excel formula: "_xlfn.AGGREGATE(15,6,U_Werte_IWU!$F$30:$F$262/((U_Werte_IWU!$E$30:$E$262=clc_load!$A61)*(U_Werte_IWU!$D$30:$D$262=clc_load!$I$4)*(U_Werte_IWU!$C$30:$C$262=clc_load!$I$3)),1)"
       */
      grid.setCell('clc_load', `${clcLoadCol}61`, (s, c, g) => {
        return g.AGGREGATE(
          15, // SMALL
          g.MULTIPLY(
            g.DIVIDE(
              g.RANGE('U_Werte_IWU!F30:F262', s),
              g.MULTIPLY(
                g.GLEICH(g.RANGE('U_Werte_IWU!E30:E262', s), g.g('clc_load', 'A61')),
                g.MULTIPLY(
                  g.GLEICH(g.RANGE('U_Werte_IWU!D30:D262', s), g.g(s, `${clcLoadCol}4`)),
                  g.GLEICH(g.RANGE('U_Werte_IWU!C30:C262', s), g.g(s, `${clcLoadCol}3`))
                )
              )
            )
          ),
          s,
          1
        );
      });

      /**
       * Row 62: U-Wert ausgetauschte Fenster
       * Original Excel formula: "IF(IN_build!$S$8=0,0,_xlfn.AGGREGATE(15,6,U_Werte_IWU!$F$30:$F$262/((U_Werte_IWU!$E$30:$E$262=clc_load!$A62)*(clc_load!$I$3=U_Werte_IWU!$C$30:$C$262)*(U_Werte_IWU!$D$30:$D$262=IN_build!$S$8)),1))"
       * Updated Excel formula: "_xlfn.AGGREGATE(15,6,U_Werte_IWU!$F$30:$F$267/((U_Werte_IWU!$E$30:$E$267=clc_load!$A62)*(U_Werte_IWU!$D$30:$D$267=IN_rooms!R$79)*(U_Werte_IWU!$C$30:$C$267=clc_load!$I$3)),1)"
       */
      grid.setCell('clc_load', `${clcLoadCol}62`, (s, c, g) => {
        return g.AGGREGATE(
          15, // SMALL
          g.MULTIPLY(
            g.DIVIDE(
              g.RANGE('U_Werte_IWU!F30:F267', s),
              g.MULTIPLY(
                g.GLEICH(g.RANGE('U_Werte_IWU!E30:E267', s), g.g('clc_load', 'A62')),
                g.MULTIPLY(
                  g.GLEICH(g.RANGE('U_Werte_IWU!D30:D267', s), g.g('IN_rooms', `${roomCol}79`)),
                  g.GLEICH(g.RANGE('U_Werte_IWU!C30:C267', s), g.g(s, `${clcLoadCol}3`))
                )
              )
            )
          ),
          s,
          1
        );
      });

      /**
       * Row 63: U-Wert_Berechnung
       * Original Excel formula: "IF(I$62>0,I$62,MIN(I$62,I$61))"
       */
      grid.setCell('clc_load', `${clcLoadCol}63`, (s, c, g) =>
        g.WENN(
          g.n(s, `${clcLoadCol}62`) > 0,
          g.n(s, `${clcLoadCol}62`),
          Math.min(g.n(s, `${clcLoadCol}62`), g.n(s, `${clcLoadCol}61`))
        ));

      /**
       * Row 64: Heizlast Transmission
       * Original Excel formula: "I$60*(I$63+I$8)*(I$10-Normaußentemperatur_12831!$B$6)"
       */
      grid.setCell('clc_load', `${clcLoadCol}64`, (s, c, g) =>
        g.n(s, `${clcLoadCol}60`) *
        (g.n(s, `${clcLoadCol}63`) + g.n(s, `${clcLoadCol}8`)) *
        (g.n(s, `${clcLoadCol}10`) - g.n('Normaußentemperatur_12831', 'B6')));

      /**
       * Row 65: Anteil an Raumheizlast
       * Original Excel formula: "I$64/I$72"
       */
      grid.setCell('clc_load', `${clcLoadCol}65`, (s, c, g) =>
        g.n(s, `${clcLoadCol}64`) / g.n(s, `${clcLoadCol}72`));

      /**
       * Row 66: Fläche
       * Original Excel formula: "IN_rooms!R$45*IN_rooms!R$46*IN_rooms!R$48"
       */
      grid.setCell('clc_load', `${clcLoadCol}66`, (s, c, g) =>
        g.n('IN_rooms', `${roomCol}45`) *
        g.n('IN_rooms', `${roomCol}46`) *
        g.n('IN_rooms', `${roomCol}48`));

      /**
       * Row 67: U-Wert_IWU
       * Original Excel formula: "_xlfn.AGGREGATE(15,6,U_Werte_IWU!$F$30:$F$262/((U_Werte_IWU!$E$30:$E$262=clc_load!$A67)*(U_Werte_IWU!$D$30:$D$262=clc_load!$I$4)*(U_Werte_IWU!$C$30:$C$262=clc_load!$I$3)),1)"
       */
      grid.setCell('clc_load', `${clcLoadCol}67`, (s, c, g) => {
        return g.AGGREGATE(
          15, // SMALL
          g.MULTIPLY(
            g.DIVIDE(
              g.RANGE('U_Werte_IWU!F30:F262', s),
              g.MULTIPLY(
                g.GLEICH(g.RANGE('U_Werte_IWU!E30:E262', s), g.g('clc_load', 'A67')),
                g.MULTIPLY(
                  g.GLEICH(g.RANGE('U_Werte_IWU!D30:D262', s), g.g(s, `${clcLoadCol}4`)),
                  g.GLEICH(g.RANGE('U_Werte_IWU!C30:C262', s), g.g(s, `${clcLoadCol}3`))
                )
              )
            )
          ),
          s,
          1
        );
      });

      /**
       * Row 68: U-Wert ausgetauschte Fenster
       * Original Excel formula: "IF(IN_build!$S$8=0,0,_xlfn.AGGREGATE(15,6,U_Werte_IWU!$F$30:$F$262/((U_Werte_IWU!$E$30:$E$262=clc_load!$A68)*(clc_load!$I$3=U_Werte_IWU!$C$30:$C$262)*(U_Werte_IWU!$D$30:$D$262=IN_build!$S$8)),1))"
       * Updated Excel formula: "_xlfn.AGGREGATE(15,6,U_Werte_IWU!$F$30:$F$267/((U_Werte_IWU!$E$30:$E$267=clc_load!$A68)*(U_Werte_IWU!$D$30:$D$267=IN_rooms!R$80)*(U_Werte_IWU!$C$30:$C$267=clc_load!$I$3)),1)"
       */
      grid.setCell('clc_load', `${clcLoadCol}68`, (s, c, g) => {
        return g.AGGREGATE(
          15, // SMALL
          g.MULTIPLY(
            g.DIVIDE(
              g.RANGE('U_Werte_IWU!F30:F267', s),
              g.MULTIPLY(
                g.GLEICH(g.RANGE('U_Werte_IWU!E30:E267', s), g.g('clc_load', 'A68')),
                g.MULTIPLY(
                  g.GLEICH(g.RANGE('U_Werte_IWU!D30:D267', s), g.g('IN_rooms', `${roomCol}80`)),
                  g.GLEICH(g.RANGE('U_Werte_IWU!C30:C267', s), g.g(s, `${clcLoadCol}3`))
                )
              )
            )
          ),
          s,
          1
        );
      });

      /**
       * Row 69: U-Wert_Berechnung
       * Original Excel formula: "IF(I$68>0,I$68,MIN(I$68,I$67))"
       */
      grid.setCell('clc_load', `${clcLoadCol}69`, (s, c, g) =>
        g.WENN(
          g.n(s, `${clcLoadCol}68`) > 0,
          g.n(s, `${clcLoadCol}68`),
          Math.min(g.n(s, `${clcLoadCol}68`), g.n(s, `${clcLoadCol}67`))
        ));

      /**
       * Row 70: Heizlast Transmission
       * Original Excel formula: "I$66*(I$69+I$8)*(I$10-Normaußentemperatur_12831!$B$6)"
       */
      grid.setCell('clc_load', `${clcLoadCol}70`, (s, c, g) =>
        g.n(s, `${clcLoadCol}66`) *
        (g.n(s, `${clcLoadCol}69`) + g.n(s, `${clcLoadCol}8`)) *
        (g.n(s, `${clcLoadCol}10`) - g.n('Normaußentemperatur_12831', 'B6')));

      /**
       * Row 71: Anteil an Raumheizlast
       * Original Excel formula: "I70/I$72"
       */
      grid.setCell('clc_load', `${clcLoadCol}71`, (s, c, g) =>
        g.n(s, `${clcLoadCol}70`) / g.n(s, `${clcLoadCol}72`));

      /**
       * Row 72: Absolute Raumheizlast [W]
       * Original Excel formula: "SUMIF($B$3:$B$71,$B$17,I3:I71)+I12"
       */
      grid.setCell('clc_load', `${clcLoadCol}72`, (s, c, g) =>
        g.SUMMEWENN('$B$3:$B$71', g.g('clc_load', 'B17'), `${clcLoadCol}3:${clcLoadCol}71`, 'clc_load') +
        g.n('clc_load', `${clcLoadCol}12`));

      /**
       * Row 73: Heizlast_spezifisch / qdot_room [W/m²]
       * Original Excel formula: "I$72/IN_rooms!R$4"
       */
      grid.setCell('clc_load', `${clcLoadCol}73`, (s, c, g) =>
        g.n(s, `${clcLoadCol}72`) / g.n('IN_rooms', `${roomCol}4`));

      /**
       * Row 74: Heizlast mit Abschlag / Qdot_room_cor [W]
       * Original Excel formula:
       * "_xlfn.IFS(I$73<Daten!$E$112,clc_load!I$72*(1-Daten!$F$112),
       * AND(clc_load!I$73>=Daten!$E$112,clc_load!I$73<Daten!$E$113),clc_load!I$72*(1-Daten!$F$113),
       * AND(clc_load!I$73>=Daten!$E$113,clc_load!I$73<Daten!$E$114),clc_load!I$72*(1-Daten!$F$114),
       * I$73>=Daten!$E$114,clc_load!I$72)"
       */
      grid.setCell('clc_load', `${clcLoadCol}74`, (s, c, g) => {
        return g.WENNS(
          g.n(s, `${clcLoadCol}73`) < g.n('Daten', 'E112'),
          g.n(s, `${clcLoadCol}72`) * (1 - g.n('Daten', 'F112')),

          g.UND(
            g.n(s, `${clcLoadCol}73`) >= g.n('Daten', 'E112'),
            g.n(s, `${clcLoadCol}73`) < g.n('Daten', 'E113')
          ),
          g.n(s, `${clcLoadCol}72`) * (1 - g.n('Daten', 'F113')),

          g.UND(
            g.n(s, `${clcLoadCol}73`) >= g.n('Daten', 'E113'),
            g.n(s, `${clcLoadCol}73`) < g.n('Daten', 'E114')
          ),
          g.n(s, `${clcLoadCol}72`) * (1 - g.n('Daten', 'F114')),

          g.n(s, `${clcLoadCol}73`) >= g.n('Daten', 'E114'),
          g.n(s, `${clcLoadCol}72`),

          // Default fallback
          g.n(s, `${clcLoadCol}72`)
        );
      });

      /**
       * Row 75: Heizlast_spez mit Abschlag / qdot_room_cor [W/m²]
       * Original Excel formula: "I$74/IN_rooms!R$4"
       */
      grid.setCell('clc_load', `${clcLoadCol}75`, (s, c, g) =>
        g.n(s, `${clcLoadCol}74`) / g.n('IN_rooms', `${roomCol}4`));

      /**
       * Row 76: Kontrolle / r_Qdot_room
       * Original Excel formula: "SUMIF($B$3:$B$71,$B$18,I$3:I$71)"
       */
      grid.setCell('clc_load', `${clcLoadCol}76`, (s, c, g) =>
        g.SUMMEWENN('$B$3:$B$71', g.g('clc_load', 'B18'), `${clcLoadCol}3:${clcLoadCol}71`, 'clc_load'));
    }
  }
}
