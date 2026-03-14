import {DataGrid} from '../data-grid';
import {CLC_LOAD_COLS, FormulaOverlay, IN_ROOM_COLS} from './base-overlay';

/**
 * clc_load sheet formula overlay
 * Contains formula implementations for the clc_load sheet
 */
export class ClcLoadOverlay implements FormulaOverlay {

  /**
   * Apply clc_load formulas to the data grid
   * @param grid The DataGrid instance to apply formulas to
   */
  applyFormulas(grid: DataGrid): void {
    // Implement formulas for each room column
    for (let i = 0; i < CLC_LOAD_COLS.length; i++) {
      const clcLoadCol = CLC_LOAD_COLS[i];
      const roomCol = IN_ROOM_COLS[i];

      /**
       * Row 2: Room ID
       * Excel: "IN_rooms!R2"
       */
      grid.setCell('clc_load', `${clcLoadCol}2`, (s, c, g) =>
        g.g('IN_rooms', `${roomCol}2`));

      /**
       * Row 3: Building type
       * Excel: "IN_build!$P$3"
       */
      grid.setCell('clc_load', `${clcLoadCol}3`, (s, c, g) =>
        g.g('IN_build', 'P3'));

      /**
       * Row 4: Building year
       * Excel: "IN_build!$P$5"
       */
      grid.setCell('clc_load', `${clcLoadCol}4`, (s, c, g) =>
        g.g('IN_build', 'P5'));

      /**
       * Row 5: Room name
       * Excel: "IN_rooms!R3"
       */
      grid.setCell('clc_load', `${clcLoadCol}5`, (s, c, g) =>
        g.g('IN_rooms', `${roomCol}3`));

      /**
       * Row 6: Room volume
       * Excel: "IF(I$26>0,HLOOKUP("f_Vroom_roof",PAR!$F$1:$AZ$5,2,FALSE)*IN_rooms!R$4*IN_rooms!R$5+I$25,IN_rooms!R$4*IN_rooms!R$5)"
       */
      grid.setCell('clc_load', `${clcLoadCol}6`, (s, c, g) =>
        g.WENN(
          g.n(s, `${clcLoadCol}26`) > 0,
          g.HLOOKUP('PAR', 'f_Vroom_roof', '$F$1', '$AZ$5', 2, false) as number *
            g.n('IN_rooms', `${roomCol}4`) * g.n('IN_rooms', `${roomCol}5`) +
            g.n(s, `${clcLoadCol}25`),
          g.n('IN_rooms', `${roomCol}4`) * g.n('IN_rooms', `${roomCol}5`)
        ));

      /**
       * Row 7: Luftwechselrate
       * Excel: "0.5"
       */
      grid.setCell('clc_load', `${clcLoadCol}7`, (s, c, g) => 0.5);

      /**
       * Row 8: Wärmebrückenkoeffizient ∆U,TB
       * Excel:
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
       * Excel: "0.34"
       */
      grid.setCell('clc_load', `${clcLoadCol}9`, (s, c, g) => 0.34);

      /**
       * Row 10: Berechnungs-Raumtemperatur
       * Excel: "IF(IN_rooms!R$6<>20,IN_rooms!R$6,20)"
       */
      grid.setCell('clc_load', `${clcLoadCol}10`, (s, c, g) =>
        g.WENN(g.g('IN_rooms', `${roomCol}6`) != 20,
              g.g('IN_rooms', `${roomCol}6`),
              20));

      /**
       * Row 11: Mindes-Luftvolumenstrom qv,min
       * Excel: "I$7*I$6"
       */
      grid.setCell('clc_load', `${clcLoadCol}11`, (s, c, g) =>
        g.n('clc_load', `${clcLoadCol}7`) * g.n('clc_load', `${clcLoadCol}6`));

      /**
       * Row 12: Heizlast Ventilation [W]
       * Excel: "I$9*I$11*(I$10-Normaußentemperatur_12831!$B$6)"
       */
      grid.setCell('clc_load', `${clcLoadCol}12`, (s, c, g) =>
        g.n('clc_load', `${clcLoadCol}9`) *
        g.n('clc_load', `${clcLoadCol}11`) *
        (g.n('clc_load', `${clcLoadCol}10`) - g.n('Normaußentemperatur_12831', 'B6')));

      /**
       * Row 13: Anteil an Raumheizlast
       * Excel: "I$12/I$72"
       */
      grid.setCell('clc_load', `${clcLoadCol}13`, (s, c, g) =>
        g.n('clc_load', `${clcLoadCol}12`) / g.n('clc_load', `${clcLoadCol}72`));

      /**
       * Row 14: Wand-Außenfläche [m²]
       * Excel:
       * "IF(
       *   OR(IN_rooms!R$28=\"Keine\",IN_rooms!R$28=\"Flachdach\",IN_rooms!R$31=0,IN_rooms!R$30=0,IN_build!$P$4=\"Flach bzw. Flachdach\"),
       *   ((IN_rooms!R$9+HLOOKUP(\"f_A_wall_wid\",PAR!$F$1:$AZ$5,2,FALSE))*(IN_rooms!R$5+HLOOKUP(\"f_A_wall_hei\",PAR!$F$1:$AZ$5,2,FALSE))-(I$42+I$48+I$54))*(IN_rooms!R$9>0),
       *   _xlfn.LET(
       *     _xlpm.komplex,IN_rooms!R$28=\"Komplex\",
       *     _xlpm.b_ceil,IN_rooms!R$32,
       *     _xlpm.L_wall,(IN_rooms!R$9+HLOOKUP(\"f_A_wall_wid\",PAR!$F$1:$AZ$5,2,FALSE))*(IN_rooms!R$9>0),
       *     _xlpm.n_giebel,IF(_xlpm.L_wall=0,0,IN_rooms!R33),
       *     _xlpm.h_knee,IN_rooms!R$34,
       *     _xlpm.h_roof,IN_rooms!R$31,
       *     _xlpm.is_jamb,IN_rooms!R$35=\"Ja\",
       *     _xlpm.h_room,IN_rooms!R$5+HLOOKUP(\"f_A_wall_hei\",PAR!$F$1:$AZ$5,2,FALSE),
       *     _xlpm.alpha,_xlfn.IFS(
       *       IN_build!$P$4=\"geneigt\",25,
       *       IN_build!$P$4=\"steil\",40,
       *       IN_build!$P$4=\"sehr steil\",55),
       *     _xlpm.A_win,(I$42+I$48+I$54),
       *     _xlpm.A_knee,MAX(0,IF(_xlpm.is_jamb,0,IF(_xlpm.komplex,I$26*(_xlpm.h_knee*SIN(_xlpm.alpha*PI()/180))/(_xlpm.h_room-_xlpm.h_knee),_xlpm.h_knee*IN_rooms!R$30))),
       *     _xlpm.A_no_slop,_xlpm.L_wall*_xlpm.h_room,
       *     _xlpm.A_big_rect,_xlpm.h_room*_xlpm.b_ceil,
       *     _xlpm.A_triangle,1/4*_xlpm.h_roof^2*SIN(2*_xlpm.alpha*PI()/180),
       *     _xlpm.A_small_rect,_xlpm.h_knee*_xlpm.h_roof*COS(_xlpm.alpha*PI()/180),
       *     _xlpm.A_triangle_jamb,1/2*_xlpm.h_knee^2*TAN(_xlpm.alpha*PI()/180),
       *     _xlpm.A_slop_tot,_xlpm.A_triangle+_xlpm.A_small_rect+IF(_xlpm.is_jamb,_xlpm.A_triangle_jamb,0),
       *
       *     _xlpm.giebel_0,_xlpm.n_giebel=0,
       *     _xlpm.giebel_1_slop_1,AND(IN_rooms!R$28=\"Eine\",_xlpm.n_giebel=1),
       *     _xlpm.giebel_2_slop_1,AND(IN_rooms!R$28=\"Eine\",_xlpm.n_giebel=2),
       *     _xlpm.giebel_1_slop_2,AND(IN_rooms!R$28=\"Zwei (symmetrisch)\",_xlpm.n_giebel=1),
       *     _xlpm.giebel_2_slop_2,AND(IN_rooms!R$28=\"Zwei (symmetrisch)\",_xlpm.n_giebel=2),
       *
       *     IF(_xlpm.komplex,
       *       MAX(MIN(_xlfn.IFS(
       *         _xlpm.giebel_0,_xlpm.L_wall*_xlpm.h_room,
       *         _xlpm.is_jamb,_xlpm.h_room^2/TAN(_xlpm.alpha*PI()/180),
       *         NOT(_xlpm.is_jamb),_xlpm.L_wall * (_xlpm.h_knee + 0.5 * (_xlpm.h_room - _xlpm.h_knee)),
       *         TRUE,_xlpm.A_no_slop),_xlpm.A_no_slop)+_xlpm.A_knee-_xlpm.A_win,0)*HLOOKUP(\"f_Awall_roof\",PAR!$F$1:$AZ$5,2,FALSE),
       *       MAX(MIN(_xlfn.IFS(
       *         _xlpm.giebel_0,_xlpm.A_no_slop,
       *         _xlpm.giebel_1_slop_1,_xlpm.A_big_rect+_xlpm.A_slop_tot,
       *         _xlpm.giebel_2_slop_1,2*(_xlpm.A_big_rect+_xlpm.A_slop_tot),
       *         _xlpm.giebel_1_slop_2,_xlpm.A_big_rect+2*_xlpm.A_slop_tot,
       *         _xlpm.giebel_2_slop_2,2*(_xlpm.A_big_rect+2*_xlpm.A_slop_tot),
       *         TRUE,_xlpm.A_no_slop),_xlpm.A_no_slop)+_xlpm.A_knee-_xlpm.A_win,0)*HLOOKUP(\"f_Awall_roof\",PAR!$F$1:$AZ$5,2,FALSE)
       *     )
       *   )
       * )"
       */
      grid.setCell('clc_load', `${clcLoadCol}14`, (s, c, g) => {
        return g.WENN(
          g.ODER(
            g.g('IN_rooms', `${roomCol}28`) === 'Keine',
            g.g('IN_rooms', `${roomCol}28`) === 'Flachdach',
            g.n('IN_rooms', `${roomCol}31`) === 0,
            g.n('IN_rooms', `${roomCol}30`) === 0,
            g.g('IN_build', 'P4') === 'Flach bzw. Flachdach'
          ),
          (() => {
            // Simple calculation: corrected wall dimensions minus windows
            let wall_wid_factor = g.HLOOKUP('PAR', 'f_A_wall_wid', '$F$1', '$AZ$5', 2, false) as number;
            let wall_hei_factor = g.HLOOKUP('PAR', 'f_A_wall_hei', '$F$1', '$AZ$5', 2, false) as number;
            let corrected_L_wall = g.n('IN_rooms', `${roomCol}9`) + wall_wid_factor;
            let corrected_h_room = g.n('IN_rooms', `${roomCol}5`) + wall_hei_factor;
            let wall_exists = g.n('IN_rooms', `${roomCol}9`) > 0 ? 1 : 0;
            let A_win = g.n(s, `${clcLoadCol}42`) + g.n(s, `${clcLoadCol}48`) + g.n(s, `${clcLoadCol}54`);
            return (corrected_L_wall * corrected_h_room - A_win) * wall_exists;
          })(),

          (() => {
            // Complex calculation with LET variables
            let komplex = g.g('IN_rooms', `${roomCol}28`) === 'Komplex';
            let b_ceil = g.n('IN_rooms', `${roomCol}32`);
            let wall_wid_factor = g.HLOOKUP('PAR', 'f_A_wall_wid', '$F$1', '$AZ$5', 2, false) as number;
            let wall_hei_factor = g.HLOOKUP('PAR', 'f_A_wall_hei', '$F$1', '$AZ$5', 2, false) as number;
            let wall_exists = g.n('IN_rooms', `${roomCol}9`) > 0 ? 1 : 0;
            let L_wall = (g.n('IN_rooms', `${roomCol}9`) + wall_wid_factor) * wall_exists;
            let n_giebel = L_wall === 0 ? 0 : g.n('IN_rooms', `${roomCol}33`);
            let h_knee = g.n('IN_rooms', `${roomCol}34`); // Updated to use row 34
            let h_roof = g.n('IN_rooms', `${roomCol}31`);
            let is_jamb = g.g('IN_rooms', `${roomCol}35`) === 'Ja';
            let h_room = g.n('IN_rooms', `${roomCol}5`) + wall_hei_factor;

            let roofType = g.g('IN_build', 'P4');
            let alpha = g.WENNS(
              roofType === 'geneigt', 25,
              roofType === 'steil', 40,
              roofType === 'sehr steil', 55,
              g.WAHR(), 0
            );
            let alphaRad = (alpha * Math.PI) / 180;

            let A_win = g.n(s, `${clcLoadCol}42`) + g.n(s, `${clcLoadCol}48`) + g.n(s, `${clcLoadCol}54`);

            // Complex knee area calculation
            let A_knee = Math.max(0,
              is_jamb ? 0 :
                komplex ?
                  g.n(s, `${clcLoadCol}26`) * (h_knee * Math.sin(alphaRad)) / (h_room - h_knee) :
                  h_knee * g.n('IN_rooms', `${roomCol}30`)
            );

            let A_no_slop = L_wall * h_room;
            let A_big_rect = h_room * b_ceil;
            let A_triangle = 0.25 * h_roof * h_roof * Math.sin(2 * alphaRad);
            let A_small_rect = h_knee * h_roof * Math.cos(alphaRad);
            let A_triangle_jamb = 0.5 * h_knee * h_knee * Math.tan(alphaRad);
            let A_slop_tot = A_triangle + A_small_rect + (is_jamb ? A_triangle_jamb : 0);

            let giebel_0 = n_giebel === 0;
            let giebel_1_slop_1 = g.g('IN_rooms', `${roomCol}28`) === 'Eine' && n_giebel === 1;
            let giebel_2_slop_1 = g.g('IN_rooms', `${roomCol}28`) === 'Eine' && n_giebel === 2;
            let giebel_1_slop_2 = g.g('IN_rooms', `${roomCol}28`) === 'Zwei (symmetrisch)' && n_giebel === 1;
            let giebel_2_slop_2 = g.g('IN_rooms', `${roomCol}28`) === 'Zwei (symmetrisch)' && n_giebel === 2;

            // Get wall area correction factor for roof rooms
            let f_Awall_roof = g.HLOOKUP('PAR', 'f_Awall_roof', '$F$1', '$AZ$5', 2, false) as number;

            if (komplex) {
              // Complex roof calculation
              let area_calc = g.WENNS(
                giebel_0, L_wall * h_room,
                is_jamb, h_room * h_room / Math.tan(alphaRad),
                !is_jamb, L_wall * (h_knee + 0.5 * (h_room - h_knee)),
                g.WAHR(), A_no_slop
              );
              return Math.max(Math.min(area_calc, A_no_slop) + A_knee - A_win, 0) * f_Awall_roof;
            } else {
              // Standard roof calculation
              let area_calc = g.WENNS(
                giebel_0, A_no_slop,
                giebel_1_slop_1, A_big_rect + A_slop_tot,
                giebel_2_slop_1, 2 * (A_big_rect + A_slop_tot),
                giebel_1_slop_2, A_big_rect + 2 * A_slop_tot,
                giebel_2_slop_2, 2 * (A_big_rect + 2 * A_slop_tot),
                g.WAHR(), A_no_slop
              );
              return Math.max(Math.min(area_calc, A_no_slop) + A_knee - A_win, 0) * f_Awall_roof;
            }
          })()
        );
      });

      /**
       * Row 15: U-Wert Außenwand [W/(m²K)]
       * Excel: "IF(I14=0,0,_xlfn.AGGREGATE(15,6,U_Werte_IWU!$F$30:$F$297/((U_Werte_IWU!$E$30:$E$297=LEFT($A$14,9))*(U_Werte_IWU!$D$30:$D$297=clc_load!I4)*(U_Werte_IWU!$C$30:$C$297=clc_load!I3)),1))"
       */
      grid.setCell('clc_load', `${clcLoadCol}15`, (s, c, g) => {
        return g.WENN(
          g.n(s, `${clcLoadCol}14`) === 0,
          0,
          g.AGGREGATE(15, 6, g.DIVIDE_ARRAY(
            g.RANGE('F30:F297', 'U_Werte_IWU'),
            g.MULTIPLY_ARRAYS(
              g.GLEICH(g.RANGE('E30:E297', 'U_Werte_IWU'), g.LINKS(g.g(s, `A14`), 9)),
              g.MULTIPLY_ARRAYS(
                g.GLEICH(g.RANGE('D30:D297', 'U_Werte_IWU'), g.g(s, `${clcLoadCol}4`)),
                g.GLEICH(g.RANGE('C30:C297', 'U_Werte_IWU'), g.g(s, `${clcLoadCol}3`))
              )
            )
          ), s, 1)
        );
      });

      /**
       * Row 16: U-Wert Außenwand (mit Dämmung) [W/(m²K)]
       * Excel:
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
       * Excel:
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
       * Excel: "I$17/I$72"
       */
      grid.setCell('clc_load', `${clcLoadCol}18`, (s, c, g) =>
        g.n(s, `${clcLoadCol}17`) / g.n(s, `${clcLoadCol}72`));

      /**
       * Row 19: Fläche [m²]
       * Excel: "IF(IN_rooms!R25=\"Nein\",0,IN_rooms!R26*IN_rooms!R5)"
       */
      grid.setCell('clc_load', `${clcLoadCol}19`, (s, c, g) =>
        g.WENN(
          g.g('IN_rooms', `${roomCol}25`) === 'Nein',
          0,
          g.n('IN_rooms', `${roomCol}26`) * g.n('IN_rooms', `${roomCol}5`)
        ));

      /**
       * Row 20: U-Wert_IWU
       * Excel: "INDEX(INDIRECT(\"PAR[U_inwall]\"),1)"
       */
      grid.setCell('clc_load', `${clcLoadCol}20`, (s, c, g) =>
        (g.INDIREKT_DB_REF('PAR', 'U_inwall')[0] as number));

      /**
       * Row 21: U-Wert_Berechnung
       * Excel: "IF(IN_rooms!R$27>0,1/(1/I$20+IN_rooms!R$27*0.01/INDEX(INDIRECT(\"PAR[lambda_ins_thick]\"),1)),I$20)"
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
       * Excel: "IF(I19=0,0,(I19*(I21+I$8)*0.5*(I$10-IF(IN_rooms!R$28=\"Ja\",15,5))))"
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
       * Excel: "IF(I$22=0,0,I$22/I$72)"
       */
      grid.setCell('clc_load', `${clcLoadCol}23`, (s, c, g) =>
        g.WENN(
          g.n(s, `${clcLoadCol}22`) === 0,
          0,
          g.n(s, `${clcLoadCol}22`) / g.n(s, `${clcLoadCol}72`)
        ));

      /**
       * Row 24: ZWISCHENERGEBNIS Heizlast Transmission
       * Excel: "IF(I$25<=0,0,1.6175*I$28^-0.28)"
       */
      grid.setCell('clc_load', `${clcLoadCol}24`, (s, c, g) =>
        g.WENN(
          g.n(s, `${clcLoadCol}25`) <= 0,
          0,
          1.6175 * Math.pow(g.n(s, `${clcLoadCol}28`), -0.28)
        ));

      /**
       * Row 25: Volumen Gaube
       * Excel: "IF(IN_rooms!R$40=\"Ja\",MAX(0,0.4183*I$26-1.3793,0),0)"
       */
      grid.setCell('clc_load', `${clcLoadCol}25`, (s, c, g) =>
        g.WENN(
          g.g('IN_rooms', `${roomCol}40`) === 'Ja',
          Math.max(0, 0.4183 * g.n(s, `${clcLoadCol}26`) - 1.3793, 0),
          0
        ));

      /**
       * Row 26: Fläche [m²]
       * Excel:
       * "_xlfn.LET(
       *   _xlpm.L_wall,IN_rooms!R$9,
       *   _xlpm.n_giebel,IF(_xlpm.L_wall=0,0,IN_rooms!R33),
       *   _xlpm.h_knee,IN_rooms!R$34,
       *   _xlpm.h_roof,IN_rooms!R$31 + HLOOKUP(\"f_A_roof_hei\",PAR!$F$1:$AZ$5,2,FALSE),
       *   _xlpm.b_roof,IN_rooms!R$30 + MIN(2,_xlpm.n_giebel) * HLOOKUP(\"f_A_roof_wid\",PAR!$F$1:$AZ$5,2,FALSE),
       *   _xlpm.h_room,IN_rooms!R$5,
       *   _xlpm.alpha,_xlfn.IFS(
       *     IN_build!$P$4=\"geneigt\",25,
       *     IN_build!$P$4=\"steil\",40,
       *     IN_build!$P$4=\"sehr steil\",55) * PI() / 180,
       *   _xlpm.is_jamb,IN_rooms!R$35=\"Ja\",
       *   _xlpm.n_A_roof, IF(IN_rooms!R$28=\"Zwei (symmetrisch)\", 2, 1),
       *
       *   MIN(MAX(_xlfn.IFS(
       *     OR(IN_rooms!R$28=\"Keine\",IN_rooms!R$28=\"\"),
       *     0,
       *     OR(IN_rooms!R$28=\"Flachdach\",IN_build!$P$4=\"Flach bzw. Flachdach\"),
       *       IN_rooms!R$4 + _xlpm.L_wall * HLOOKUP(\"f_A_roof_wid\",PAR!$F$1:$AZ$5,2,FALSE) - (I$60+I$66),
       *     IN_rooms!R$28=\"Komplex\",
       *       IF(_xlpm.is_jamb,IN_rooms!R$84*(1+_xlpm.h_knee/(_xlpm.h_room*SIN(_xlpm.alpha))),IN_rooms!R$84),
       *     IN_rooms!R$39>0,
       *       _xlpm.h_roof*_xlpm.b_roof
       *       +IN_rooms!R$39
       *       /SIN(_xlpm.alpha),
       *     OR(IN_rooms!R$39=0, IN_rooms!R$37>0),
       *       _xlpm.h_roof*_xlpm.b_roof) * _xlpm.n_A_roof - (I$60+I$66), 0),  IN_rooms!R$4 * 2))
       * "
       */
      grid.setCell('clc_load', `${clcLoadCol}26`, (s, c, g) => {
        // LET variables
        let L_wall = g.n('IN_rooms', `${roomCol}9`);
        let n_giebel = L_wall === 0 ? 0 : g.n('IN_rooms', `${roomCol}33`);
        let h_knee = g.n('IN_rooms', `${roomCol}34`);
        let roof_hei_factor = g.HLOOKUP('PAR', 'f_A_roof_hei', '$F$1', '$AZ$5', 2, false) as number;
        let roof_wid_factor = g.HLOOKUP('PAR', 'f_A_roof_wid', '$F$1', '$AZ$5', 2, false) as number;
        let h_roof = g.n('IN_rooms', `${roomCol}31`) + roof_hei_factor;
        let b_roof = g.n('IN_rooms', `${roomCol}30`) + Math.min(2, n_giebel) * roof_wid_factor;
        let h_room = g.n('IN_rooms', `${roomCol}5`);
        let alpha = g.WENNS(
          g.g('IN_build', 'P4') === 'geneigt', 25,
          g.g('IN_build', 'P4') === 'steil', 40,
          g.g('IN_build', 'P4') === 'sehr steil', 55,
          g.WAHR(), 0
        ) * Math.PI / 180;
        let is_jamb = g.g('IN_rooms', `${roomCol}35`) === 'Ja';
        let n_A_roof = g.g('IN_rooms', `${roomCol}28`) === 'Zwei (symmetrisch)' ? 2 : 1;

        // Window areas
        let win_area = g.n(s, `${clcLoadCol}60`) + g.n(s, `${clcLoadCol}66`);

        // Main calculation
        let roof_area = g.WENNS(
          g.ODER(
            g.g('IN_rooms', `${roomCol}28`) === 'Keine',
            g.g('IN_rooms', `${roomCol}28`) === ''
          ),
          0,

          g.ODER(
            g.g('IN_rooms', `${roomCol}28`) === 'Flachdach',
            g.g('IN_build', 'P4') === 'Flach bzw. Flachdach'
          ),
          g.n('IN_rooms', `${roomCol}4`) + L_wall * roof_wid_factor - win_area,

          g.g('IN_rooms', `${roomCol}28`) === 'Komplex',
          is_jamb ? g.n('IN_rooms', `${roomCol}84`) * (1 + h_knee / (h_room * Math.sin(alpha))) : g.n('IN_rooms', `${roomCol}84`),

          g.n('IN_rooms', `${roomCol}39`) > 0,
          h_roof * b_roof + g.n('IN_rooms', `${roomCol}39`) / Math.sin(alpha),

          g.ODER(
            g.n('IN_rooms', `${roomCol}39`) === 0,
            g.n('IN_rooms', `${roomCol}37`) > 0
          ),
          h_roof * b_roof,

          g.WAHR(), 0
        );

        return Math.min(Math.max(roof_area * n_A_roof - win_area, 0), g.n('IN_rooms', `${roomCol}4`) * 2);
      });

      /**
       * Row 27: U-Wert_IWU
       * Excel:
       * "_xlfn.AGGREGATE(15,6,U_Werte_IWU!$F$30:$F$297/((U_Werte_IWU!$E$30:$E$297=LEFT($A27,4))*(U_Werte_IWU!$D$30:$D$297=clc_load!I4)*(U_Werte_IWU!$C$30:$C$297=clc_load!I3)),1)"
       */
      grid.setCell('clc_load', `${clcLoadCol}27`, (s, c, g) => {
        return g.AGGREGATE(15, 6,
          g.DIVIDE_ARRAY(
            g.RANGE('F30:F297', 'U_Werte_IWU'),
            g.MULTIPLY_ARRAYS(
              g.GLEICH(g.RANGE('E30:E297', 'U_Werte_IWU'), g.LINKS(g.g('clc_load', 'A27'), 4)),
              g.MULTIPLY_ARRAYS(
                g.GLEICH(g.RANGE('D30:D297', 'U_Werte_IWU'), g.g(s, `${clcLoadCol}4`)),
                g.GLEICH(g.RANGE('C30:C297', 'U_Werte_IWU'), g.g(s, `${clcLoadCol}3`))
              )
                     )
        ), s, 1);
      });

      /**
       * Row 28: U-Wert_Berechnung
       * Excel:
       * "_xlfn.LET(\n_xlpm.U_no_ins, _xlfn.XLOOKUP(1,\n  (INDIRECT(\"UWert_Mod[Bauteil]\")=\"Dach\")*\n  (INDIRECT(\"UWert_Mod[Modernisierungsjahr]\")=\"1983 - 1994\"),\n  INDIRECT(\"UWert_Mod[U_no_ins]\")),\n_xlpm.U_IWU, I$27,\n_xlpm.d_ins,IN_build!$T$9,\nIF(_xlpm.d_ins>0,1/(1/_xlpm.U_no_ins+_xlpm.d_ins*0.01/INDEX(INDIRECT(\"PAR[lambda_ins_thick]\"), 1)),_xlpm.U_IWU))"
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
        const d_ins = g.n('IN_build', 'T9');

        if(typeof U_no_ins != 'number') return NaN;

        return g.WENN(
          d_ins > 0,
          1 / (1/U_no_ins + d_ins * 0.01 / (g.INDIREKT_DB_REF('PAR', 'lambda_ins_thick')[0] as number)),
          U_IWU
        );
      });

      /**
       * Row 29: Heizlast Transmission
       * Excel: "IF(I26=0,0,I26*(I28+I$8)*(I$10-Normaußentemperatur_12831!$B$6)*MAX(I$24,1))"
       */
      grid.setCell('clc_load', `${clcLoadCol}29`, (s, c, g) =>
        g.WENN(
          g.n(s, `${clcLoadCol}26`) === 0,
          0,
          g.n(s, `${clcLoadCol}26`) *
          (g.n(s, `${clcLoadCol}28`) + g.n(s, `${clcLoadCol}8`)) *
          (g.n(s, `${clcLoadCol}10`) - g.n('Normaußentemperatur_12831', 'B6')) *
          Math.max(g.n(s, `${clcLoadCol}24`), 1)
        ));

      /**
       * Row 30: Anteil an Raumheizlast
       * Excel: "I$29/I$72"
       */
      grid.setCell('clc_load', `${clcLoadCol}30`, (s, c, g) =>
        g.n(s, `${clcLoadCol}29`) / g.n(s, `${clcLoadCol}72`));

      /**
       * Row 31: Abzgl. Dachschräge vorhandene Deckenfläche
       * Excel: "_xlfn.IFS(
       *   IN_rooms!R$28=\"Keine\",IN_rooms!R$4,
       *   IN_rooms!R$28=\"Komplex\",IN_rooms!R$85,
       *   IN_rooms!R$28=\"Flachdach\",0,
       *   TRUE,IN_rooms!R$32*IN_rooms!R$30)"
       */
      grid.setCell('clc_load', `${clcLoadCol}31`, (s, c, g) =>
        g.WENNS(
          g.g('IN_rooms', `${roomCol}28`) === 'Keine',
          g.n('IN_rooms', `${roomCol}4`),

          g.g('IN_rooms', `${roomCol}28`) === 'Komplex',
          g.n('IN_rooms', `${roomCol}85`),

          g.g('IN_rooms', `${roomCol}28`) === 'Flachdach',
          0,

          g.WAHR(),
          g.n('IN_rooms', `${roomCol}32`) * g.n('IN_rooms', `${roomCol}30`)
        ));

      /**
       * Row 32: Fläche [m²]
       * Excel: "IF(IN_build!$P$4=\"Flach bzw. Flachdach\",0,clc_load!I$31)"
       */
      grid.setCell('clc_load', `${clcLoadCol}32`, (s, c, g) =>
        g.WENN(
          g.g('IN_build', 'P4') === 'Flach bzw. Flachdach',
          0,
          g.n(s, `${clcLoadCol}31`)
        ));

      /**
       * Row 33: U-Wert_IWU
       * Excel: IF(I$32=0,0,_xlfn.AGGREGATE(15,6,U_Werte_IWU!$F$30:$F$297/((U_Werte_IWU!$E$30:$E$297=LEFT($A33,5))*(U_Werte_IWU!$D$30:$D$297=clc_load!I$4)*(U_Werte_IWU!$C$30:$C$297=clc_load!I$3)),1))
       */
      grid.setCell('clc_load', `${clcLoadCol}33`, (s, c, g) => {
        return g.WENN(
          g.n(s, `${clcLoadCol}32`) === 0,
          0,
          g.AGGREGATE(15, 6,
            g.DIVIDE_ARRAY(
              g.RANGE('F30:F297', 'U_Werte_IWU'),
              g.MULTIPLY_ARRAYS(
                g.GLEICH(g.RANGE('E30:E297', 'U_Werte_IWU'), g.LINKS(g.g('clc_load', 'A33'), 5)),
                g.MULTIPLY_ARRAYS(
                  g.GLEICH(g.RANGE('D30:D297', 'U_Werte_IWU'), g.g(s, `${clcLoadCol}4`)),
                  g.GLEICH(g.RANGE('C30:C297', 'U_Werte_IWU'), g.g(s, `${clcLoadCol}3`))
                )
              )
                    ), s, 1)
        );
      });

      /**
       * Row 34: U-Wert_Berechnung
       * Excel:
       * "_xlfn.LET(\n_xlpm.U_no_ins, _xlfn.XLOOKUP(1,\n  (INDIRECT(\"UWert_Mod[Bauteil]\")=$A$34)*\n  (INDIRECT(\"UWert_Mod[Modernisierungsjahr]\")=\"1983 - 1994\"),\n  INDIRECT(\"UWert_Mod[U_no_ins]\")),\n_xlpm.U_IWU, I$33,\n_xlpm.d_ins,IN_build!$T$11,\nIF(_xlpm.d_ins>0,1/(1/_xlpm.U_no_ins+_xlpm.d_ins*0.01/INDEX(INDIRECT(\"PAR[lambda_ins_thick]\"), 1)),_xlpm.U_IWU))"
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
        const d_ins = g.n('IN_build', 'T11');

        if(typeof U_no_ins != 'number') return NaN;

        return g.WENN(
          d_ins > 0,
          1 / (1/U_no_ins + d_ins * 0.01 / (g.INDIREKT_DB_REF('PAR', 'lambda_ins_thick')[0] as number)),
          U_IWU
        );
      });

      /**
       * Row 35: Heizlast Transmission
       * Excel: "IF(OR(I$32=\"entfällt\",I$32=0),0,(I$32*(I$34+I$8)*_xlfn.XLOOKUP(IN_rooms!R$7,Daten!$E$106:$E$109,Daten!$F$106:$F$109,\"FEHLER\",0,1))*(I$10-Normaußentemperatur_12831!$B$6))"
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
       * Excel: "I$35/I$72"
       */
      grid.setCell('clc_load', `${clcLoadCol}36`, (s, c, g) =>
        g.n(s, `${clcLoadCol}35`) / g.n(s, `${clcLoadCol}72`));

      /**
       * Row 37: Fläche [m²]
       * Excel: "_xlfn.LET(
       *   _xlpm.alpha,_xlfn.IFS(
       *     IN_build!$P$4=\"geneigt\",25,
       *     IN_build!$P$4=\"steil\",40,
       *     IN_build!$P$4=\"sehr steil\",55) * PI() / 180,
       *   _xlpm.A_room, IN_rooms!R$4,
       *   _xlpm.h_knee,IN_rooms!R$34,
       *   _xlpm.h_room,IN_rooms!R$5,
       *
       *   IF(OR(IN_build!$P$4 = \"Flach bzw. Flachdach\", IN_rooms!R$39=0, IN_rooms!R$28 = \"Flachdach\", IN_rooms!R$28 = \"Keine\"),
       *     _xlpm.A_room,
       *     MIN(IF(IN_rooms!R$28 = \"Komplex\",
       *       _xlpm.A_room * (1+(_xlpm.h_knee/_xlpm.h_room)*_xlfn.COT(_xlpm.alpha)),
       *       _xlpm.A_room + _xlpm.h_knee/TAN(_xlpm.alpha)*IN_rooms!R$30), 1.5 * _xlpm.A_room)))"
       */
      grid.setCell('clc_load', `${clcLoadCol}37`, (s, c, g) => {
        // LET variables
        let alpha = g.WENNS(
          g.g('IN_build', 'P4') === 'geneigt', 25,
          g.g('IN_build', 'P4') === 'steil', 40,
          g.g('IN_build', 'P4') === 'sehr steil', 55,
          g.WAHR(), 0
        ) * Math.PI / 180;
        let A_room = g.n('IN_rooms', `${roomCol}4`);
        let h_knee = g.n('IN_rooms', `${roomCol}34`);
        let h_room = g.n('IN_rooms', `${roomCol}5`);

        return g.WENN(
          g.ODER(
            g.g('IN_build', 'P4') === 'Flach bzw. Flachdach',
            g.n('IN_rooms', `${roomCol}39`) === 0,
            g.g('IN_rooms', `${roomCol}28`) === 'Flachdach',
            g.g('IN_rooms', `${roomCol}28`) === 'Keine'
          ),
          A_room,
          Math.min(
            g.g('IN_rooms', `${roomCol}28`) === 'Komplex' ?
              A_room * (1 + (h_knee / h_room) * (1 / Math.tan(alpha))) : // COT(alpha) = 1/TAN(alpha)
              A_room + h_knee / Math.tan(alpha) * g.n('IN_rooms', `${roomCol}30`),
            1.5 * A_room
          )
        );
      });

      /**
       * Row 38: U-Wert_IWU
       * Excel: "_xlfn.AGGREGATE(15,6,U_Werte_IWU!$F$30:$F$297/((U_Werte_IWU!$E$30:$E$297=clc_load!$A38)*(U_Werte_IWU!$D$30:$D$297=clc_load!$I$4)*(U_Werte_IWU!$C$30:$C$297=clc_load!$I$3)),1)"
       */
      grid.setCell('clc_load', `${clcLoadCol}38`, (s, c, g) => {
        return g.AGGREGATE(15, 6,
          g.DIVIDE_ARRAY(
            g.RANGE('F30:F297', 'U_Werte_IWU'),
            g.MULTIPLY_ARRAYS(
              g.GLEICH(g.RANGE('E30:E297', 'U_Werte_IWU'), g.g('clc_load', 'A38')),
              g.MULTIPLY_ARRAYS(
                g.GLEICH(g.RANGE('D30:D297', 'U_Werte_IWU'), g.g(s, `${clcLoadCol}4`)),
                g.GLEICH(g.RANGE('C30:C297', 'U_Werte_IWU'), g.g(s, `${clcLoadCol}3`))
              )
            )
        ), s, 1);
      });

      /**
       * Row 39: U-Wert Berechnung
       * Excel:
       * "_xlfn.LET(\n_xlpm.U_no_ins, _xlfn.XLOOKUP(1,\n  (INDIRECT(\"UWert_Mod[Bauteil]\")=$A$39)*\n  (INDIRECT(\"UWert_Mod[Modernisierungsjahr]\")=\"1983 - 1994\"),\n  INDIRECT(\"UWert_Mod[U_no_ins]\")),\n_xlpm.U_IWU, I$38,\n_xlpm.d_ins,IN_build!$T$10,\nIF(_xlpm.d_ins>0,1/(1/_xlpm.U_no_ins+_xlpm.d_ins*0.01/INDEX(INDIRECT(\"PAR[lambda_ins_thick]\"), 1)),_xlpm.U_IWU))"
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
        const d_ins = g.n('IN_build', 'T10');

        if(typeof U_no_ins != 'number') return NaN;

        return g.WENN(
          d_ins > 0,
          1 / (1/U_no_ins + d_ins * 0.01 / (g.INDIREKT_DB_REF('PAR', 'lambda_ins_thick')[0] as number)),
          U_IWU
        );
      });

      /**
       * Row 40: Heizlast Transmission
       * Excel: "I$37*(I$38+I$8)*_xlfn.XLOOKUP(IF(IN_rooms!R8=\"\",\"unbeheizt\",IN_rooms!R8),Daten!$E$106:$E$109,Daten!$F$106:$F$109,\"FEHLER\",0,1)*(I$10-Normaußentemperatur_12831!$B$6)"
       */
      grid.setCell('clc_load', `${clcLoadCol}40`, (s, c, g) => {
        return g.n(s, `${clcLoadCol}37`) *
          (g.n(s, `${clcLoadCol}38`) + g.n(s, `${clcLoadCol}8`)) *
          (g.XVERWEIS(
            g.WENN(g.g('IN_rooms', `${roomCol}8`) === "", "unbeheizt", g.g('IN_rooms', `${roomCol}8`)),
            g.getCells('Daten', 'E106', 'E109').flat(1),
            g.getCells('Daten', 'F106', 'F109').flat(1),
            {ifNotFound: 'FEHLER', matchMode: 'exact', searchMode: 'first'}
          ) as number) *
          (g.n(s, `${clcLoadCol}10`) - g.n('Normaußentemperatur_12831', 'B6'));
      });

      /**
       * Row 41: Anteil an Raumheizlast
       * Excel: "I$40/I$72"
       */
      grid.setCell('clc_load', `${clcLoadCol}41`, (s, c, g) =>
        g.n(s, `${clcLoadCol}40`) / g.n(s, `${clcLoadCol}72`));

      /**
       * Row 42: Fläche
       * Excel: "IN_rooms!R$13*IN_rooms!R$14*IN_rooms!R$16"
       */
      grid.setCell('clc_load', `${clcLoadCol}42`, (s, c, g) =>
        g.n('IN_rooms', `${roomCol}13`) *
        g.n('IN_rooms', `${roomCol}14`) *
        g.n('IN_rooms', `${roomCol}16`));

      /**
       * Row 43: U-Wert_IWU
       * Excel: "_xlfn.AGGREGATE(15,6,U_Werte_IWU!$F$30:$F$297/((U_Werte_IWU!$E$30:$E$297=clc_load!$A43)*(U_Werte_IWU!$D$30:$D$297=clc_load!$I$4)*(U_Werte_IWU!$C$30:$C$297=clc_load!$I$3)),1)"
       */
      grid.setCell('clc_load', `${clcLoadCol}43`, (s, c, g) => {
        return g.AGGREGATE(15, 6,
          g.DIVIDE_ARRAY(
            g.RANGE('F30:F297', 'U_Werte_IWU'),
            g.MULTIPLY_ARRAYS(
              g.GLEICH(g.RANGE('E30:E297', 'U_Werte_IWU'), g.g('clc_load', 'A43')),
              g.MULTIPLY_ARRAYS(
                g.GLEICH(g.RANGE('D30:D297', 'U_Werte_IWU'), g.g(s, `${clcLoadCol}4`)),
                g.GLEICH(g.RANGE('C30:C297', 'U_Werte_IWU'), g.g(s, `${clcLoadCol}3`))
              )
            )
        ), s, 1);
      });

      /**
       * Row 44: U-Wert ausgetauschte Fenster
       * Excel: "_xlfn.AGGREGATE(15,6,U_Werte_IWU!$F$30:$F$297/((U_Werte_IWU!$E$30:$E$297=clc_load!$A44)*(U_Werte_IWU!$D$30:$D$297=IN_rooms!R$76)*(U_Werte_IWU!$C$30:$C$297=clc_load!$I$3)),1)"
       */
      grid.setCell('clc_load', `${clcLoadCol}44`, (s, c, g) => {
        return g.AGGREGATE(15, 6,
          g.DIVIDE_ARRAY(
            g.RANGE('F30:F297', 'U_Werte_IWU'),
            g.MULTIPLY_ARRAYS(
              g.GLEICH(g.RANGE('E30:E297', 'U_Werte_IWU'), g.g('clc_load', 'A44')),
              g.MULTIPLY_ARRAYS(
                g.GLEICH(g.RANGE('D30:D297', 'U_Werte_IWU'), g.g('IN_rooms', `${roomCol}76`)),
                g.GLEICH(g.RANGE('C30:C297', 'U_Werte_IWU'), g.g(s, `${clcLoadCol}3`))
              )
            )
        ), s, 1);
      });

      /**
       * Row 45: U-Wert_Berechnung
       * Excel: "IF(I44>0,I44,MIN(I44,I43))"
       */
      grid.setCell('clc_load', `${clcLoadCol}45`, (s, c, g) =>
        g.WENN(
          g.n(s, `${clcLoadCol}44`) > 0,
          g.n(s, `${clcLoadCol}44`),
          Math.min(g.n(s, `${clcLoadCol}44`), g.n(s, `${clcLoadCol}43`))
        ));

      /**
       * Row 46: Heizlast Transmission
       * Excel: "IF(I$42=0,0,I$42*(I$45+I$8)*(I$10-Normaußentemperatur_12831!$B$6))"
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
       * Excel: "I$46/I$72"
       */
      grid.setCell('clc_load', `${clcLoadCol}47`, (s, c, g) =>
        g.n(s, `${clcLoadCol}46`) / g.n(s, `${clcLoadCol}72`));

      /**
       * Row 48: Fläche
       * Excel: "IN_rooms!R$17*IN_rooms!R$18*IN_rooms!R$20"
       */
      grid.setCell('clc_load', `${clcLoadCol}48`, (s, c, g) =>
        g.n('IN_rooms', `${roomCol}17`) *
        g.n('IN_rooms', `${roomCol}18`) *
        g.n('IN_rooms', `${roomCol}20`));

      /**
       * Row 49: U-Wert_IWU
       * Excel: "_xlfn.AGGREGATE(15,6,U_Werte_IWU!$F$30:$F$297/((U_Werte_IWU!$E$30:$E$297=clc_load!$A49)*(U_Werte_IWU!$D$30:$D$297=clc_load!$I$4)*(U_Werte_IWU!$C$30:$C$297=clc_load!$I$3)),1)"
       */
      grid.setCell('clc_load', `${clcLoadCol}49`, (s, c, g) => {
        return g.AGGREGATE(15, 6,
          g.DIVIDE_ARRAY(
            g.RANGE('F30:F297', 'U_Werte_IWU'),
            g.MULTIPLY_ARRAYS(
              g.GLEICH(g.RANGE('E30:E297', 'U_Werte_IWU'), g.g('clc_load', 'A49')),
              g.MULTIPLY_ARRAYS(
                g.GLEICH(g.RANGE('D30:D297', 'U_Werte_IWU'), g.g(s, `${clcLoadCol}4`)),
                g.GLEICH(g.RANGE('C30:C297', 'U_Werte_IWU'), g.g(s, `${clcLoadCol}3`))
              )
                       )
        ), s, 1);
      });

      /**
       * Row 50: U-Wert ausgetauschte Fenster
       * Excel: "_xlfn.AGGREGATE(15,6,U_Werte_IWU!$F$30:$F$297/((U_Werte_IWU!$E$30:$E$297=clc_load!$A50)*(U_Werte_IWU!$D$30:$D$297=IN_rooms!R$77)*(U_Werte_IWU!$C$30:$C$297=clc_load!$I$3)),1)"
       */
      grid.setCell('clc_load', `${clcLoadCol}50`, (s, c, g) => {
        return g.AGGREGATE(15, 6,
          g.DIVIDE_ARRAY(
            g.RANGE('F30:F297', 'U_Werte_IWU'),
            g.MULTIPLY_ARRAYS(
              g.GLEICH(g.RANGE('E30:E297', 'U_Werte_IWU'), g.g('clc_load', 'A50')),
              g.MULTIPLY_ARRAYS(
                g.GLEICH(g.RANGE('D30:D297', 'U_Werte_IWU'), g.g('IN_rooms', `${roomCol}77`)),
                g.GLEICH(g.RANGE('C30:C297', 'U_Werte_IWU'), g.g(s, `${clcLoadCol}3`))
              )
          )
        ), s, 1);
      });

      /**
       * Row 51: U-Wert_Berechnung
       * Excel: "IF(I$50>0,I$50,MIN(I$50,I$49))"
       */
      grid.setCell('clc_load', `${clcLoadCol}51`, (s, c, g) =>
        g.WENN(
          g.n(s, `${clcLoadCol}50`) > 0,
          g.n(s, `${clcLoadCol}50`),
          Math.min(g.n(s, `${clcLoadCol}50`), g.n(s, `${clcLoadCol}49`))
        ));

      /**
       * Row 52: Heizlast Transmission
       * Excel: "IF(I$48=0,0,I$48*(I$50+I$8)*(I$10-Normaußentemperatur_12831!$B$6))"
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
       * Excel: "I$52/I$72"
       */
      grid.setCell('clc_load', `${clcLoadCol}53`, (s, c, g) =>
        g.n(s, `${clcLoadCol}52`) / g.n(s, `${clcLoadCol}72`));

      /**
       * Row 54: Fläche
       * Excel: "IN_rooms!R$21*IN_rooms!R$22*IN_rooms!R$24"
       */
      grid.setCell('clc_load', `${clcLoadCol}54`, (s, c, g) =>
        g.n('IN_rooms', `${roomCol}21`) *
        g.n('IN_rooms', `${roomCol}22`) *
        g.n('IN_rooms', `${roomCol}24`));

      /**
       * Row 55: U-Wert_IWU
       * Excel: "_xlfn.AGGREGATE(15,6,U_Werte_IWU!$F$30:$F$297/((U_Werte_IWU!$E$30:$E$297=clc_load!$A55)*(U_Werte_IWU!$D$30:$D$297=clc_load!$I$4)*(U_Werte_IWU!$C$30:$C$297=clc_load!$I$3)),1)"
       */
      grid.setCell('clc_load', `${clcLoadCol}55`, (s, c, g) => {
        return g.AGGREGATE(15, 6,
          g.DIVIDE_ARRAY(
            g.RANGE('F30:F297', 'U_Werte_IWU'),
            g.MULTIPLY_ARRAYS(
              g.GLEICH(g.RANGE('E30:E297', 'U_Werte_IWU'), g.g('clc_load', 'A55')),
              g.MULTIPLY_ARRAYS(
                g.GLEICH(g.RANGE('D30:D297', 'U_Werte_IWU'), g.g(s, `${clcLoadCol}4`)),
                g.GLEICH(g.RANGE('C30:C297', 'U_Werte_IWU'), g.g(s, `${clcLoadCol}3`))
              )
         )
        ), s, 1);
      });

      /**
       * Row 56: U-Wert ausgetauschte Fenster
       * Excel: "_xlfn.AGGREGATE(15,6,U_Werte_IWU!$F$30:$F$297/((U_Werte_IWU!$E$30:$E$297=clc_load!$A56)*(U_Werte_IWU!$D$30:$D$297=IN_rooms!R$78)*(U_Werte_IWU!$C$30:$C$297=clc_load!$I$3)),1)"
       */
      grid.setCell('clc_load', `${clcLoadCol}56`, (s, c, g) => {
        return g.AGGREGATE(15, 6,
          g.DIVIDE_ARRAY(
            g.RANGE('F30:F297', 'U_Werte_IWU'),
            g.MULTIPLY_ARRAYS(
              g.GLEICH(g.RANGE('E30:E297', 'U_Werte_IWU'), g.g('clc_load', 'A56')),
              g.MULTIPLY_ARRAYS(
                g.GLEICH(g.RANGE('D30:D297', 'U_Werte_IWU'), g.g('IN_rooms', `${roomCol}78`)),
                g.GLEICH(g.RANGE('C30:C297', 'U_Werte_IWU'), g.g(s, `${clcLoadCol}3`))
              )
          )
        ), s, 1);
      });

      /**
       * Row 57: U-Wert_Berechnung
       * Excel: "IF(I$56>0,I$56,MIN(I$56,I$55))"
       */
      grid.setCell('clc_load', `${clcLoadCol}57`, (s, c, g) =>
        g.WENN(
          g.n(s, `${clcLoadCol}56`) > 0,
          g.n(s, `${clcLoadCol}56`),
          Math.min(g.n(s, `${clcLoadCol}56`), g.n(s, `${clcLoadCol}55`))
        ));

      /**
       * Row 58: Heizlast Transmission
       * Excel: "IF(I$54=0,0,I$42*(I$57+I$8)*(I$10-Normaußentemperatur_12831!$B$6))"
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
       * Excel: "I$58/I$72"
       */
      grid.setCell('clc_load', `${clcLoadCol}59`, (s, c, g) =>
        g.n(s, `${clcLoadCol}58`) / g.n(s, `${clcLoadCol}72`));

      /**
       * Row 60: Fläche
       * Excel: "IN_rooms!R$41*IN_rooms!R$42*IN_rooms!R$44"
       */
      grid.setCell('clc_load', `${clcLoadCol}60`, (s, c, g) =>
        g.n('IN_rooms', `${roomCol}41`) *
        g.n('IN_rooms', `${roomCol}42`) *
        g.n('IN_rooms', `${roomCol}44`));

      /**
       * Row 61: U-Wert_IWU
       * Excel: "_xlfn.AGGREGATE(15,6,U_Werte_IWU!$F$30:$F$297/((U_Werte_IWU!$E$30:$E$297=clc_load!$A61)*(U_Werte_IWU!$D$30:$D$297=clc_load!$I$4)*(U_Werte_IWU!$C$30:$C$297=clc_load!$I$3)),1)"
       */
      grid.setCell('clc_load', `${clcLoadCol}61`, (s, c, g) => {
        return g.AGGREGATE(15, 6,
          g.DIVIDE_ARRAY(
            g.RANGE('F30:F297', 'U_Werte_IWU'),
            g.MULTIPLY_ARRAYS(
              g.GLEICH(g.RANGE('E30:E297', 'U_Werte_IWU'), g.g('clc_load', 'A61')),
              g.MULTIPLY_ARRAYS(
                g.GLEICH(g.RANGE('D30:D297', 'U_Werte_IWU'), g.g(s, `${clcLoadCol}4`)),
                g.GLEICH(g.RANGE('C30:C297', 'U_Werte_IWU'), g.g(s, `${clcLoadCol}3`))
              )
          )
        ), s, 1);
      });

      /**
       * Row 62: U-Wert ausgetauschte Fenster
       * Excel: "_xlfn.AGGREGATE(15,6,U_Werte_IWU!$F$30:$F$297/((U_Werte_IWU!$E$30:$E$297=clc_load!$A62)*(U_Werte_IWU!$D$30:$D$297=IN_rooms!R$79)*(U_Werte_IWU!$C$30:$C$297=clc_load!$I$3)),1)"
       */
      grid.setCell('clc_load', `${clcLoadCol}62`, (s, c, g) => {
        return g.AGGREGATE(15, 6,
          g.DIVIDE_ARRAY(
            g.RANGE('F30:F297', 'U_Werte_IWU'),
            g.MULTIPLY_ARRAYS(
              g.GLEICH(g.RANGE('E30:E297', 'U_Werte_IWU'), g.g('clc_load', 'A62')),
              g.MULTIPLY_ARRAYS(
                g.GLEICH(g.RANGE('D30:D297', 'U_Werte_IWU'), g.g('IN_rooms', `${roomCol}79`)),
                g.GLEICH(g.RANGE('C30:C297', 'U_Werte_IWU'), g.g(s, `${clcLoadCol}3`))
              )
          )
        ), s, 1);
      });

      /**
       * Row 63: U-Wert_Berechnung
       * Excel: "IF(I$62>0,I$62,MIN(I$62,I$61))"
       */
      grid.setCell('clc_load', `${clcLoadCol}63`, (s, c, g) =>
        g.WENN(
          g.n(s, `${clcLoadCol}62`) > 0,
          g.n(s, `${clcLoadCol}62`),
          Math.min(g.n(s, `${clcLoadCol}62`), g.n(s, `${clcLoadCol}61`))
        ));

      /**
       * Row 64: Heizlast Transmission
       * Excel: "I$60*(I$63+I$8)*(I$10-Normaußentemperatur_12831!$B$6)"
       */
      grid.setCell('clc_load', `${clcLoadCol}64`, (s, c, g) =>
        g.n(s, `${clcLoadCol}60`) *
        (g.n(s, `${clcLoadCol}63`) + g.n(s, `${clcLoadCol}8`)) *
        (g.n(s, `${clcLoadCol}10`) - g.n('Normaußentemperatur_12831', 'B6')));

      /**
       * Row 65: Anteil an Raumheizlast
       * Excel: "I$64/I$72"
       */
      grid.setCell('clc_load', `${clcLoadCol}65`, (s, c, g) =>
        g.n(s, `${clcLoadCol}64`) / g.n(s, `${clcLoadCol}72`));

      /**
       * Row 66: Fläche
       * Excel: "IN_rooms!R$45*IN_rooms!R$46*IN_rooms!R$48"
       */
      grid.setCell('clc_load', `${clcLoadCol}66`, (s, c, g) =>
        g.n('IN_rooms', `${roomCol}45`) *
        g.n('IN_rooms', `${roomCol}46`) *
        g.n('IN_rooms', `${roomCol}48`));

      /**
       * Row 67: U-Wert_IWU
       * Excel: "_xlfn.AGGREGATE(15,6,U_Werte_IWU!$F$30:$F$297/((U_Werte_IWU!$E$30:$E$297=clc_load!$A67)*(U_Werte_IWU!$D$30:$D$297=clc_load!$I$4)*(U_Werte_IWU!$C$30:$C$297=clc_load!$I$3)),1)"
       */
      grid.setCell('clc_load', `${clcLoadCol}67`, (s, c, g) => {
        return g.AGGREGATE(15, 6,
          g.DIVIDE_ARRAY(
            g.RANGE('F30:F297', 'U_Werte_IWU'),
            g.MULTIPLY_ARRAYS(
              g.GLEICH(g.RANGE('E30:E297', 'U_Werte_IWU'), g.g('clc_load', 'A67')),
              g.MULTIPLY_ARRAYS(
                g.GLEICH(g.RANGE('D30:D297', 'U_Werte_IWU'), g.g(s, `${clcLoadCol}4`)),
                g.GLEICH(g.RANGE('C30:C297', 'U_Werte_IWU'), g.g(s, `${clcLoadCol}3`))
              )
          )
        ), s, 1);
      });

      /**
       * Row 68: U-Wert ausgetauschte Fenster
       * Excel: "_xlfn.AGGREGATE(15,6,U_Werte_IWU!$F$30:$F$297/((U_Werte_IWU!$E$30:$E$297=clc_load!$A68)*(U_Werte_IWU!$D$30:$D$297=IN_rooms!R$80)*(U_Werte_IWU!$C$30:$C$297=clc_load!$I$3)),1)"
       */
      grid.setCell('clc_load', `${clcLoadCol}68`, (s, c, g) => {
        return g.AGGREGATE(15, 6,
          g.DIVIDE_ARRAY(
            g.RANGE('F30:F297', 'U_Werte_IWU'),
            g.MULTIPLY_ARRAYS(
              g.GLEICH(g.RANGE('E30:E297', 'U_Werte_IWU'), g.g('clc_load', 'A68')),
              g.MULTIPLY_ARRAYS(
                g.GLEICH(g.RANGE('D30:D297', 'U_Werte_IWU'), g.g('IN_rooms', `${roomCol}80`)),
                g.GLEICH(g.RANGE('C30:C297', 'U_Werte_IWU'), g.g(s, `${clcLoadCol}3`))
              )
          )
        ), s, 1);
      });

      /**
       * Row 69: U-Wert_Berechnung
       * Excel: "IF(I$68>0,I$68,MIN(I$68,I$67))"
       */
      grid.setCell('clc_load', `${clcLoadCol}69`, (s, c, g) =>
        g.WENN(
          g.n(s, `${clcLoadCol}68`) > 0,
          g.n(s, `${clcLoadCol}68`),
          Math.min(g.n(s, `${clcLoadCol}68`), g.n(s, `${clcLoadCol}67`))
        ));

      /**
       * Row 70: Heizlast Transmission
       * Excel: "I$66*(I$69+I$8)*(I$10-Normaußentemperatur_12831!$B$6)"
       */
      grid.setCell('clc_load', `${clcLoadCol}70`, (s, c, g) =>
        g.n(s, `${clcLoadCol}66`) *
        (g.n(s, `${clcLoadCol}69`) + g.n(s, `${clcLoadCol}8`)) *
        (g.n(s, `${clcLoadCol}10`) - g.n('Normaußentemperatur_12831', 'B6')));

      /**
       * Row 71: Anteil an Raumheizlast
       * Excel: "I70/I$72"
       */
      grid.setCell('clc_load', `${clcLoadCol}71`, (s, c, g) =>
        g.n(s, `${clcLoadCol}70`) / g.n(s, `${clcLoadCol}72`));

      /**
       * Row 72: Absolute Raumheizlast [W]
       * Excel: "SUMIF($B$3:$B$71,$B$17,I3:I71)+I12"
       */
      grid.setCell('clc_load', `${clcLoadCol}72`, (s, c, g) =>
        g.SUMMEWENN('$B$3:$B$71', g.g('clc_load', 'B17'), `${clcLoadCol}3:${clcLoadCol}71`, 'clc_load') +
        g.n('clc_load', `${clcLoadCol}12`));

      /**
       * Row 73: Heizlast_spezifisch / qdot_room [W/m²]
       * Excel: "I$72/IN_rooms!R$4"
       */
      grid.setCell('clc_load', `${clcLoadCol}73`, (s, c, g) =>
        g.n(s, `${clcLoadCol}72`) / g.n('IN_rooms', `${roomCol}4`));

      /**
       * Row 74: Heizlast mit Abschlag / Qdot_room_cor [W]
       * Excel:
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
       * Excel: "I$74/IN_rooms!R$4"
       */
      grid.setCell('clc_load', `${clcLoadCol}75`, (s, c, g) =>
        g.n(s, `${clcLoadCol}74`) / g.n('IN_rooms', `${roomCol}4`));

      /**
       * Row 76: Kontrolle / r_Qdot_room
       * Excel: "SUMIF($B$3:$B$71,$B$18,I$3:I$71)"
       */
      grid.setCell('clc_load', `${clcLoadCol}76`, (s, c, g) =>
        g.SUMMEWENN('$B$3:$B$71', g.g('clc_load', 'B18'), `${clcLoadCol}3:${clcLoadCol}71`, 'clc_load'));
    }
  }
}
