import {DataGrid} from '../data-grid';
import {FormulaOverlay} from './base-overlay';

/**
 * clc_build sheet formula overlay
 * Contains formula implementations for the clc_build sheet
 */
export class ClcBuildOverlay implements FormulaOverlay {
  // Columns G-U for rooms 1-15
  private clcBuildRoomCols = ['G', 'H', 'I', 'J', 'K', 'L', 'M', 'N', 'O', 'P', 'Q', 'R', 'S', 'T', 'U'];
  // Corresponding columns I-W in clc_load for rooms 1-15
  private clcLoadCols = ['I', 'J', 'K', 'L', 'M', 'N', 'O', 'P', 'Q', 'R', 'S', 'T', 'U', 'V', 'W'];
  // Corresponding columns R-AF in IN_rooms for rooms 1-15
  private roomCols = ['R', 'S', 'T', 'U', 'V', 'W', 'X', 'Y', 'Z', 'AA', 'AB', 'AC', 'AD', 'AE', 'AF'];

  /**
   * Apply clc_build formulas to the data grid
   * @param grid The DataGrid instance to apply formulas to
   */
  applyFormulas(grid: DataGrid): void {
    // Implement formulas for each room column
    for (let i = 0; i < this.clcBuildRoomCols.length; i++) {
      const clcBuildCol = this.clcBuildRoomCols[i];
      const clcLoadCol = this.clcLoadCols[i];
      const roomCol = this.roomCols[i];

      /**
       * Row 3: Heizlast Transmission [W]
       * Excel: "ROUND((clc_load!I72-clc_load!I12)/10,0)*10"
       */
      grid.setCell('clc_build', `${clcBuildCol}3`, (s, c, g) =>
        Math.round((g.n('clc_load', `${clcLoadCol}72`) - g.n('clc_load', `${clcLoadCol}12`)) / 10) * 10);

      /**
       * Row 4: Heizlast Lüftung [W]
       * Excel: "ROUND(clc_load!I12/10,0)*10"
       */
      grid.setCell('clc_build', `${clcBuildCol}4`, (s, c, g) =>
        Math.round(g.n('clc_load', `${clcLoadCol}12`) / 10) * 10);

      /**
       * Row 5: Heizlast_total / Qdot_room [W]
       * Excel: "ROUND(clc_load!I72/HLOOKUP(\"NO_round_Qdot\", PAR!$F$1:$AZ$5, 2, FALSE),0)*HLOOKUP(\"NO_round_Qdot\", PAR!$F$1:$AZ$5, 2, FALSE)"
       */
      grid.setCell('clc_build', `${clcBuildCol}5`, (s, c, g) => {
        const noRoundQdot = g.HLOOKUP('PAR','NO_round_Qdot', '$F$1','$AZ$5', 2, false)  as number;
        return Math.round(g.n('clc_load', `${clcLoadCol}72`) / noRoundQdot) * noRoundQdot;
      });

      /**
       * Row 6: Heizlast_spezifisch / qdot_room [W/m²]
       * Excel: "ROUND(clc_load!I73/HLOOKUP(\"NO_round_Qdot_spez\", PAR!$F$1:$AZ$5, 2, FALSE),0)*HLOOKUP(\"NO_round_Qdot_spez\", PAR!$F$1:$AZ$5, 2, FALSE)"
       */
      grid.setCell('clc_build', `${clcBuildCol}6`, (s, c, g) => {
        const noRoundQdotSpez = g.HLOOKUP('PAR', 'NO_round_Qdot_spez', '$F$1', '$AZ$5', 2, false)  as number  as number;
        return Math.round(g.n('clc_load', `${clcLoadCol}73`) / noRoundQdotSpez) * noRoundQdotSpez;
      });

      /**
       * Row 7: Heizlast mit Abschlag / Qdot_room_cor [W]
       * Excel: "ROUND(clc_load!I74/HLOOKUP(\"NO_round_Qdot\", PAR!$F$1:$AZ$5, 2, FALSE),0)*HLOOKUP(\"NO_round_Qdot\", PAR!$F$1:$AZ$5, 2, FALSE)"
       */
      grid.setCell('clc_build', `${clcBuildCol}7`, (s, c, g) => {
        const noRoundQdot = g.HLOOKUP('PAR', 'NO_round_Qdot', '$F$1', '$AZ$5', 2, false)  as number;
        return Math.round(g.n('clc_load', `${clcLoadCol}74`) / noRoundQdot) * noRoundQdot;
      });

      /**
       * Row 8: Heizlast_spez mit Abschlag / qdot_room_cor [W/m²]
       * Excel: "ROUND(clc_load!I75/HLOOKUP(\"NO_round_Qdot_spez\", PAR!$F$1:$AZ$5, 2, FALSE),0)*HLOOKUP(\"NO_round_Qdot_spez\", PAR!$F$1:$AZ$5, 2, FALSE)"
       */
      grid.setCell('clc_build', `${clcBuildCol}8`, (s, c, g) => {
        const noRoundQdotSpez = g.HLOOKUP('PAR', 'NO_round_Qdot_spez', '$F$1', '$AZ$5', 2, false)  as number  as number;
        return Math.round(g.n('clc_load', `${clcLoadCol}75`) / noRoundQdotSpez) * noRoundQdotSpez;
      });

      /**
       * Row 9: Name des Raums
       * Excel: "IN_rooms!R3"
       */
      grid.setCell('clc_build', `${clcBuildCol}9`, (s, c, g) =>
        g.g('IN_rooms', `${roomCol}3`));

      /**
       * Row 11: U-Wert wall [W/(m²K)]
       * Excel: "IF(clc_load!I14>0,clc_load!I16,\"\")"
       */
      grid.setCell('clc_build', `${clcBuildCol}11`, (s, c, g) =>
        g.WENN(
          g.n('clc_load', `${clcLoadCol}14`) > 0,
          g.n('clc_load', `${clcLoadCol}16`),
          ""
        ));

      /**
       * Row 12: Heizlast Transmission wall [W]
       * Excel: "clc_load!I17"
       */
      grid.setCell('clc_build', `${clcBuildCol}12`, (s, c, g) =>
        g.n('clc_load', `${clcLoadCol}17`));

      /**
       * Row 13: Anteil Raumheizlast wall [%]
       * Excel: "clc_load!I18"
       */
      grid.setCell('clc_build', `${clcBuildCol}13`, (s, c, g) =>
        g.n('clc_load', `${clcLoadCol}18`));

      /**
       * Row 14: Potenzial Austausch wall
       * Excel: "AND(G$11>=HLOOKUP(\"U_opaque_lim\", PAR!$F$1:$AZ$5, 2, FALSE),G$13>=HLOOKUP(\"r_worst_lim\", PAR!$F$1:$AZ$5, 2, FALSE))"
       */
      grid.setCell('clc_build', `${clcBuildCol}14`, (s, c, g) =>
        g.UND(
          g.n(s, `${clcBuildCol}11`) >=( g.HLOOKUP('PAR', 'U_opaque_lim', '$F$1', '$AZ$5', 2, false)  as number),
          g.n(s, `${clcBuildCol}13`) >= (g.HLOOKUP('PAR', 'r_worst_lim', '$F$1', '$AZ$5', 2, false)  as number)
        ));

      /**
       * Row 15: U-Wert innerwall [W/(m²K)]
       * Excel: "IF(clc_load!I19,clc_load!I21,\"\")"
       */
      grid.setCell('clc_build', `${clcBuildCol}15`, (s, c, g) =>
        g.WENN(
          g.n('clc_load', `${clcLoadCol}19`) > 0,
          g.n('clc_load', `${clcLoadCol}21`),
          ""
        ));

      /**
       * Row 16: Heizlast Transmission innerwall [W]
       * Excel: "clc_load!I22"
       */
      grid.setCell('clc_build', `${clcBuildCol}16`, (s, c, g) =>
        g.n('clc_load', `${clcLoadCol}22`));

      /**
       * Row 17: Anteil Raumheizlast innerwall [%]
       * Excel: "clc_load!I23"
       */
      grid.setCell('clc_build', `${clcBuildCol}17`, (s, c, g) =>
        g.n('clc_load', `${clcLoadCol}23`));

      /**
       * Row 18: Potenzial Austausch innerwall
       * Excel: Similar to row 14 but with innerwall values
       */
      grid.setCell('clc_build', `${clcBuildCol}18`, (s, c, g) =>
        g.UND(
          g.n(s, `${clcBuildCol}15`) >= (g.HLOOKUP('PAR', 'U_opaque_lim', '$F$1', '$AZ$5', 2, false)  as number),
          g.n(s, `${clcBuildCol}17`) >= (g.HLOOKUP('PAR', 'r_worst_lim', '$F$1', '$AZ$5', 2, false)  as number)
        ));

      /**
       * Row 19: U-Wert win [W/(m²K)] - Gewichteter Mittelwert U-Wert der einzelnen Fenster, nur wenn Fläche > 0
       * Excel: "_xlfn.LET(_xlpm.cond, CHOOSE({1,2,3,4,5}, clc_load!I42, clc_load!I48, clc_load!I54, clc_load!I60, clc_load!I66), _xlpm.val, CHOOSE({1,2,3,4,5}, clc_load!I45, clc_load!I51, clc_load!I57, clc_load!I63, clc_load!I69), _xlpm.valid, _xlpm.cond>0, _xlpm.f_val, _xlfn._xlws.FILTER(_xlpm.val, _xlpm.valid), _xlpm.f_wgt, _xlfn._xlws.FILTER(_xlpm.cond, _xlpm.valid), _xlpm.wgt_sum, SUM(_xlpm.f_wgt), _xlpm.wgt_avg, IF(_xlpm.wgt_sum>0, SUMPRODUCT(_xlpm.f_val, _xlpm.f_wgt)/_xlpm.wgt_sum, \"\"), IF(SUM(--_xlpm.valid)=0, \"\", _xlpm.wgt_avg))"
       */
      grid.setCell('clc_build', `${clcBuildCol}19`, (s, c, g) => {
        // LET _xlpm.cond, CHOOSE({1,2,3,4,5}, clc_load!I42, clc_load!I48, clc_load!I54, clc_load!I60, clc_load!I66)
        const xlpm_cond = [1,2,3,4,5].map(i => g.CHOOSE(i,
          g.n('clc_load', `${clcLoadCol}42`),
          g.n('clc_load', `${clcLoadCol}48`),
          g.n('clc_load', `${clcLoadCol}54`),
          g.n('clc_load', `${clcLoadCol}60`),
          g.n('clc_load', `${clcLoadCol}66`)
        ));

        // LET _xlpm.val, CHOOSE({1,2,3,4,5}, clc_load!I45, clc_load!I51, clc_load!I57, clc_load!I63, clc_load!I69)
        const xlpm_val = [1,2,3,4,5].map(i => g.CHOOSE(i,
          g.n('clc_load', `${clcLoadCol}45`),
          g.n('clc_load', `${clcLoadCol}51`),
          g.n('clc_load', `${clcLoadCol}57`),
          g.n('clc_load', `${clcLoadCol}63`),
          g.n('clc_load', `${clcLoadCol}69`)
        ));

        // LET _xlpm.valid, _xlpm.cond>0
        const xlpm_valid = xlpm_cond.map(cond => cond > 0);

        // LET _xlpm.f_val, _xlfn._xlws.FILTER(_xlpm.val, _xlpm.valid)
        const xlpm_f_val = g.FILTER(xlpm_val, xlpm_valid);

        // LET _xlpm.f_wgt, _xlfn._xlws.FILTER(_xlpm.cond, _xlpm.valid)
        const xlpm_f_wgt = g.FILTER(xlpm_cond, xlpm_valid);

        // LET _xlpm.wgt_sum, SUM(_xlpm.f_wgt)
        const xlpm_wgt_sum = g.SUM(s, xlpm_f_wgt);

        // LET _xlpm.wgt_avg, IF(_xlpm.wgt_sum>0, SUMPRODUCT(_xlpm.f_val, _xlpm.f_wgt)/_xlpm.wgt_sum, "")
        const xlpm_wgt_avg = g.WENN(
          xlpm_wgt_sum > 0,
          g.SUMPRODUCT(xlpm_f_val, xlpm_f_wgt) / xlpm_wgt_sum,
          ""
        );

        // Final: IF(SUM(--_xlpm.valid)=0, "", _xlpm.wgt_avg)
        return g.WENN(
          g.SUM(s, xlpm_valid.map(v => v ? 1 : 0)) === 0,
          "",
          xlpm_wgt_avg
        );
      });

      /**
       * Row 20: Heizlast Transmission win [W]
       * Excel: "(clc_load!I46+clc_load!I52+clc_load!I58+clc_load!I64+clc_load!I70)"
       */
      grid.setCell('clc_build', `${clcBuildCol}20`, (s, c, g) =>
        g.n('clc_load', `${clcLoadCol}46`) +
        g.n('clc_load', `${clcLoadCol}52`) +
        g.n('clc_load', `${clcLoadCol}58`) +
        g.n('clc_load', `${clcLoadCol}64`) +
        g.n('clc_load', `${clcLoadCol}70`));

      /**
       * Row 21: Anteil Raumheizlast win [%]
       * Excel: "clc_load!I47+clc_load!I53+clc_load!I59+clc_load!I65+clc_load!I71"
       */
      grid.setCell('clc_build', `${clcBuildCol}21`, (s, c, g) =>
        g.n('clc_load', `${clcLoadCol}47`) +
        g.n('clc_load', `${clcLoadCol}53`) +
        g.n('clc_load', `${clcLoadCol}59`) +
        g.n('clc_load', `${clcLoadCol}65`) +
        g.n('clc_load', `${clcLoadCol}71`));

      /**
       * Row 22: Potenzial Austausch win
       * Excel: "AND(G$19>=HLOOKUP(\"U_win_lim\", PAR!$F$1:$AZ$5, 2, FALSE),G$21>=HLOOKUP(\"r_worst_lim\", PAR!$F$1:$AZ$5, 2, FALSE))"
       */
      grid.setCell('clc_build', `${clcBuildCol}22`, (s, c, g) =>
        g.UND(
          g.n(s, `${clcBuildCol}19`) >= (g.HLOOKUP('PAR', 'U_win_lim', '$F$1', '$AZ$5', 2, false)  as number),
          g.n(s, `${clcBuildCol}21`) >= (g.HLOOKUP('PAR', 'r_worst_lim', '$F$1', '$AZ$5', 2, false)  as number)
        ));

      /**
       * Row 23: U-Wert roof [W/(m²K)]
       * Excel: "IF(clc_load!I26>0,clc_load!I28,\"\")"
       */
      grid.setCell('clc_build', `${clcBuildCol}23`, (s, c, g) =>
        g.WENN(
          g.n('clc_load', `${clcLoadCol}26`) > 0,
          g.n('clc_load', `${clcLoadCol}28`),
          ""
        ));

      /**
       * Row 24: Heizlast Transmission roof [W]
       * Excel: "clc_load!I29"
       */
      grid.setCell('clc_build', `${clcBuildCol}24`, (s, c, g) =>
        g.n('clc_load', `${clcLoadCol}29`));

      /**
       * Row 25: Anteil Raumheizlast roof [%]
       * Excel: "clc_load!I30"
       */
      grid.setCell('clc_build', `${clcBuildCol}25`, (s, c, g) =>
        g.n('clc_load', `${clcLoadCol}30`));

      /**
       * Row 26: Potenzial Austausch roof
       * Excel: "AND(G$23>=HLOOKUP(\"U_opaque_lim\", PAR!$F$1:$AZ$5, 2, FALSE),G$25>=HLOOKUP(\"r_worst_lim\", PAR!$F$1:$AZ$5, 2, FALSE))"
       */
      grid.setCell('clc_build', `${clcBuildCol}26`, (s, c, g) =>
        g.UND(
          g.n(s, `${clcBuildCol}23`) >= (g.HLOOKUP('PAR', 'U_opaque_lim', '$F$1', '$AZ$5', 2, false)  as number),
          g.n(s, `${clcBuildCol}25`) >= (g.HLOOKUP('PAR', 'r_worst_lim', '$F$1', '$AZ$5', 2, false)  as number)
        ));

      /**
       * Row 27: U-Wert botceil [W/(m²K)]
       * Excel: "IF(clc_load!I37>0,clc_load!I39,\"\")"
       */
      grid.setCell('clc_build', `${clcBuildCol}27`, (s, c, g) =>
        g.WENN(
          g.n('clc_load', `${clcLoadCol}37`) > 0,
          g.n('clc_load', `${clcLoadCol}39`),
          ""
        ));

      /**
       * Row 28: Heizlast Transmission floor [W]
       * Excel: "clc_load!I40"
       */
      grid.setCell('clc_build', `${clcBuildCol}28`, (s, c, g) =>
        g.n('clc_load', `${clcLoadCol}40`));

      /**
       * Row 29: Anteil Raumheizlast floor [%]
       * Excel: "clc_load!I41"
       */
      grid.setCell('clc_build', `${clcBuildCol}29`, (s, c, g) =>
        g.n('clc_load', `${clcLoadCol}41`));

      /**
       * Row 30: Potenzial Austausch floor
       * Excel: "AND(G$27>=HLOOKUP(\"U_opaque_lim\", PAR!$F$1:$AZ$5, 2, FALSE),G$29>=HLOOKUP(\"r_worst_lim\", PAR!$F$1:$AZ$5, 2, FALSE))"
       */
      grid.setCell('clc_build', `${clcBuildCol}30`, (s, c, g) =>
        g.UND(
          g.n(s, `${clcBuildCol}27`) >= (g.HLOOKUP('PAR', 'U_opaque_lim', '$F$1', '$AZ$5', 2, false)  as number),
          g.n(s, `${clcBuildCol}29`) >= (g.HLOOKUP('PAR', 'r_worst_lim', '$F$1', '$AZ$5', 2, false)  as number)
        ));

      /**
       * Row 31: U-Wert topceil [W/(m²K)]
       * Excel: "IF(clc_load!I32>0,clc_load!I34,\"\")"
       */
      grid.setCell('clc_build', `${clcBuildCol}31`, (s, c, g) =>
        g.WENN(
          g.n('clc_load', `${clcLoadCol}32`) > 0,
          g.n('clc_load', `${clcLoadCol}34`),
          ""
        ));

      /**
       * Row 32: Heizlast Transmission ceiling [W]
       * Excel: "clc_load!I35"
       */
      grid.setCell('clc_build', `${clcBuildCol}32`, (s, c, g) =>
        g.n('clc_load', `${clcLoadCol}35`));

      /**
       * Row 33: Anteil Raumheizlast ceiling [%]
       * Excel: "clc_load!I36"
       */
      grid.setCell('clc_build', `${clcBuildCol}33`, (s, c, g) =>
        g.n('clc_load', `${clcLoadCol}36`));

      /**
       * Row 34: Potenzial Austausch ceiling
       * Excel: "AND(G$31>=HLOOKUP(\"U_opaque_lim\", PAR!$F$1:$AZ$5, 2, FALSE),G$33>=HLOOKUP(\"r_worst_lim\", PAR!$F$1:$AZ$5, 2, FALSE))"
       */
      grid.setCell('clc_build', `${clcBuildCol}34`, (s, c, g) =>
        g.UND(
          g.n(s, `${clcBuildCol}31`) >= (g.HLOOKUP('PAR', 'U_opaque_lim', '$F$1', '$AZ$5', 2, false)  as number),
          g.n(s, `${clcBuildCol}33`) >= (g.HLOOKUP('PAR', 'r_worst_lim', '$F$1', '$AZ$5', 2, false)  as number)
        ));

      /**
       * Row 37: Leistung Heizkörper IST 55°C [W]
       * Excel: "ROUND(clc_power!G203/HLOOKUP(\"NO_round_Qdot\", PAR!$F$1:$AZ$5, 2, FALSE),0)*HLOOKUP(\"NO_round_Qdot\", PAR!$F$1:$AZ$5, 2, FALSE)"
       */
      grid.setCell('clc_build', `${clcBuildCol}37`, (s, c, g) => {
        const noRoundQdot = g.HLOOKUP('PAR', 'NO_round_Qdot', '$F$1', '$AZ$5', 2, false)  as number;
        // column mapping clc_power is same as clc_build
        return Math.round(g.n('clc_power', `${clcBuildCol}203`) / noRoundQdot) * noRoundQdot;
      });

      /**
       * Row 38: Typ 33 max. Leistung Austausch-Heizkörper [W]
       * Excel: "ROUND(clc_power!G204/HLOOKUP(\"NO_round_Qdot\", PAR!$F$1:$AZ$5, 2, FALSE),0)*HLOOKUP(\"NO_round_Qdot\", PAR!$F$1:$AZ$5, 2, FALSE)"
       */
      grid.setCell('clc_build', `${clcBuildCol}38`, (s, c, g) => {
        const noRoundQdot = g.HLOOKUP('PAR', 'NO_round_Qdot', '$F$1', '$AZ$5', 2, false)  as number;
        return Math.round(g.n('clc_power', `${clcBuildCol}204`) / noRoundQdot) * noRoundQdot;
      });

      /**
       * Row 39: Deckungsgrad IST 55°C
       * Excel: "ROUND(clc_power!G205/HLOOKUP(\"NO_round_rcover\", PAR!$F$1:$AZ$5, 2, FALSE),0)*HLOOKUP(\"NO_round_rcover\", PAR!$F$1:$AZ$5, 2, FALSE)"
       */
      grid.setCell('clc_build', `${clcBuildCol}39`, (s, c, g) => {
        const noRoundRcover = g.HLOOKUP('PAR', 'NO_round_rcover', '$F$1', '$AZ$5', 2, false)  as number;
        return Math.round(g.n('clc_power', `${clcBuildCol}205`) / noRoundRcover) * noRoundRcover;
      });

      /**
       * Row 40: Typ 33 Deckungsgrad
       * Excel: "ROUND(clc_power!G206/HLOOKUP(\"NO_round_rcover\", PAR!$F$1:$AZ$5, 2, FALSE),0)*HLOOKUP(\"NO_round_rcover\", PAR!$F$1:$AZ$5, 2, FALSE)"
       */
      grid.setCell('clc_build', `${clcBuildCol}40`, (s, c, g) => {
        const noRoundRcover = g.HLOOKUP('PAR', 'NO_round_rcover', '$F$1', '$AZ$5', 2, false)  as number;
        return Math.round(g.n('clc_power', `${clcBuildCol}206`) / noRoundRcover) * noRoundRcover;
      });

      /**
       * Row 41: NT1-ready (nt1 = 55°C)
       * Excel: "G39>1"
       */
      grid.setCell('clc_build', `${clcBuildCol}41`, (s, c, g) =>
        g.n(s, `${clcBuildCol}39`) > 1);

      /**
       * Row 42: NT2-maybe (nt2 = 45°C)
       * Excel: "G40>1"
       */
      grid.setCell('clc_build', `${clcBuildCol}42`, (s, c, g) =>
        g.n(s, `${clcBuildCol}40`) > 1);

      /**
       * Row 43: NT2-ready (nt2 = 45°C)
       * Excel: "G40>HLOOKUP(\"NO_r_nt2\", PAR!$F$1:$AZ$5, 2, FALSE)"
       */
      grid.setCell('clc_build', `${clcBuildCol}43`, (s, c, g) =>
        g.n(s, `${clcBuildCol}40`) > (g.HLOOKUP('PAR', 'NO_r_nt2', '$F$1', '$AZ$5', 2, false)  as number));
    }

    // Aggregation formulas for building level (column G only, rows 49-88)
    // These aggregate values across all rooms (G to AA columns)

    /**
     * Row 49: Anzahl Räume (Number of rooms)
     * Excel: "SUMPRODUCT((G9:AA9<>\"\")*1)"
     */
    grid.setCell('clc_build', 'G49', (s, c, g) =>
      g.SUMPRODUCT(g.RANGE("G9:AA9", s).map(v => v !== "" ? 1 : 0))
    );

    /**
     * Row 51: Anzahl Potenzial wall
     * Excel: "COUNTIF(G14:AA14,TRUE)"
     */
    grid.setCell('clc_build', 'G51', (s, c, g) =>
      g.COUNTIF(s, 'G14:AA14', g.WAHR()));

    /**
     * Row 52: Anzahl Potenzial innerwall
     * Excel: "COUNTIF(G18:AA18,TRUE)"
     */
    grid.setCell('clc_build', 'G52', (s, c, g) =>
      g.COUNTIF(s, 'G18:AA18', g.WAHR()));

    /**
     * Row 53: Anzahl Potenzial win
     * Excel: "COUNTIF(G22:AA22,TRUE)"
     */
    grid.setCell('clc_build', 'G53', (s, c, g) =>
      g.COUNTIF(s, 'G22:AA22', g.WAHR()));

    /**
     * Row 54: Anzahl Potenzial roof
     * Excel: "COUNTIF(G26:AA26,TRUE)"
     */
    grid.setCell('clc_build', 'G54', (s, c, g) =>
      g.COUNTIF(s, 'G26:AA26', g.WAHR()));

    /**
     * Row 55: Anzahl Potenzial botceil
     * Excel: "COUNTIF(G30:AA30,TRUE)"
     */
    grid.setCell('clc_build', 'G55', (s, c, g) =>
      g.COUNTIF(s, 'G30:AA30', g.WAHR()));

    /**
     * Row 56: Anzahl Potenzial topceil
     * Excel: "COUNTIF(G34:AA34,TRUE)"
     */
    grid.setCell('clc_build', 'G56', (s, c, g) =>
      g.COUNTIF(s, 'G34:AA34', g.WAHR()));

    /**
     * Row 57: Anteil Potenzial wall
     * Excel: "G51/$G$49"
     */
    grid.setCell('clc_build', 'G57', (s, c, g) =>
      g.n(s, 'G51') / g.n(s, 'G49'));

    /**
     * Row 58: Anteil Potenzial innerwall
     * Excel: "G52/$G$49"
     */
    grid.setCell('clc_build', 'G58', (s, c, g) =>
      g.n(s, 'G52') / g.n(s, 'G49'));

    /**
     * Row 59: Anteil Potenzial win
     * Excel: "G53/$G$49"
     */
    grid.setCell('clc_build', 'G59', (s, c, g) =>
      g.n(s, 'G53') / g.n(s, 'G49'));

    /**
     * Row 60: Anteil Potenzial roof
     * Excel: "G54/$G$49"
     */
    grid.setCell('clc_build', 'G60', (s, c, g) =>
      g.n(s, 'G54') / g.n(s, 'G49'));

    /**
     * Row 61: Anteil Potenzial botceil
     * Excel: "G55/$G$49"
     */
    grid.setCell('clc_build', 'G61', (s, c, g) =>
      g.n(s, 'G55') / g.n(s, 'G49'));

    /**
     * Row 62: Anteil Potenzial topceil
     * Excel: "G56/$G$49"
     */
    grid.setCell('clc_build', 'G62', (s, c, g) =>
      g.n(s, 'G56') / g.n(s, 'G49'));

    /**
     * Row 65: Anzahl Räume Deckungsgrad < 0,6
     * Excel: "COUNTIF($G$39:$AA$39,\"<0,6\")"
     */
    grid.setCell('clc_build', 'G65', (s, c, g) =>
      g.COUNTIF(s, 'G39:AA39', '<0.6'));

    /**
     * Row 66: Anzahl Räume Deckungsgrad < 0,8
     * Excel: "COUNTIF($G$39:$AA$39,\"<0,8\")"
     */
    grid.setCell('clc_build', 'G66', (s, c, g) =>
      g.COUNTIF(s, 'G39:AA39', '<0.8'));

    /**
     * Row 67: Anzahl Räume 0,6<Deckungsgrad<0,8
     * Excel: "COUNTIFS(G39:AA39,\">=0,6\",G39:AA39,\"<0,8\")"
     */
    grid.setCell('clc_build', 'G67', (s, c, g) =>
      g.COUNTIFS(s, 'G39:AA39', '>=0.6', 'G39:AA39', '<0.8'));

    /**
     * Row 68: Anzahl Räume Deckungsgrad < 1
     * Excel: "COUNTIF($G$39:$AA$39,\"<1\")"
     */
    grid.setCell('clc_build', 'G68', (s, c, g) =>
      g.COUNTIF(s, 'G39:AA39', '<1'));

    /**
     * Row 69: Anzahl Räume 0,8<Deckungsgrad<1,0
     * Excel: "COUNTIFS(G39:AA39,\">=0,8\",G39:AA39,\"<1\")"
     */
    grid.setCell('clc_build', 'G69', (s, c, g) =>
      g.COUNTIFS(s, 'G39:AA39', '>=0.8', 'G39:AA39', '<1'));

    /**
     * Row 70: Anzahl Räume Deckungsgrad > 1
     * Excel: "COUNTIFS(G39:AA39,\">=1\")"
     */
    grid.setCell('clc_build', 'G70', (s, c, g) =>
      g.COUNTIFS(s, 'G39:AA39', '>=1'));

    /**
     * Row 71: Anzahl Räume Deckungsgrad Typ 33 < 1
     * Excel: "COUNTIF(G40:AA40,\"<1\")"
     */
    grid.setCell('clc_build', 'G71', (s, c, g) =>
      g.COUNTIF(s, 'G40:AA40', '<1'));

    /**
     * Row 72: Anzahl Räume Deckungsgrad Typ 33 > 1
     * Excel: "COUNTIF(G40:AA40,\">=1\")"
     */
    grid.setCell('clc_build', 'G72', (s, c, g) =>
      g.COUNTIF(s, 'G40:AA40', '>=1'));

    /**
     * Row 73: Anteil Räume Deckungsgrad < 0,6
     * Excel: "G65/$G$49"
     */
    grid.setCell('clc_build', 'G73', (s, c, g) =>
      g.n(s, 'G65') / g.n(s, 'G49'));

    /**
     * Row 74: Anteil Räume Deckungsgrad < 0,8
     * Excel: "G66/$G$49"
     */
    grid.setCell('clc_build', 'G74', (s, c, g) =>
      g.n(s, 'G66') / g.n(s, 'G49'));

    /**
     * Row 75: Anteil Räume 0,6<Deckungsgrad<0,8
     * Excel: "G67/$G$49"
     */
    grid.setCell('clc_build', 'G75', (s, c, g) =>
      g.n(s, 'G67') / g.n(s, 'G49'));

    /**
     * Row 76: Anteil Räume Deckungsgrad < 1
     * Excel: "G68/$G$49"
     */
    grid.setCell('clc_build', 'G76', (s, c, g) =>
      g.n(s, 'G68') / g.n(s, 'G49'));

    /**
     * Row 77: Anteil Räume 0,8<Deckungsgrad<1
     * Excel: "G69/$G$49"
     */
    grid.setCell('clc_build', 'G77', (s, c, g) =>
      g.n(s, 'G69') / g.n(s, 'G49'));

    /**
     * Row 78: Anteil Räume Deckungsgrad>1
     * Excel: "G70/$G$49"
     */
    grid.setCell('clc_build', 'G78', (s, c, g) =>
      g.n(s, 'G70') / g.n(s, 'G49'));

    /**
     * Row 79: Anteil Räume Deckungsgrad Typ 33 < 1
     * Excel: "G71/$G$49"
     */
    grid.setCell('clc_build', 'G79', (s, c, g) =>
      g.n(s, 'G71') / g.n(s, 'G49'));

    /**
     * Row 80: Anteil Räume Deckungsgrad Typ 33 > 1
     * Excel: "G72/$G$49"
     */
    grid.setCell('clc_build', 'G80', (s, c, g) =>
      g.n(s, 'G72') / g.n(s, 'G49'));

    /**
     * Row 83: Anteil Räume < 50 W/m²
     * Excel: "COUNTIF($G$8:$AA$8,\"<50\")/$G$49"
     */
    grid.setCell('clc_build', 'G83', (s, c, g) =>
      g.COUNTIF(s, 'G8:AA8', '<50') / g.n(s, 'G49'));

    /**
     * Row 84: Anteil Räume < 70 W/m²
     * Excel: "COUNTIF($G$8:$AA$8,\"<70\")/$G$49"
     */
    grid.setCell('clc_build', 'G84', (s, c, g) =>
      g.COUNTIF(s, 'G8:AA8', '<70') / g.n(s, 'G49'));

    /**
     * Row 85: Anteil Räume 50-70 W/m²
     * Excel: "COUNTIFS($G$8:$AA$8,\">=50\",$G$8:$AA$8,\"<70\")/$G$49"
     */
    grid.setCell('clc_build', 'G85', (s, c, g) =>
      g.COUNTIFS(s, 'G8:AA8', '>=50', 'G8:AA8', '<70') / g.n(s, 'G49'));

    /**
     * Row 86: Anteil Räume < 90 W/m²
     * Excel: "COUNTIF($G$8:$AA$8,\"<90\")/$G$49"
     */
    grid.setCell('clc_build', 'G86', (s, c, g) =>
      g.COUNTIF(s, 'G8:AA8', '<90') / g.n(s, 'G49'));

    /**
     * Row 87: Anteil Räume 70-90 W/m²
     * Excel: "COUNTIFS($G$8:$AA$8,\">=70\",$G$8:$AA$8,\"<90\")/$G$49"
     */
    grid.setCell('clc_build', 'G87', (s, c, g) =>
      g.COUNTIFS(s, 'G8:AA8', '>=70', 'G8:AA8', '<90') / g.n(s, 'G49'));

    /**
     * Row 88: Anteil Räume > 90 W/m²
     * Excel: "COUNTIF($G$8:$AA$8,\">=90\")/$G$49"
     */
    grid.setCell('clc_build', 'G88', (s, c, g) =>
      g.COUNTIF(s, 'G8:AA8', '>=90') / g.n(s, 'G49'));
  }
}
