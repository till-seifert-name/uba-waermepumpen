import { DataGrid } from '../data-grid';
import { FormulaOverlay } from './base-overlay';

/**
 * clc_build sheet formula overlay
 * Contains formula implementations for the clc_build sheet
 */
export class ClcBuildOverlay implements FormulaOverlay {
  // Columns G-U for rooms 1-15
  private clcBuildRoomCols = ['G', 'H', 'I', 'J', 'K', 'L', 'M', 'N', 'O', 'P', 'Q', 'R', 'S', 'T', 'U'];
  // Corresponding columns I-W in clc_load for rooms 1-15
  private clcLoadCols = ['I', 'J', 'K', 'L', 'M', 'N', 'O', 'P', 'Q', 'R', 'S', 'T', 'U', 'V', 'W'];

  /**
   * Apply clc_build formulas to the data grid
   * @param grid The DataGrid instance to apply formulas to
   */
  applyFormulas(grid: DataGrid): void {
    // Implement formulas for each room column
    for (let i = 0; i < this.clcBuildRoomCols.length; i++) {
      const clcBuildCol = this.clcBuildRoomCols[i];
      const clcLoadCol = this.clcLoadCols[i];

      /**
       * Row 5: Heizlast_total / Qdot_room [W]
       * Original Excel formula: "ROUND(clc_load!I72/HLOOKUP(\"NO_round_Qdot\", PAR!$F$1:$AZ$5, 2, FALSE),0)*HLOOKUP(\"NO_round_Qdot\", PAR!$F$1:$AZ$5, 2, FALSE)"
       */
      grid.setCell('clc_build', `${clcBuildCol}5`, (s, c, g) => {
        const noRoundQdot = g.HLOOKUP('PAR','NO_round_Qdot', '$F$1','$AZ$5', 2, false)  as number;
        return Math.round(g.n('clc_load', `${clcLoadCol}72`) / noRoundQdot) * noRoundQdot;
      });

      /**
       * Row 6: Heizlast_spezifisch / qdot_room [W/m²]
       * Original Excel formula: "ROUND(clc_load!I73/HLOOKUP(\"NO_round_Qdot_spez\", PAR!$F$1:$AZ$5, 2, FALSE),0)*HLOOKUP(\"NO_round_Qdot_spez\", PAR!$F$1:$AZ$5, 2, FALSE)"
       */
      grid.setCell('clc_build', `${clcBuildCol}6`, (s, c, g) => {
        const noRoundQdotSpez = g.HLOOKUP('PAR', 'NO_round_Qdot_spez', '$F$1', '$AZ$5', 2, false)  as number  as number;
        return Math.round(g.n('clc_load', `${clcLoadCol}73`) / noRoundQdotSpez) * noRoundQdotSpez;
      });

      /**
       * Row 7: Heizlast mit Abschlag / Qdot_room_cor [W]
       * Original Excel formula: "ROUND(clc_load!I74/HLOOKUP(\"NO_round_Qdot\", PAR!$F$1:$AZ$5, 2, FALSE),0)*HLOOKUP(\"NO_round_Qdot\", PAR!$F$1:$AZ$5, 2, FALSE)"
       */
      grid.setCell('clc_build', `${clcBuildCol}7`, (s, c, g) => {
        const noRoundQdot = g.HLOOKUP('PAR', 'NO_round_Qdot', '$F$1', '$AZ$5', 2, false)  as number;
        return Math.round(g.n('clc_load', `${clcLoadCol}74`) / noRoundQdot) * noRoundQdot;
      });

      /**
       * Row 8: Heizlast_spez mit Abschlag / qdot_room_cor [W/m²]
       * Original Excel formula: "ROUND(clc_load!I75/HLOOKUP(\"NO_round_Qdot_spez\", PAR!$F$1:$AZ$5, 2, FALSE),0)*HLOOKUP(\"NO_round_Qdot_spez\", PAR!$F$1:$AZ$5, 2, FALSE)"
       */
      grid.setCell('clc_build', `${clcBuildCol}8`, (s, c, g) => {
        const noRoundQdotSpez = g.HLOOKUP('PAR', 'NO_round_Qdot_spez', '$F$1', '$AZ$5', 2, false)  as number  as number;
        return Math.round(g.n('clc_load', `${clcLoadCol}75`) / noRoundQdotSpez) * noRoundQdotSpez;
      });

      /**
       * Row 11: U-Wert wall [W/(m²K)]
       * Original Excel formula: "clc_load!I16"
       */
      grid.setCell('clc_build', `${clcBuildCol}11`, (s, c, g) =>
        g.n('clc_load', `${clcLoadCol}16`));

      /**
       * Row 12: Heizlast Transmission wall [W]
       * Original Excel formula: "clc_load!I17"
       */
      grid.setCell('clc_build', `${clcBuildCol}12`, (s, c, g) =>
        g.n('clc_load', `${clcLoadCol}17`));

      /**
       * Row 13: Anteil Raumheizlast wall [%]
       * Original Excel formula: "clc_load!I18"
       */
      grid.setCell('clc_build', `${clcBuildCol}13`, (s, c, g) =>
        g.n('clc_load', `${clcLoadCol}18`));

      /**
       * Row 14: Potenzial Austausch wall
       * Original Excel formula: "AND(G$11>=HLOOKUP(\"U_opaque_lim\", PAR!$F$1:$AZ$5, 2, FALSE),G$13>=HLOOKUP(\"r_worst_lim\", PAR!$F$1:$AZ$5, 2, FALSE))"
       */
      grid.setCell('clc_build', `${clcBuildCol}14`, (s, c, g) =>
        g.UND(
          g.n(s, `${clcBuildCol}11`) >=( g.HLOOKUP('PAR', 'U_opaque_lim', '$F$1', '$AZ$5', 2, false)  as number),
          g.n(s, `${clcBuildCol}13`) >= (g.HLOOKUP('PAR', 'r_worst_lim', '$F$1', '$AZ$5', 2, false)  as number)
        ));

      /**
       * Row 15: U-Wert innerwall [W/(m²K)]
       * Original Excel formula: "clc_load!I21"
       */
      grid.setCell('clc_build', `${clcBuildCol}15`, (s, c, g) =>
        g.n('clc_load', `${clcLoadCol}21`));

      /**
       * Row 16: Heizlast Transmission innerwall [W]
       * Original Excel formula: "clc_load!I22"
       */
      grid.setCell('clc_build', `${clcBuildCol}16`, (s, c, g) =>
        g.n('clc_load', `${clcLoadCol}22`));

      /**
       * Row 17: Anteil Raumheizlast innerwall [%]
       * Original Excel formula: "clc_load!I23"
       */
      grid.setCell('clc_build', `${clcBuildCol}17`, (s, c, g) =>
        g.n('clc_load', `${clcLoadCol}23`));

      /**
       * Row 18: Potenzial Austausch innerwall
       * Original Excel formula: Similar to row 14 but with innerwall values
       */
      grid.setCell('clc_build', `${clcBuildCol}18`, (s, c, g) =>
        g.UND(
          g.n(s, `${clcBuildCol}15`) >= (g.HLOOKUP('PAR', 'U_opaque_lim', '$F$1', '$AZ$5', 2, false)  as number),
          g.n(s, `${clcBuildCol}17`) >= (g.HLOOKUP('PAR', 'r_worst_lim', '$F$1', '$AZ$5', 2, false)  as number)
        ));

      /**
       * Row 19: U-Wert win [W/(m²K)]
       * Original Excel formula: "clc_load!I45" (assuming based on pattern)
       */
      grid.setCell('clc_build', `${clcBuildCol}19`, (s, c, g) =>
        g.n('clc_load', `${clcLoadCol}45`));

      /**
       * Row 20: Heizlast Transmission win [W]
       * Original Excel formula: "(clc_load!I46+clc_load!I52+clc_load!I58+clc_load!I64+clc_load!I70)"
       */
      grid.setCell('clc_build', `${clcBuildCol}20`, (s, c, g) =>
        g.n('clc_load', `${clcLoadCol}46`) +
        g.n('clc_load', `${clcLoadCol}52`) +
        g.n('clc_load', `${clcLoadCol}58`) +
        g.n('clc_load', `${clcLoadCol}64`) +
        g.n('clc_load', `${clcLoadCol}70`));

      /**
       * Row 21: Anteil Raumheizlast win [%]
       * Original Excel formula: "clc_load!I47+clc_load!I53+clc_load!I59+clc_load!I65+clc_load!I71"
       */
      grid.setCell('clc_build', `${clcBuildCol}21`, (s, c, g) =>
        g.n('clc_load', `${clcLoadCol}47`) +
        g.n('clc_load', `${clcLoadCol}53`) +
        g.n('clc_load', `${clcLoadCol}59`) +
        g.n('clc_load', `${clcLoadCol}65`) +
        g.n('clc_load', `${clcLoadCol}71`));

      /**
       * Row 22: Potenzial Austausch win
       * Original Excel formula: "AND(G$19>=HLOOKUP(\"U_win_lim\", PAR!$F$1:$AZ$5, 2, FALSE),G$21>=HLOOKUP(\"r_worst_lim\", PAR!$F$1:$AZ$5, 2, FALSE))"
       */
      grid.setCell('clc_build', `${clcBuildCol}22`, (s, c, g) =>
        g.UND(
          g.n(s, `${clcBuildCol}19`) >= (g.HLOOKUP('PAR', 'U_win_lim', '$F$1', '$AZ$5', 2, false)  as number),
          g.n(s, `${clcBuildCol}21`) >= (g.HLOOKUP('PAR', 'r_worst_lim', '$F$1', '$AZ$5', 2, false)  as number)
        ));

      /**
       * Row 23: U-Wert roof [W/(m²K)]
       * Original Excel formula: "clc_load!I28"
       */
      grid.setCell('clc_build', `${clcBuildCol}23`, (s, c, g) =>
        g.n('clc_load', `${clcLoadCol}28`));

      /**
       * Row 24: Heizlast Transmission roof [W]
       * Original Excel formula: "clc_load!I29"
       */
      grid.setCell('clc_build', `${clcBuildCol}24`, (s, c, g) =>
        g.n('clc_load', `${clcLoadCol}29`));

      /**
       * Row 25: Anteil Raumheizlast roof [%]
       * Original Excel formula: "clc_load!I30"
       */
      grid.setCell('clc_build', `${clcBuildCol}25`, (s, c, g) =>
        g.n('clc_load', `${clcLoadCol}30`));

      /**
       * Row 26: Potenzial Austausch roof
       * Original Excel formula: "AND(G$23>=HLOOKUP(\"U_opaque_lim\", PAR!$F$1:$AZ$5, 2, FALSE),G$25>=HLOOKUP(\"r_worst_lim\", PAR!$F$1:$AZ$5, 2, FALSE))"
       */
      grid.setCell('clc_build', `${clcBuildCol}26`, (s, c, g) =>
        g.UND(
          g.n(s, `${clcBuildCol}23`) >= (g.HLOOKUP('PAR', 'U_opaque_lim', '$F$1', '$AZ$5', 2, false)  as number),
          g.n(s, `${clcBuildCol}25`) >= (g.HLOOKUP('PAR', 'r_worst_lim', '$F$1', '$AZ$5', 2, false)  as number)
        ));

      /**
       * Row 27: U-Wert floor [W/(m²K)]
       * Original Excel formula: "clc_load!I39"
       */
      grid.setCell('clc_build', `${clcBuildCol}27`, (s, c, g) =>
        g.n('clc_load', `${clcLoadCol}39`));

      /**
       * Row 28: Heizlast Transmission floor [W]
       * Original Excel formula: "clc_load!I40"
       */
      grid.setCell('clc_build', `${clcBuildCol}28`, (s, c, g) =>
        g.n('clc_load', `${clcLoadCol}40`));

      /**
       * Row 29: Anteil Raumheizlast floor [%]
       * Original Excel formula: "clc_load!I41"
       */
      grid.setCell('clc_build', `${clcBuildCol}29`, (s, c, g) =>
        g.n('clc_load', `${clcLoadCol}41`));

      /**
       * Row 30: Potenzial Austausch floor
       * Original Excel formula: "AND(G$27>=HLOOKUP(\"U_opaque_lim\", PAR!$F$1:$AZ$5, 2, FALSE),G$29>=HLOOKUP(\"r_worst_lim\", PAR!$F$1:$AZ$5, 2, FALSE))"
       */
      grid.setCell('clc_build', `${clcBuildCol}30`, (s, c, g) =>
        g.UND(
          g.n(s, `${clcBuildCol}27`) >= (g.HLOOKUP('PAR', 'U_opaque_lim', '$F$1', '$AZ$5', 2, false)  as number),
          g.n(s, `${clcBuildCol}29`) >= (g.HLOOKUP('PAR', 'r_worst_lim', '$F$1', '$AZ$5', 2, false)  as number)
        ));

      /**
       * Row 31: U-Wert ceiling [W/(m²K)]
       * Original Excel formula: "clc_load!I34"
       */
      grid.setCell('clc_build', `${clcBuildCol}31`, (s, c, g) =>
        g.n('clc_load', `${clcLoadCol}34`));

      /**
       * Row 32: Heizlast Transmission ceiling [W]
       * Original Excel formula: "clc_load!I35"
       */
      grid.setCell('clc_build', `${clcBuildCol}32`, (s, c, g) =>
        g.n('clc_load', `${clcLoadCol}35`));

      /**
       * Row 33: Anteil Raumheizlast ceiling [%]
       * Original Excel formula: "clc_load!I36"
       */
      grid.setCell('clc_build', `${clcBuildCol}33`, (s, c, g) =>
        g.n('clc_load', `${clcLoadCol}36`));

      /**
       * Row 34: Potenzial Austausch ceiling
       * Original Excel formula: "AND(G$31>=HLOOKUP(\"U_opaque_lim\", PAR!$F$1:$AZ$5, 2, FALSE),G$33>=HLOOKUP(\"r_worst_lim\", PAR!$F$1:$AZ$5, 2, FALSE))"
       */
      grid.setCell('clc_build', `${clcBuildCol}34`, (s, c, g) =>
        g.UND(
          g.n(s, `${clcBuildCol}31`) >= (g.HLOOKUP('PAR', 'U_opaque_lim', '$F$1', '$AZ$5', 2, false)  as number),
          g.n(s, `${clcBuildCol}33`) >= (g.HLOOKUP('PAR', 'r_worst_lim', '$F$1', '$AZ$5', 2, false)  as number)
        ));

      /**
       * Row 37: Leistung Heizkörper IST 55°C [W]
       * Original Excel formula: "ROUND(clc_power!G203/HLOOKUP(\"NO_round_Qdot\", PAR!$F$1:$AZ$5, 2, FALSE),0)*HLOOKUP(\"NO_round_Qdot\", PAR!$F$1:$AZ$5, 2, FALSE)"
       */
      grid.setCell('clc_build', `${clcBuildCol}37`, (s, c, g) => {
        const noRoundQdot = g.HLOOKUP('PAR', 'NO_round_Qdot', '$F$1', '$AZ$5', 2, false)  as number;
        // Assuming the column mapping for clc_power is similar to clc_build
        return Math.round(g.n('clc_power', `${clcBuildCol}203`) / noRoundQdot) * noRoundQdot;
      });

      /**
       * Row 38: Typ 33 max. Leistung Austausch-Heizkörper [W]
       * Original Excel formula: "ROUND(clc_power!G204/HLOOKUP(\"NO_round_Qdot\", PAR!$F$1:$AZ$5, 2, FALSE),0)*HLOOKUP(\"NO_round_Qdot\", PAR!$F$1:$AZ$5, 2, FALSE)"
       */
      grid.setCell('clc_build', `${clcBuildCol}38`, (s, c, g) => {
        const noRoundQdot = g.HLOOKUP('PAR', 'NO_round_Qdot', '$F$1', '$AZ$5', 2, false)  as number;
        return Math.round(g.n('clc_power', `${clcBuildCol}204`) / noRoundQdot) * noRoundQdot;
      });

      /**
       * Row 39: Deckungsgrad IST 55°C
       * Original Excel formula: "ROUND(clc_power!G205/HLOOKUP(\"NO_round_rcover\", PAR!$F$1:$AZ$5, 2, FALSE),0)*HLOOKUP(\"NO_round_rcover\", PAR!$F$1:$AZ$5, 2, FALSE)"
       */
      grid.setCell('clc_build', `${clcBuildCol}39`, (s, c, g) => {
        const noRoundRcover = g.HLOOKUP('PAR', 'NO_round_rcover', '$F$1', '$AZ$5', 2, false)  as number;
        return Math.round(g.n('clc_power', `${clcBuildCol}205`) / noRoundRcover) * noRoundRcover;
      });

      /**
       * Row 40: Typ 33 Deckungsgrad
       * Original Excel formula: "ROUND(clc_power!G206/HLOOKUP(\"NO_round_rcover\", PAR!$F$1:$AZ$5, 2, FALSE),0)*HLOOKUP(\"NO_round_rcover\", PAR!$F$1:$AZ$5, 2, FALSE)"
       */
      grid.setCell('clc_build', `${clcBuildCol}40`, (s, c, g) => {
        const noRoundRcover = g.HLOOKUP('PAR', 'NO_round_rcover', '$F$1', '$AZ$5', 2, false)  as number;
        return Math.round(g.n('clc_power', `${clcBuildCol}206`) / noRoundRcover) * noRoundRcover;
      });

      /**
       * Row 41: NT1-ready (nt1 = 55°C)
       * Original Excel formula: "G39>1"
       */
      grid.setCell('clc_build', `${clcBuildCol}41`, (s, c, g) =>
        g.n(s, `${clcBuildCol}39`) > 1);

      /**
       * Row 42: NT2-maybe (nt2 = 45°C)
       * Original Excel formula: "G40>1"
       */
      grid.setCell('clc_build', `${clcBuildCol}42`, (s, c, g) =>
        g.n(s, `${clcBuildCol}40`) > 1);

      /**
       * Row 43: NT2-ready (nt2 = 45°C)
       * Original Excel formula: "G40>HLOOKUP(\"NO_r_nt2\", PAR!$F$1:$AZ$5, 2, FALSE)"
       */
      grid.setCell('clc_build', `${clcBuildCol}43`, (s, c, g) =>
        g.n(s, `${clcBuildCol}40`) > (g.HLOOKUP('PAR', 'NO_r_nt2', '$F$1', '$AZ$5', 2, false)  as number));
    }

    // TODO: Implement column formulas from row 44 onwards (those will not be room specific)
  }
}
