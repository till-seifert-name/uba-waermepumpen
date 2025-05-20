import { DataGrid } from '../data-grid';
import { FormulaOverlay } from './base-overlay';

/**
 * clc_power sheet formula overlay
 * Contains formula implementations for the clc_power sheet
 */
export class ClcPowerOverlay implements FormulaOverlay {
  // Columns H-U for rooms 1-15
  private clcPowerCols = ['G', 'H', 'I', 'J', 'K', 'L', 'M', 'N', 'O', 'P', 'Q', 'R', 'S', 'T', 'U'];
  // Columns R-AF for rooms 1-15 in IN_rooms sheet
  private roomCols =     ['R', 'S', 'T', 'U', 'V', 'W', 'X', 'Y', 'Z', 'AA', 'AB', 'AC', 'AD', 'AE', 'AF'];
  // Columns I-W for rooms 1-15 in clc_load sheet
  private clcLoadCols =  ['I', 'J', 'K', 'L', 'M', 'N', 'O', 'P', 'Q', 'R', 'S', 'T', 'U', 'V', 'W'];

  /**
   * Apply clc_power formulas to the data grid
   * @param grid The DataGrid instance to apply formulas to
   */
  applyFormulas(grid: DataGrid): void {
    // Implement formulas for each room column
    for (let i = 0; i < this.clcPowerCols.length; i++) {
      const clcPowerCol = this.clcPowerCols[i];
      const roomCol = this.roomCols[i];
      const clcLoadCol = this.clcLoadCols[i];

      /**
       * Row 1: Room header text
       * Original Excel formula: "\"Raum\"&\" \"&R$2"
       */
      grid.setCell('clc_power', `${clcPowerCol}1`, (s, c, g) =>
        "Raum " + g.g(s, `${clcPowerCol}2`));

      /**
       * Row 2: Room ID (copied from IN_rooms)
       * Original Excel formula: "IN_rooms!S2" for H2
       */
      grid.setCell('clc_power', `${clcPowerCol}2`, (s, c, g) =>
        g.g('IN_rooms', `${roomCol}2`));

      /**
       * Row 3: Radiator type (Flachheizkörper)
       * Original Excel formula: "IF(OR(IN_rooms!S$49=\"Flachheizkoerper_glatt\",IN_rooms!S$49=\"Flachheizkoerper_senkrecht_profiliert\"),IN_rooms!S$49,\"\")"
       */
      grid.setCell('clc_power', `${clcPowerCol}3`, (s, c, g) =>
        g.WENN(
          g.ODER(
            g.g('IN_rooms', `${roomCol}49`) === 'Flachheizkoerper_glatt',
            g.g('IN_rooms', `${roomCol}49`) === 'Flachheizkoerper_senkrecht_profiliert'
          ),
          g.g('IN_rooms', `${roomCol}49`),
          ''
        ));

      /**
       * Row 4: Subtype (from IN_rooms)
       * Original Excel formula: "IN_rooms!S$50"
       */
      grid.setCell('clc_power', `${clcPowerCol}4`, (s, c, g) =>
        g.g('IN_rooms', `${roomCol}50`));

      /**
       * Row 5: Height (from IN_rooms)
       * Original Excel formula: "IN_rooms!S$51"
       */
      grid.setCell('clc_power', `${clcPowerCol}5`, (s, c, g) =>
        g.g('IN_rooms', `${roomCol}51`));

      /**
       * Row 6: Length (from IN_rooms)
       * Original Excel formula: "IN_rooms!S$52"
       */
      grid.setCell('clc_power', `${clcPowerCol}6`, (s, c, g) =>
        g.g('IN_rooms', `${roomCol}52`));

      /**
       * Row 7: Depth (looked up from table data)
       * Original Excel formula: "IF(H4=0,0,_xlfn.XLOOKUP(H4&\"_Tiefe\",Daten!$K$14:$Q$14,Daten!$K$15:$Q$15))"
       */
      grid.setCell('clc_power', `${clcPowerCol}7`, (s, c, g) =>
        g.WENN(
          g.n(s, `${clcPowerCol}4`) === 0,
          0,
          g.XVERWEIS(
            g.n(s, `${clcPowerCol}4`) + "_Tiefe",
            g.getCells('Daten', 'K14', 'Q14').flat(),
            g.getCells('Daten', 'K15', 'Q15').flat(),
            { ifNotFound: 0 }
          )
        ));

      /**
       * Row 8: Radiator exponent n (looked up from tabelle1)
       * Original Excel formula: "SUMIFS(
       *   INDIRECT(\"tabelle1[Heizkörperexponent n ]\"),
       *   INDIRECT(\"tabelle1[Heizkörper_Typ]\"), clc_power!H$3,
       *   INDIRECT(\"tabelle1[Heizkörper_Subtyp]\"), clc_power!H$4,
       *   INDIRECT(\"tabelle1[Höhe H in mm]\"), clc_power!H$5,
       *   INDIRECT(\"tabelle1[Bautiefe T in mm]\"), clc_power!H$7
       * )"
       */
      grid.setCell('clc_power', `${clcPowerCol}8`, (s, c, g) => {
        // Using SUMMEWENNS to follow the Excel formula pattern exactly
        return g.SUMMEWENNS(
          g.INDIREKT_DB_REF("tabelle1", "Heizkörperexponent n "),
          g.INDIREKT_DB_REF("tabelle1", "Heizkörper_Typ"), [g.g(s, `${clcPowerCol}3`)],
          g.INDIREKT_DB_REF("tabelle1", "Heizkörper_Subtyp"), [g.g(s, `${clcPowerCol}4`)],
          g.INDIREKT_DB_REF("tabelle1", "Höhe H in mm"), [g.g(s, `${clcPowerCol}5`)],
          g.INDIREKT_DB_REF("tabelle1", "Bautiefe T in mm"), [g.g(s, `${clcPowerCol}7`)]
        );
      });

      /**
       * Row 9: Radiator power at 75/65/20
       * Original Excel formula: "_xlfn.LET(
       *   _xlpm.leistung, IN_rooms!S$55 * SUMIFS(
       *     INDIRECT(\"tabelle1[Wärmeleistung (75/65/20)  in W/m]\"),
       *     INDIRECT(\"tabelle1[Heizkörper_Typ]\"), clc_power!H$3,
       *     INDIRECT(\"tabelle1[Heizkörper_Subtyp]\"), clc_power!H$4,
       *     INDIRECT(\"tabelle1[Höhe H in mm]\"), clc_power!H$5,
       *     INDIRECT(\"tabelle1[Bautiefe T in mm]\"), clc_power!H$7  ) * H$6 / 1000,
       *   IF(_xlpm.leistung > 0, _xlpm.leistung, 0)
       * )"
       */
      grid.setCell('clc_power', `${clcPowerCol}9`, (s, c, g) => {
        // Using JavaScript let to match Excel LET function for leistung variable
        let leistung = g.n('IN_rooms', `${roomCol}55`) * g.SUMMEWENNS(
          g.INDIREKT_DB_REF("tabelle1", "Wärmeleistung (75/65/20)  in W/m"),
          g.INDIREKT_DB_REF("tabelle1", "Heizkörper_Typ"), [g.g(s, `${clcPowerCol}3`)],
          g.INDIREKT_DB_REF("tabelle1", "Heizkörper_Subtyp"), [g.g(s, `${clcPowerCol}4`)],
          g.INDIREKT_DB_REF("tabelle1", "Höhe H in mm"), [g.g(s, `${clcPowerCol}5`)],
          g.INDIREKT_DB_REF("tabelle1", "Bautiefe T in mm"), [g.g(s, `${clcPowerCol}7`)]
        ) * g.n(s, `${clcPowerCol}6`) / 1000;

        return g.WENN(leistung > 0, leistung, 0);
      });

      /**
       * Row 10: TVL_Ziel - Target flow temperature
       * Original Excel formula: "TVL_Ziel"
       */
      grid.setCell('clc_power', `${clcPowerCol}10`, (s, c, g) =>
        g.g('Names', 'TVL_Ziel'));

      /**
       * Row 11: TRL_Ziel - Target return temperature
       * Original Excel formula: "TRL_Ziel"
       */
      grid.setCell('clc_power', `${clcPowerCol}11`, (s, c, g) =>
        g.g('Names', 'TRL_Ziel'));

      /**
       * Row 12: Logarithmic mean temperature difference
       * Original Excel formula: "_xlfn.LET(
       *   _xlpm.TVL, H$10,
       *   _xlpm.TRL, H$11,
       *   _xlpm.Ti, clc_load!J$10,
       *   (_xlpm.TVL-_xlpm.TRL)/(LN((_xlpm.TVL-_xlpm.Ti)/(_xlpm.TRL-_xlpm.Ti)))
       * )"
       */
      grid.setCell('clc_power', `${clcPowerCol}12`, (s, c, g) => {
        // Using JavaScript let variables to match Excel LET function
        let TVL = g.n(s, `${clcPowerCol}10`);
        let TRL = g.n(s, `${clcPowerCol}11`);
        let Ti = g.n('clc_load', `${clcLoadCol}10`);

        // Using LN function for logarithm calculation with named variables
        return (TVL - TRL) / g.LN((TVL - Ti) / (TRL - Ti));
      });

      /**
       * Row 13: Radiator power at target temperature
       * Original Excel formula: "IF(H$9*((H$12/Log_ÜT_Norm)^H$8)>0,H$9*((H$12/Log_ÜT_Norm)^H$8),0)"
       */
      grid.setCell('clc_power', `${clcPowerCol}13`, (s, c, g) =>
        g.WENN(
          g.n(s, `${clcPowerCol}9`) * ((g.n(s, `${clcPowerCol}12`) / g.n('Names', 'Log_ÜT_Norm')) ** g.n(s, `${clcPowerCol}8`)) > 0,
          g.n(s, `${clcPowerCol}9`) * ((g.n(s, `${clcPowerCol}12`) / g.n('Names', 'Log_ÜT_Norm')) ** g.n(s, `${clcPowerCol}8`)),
          0
        )
      );

      /**
       * Row 14: Alternative radiator calculation (Type 33, height from G5)
       * Original Excel formula: "_xlfn.LET(
       *   _xlpm.leistung, IN_rooms!R$55 * SUMIFS(
       *     INDIRECT(\"tabelle1[Wärmeleistung (75/65/20)  in W/m]\"),
       *     INDIRECT(\"tabelle1[Heizkörper_Typ]\"), \"Flachheizkoerper_senkrecht_profiliert\",
       *     INDIRECT(\"tabelle1[Heizkörper_Subtyp]\"), \"Typ_33\",
       *     INDIRECT(\"tabelle1[Höhe H in mm]\"), G$5,
       *     INDIRECT(\"tabelle1[Bautiefe T in mm]\"), 155
       *   ) * G$6 / 1000 * ((G$12 / Log_ÜT_Norm) ^ SUMIFS(
       *     INDIRECT(\"tabelle1[Heizkörperexponent n ]\"),
       *     INDIRECT(\"tabelle1[Heizkörper_Typ]\"), \"Flachheizkoerper_senkrecht_profiliert\",
       *     INDIRECT(\"tabelle1[Heizkörper_Subtyp]\"), \"Typ_33\",
       *     INDIRECT(\"tabelle1[Höhe H in mm]\"), G$5,
       *     INDIRECT(\"tabelle1[Bautiefe T in mm]\"), 155
       *   )),
       *   IF(_xlpm.leistung > 0, _xlpm.leistung, 0)
       * )"
       */
      grid.setCell('clc_power', `${clcPowerCol}14`, (s, c, g) => {
        // Calculate the exponent using SUMIFS
        let exponent = g.SUMMEWENNS(
          g.INDIREKT_DB_REF("tabelle1", "Heizkörperexponent n "),
          g.INDIREKT_DB_REF("tabelle1", "Heizkörper_Typ"), ["Flachheizkoerper_senkrecht_profiliert"],
          g.INDIREKT_DB_REF("tabelle1", "Heizkörper_Subtyp"), ["Typ_33"],
          g.INDIREKT_DB_REF("tabelle1", "Höhe H in mm"), [g.g(s, `${clcPowerCol}5`)],
          g.INDIREKT_DB_REF("tabelle1", "Bautiefe T in mm"), [155]
        );

        // Calculate the power
        let leistung = g.n('IN_rooms', `${roomCol}55`) * g.SUMMEWENNS(
          g.INDIREKT_DB_REF("tabelle1", "Wärmeleistung (75/65/20)  in W/m"),
          g.INDIREKT_DB_REF("tabelle1", "Heizkörper_Typ"), ["Flachheizkoerper_senkrecht_profiliert"],
          g.INDIREKT_DB_REF("tabelle1", "Heizkörper_Subtyp"), ["Typ_33"],
          g.INDIREKT_DB_REF("tabelle1", "Höhe H in mm"), [g.g(s, `${clcPowerCol}5`)],
          g.INDIREKT_DB_REF("tabelle1", "Bautiefe T in mm"), [155]
        ) * g.n(s, `${clcPowerCol}6`) / 1000 * ((g.n(s, `${clcPowerCol}12`) / g.n('Names', 'Log_ÜT_Norm')) ** exponent);

        return g.WENN(leistung > 0, leistung, 0);
      });

      /**
       * Row 15: Cast iron radiator type (from IN_rooms)
       * Original Excel formula: "IF(IN_rooms!R$49=\"Gliederheizkörper\",IN_rooms!R$49,\"\")"
       */
      grid.setCell('clc_power', `${clcPowerCol}15`, (s, c, g) =>
        g.WENN(
          g.g('IN_rooms', `${roomCol}49`) === "Gliederheizkörper",
          g.g('IN_rooms', `${roomCol}49`),
          ""
        )
      );

      /**
       * Row 16: Radiator subtype (from IN_rooms)
       * Original Excel formula: "IN_rooms!R$50"
       */
      grid.setCell('clc_power', `${clcPowerCol}16`, (s, c, g) =>
        g.g('IN_rooms', `${roomCol}50`)
      );

      /**
       * Row 17: Radiator height (from IN_rooms)
       * Original Excel formula: "IN_rooms!R$51"
       */
      grid.setCell('clc_power', `${clcPowerCol}17`, (s, c, g) =>
        g.g('IN_rooms', `${roomCol}51`)
      );

      /**
       * Row 18: Radiator depth calculation based on type
       * Original Excel formula: "_xlfn.IFS(IN_rooms!R$53=0,0,
       *  G16 = \"Stahlradiator\",
       *  INDEX(Daten!$AF$13:$AF$23,_xlfn.XMATCH(MIN(IF(Daten!$AE$13:$AE$23=G17,ABS(Daten!$AF$13:$AF$23-IN_rooms!R$53))),
       *                                  IF(Daten!$AE$13:$AE$23=G17,ABS(Daten!$AF$13:$AF$23-IN_rooms!R$53)),
       *                                  0)),
       *  G16 = \"Gussradiator\",
       *  INDEX(Daten!$AD$13:$AD$25,_xlfn.XMATCH(MIN(IF(Daten!$AC$13:$AC$25=G17,ABS(Daten!$AD$13:$AD$25-IN_rooms!R$53))),
       *                                   IF(Daten!$AC$13:$AC$25=G17,ABS(Daten!$AD$13:$AD$25-IN_rooms!R$53)),
       *                                   0)),
       *  TRUE, IN_rooms!R$53)"
       */
      grid.setCell('clc_power', `${clcPowerCol}18`, (s, c, g) => {
        const radius = g.n("IN_rooms", `${roomCol}53`);
        const typ = g.g(s, `${clcPowerCol}16`);
        const size = g.g(s, `${clcPowerCol}17`);

        return g.WENNS(
          radius === 0, 0,

          typ === "Stahlradiator", (() => {
            const rawValues = g.RANGE("Daten!AF13:AF23", s).map(Number);
            const condition = g.GLEICH(g.RANGE("Daten!AE13:AE23", s), size);
            const filtered = g.WENN_ARRAY(condition, g.ABS_ARRAY(rawValues.map(v => v - radius)));
            const idx = g.MIN_INDEX(filtered);
            return rawValues[idx];
          })(),

          typ === "Gussradiator", (() => {
            const rawValues = g.RANGE("Daten!AD13:AD25", s).map(Number);
            const condition = g.GLEICH(g.RANGE("Daten!AC13:AC25", s), size);
            const filtered = g.WENN_ARRAY(condition, g.ABS_ARRAY(rawValues.map(v => v - radius)));
            const idx = g.MIN_INDEX(filtered);
            return rawValues[idx];
          })(),

          g.WAHR(), radius
        );
      });

      /**
       * Row 19: Number of elements from IN_rooms
       * Original Excel formula: "IN_rooms!R$54"
       */
      grid.setCell('clc_power', `${clcPowerCol}19`, (s, c, g) =>
        g.g('IN_rooms', `${roomCol}54`)
      );

      /**
       * Row 20: Radiator exponent fixed value
       * Original Excel formula: "1.3"
       */
      grid.setCell('clc_power', `${clcPowerCol}20`, (s, c, g) => 1.3);

      /**
       * Row 21: Cast iron radiator power at 75/65/20
       * Original Excel formula: "_xlfn.LET(
       *   _xlpm.wärmeleistung, SUMIFS(
       *     INDIRECT(\"tabelle1[Wärmeleistung (75/65/20)  in W/Glied]\"),
       *     INDIRECT(\"tabelle1[Heizkörper_Typ]\"), clc_power!G$15,
       *     INDIRECT(\"tabelle1[Heizkörper_Subtyp]\"), clc_power!G$16,
       *     INDIRECT(\"tabelle1[Höhe H in mm]\"), clc_power!G$17,
       *     INDIRECT(\"tabelle1[Bautiefe T in mm]\"), clc_power!G$18
       *   ),
       *   _xlpm.leistung, IN_rooms!R$55 * _xlpm.wärmeleistung * G$19,
       *   IF(_xlpm.leistung > 0, _xlpm.leistung, 0)
       * )"
       */
      grid.setCell('clc_power', `${clcPowerCol}21`, (s, c, g) => {
        // Calculate using LET equivalent
        let wärmeleistung = g.SUMMEWENNS(
          g.INDIREKT_DB_REF("tabelle1", "Wärmeleistung (75/65/20)  in W/Glied"),
          g.INDIREKT_DB_REF("tabelle1", "Heizkörper_Typ"), [g.g(s, `${clcPowerCol}15`)],
          g.INDIREKT_DB_REF("tabelle1", "Heizkörper_Subtyp"), [g.g(s, `${clcPowerCol}16`)],
          g.INDIREKT_DB_REF("tabelle1", "Höhe H in mm"), [g.g(s, `${clcPowerCol}17`)],
          g.INDIREKT_DB_REF("tabelle1", "Bautiefe T in mm"), [g.g(s, `${clcPowerCol}18`)]
        );

        let leistung = g.n('IN_rooms', `${roomCol}55`) * wärmeleistung * g.n(s, `${clcPowerCol}19`);

        return g.WENN(leistung > 0, leistung, 0);
      });

      /**
       * Row 22: Target flow temperature from Named cell
       * Original Excel formula: "TVL_Ziel"
       */
      grid.setCell('clc_power', `${clcPowerCol}22`, (s, c, g) =>
        g.g('Names', 'TVL_Ziel')
      );

      /**
       * Row 23: Target return temperature from Named cell
       * Original Excel formula: "TRL_Ziel"
       */
      grid.setCell('clc_power', `${clcPowerCol}23`, (s, c, g) =>
        g.g('Names', 'TRL_Ziel')
      );

      /**
       * Row 24: Logarithmic mean temperature difference
       * Original Excel formula: "(G$22-G$23)/(LN((G$22-clc_load!I$10)/(G$23-clc_load!I$10)))"
       */
      grid.setCell('clc_power', `${clcPowerCol}24`, (s, c, g) => {
        // Using Excel formula structure directly
        return (g.n(s, `${clcPowerCol}22`) - g.n(s, `${clcPowerCol}23`)) /
               g.LN((g.n(s, `${clcPowerCol}22`) - g.n('clc_load', `${clcLoadCol}10`)) /
                    (g.n(s, `${clcPowerCol}23`) - g.n('clc_load', `${clcLoadCol}10`)));
      });

      /**
       * Row 25: Cast iron radiator power at heat pump temperatures
       * Original Excel formula: "IF(G$21*((G$24/Log_ÜT_Norm)^G$20)>0,G$21*((G$24/Log_ÜT_Norm)^G$20),0)"
       */
      grid.setCell('clc_power', `${clcPowerCol}25`, (s, c, g) =>
        g.WENN(
          g.n(s, `${clcPowerCol}21`) * ((g.n(s, `${clcPowerCol}24`) / g.n('Names', 'Log_ÜT_Norm')) ** g.n(s, `${clcPowerCol}20`)) > 0,
          g.n(s, `${clcPowerCol}21`) * ((g.n(s, `${clcPowerCol}24`) / g.n('Names', 'Log_ÜT_Norm')) ** g.n(s, `${clcPowerCol}20`)),
          0
        )
      );

      /**
       * Row 26: Alternative radiator calculation
       * Original Excel formula: "_xlfn.LET(
       *   _xlpm.typ, "Flachheizkoerper_senkrecht_profiliert",
       *   _xlpm.subtyp, "Typ_33",
       *   _xlpm.höhe, _xlfn.XLOOKUP(G$17, Data_radiator!$G$5:$G$32, Data_radiator!$G$5:$G$32, 1000000, 1, 1),
       *   _xlpm.tiefe, 155,
       *   _xlpm.glieder, G$19,
       *   _xlpm.radiatorart, G$16,
       *   _xlpm.tempfaktor, IF(_xlpm.radiatorart = "Gussradiator", 50, 60),
       *   _xlpm.überschuss, G$24,
       *   _xlpm.leistung, IN_rooms!R$55 *
       *     SUMIFS(
       *       INDIRECT("tabelle1[Wärmeleistung (75/65/20)  in W/m]"),
       *       INDIRECT("tabelle1[Heizkörper_Typ]"), _xlpm.typ,
       *       INDIRECT("tabelle1[Heizkörper_Subtyp]"), _xlpm.subtyp,
       *       INDIRECT("tabelle1[Höhe H in mm]"), _xlpm.höhe,
       *       INDIRECT("tabelle1[Bautiefe T in mm]"), _xlpm.tiefe
       *     ) *
       *     ((_xlpm.glieder * _xlpm.tempfaktor / 1000) *
       *     ((_xlpm.überschuss / Log_ÜT_Norm) ^
       *       SUMIFS(
       *         INDIRECT("tabelle1[Heizkörperexponent n ]"),
       *         INDIRECT("tabelle1[Heizkörper_Typ]"), _xlpm.typ,
       *         INDIRECT("tabelle1[Heizkörper_Subtyp]"), _xlpm.subtyp,
       *         INDIRECT("tabelle1[Höhe H in mm]"), _xlpm.höhe,
       *         INDIRECT("tabelle1[Bautiefe T in mm]"), _xlpm.tiefe
       *       )
       *     )
       *   ),
       *   IF(_xlpm.leistung > 0, _xlpm.leistung, 0)
       * )"
       */
      grid.setCell('clc_power', `${clcPowerCol}26`, (s, c, g) => {
        // Using JavaScript let variables to match Excel LET function
        let typ = "Flachheizkoerper_senkrecht_profiliert";
        let subtyp = "Typ_33";
        let höhe = g.XVERWEIS(
          g.n(s, `${clcPowerCol}17`),
          g.getCells('Data_radiator', 'G5', 'G32').flat(),
          g.getCells('Data_radiator', 'G5', 'G32').flat(),
          { ifNotFound: 1000000, matchMode: 'exactOrNextSmaller', searchMode: 'first' }
        );
        let tiefe = 155;
        let glieder = g.n(s, `${clcPowerCol}19`);
        let radiatorart = g.g(s, `${clcPowerCol}16`);
        let tempfaktor = g.WENN(radiatorart === "Gussradiator", 50, 60);
        let überschuss = g.n(s, `${clcPowerCol}24`);

        // Calculate the radiator exponent using SUMIFS
        let exponent = g.SUMMEWENNS(
          g.INDIREKT_DB_REF("tabelle1", "Heizkörperexponent n "),
          g.INDIREKT_DB_REF("tabelle1", "Heizkörper_Typ"), [typ],
          g.INDIREKT_DB_REF("tabelle1", "Heizkörper_Subtyp"), [subtyp],
          g.INDIREKT_DB_REF("tabelle1", "Höhe H in mm"), [höhe ?? 0],
          g.INDIREKT_DB_REF("tabelle1", "Bautiefe T in mm"), [tiefe]
        );

        // Calculate the radiator power
        let leistung = g.n('IN_rooms', `${roomCol}55`) * g.SUMMEWENNS(
          g.INDIREKT_DB_REF("tabelle1", "Wärmeleistung (75/65/20)  in W/m"),
          g.INDIREKT_DB_REF("tabelle1", "Heizkörper_Typ"), [typ],
          g.INDIREKT_DB_REF("tabelle1", "Heizkörper_Subtyp"), [subtyp],
          g.INDIREKT_DB_REF("tabelle1", "Höhe H in mm"), [höhe ?? 0],
          g.INDIREKT_DB_REF("tabelle1", "Bautiefe T in mm"), [tiefe]
        ) * (
          (glieder * tempfaktor / 1000) *
          ((überschuss / g.n('Names', 'Log_ÜT_Norm')) ** exponent)
        );

        return g.WENN(leistung > 0, leistung, 0);
      });

      /**
       * Row 27: Is radiator type "Rohrradiator"?
       * Original Excel formula: "IF(IN_rooms!S$49="Rohrradiator",IN_rooms!S$49,"")"
       */
      grid.setCell('clc_power', `${clcPowerCol}27`, (s, c, g) =>
        g.WENN(g.g('IN_rooms', `${roomCol}49`) === "Rohrradiator",
               g.g('IN_rooms', `${roomCol}49`),
               "")
      );

      /**
       * Row 28: Radiator subtype for tube radiator
       * Original Excel formula: "IF(H$27=\"\",\"\",IN_rooms!S$50)"
       */
      grid.setCell('clc_power', `${clcPowerCol}28`, (s, c, g) =>
        g.WENN(g.g(s, `${clcPowerCol}27`) === "",
               "",
               g.g('IN_rooms', `${roomCol}50`))
      );

      /**
       * Row 29: Height for tube radiator
       * Original Excel formula: "IF(H$27=\"\",\"\",IN_rooms!S$51)"
       */
      grid.setCell('clc_power', `${clcPowerCol}29`, (s, c, g) =>
        g.WENN(g.g(s, `${clcPowerCol}27`) === "",
               "",
               g.g('IN_rooms', `${roomCol}51`))
      );

      /**
       * Row 30: Number of elements for tube radiator
       * Original Excel formula: "IF(H$27=\"\",\"\",IN_rooms!S$52)"
       */
      grid.setCell('clc_power', `${clcPowerCol}30`, (s, c, g) =>
        g.WENN(g.g(s, `${clcPowerCol}27`) === "",
               "",
               g.g('IN_rooms', `${roomCol}52`))
      );

      /**
       * Row 31: Tube radiator type from table
       * Original Excel formula: "IF(H$28=\"\",\"\",SUMIFS(
       *   INDIRECT(\"tabelle1[Rohrdurchmesser in mm]\"),
       *   INDIRECT(\"tabelle1[Heizkörper_Typ]\"),H$27,
       *   INDIRECT(\"tabelle1[Heizkörper_Subtyp]\"),H$28
       * ))"
       */
      grid.setCell('clc_power', `${clcPowerCol}31`, (s, c, g) =>
        g.WENN(g.g(s, `${clcPowerCol}28`) === "",
               "",
               g.SUMMEWENNS(
                 g.INDIREKT_DB_REF("tabelle1", "Rohrdurchmesser in mm"),
                 g.INDIREKT_DB_REF("tabelle1", "Heizkörper_Typ"), [g.g(s, `${clcPowerCol}27`)],
                 g.INDIREKT_DB_REF("tabelle1", "Heizkörper_Subtyp"), [g.g(s, `${clcPowerCol}28`)]
               ))
      );

      /**
       * Row 32: Tube radiator elements
       * Original Excel formula: "IN_rooms!R$54"
       */
      grid.setCell('clc_power', `${clcPowerCol}32`, (s, c, g) =>
        g.g('IN_rooms', `${roomCol}54`)
      );

      /**
       * Row 33: Radiator exponent based on radiator type
       * Original Excel formula: "_xlfn.IFS(
       *   G$28 = \"Stahlrohrradiator\", 1.3,
       *   G$28= \"Fensterbankradiator\", 1.3,
       *   G$28 = \"Handtuchradiator\", 1.21,
       *   G$27 = \"\", 0
       * )"
       */
      grid.setCell('clc_power', `${clcPowerCol}33`, (s, c, g) =>
        g.WENNS(
          g.g(s, `${clcPowerCol}28`) === "Stahlrohrradiator", 1.3,
          g.g(s, `${clcPowerCol}28`) === "Fensterbankradiator", 1.3,
          g.g(s, `${clcPowerCol}28`) === "Handtuchradiator", 1.21,
          g.g(s, `${clcPowerCol}27`) === "", 0,
          // Default
          0
        )
      );

      /**
       * Row 34: Radiator power calculation for different types
       * Original Excel formula: "_xlfn.LET(
       *   _xlpm.typ, clc_power!H$27,
       *   _xlpm.subtyp, clc_power!H$28,
       *   _xlpm.höhe, clc_power!H$29,
       *   _xlpm.breite, clc_power!H$30,
       *   _xlpm.tiefe, clc_power!H$31,
       *   _xlpm.faktor, clc_power!H$32,
       *   _xlpm.fläche, IN_rooms!S$51 * IN_rooms!S$52,
       *   _xlpm.radiatorart, H$28,
       *   _xlpm.leistung, _xlfn.IFS(
       *     _xlpm.radiatorart = "Stahlrohrradiator",
       *       _xlpm.faktor * SUMIFS(
       *         INDIRECT("tabelle1[Wärmeleistung (75/65/20)  in W/Glied]"),
       *         INDIRECT("tabelle1[Heizkörper_Typ]"), _xlpm.typ,
       *         INDIRECT("tabelle1[Heizkörper_Subtyp]"), _xlpm.subtyp,
       *         INDIRECT("tabelle1[Höhe H in mm]"), _xlpm.höhe,
       *         INDIRECT("tabelle1[Bautiefe T in mm]"), _xlpm.tiefe
       *       ),
       *     _xlpm.radiatorart = "Handtuchradiator",
       *       919 * (_xlpm.fläche / 10^6) + 76.691,
       *     _xlpm.radiatorart = "Fensterbankradiator",
       *       SUMIFS(
       *         INDIRECT("tabelle1[Wärmeleistung (75/65/20)  in W]"),
       *         INDIRECT("tabelle1[Heizkörper_Typ]"), _xlpm.typ,
       *         INDIRECT("tabelle1[Heizkörper_Subtyp]"), _xlpm.subtyp,
       *         INDIRECT("tabelle1[Höhe H in mm]"), _xlpm.höhe,
       *         INDIRECT("tabelle1[Breite B in mm]"), _xlpm.breite,
       *         INDIRECT("tabelle1[Bautiefe T in mm]"), _xlpm.tiefe
       *       ),
       *     _xlpm.typ = "", 0
       *   ),
       *   IF(IN_rooms!S$55 * _xlpm.leistung > 0, IN_rooms!S$55 * _xlpm.leistung, 0)
       * )"
       */
      grid.setCell('clc_power', `${clcPowerCol}34`, (s, c, g) => {
        // Using JavaScript let variables to match Excel LET function
        let typ = g.g(s, `${clcPowerCol}27`);
        let subtyp = g.g(s, `${clcPowerCol}28`);
        let höhe = g.g(s, `${clcPowerCol}29`);
        let breite = g.g(s, `${clcPowerCol}30`);
        let tiefe = g.g(s, `${clcPowerCol}31`);
        let faktor = g.n(s, `${clcPowerCol}32`);
        let fläche = g.n('IN_rooms', `${roomCol}51`) * g.n('IN_rooms', `${roomCol}52`);
        let radiatorart = g.g(s, `${clcPowerCol}28`);

        // Implement the IFS function using WENNS
        let leistung = g.WENNS(
          radiatorart === "Stahlrohrradiator",
          faktor * g.SUMMEWENNS(
            g.INDIREKT_DB_REF("tabelle1", "Wärmeleistung (75/65/20)  in W/Glied"),
            g.INDIREKT_DB_REF("tabelle1", "Heizkörper_Typ"), [typ],
            g.INDIREKT_DB_REF("tabelle1", "Heizkörper_Subtyp"), [subtyp],
            g.INDIREKT_DB_REF("tabelle1", "Höhe H in mm"), [höhe],
            g.INDIREKT_DB_REF("tabelle1", "Bautiefe T in mm"), [tiefe]
          ),

          radiatorart === "Handtuchradiator",
          919 * (fläche / (10 ** 6)) + 76.691,

          radiatorart === "Fensterbankradiator",
          g.SUMMEWENNS(
            g.INDIREKT_DB_REF("tabelle1", "Wärmeleistung (75/65/20)  in W"),
            g.INDIREKT_DB_REF("tabelle1", "Heizkörper_Typ"), [typ],
            g.INDIREKT_DB_REF("tabelle1", "Heizkörper_Subtyp"), [subtyp],
            g.INDIREKT_DB_REF("tabelle1", "Höhe H in mm"), [höhe],
            g.INDIREKT_DB_REF("tabelle1", "Breite B in mm"), [breite],
            g.INDIREKT_DB_REF("tabelle1", "Bautiefe T in mm"), [tiefe]
          ),

          typ === "",
          0,

          // Default case
          0
        );

        // Final check for valid calculation result
        return g.WENN(g.n('IN_rooms', `${roomCol}55`) * leistung > 0,
                      g.n('IN_rooms', `${roomCol}55`) * leistung,
                      0);
      });

      /**
       * Row 35: Target flow temperature from Named cell
       * Original Excel formula: "TVL_Ziel"
       */
      grid.setCell('clc_power', `${clcPowerCol}35`, (s, c, g) =>
        g.g('Names', 'TVL_Ziel')

      );

      /**
       * Row 36: Return temperature (from Named cell)
       * Original Excel formula: "TRL_Ziel"
       */
      grid.setCell('clc_power', `${clcPowerCol}36`, (s, c, g) =>
        g.g('Names', 'TRL_Ziel')
      );

      /**
       * Row 37: Logarithmic mean temperature difference for return temperature
       * Original Excel formula: "(H$35-H$36)/(LN((H$35-clc_load!J$10)/(clc_power!H$36-clc_load!J$10)))"
       */
      grid.setCell('clc_power', `${clcPowerCol}37`, (s, c, g) => {
        const logNumerator = g.n(s, `${clcPowerCol}35`) - g.n('clc_load', `${clcLoadCol}10`);
        const logDenominator = g.n(s, `${clcPowerCol}36`) - g.n('clc_load', `${clcLoadCol}10`);
        const logInput = logNumerator / logDenominator;

        if (logInput <= 0) {
          // Handle case where LN log input is negative or zero
          return 0;
        }

        return (g.n(s, `${clcPowerCol}35`) - g.n(s, `${clcPowerCol}36`)) / g.LN(logInput);
      });

      /**
       * Row 38: Tube radiator power at heat pump temperatures
       * Original Excel formula: "IF(H$34*((H$37/Log_ÜT_Norm)^H$33)>0,H$34*((H$37/Log_ÜT_Norm)^H$33),0)"
       */
      grid.setCell('clc_power', `${clcPowerCol}38`, (s, c, g) => {
        // Calculate power adjustment with temperature factor
        let power = g.n(s, `${clcPowerCol}34`) *
                  ((g.n(s, `${clcPowerCol}37`) / g.n('Names', 'Log_ÜT_Norm')) ** g.n(s, `${clcPowerCol}33`));

        // Return power if positive, otherwise 0
        return g.WENN(power > 0, power, 0);
      });

      /**
       * Row 39: Alternate radiator calculation
       * Original Excel formula: "_xlfn.LET(
       *   _xlpm.typ, "Flachheizkoerper_senkrecht_profiliert",
       *   _xlpm.subtyp, "Typ_33",
       *   _xlpm.höhe, _xlfn.XLOOKUP(H$29, Data_radiator!$G$5:$G$32, Data_radiator!$G$5:$G$32, 1000000, 1, 1),
       *   _xlpm.tiefe, 155,
       *   _xlpm.glieder, IF(H$28 = "Stahlrohrradiator", 45, H$30),
       *   _xlpm.faktor, H$37 / Log_ÜT_Norm,
       *   _xlpm.leistung, IN_rooms!S$55 *
       *     SUMIFS(
       *       INDIRECT("tabelle1[Wärmeleistung (75/65/20)  in W/m]"),
       *       INDIRECT("tabelle1[Heizkörper_Typ]"), _xlpm.typ,
       *       INDIRECT("tabelle1[Heizkörper_Subtyp]"), _xlpm.subtyp,
       *       INDIRECT("tabelle1[Höhe H in mm]"), _xlpm.höhe,
       *       INDIRECT("tabelle1[Bautiefe T in mm]"), _xlpm.tiefe
       *     ) *
       *     (_xlpm.glieder / 1000) *
       *     _xlpm.faktor ^
       *     SUMIFS(
       *       INDIRECT("tabelle1[Heizkörperexponent n ]"),
       *       INDIRECT("tabelle1[Heizkörper_Typ]"), _xlpm.typ,
       *       INDIRECT("tabelle1[Heizkörper_Subtyp]"), _xlpm.subtyp,
       *       INDIRECT("tabelle1[Höhe H in mm]"), _xlpm.höhe,
       *       INDIRECT("tabelle1[Bautiefe T in mm]"), _xlpm.tiefe
       *     ),
       *   IF(_xlpm.leistung > 0, _xlpm.leistung, 0)
       * )"
       */
      grid.setCell('clc_power', `${clcPowerCol}39`, (s, c, g) => {
        // Using JavaScript let variables to match Excel LET function
        let typ = "Flachheizkoerper_senkrecht_profiliert";
        let subtyp = "Typ_33";
        let höhe = g.XVERWEIS(
          g.n(s, `${clcPowerCol}29`),
          g.getCells('Data_radiator', 'G5', 'G32').flat(),
          g.getCells('Data_radiator', 'G5', 'G32').flat(),
          { ifNotFound: 1000000, matchMode: 'exactOrNextSmaller', searchMode: 'first' }
        );
        let tiefe = 155;
        let glieder = g.WENN(g.g(s, `${clcPowerCol}28`) === "Stahlrohrradiator", 45, g.n(s, `${clcPowerCol}30`));
        let faktor = g.n(s, `${clcPowerCol}37`) / g.n('Names', 'Log_ÜT_Norm');

        // Calculate the radiator exponent using SUMIFS
        let exponent = g.SUMMEWENNS(
          g.INDIREKT_DB_REF("tabelle1", "Heizkörperexponent n "),
          g.INDIREKT_DB_REF("tabelle1", "Heizkörper_Typ"), [typ],
          g.INDIREKT_DB_REF("tabelle1", "Heizkörper_Subtyp"), [subtyp],
          g.INDIREKT_DB_REF("tabelle1", "Höhe H in mm"), [höhe ?? 0],
          g.INDIREKT_DB_REF("tabelle1", "Bautiefe T in mm"), [tiefe]
        );

        // Calculate the radiator power
        let leistung = g.n('IN_rooms', `${roomCol}55`) * g.SUMMEWENNS(
          g.INDIREKT_DB_REF("tabelle1", "Wärmeleistung (75/65/20)  in W/m"),
          g.INDIREKT_DB_REF("tabelle1", "Heizkörper_Typ"), [typ],
          g.INDIREKT_DB_REF("tabelle1", "Heizkörper_Subtyp"), [subtyp],
          g.INDIREKT_DB_REF("tabelle1", "Höhe H in mm"), [höhe ?? 0],
          g.INDIREKT_DB_REF("tabelle1", "Bautiefe T in mm"), [tiefe]
        ) * (glieder / 1000) * (faktor ** exponent);

        return g.WENN(leistung > 0, leistung, 0);
      });

      /**
       * Row 40: Sufficient power for room (yes/no)
       * Original Excel formula: "IF(OR(H$14=1,H$35>=clc_load!J$19),\"Ja\",\"Nein\")"
       */
      grid.setCell('clc_power', `${clcPowerCol}40`, (s, c, g) =>
        g.WENN(
          g.ODER(
            g.n(s, `${clcPowerCol}14`) === 1,
            g.n(s, `${clcPowerCol}35`) >= g.n('clc_load', `${clcLoadCol}19`)
          ),
          "Ja",
          "Nein"
        )
      );

      /**
       * Row 41: Required power for room from load calculation
       * Original Excel formula: "clc_load!J$19"
       */
      grid.setCell('clc_power', `${clcPowerCol}41`, (s, c, g) =>
        g.n('clc_load', `${clcLoadCol}19`)
      );

      /**
       * Row 42: Actual power available with heat pump
       * Original Excel formula: "H$35"
       */
      grid.setCell('clc_power', `${clcPowerCol}42`, (s, c, g) =>
        g.n(s, `${clcPowerCol}35`)
      );

      /**
       * Row 43: Power deficit (negative) or surplus (positive)
       * Original Excel formula: "H$35-H$41"
       */
      grid.setCell('clc_power', `${clcPowerCol}43`, (s, c, g) =>
        g.n(s, `${clcPowerCol}35`) - g.n(s, `${clcPowerCol}41`)
      );

      /**
       * Row 44: Deficit percentage (negative = deficit, positive = surplus)
       * Original Excel formula: "IF(H$41>0,(H$35-H$41)/H$41,0)"
       */
      grid.setCell('clc_power', `${clcPowerCol}44`, (s, c, g) =>
        g.WENN(
          g.n(s, `${clcPowerCol}41`) > 0,
          (g.n(s, `${clcPowerCol}35`) - g.n(s, `${clcPowerCol}41`)) / g.n(s, `${clcPowerCol}41`),
          0
        )
      );

      /**
       * Row 45: Heating system sufficient for target temperature? (0 = insufficient, 1 = sufficient)
       * Original Excel formula: "IF(H$44>=-0.1,1,0)"
       */
      grid.setCell('clc_power', `${clcPowerCol}45`, (s, c, g) =>
        g.WENN(
          g.n(s, `${clcPowerCol}44`) >= -0.1,
          1,
          0
        )
      );

      /**
       * Row 54: Convector type (from IN_rooms)
       * Original Excel formula: "IF(IN_rooms!R$49=\"Konvektor\",IN_rooms!R$49,\"\")"
       */
      grid.setCell('clc_power', `${clcPowerCol}54`, (s, c, g) =>
        g.WENN(
          g.g('IN_rooms', `${roomCol}49`) === "Konvektor",
          g.g('IN_rooms', `${roomCol}49`),
          ""
        )
      );

      /**
       * Row 55: Convector subtype
       * Original Excel formula: "IF(G54>\"\",\"Standardkonvektor\",\"\")"
       */
      grid.setCell('clc_power', `${clcPowerCol}55`, (s, c, g) =>
        g.WENN(
          g.g(s, `${clcPowerCol}54`) > "",
          "Standardkonvektor",
          ""
        )
      );

      /**
       * Row 56: Height (from IN_rooms)
       * Original Excel formula: "IN_rooms!R$51"
       */
      grid.setCell('clc_power', `${clcPowerCol}56`, (s, c, g) =>
        g.g('IN_rooms', `${roomCol}51`)
      );

      /**
       * Row 57: Factor (from IN_rooms)
       * Original Excel formula: "IN_rooms!R$52"
       */
      grid.setCell('clc_power', `${clcPowerCol}57`, (s, c, g) =>
        g.g('IN_rooms', `${roomCol}52`)
      );

      /**
       * Row 58: Depth (from IN_rooms)
       * Original Excel formula: "IN_rooms!R$53"
       */
      grid.setCell('clc_power', `${clcPowerCol}58`, (s, c, g) =>
        g.g('IN_rooms', `${roomCol}53`)
      );

      /**
       * Row 59: Radiator exponent for convector
       * Original Excel formula: "_xlfn.LET(
       *   _xlpm.typ, clc_power!G$54,
       *   _xlpm.subtyp, clc_power!G$55,
       *   _xlpm.höhe, clc_power!G$56,
       *   _xlpm.tiefe, clc_power!G$58,
       *   SUMIFS(
       *     INDIRECT(\"tabelle1[Heizkörperexponent n ]\"),
       *     INDIRECT(\"tabelle1[Heizkörper_Typ]\"), _xlpm.typ,
       *     INDIRECT(\"tabelle1[Heizkörper_Subtyp]\"), _xlpm.subtyp,
       *     INDIRECT(\"tabelle1[Höhe H in mm]\"), _xlpm.höhe,
       *     INDIRECT(\"tabelle1[Bautiefe T in mm]\"), _xlpm.tiefe
       *   )
       * )"
       */
      grid.setCell('clc_power', `${clcPowerCol}59`, (s, c, g) => {
        // Using JavaScript let variables to implement Excel LET
        let typ = g.g(s, `${clcPowerCol}54`);
        let subtyp = g.g(s, `${clcPowerCol}55`);
        let höhe = g.g(s, `${clcPowerCol}56`);
        let tiefe = g.g(s, `${clcPowerCol}58`);

        // Return the SUMIFS result
        return g.SUMMEWENNS(
          g.INDIREKT_DB_REF("tabelle1", "Heizkörperexponent n "),
          g.INDIREKT_DB_REF("tabelle1", "Heizkörper_Typ"), [typ],
          g.INDIREKT_DB_REF("tabelle1", "Heizkörper_Subtyp"), [subtyp],
          g.INDIREKT_DB_REF("tabelle1", "Höhe H in mm"), [höhe],
          g.INDIREKT_DB_REF("tabelle1", "Bautiefe T in mm"), [tiefe]
        );
      });

      /**
       * Row 60: Convector power calculation
       * Original Excel formula: "_xlfn.LET(
       *   _xlpm.bedarf, IN_rooms!R$55,
       *   _xlpm.typ, clc_power!G$54,
       *   _xlpm.subtyp, clc_power!G$55,
       *   _xlpm.höhe, clc_power!G$56,
       *   _xlpm.faktor, clc_power!G$57,
       *   _xlpm.tiefe, clc_power!G$58,
       *   _xlpm.leistung, _xlpm.bedarf *
       *     SUMIFS(
       *       INDIRECT(\"tabelle1[Wärmeleistung (75/65/20)  in W/m]\"),
       *       INDIRECT(\"tabelle1[Heizkörper_Typ]\"), _xlpm.typ,
       *       INDIRECT(\"tabelle1[Heizkörper_Subtyp]\"), _xlpm.subtyp,
       *       INDIRECT(\"tabelle1[Höhe H in mm]\"), _xlpm.höhe,
       *       INDIRECT(\"tabelle1[Bautiefe T in mm]\"), _xlpm.tiefe
       *     ) * _xlpm.faktor / 1000,
       *   IF(_xlpm.leistung > 0, _xlpm.leistung, 0)
       * )"
       */
      grid.setCell('clc_power', `${clcPowerCol}60`, (s, c, g) => {
        // Using JavaScript let variables to implement Excel LET
        let bedarf = g.n('IN_rooms', `${roomCol}55`);
        let typ = g.g(s, `${clcPowerCol}54`);
        let subtyp = g.g(s, `${clcPowerCol}55`);
        let höhe = g.g(s, `${clcPowerCol}56`);
        let faktor = g.n(s, `${clcPowerCol}57`);
        let tiefe = g.g(s, `${clcPowerCol}58`);

        // Calculate the leistung (power)
        let leistung = bedarf *
          g.SUMMEWENNS(
            g.INDIREKT_DB_REF("tabelle1", "Wärmeleistung (75/65/20)  in W/m"),
            g.INDIREKT_DB_REF("tabelle1", "Heizkörper_Typ"), [typ],
            g.INDIREKT_DB_REF("tabelle1", "Heizkörper_Subtyp"), [subtyp],
            g.INDIREKT_DB_REF("tabelle1", "Höhe H in mm"), [höhe],
            g.INDIREKT_DB_REF("tabelle1", "Bautiefe T in mm"), [tiefe]
          ) * faktor / 1000;

        // Return power if positive, otherwise 0
        return g.WENN(leistung > 0, leistung, 0);
      });

      /**
       * Row 61: Target flow temperature from Named cell
       * Original Excel formula: "TVL_Ziel"
       */
      grid.setCell('clc_power', `${clcPowerCol}61`, (s, c, g) =>
        g.g('Names', 'TVL_Ziel')
      );

      /**
       * Row 62: Target return temperature from Named cell
       * Original Excel formula: "TRL_Ziel"
       */
      grid.setCell('clc_power', `${clcPowerCol}62`, (s, c, g) =>
        g.g('Names', 'TRL_Ziel')
      );

      /**
       * Row 63: Logarithmic mean temperature difference
       * Original Excel formula: "(G$61-G$62)/(LN((G$61-clc_load!I$10)/(clc_power!G$62-clc_load!I$10)))"
       */
      grid.setCell('clc_power', `${clcPowerCol}63`, (s, c, g) =>
        (g.n(s, `${clcPowerCol}61`) - g.n(s, `${clcPowerCol}62`)) /
        g.LN((g.n(s, `${clcPowerCol}61`) - g.n('clc_load', `${clcLoadCol}10`)) /
             (g.n(s, `${clcPowerCol}62`) - g.n('clc_load', `${clcLoadCol}10`)))
      );

      /**
       * Row 64: Convector power at target temperature
       * Original Excel formula: "IF(G$60*((G$63/Log_ÜT_Norm)^G$59)>0,
       * G$60*((G$63/Log_ÜT_Norm)^G$59),0)"
       */
      grid.setCell('clc_power', `${clcPowerCol}64`, (s, c, g) => {
        let power = g.n(s, `${clcPowerCol}60`) *
                  ((g.n(s, `${clcPowerCol}63`) / g.n('Names', 'Log_ÜT_Norm')) ** g.n(s, `${clcPowerCol}59`));

        return g.WENN(power > 0, power, 0);
      });

      /**
       * Row 65: Alternative convector calculation
       * Original Excel formula: "_xlfn.LET(
       *   _xlpm.typ, \"Flachheizkoerper_senkrecht_profiliert\",
       *   _xlpm.subtyp, \"Typ_33\",
       *   _xlpm.höhe, _xlfn.XLOOKUP(G$56, Data_radiator!$G$5:$G$32, Data_radiator!$G$5:$G$32, 1000000, 1, 1),
       *   _xlpm.tiefe, 155,
       *   _xlpm.faktor, G$57 / 1000,
       *   _xlpm.exponentFaktor, G$63 / Log_ÜT_Norm,
       *   _xlpm.bedarf, IN_rooms!R$55,
       *   _xlpm.exponent, SUMIFS(
       *     INDIRECT(\"tabelle1[Heizkörperexponent n ]\"),
       *     INDIRECT(\"tabelle1[Heizkörper_Typ]\"), _xlpm.typ,
       *     INDIRECT(\"tabelle1[Heizkörper_Subtyp]\"), _xlpm.subtyp,
       *     INDIRECT(\"tabelle1[Höhe H in mm]\"), _xlpm.höhe,
       *     INDIRECT(\"tabelle1[Bautiefe T in mm]\"), _xlpm.tiefe
       *   ),
       *   _xlpm.leistung, _xlpm.bedarf *
       *     SUMIFS(
       *       INDIRECT(\"tabelle1[Wärmeleistung (75/65/20)  in W/m]\"),
       *       INDIRECT(\"tabelle1[Heizkörper_Typ]\"), _xlpm.typ,
       *       INDIRECT(\"tabelle1[Heizkörper_Subtyp]\"), _xlpm.subtyp,
       *       INDIRECT(\"tabelle1[Höhe H in mm]\"), _xlpm.höhe,
       *       INDIRECT(\"tabelle1[Bautiefe T in mm]\"), _xlpm.tiefe
       *     ) * _xlpm.faktor * (_xlpm.exponentFaktor ^ _xlpm.exponent),
       *   IF(_xlpm.leistung > 0, _xlpm.leistung, 0)
       * )"
       */
      grid.setCell('clc_power', `${clcPowerCol}65`, (s, c, g) => {
        // Using JavaScript let variables to match Excel LET function
        let typ = "Flachheizkoerper_senkrecht_profiliert";
        let subtyp = "Typ_33";
        let höhe = g.XVERWEIS(
          g.n(s, `${clcPowerCol}56`),
          g.getCells('Data_radiator', 'G5', 'G32').flat(),
          g.getCells('Data_radiator', 'G5', 'G32').flat(),
          { ifNotFound: 1000000, matchMode: 'exactOrNextSmaller', searchMode: 'first' }
        );
        let tiefe = 155;
        let faktor = g.n(s, `${clcPowerCol}57`) / 1000;
        let exponentFaktor = g.n(s, `${clcPowerCol}63`) / g.n('Names', 'Log_ÜT_Norm');
        let bedarf = g.n('IN_rooms', `${roomCol}55`);

        // Calculate the radiator exponent using SUMIFS
        let exponent = g.SUMMEWENNS(
          g.INDIREKT_DB_REF("tabelle1", "Heizkörperexponent n "),
          g.INDIREKT_DB_REF("tabelle1", "Heizkörper_Typ"), [typ],
          g.INDIREKT_DB_REF("tabelle1", "Heizkörper_Subtyp"), [subtyp],
          g.INDIREKT_DB_REF("tabelle1", "Höhe H in mm"), [höhe ?? 0],
          g.INDIREKT_DB_REF("tabelle1", "Bautiefe T in mm"), [tiefe]
        );

        // Calculate the radiator power
        let leistung = bedarf * g.SUMMEWENNS(
          g.INDIREKT_DB_REF("tabelle1", "Wärmeleistung (75/65/20)  in W/m"),
          g.INDIREKT_DB_REF("tabelle1", "Heizkörper_Typ"), [typ],
          g.INDIREKT_DB_REF("tabelle1", "Heizkörper_Subtyp"), [subtyp],
          g.INDIREKT_DB_REF("tabelle1", "Höhe H in mm"), [höhe ?? 0],
          g.INDIREKT_DB_REF("tabelle1", "Bautiefe T in mm"), [tiefe]
        ) * faktor * (exponentFaktor ** exponent);

        return g.WENN(leistung > 0, leistung, 0);
      });

      /**
       * Row 66: Combined radiator power
       * Original Excel formula: "IF(G3>\"\",G13,IF(G15>\"\",G25,IF(G27>\"\",G38,IF(G54>\"\",G64,\"\"))))"
       */
      grid.setCell('clc_power', `${clcPowerCol}66`, (s, c, g) =>
        g.WENN(
          g.g(s, `${clcPowerCol}3`) > "",
          g.n(s, `${clcPowerCol}13`),
          g.WENN(
            g.g(s, `${clcPowerCol}15`) > "",
            g.n(s, `${clcPowerCol}25`),
            g.WENN(
              g.g(s, `${clcPowerCol}27`) > "",
              g.n(s, `${clcPowerCol}38`),
              g.WENN(
                g.g(s, `${clcPowerCol}54`) > "",
                g.n(s, `${clcPowerCol}64`),
                ""
              )
            )
          )
        )
      );

      /**
       * Row 67: Combined alternative power
       * Original Excel formula: "IF(G3>\"\",G14,IF(G15>\"\",G26,IF(G27>\"\",G39,IF(G54>\"\",G65,\"\"))))"
       */
      grid.setCell('clc_power', `${clcPowerCol}67`, (s, c, g) =>
        g.WENN(
          g.g(s, `${clcPowerCol}3`) > "",
          g.n(s, `${clcPowerCol}14`),
          g.WENN(
            g.g(s, `${clcPowerCol}15`) > "",
            g.n(s, `${clcPowerCol}26`),
            g.WENN(
              g.g(s, `${clcPowerCol}27`) > "",
              g.n(s, `${clcPowerCol}39`),
              g.WENN(
                g.g(s, `${clcPowerCol}54`) > "",
                g.n(s, `${clcPowerCol}65`),
                ""
              )
            )
          )
        )
      );

      /**
       * Row 69: Secondary radiator type check from IN_rooms
       * Original Excel formula: "IF(OR(IN_rooms!R$56=\"Flachheizkoerper_glatt\",IN_rooms!R$56=\"Flachheizkoerper_senkrecht_profiliert\"),IN_rooms!R$56,\"\")"
       */
      grid.setCell('clc_power', `${clcPowerCol}69`, (s, c, g) =>
        g.WENN(
          g.ODER(
            g.g('IN_rooms', `${roomCol}56`) === "Flachheizkoerper_glatt",
            g.g('IN_rooms', `${roomCol}56`) === "Flachheizkoerper_senkrecht_profiliert"
          ),
          g.g('IN_rooms', `${roomCol}56`),
          ""
        )
      );

      /**
       * Row 70: Radiator subtype from IN_rooms
       * Original Excel formula: "IN_rooms!R$57"
       */
      grid.setCell('clc_power', `${clcPowerCol}70`, (s, c, g) =>
        g.g('IN_rooms', `${roomCol}57`)
      );

      /**
       * Row 71: Radiator height from IN_rooms
       * Original Excel formula: "IN_rooms!R$58"
       */
      grid.setCell('clc_power', `${clcPowerCol}71`, (s, c, g) =>
        g.g('IN_rooms', `${roomCol}58`)
      );

      /**
       * Row 72: Radiator length from IN_rooms
       * Original Excel formula: "IN_rooms!R$59"
       */
      grid.setCell('clc_power', `${clcPowerCol}72`, (s, c, g) =>
        g.g('IN_rooms', `${roomCol}59`)
      );

      /**
       * Row 73: Radiator depth lookup from Daten
       * Original Excel formula: "IF(G70=0,0,_xlfn.XLOOKUP(G70&\"_Tiefe\",Daten!$K$14:$Q$14,Daten!$K$15:$Q$15))"
       */
      grid.setCell('clc_power', `${clcPowerCol}73`, (s, c, g) =>
        g.WENN(
          g.n(s, `${clcPowerCol}70`) === 0,
          0,
          g.XVERWEIS(
            g.n(s, `${clcPowerCol}70`) + "_Tiefe",
            g.getCells('Daten', 'K14', 'Q14').flat(),
            g.getCells('Daten', 'K15', 'Q15').flat(),
            { ifNotFound: 0 }
          )
        )
      );

      /**
       * Row 74: Radiator exponent
       * Original Excel formula: "SUMIFS(
       *   INDIRECT(\"tabelle1[Heizkörperexponent n ]\"),
       *   INDIRECT(\"tabelle1[Heizkörper_Typ]\"), clc_power!G$69,
       *   INDIRECT(\"tabelle1[Heizkörper_Subtyp]\"), clc_power!G$70,
       *   INDIRECT(\"tabelle1[Höhe H in mm]\"), clc_power!G$71,
       *   INDIRECT(\"tabelle1[Bautiefe T in mm]\"), clc_power!G$73
       * )"
       */
      grid.setCell('clc_power', `${clcPowerCol}74`, (s, c, g) =>
        g.SUMMEWENNS(
          g.INDIREKT_DB_REF("tabelle1", "Heizkörperexponent n "),
          g.INDIREKT_DB_REF("tabelle1", "Heizkörper_Typ"), [g.g(s, `${clcPowerCol}69`)],
          g.INDIREKT_DB_REF("tabelle1", "Heizkörper_Subtyp"), [g.g(s, `${clcPowerCol}70`)],
          g.INDIREKT_DB_REF("tabelle1", "Höhe H in mm"), [g.g(s, `${clcPowerCol}71`)],
          g.INDIREKT_DB_REF("tabelle1", "Bautiefe T in mm"), [g.g(s, `${clcPowerCol}73`)]
        )
      );

      /**
       * Row 75: Radiator power at 75/65/20
       * Original Excel formula: "_xlfn.LET(
       *   _xlpm.leistung, IN_rooms!R$62 * SUMIFS(
       *     INDIRECT(\"tabelle1[Wärmeleistung (75/65/20)  in W/m]\"),
       *     INDIRECT(\"tabelle1[Heizkörper_Typ]\"), clc_power!G$69,
       *     INDIRECT(\"tabelle1[Heizkörper_Subtyp]\"), clc_power!G$70,
       *     INDIRECT(\"tabelle1[Höhe H in mm]\"), clc_power!G$71,
       *     INDIRECT(\"tabelle1[Bautiefe T in mm]\"), clc_power!G$73  ) * G$72 / 1000,
       *   IF(_xlpm.leistung > 0, _xlpm.leistung, 0)
       * )"
       */
      grid.setCell('clc_power', `${clcPowerCol}75`, (s, c, g) => {
        // Calculate power using LET equivalent
        let leistung = g.n('IN_rooms', `${roomCol}62`) * g.SUMMEWENNS(
          g.INDIREKT_DB_REF("tabelle1", "Wärmeleistung (75/65/20)  in W/m"),
          g.INDIREKT_DB_REF("tabelle1", "Heizkörper_Typ"), [g.g(s, `${clcPowerCol}69`)],
          g.INDIREKT_DB_REF("tabelle1", "Heizkörper_Subtyp"), [g.g(s, `${clcPowerCol}70`)],
          g.INDIREKT_DB_REF("tabelle1", "Höhe H in mm"), [g.g(s, `${clcPowerCol}71`)],
          g.INDIREKT_DB_REF("tabelle1", "Bautiefe T in mm"), [g.g(s, `${clcPowerCol}73`)]
        ) * g.n(s, `${clcPowerCol}72`) / 1000;

        return g.WENN(leistung > 0, leistung, 0);
      });

      /**
       * Row 76: Target flow temperature from Named cell
       * Original Excel formula: "TVL_Ziel"
       */
      grid.setCell('clc_power', `${clcPowerCol}76`, (s, c, g) =>
        g.g('Names', 'TVL_Ziel')
      );

      /**
       * Row 77: Target return temperature from Named cell
       * Original Excel formula: "TRL_Ziel"
       */
      grid.setCell('clc_power', `${clcPowerCol}77`, (s, c, g) =>
        g.g('Names', 'TRL_Ziel')
      );

      /**
       * Row 78: Logarithmic mean temperature difference
       * Original Excel formula: "(G76-G77)/(LN((G76-clc_load!I$10)/(G77-clc_load!I$10)))"
       */
      grid.setCell('clc_power', `${clcPowerCol}78`, (s, c, g) =>
        (g.n(s, `${clcPowerCol}76`) - g.n(s, `${clcPowerCol}77`)) /
        g.LN((g.n(s, `${clcPowerCol}76`) - g.n('clc_load', `${clcLoadCol}10`)) /
             (g.n(s, `${clcPowerCol}77`) - g.n('clc_load', `${clcLoadCol}10`)))
      );

      /**
       * Row 79: Radiator power at target temperature
       * Original Excel formula: "IF(G$75*((G$78/Log_ÜT_Norm)^G$74)>0,
       * G$75*((G$78/Log_ÜT_Norm)^G$74),0)"
       */
      grid.setCell('clc_power', `${clcPowerCol}79`, (s, c, g) => {
        let power = g.n(s, `${clcPowerCol}75`) *
                  ((g.n(s, `${clcPowerCol}78`) / g.n('Names', 'Log_ÜT_Norm')) ** g.n(s, `${clcPowerCol}74`));

        return g.WENN(power > 0, power, 0);
      });

      /**
       * Row 80: Alternative radiator power calculation
       * Original Excel formula: "_xlfn.LET(
       *   _xlpm.leistung, IN_rooms!R$62 * SUMIFS(
       *     INDIRECT(\"tabelle1[Wärmeleistung (75/65/20)  in W/m]\"),
       *     INDIRECT(\"tabelle1[Heizkörper_Typ]\"), \"Flachheizkoerper_senkrecht_profiliert\",
       *     INDIRECT(\"tabelle1[Heizkörper_Subtyp]\"), \"Typ_33\",
       *     INDIRECT(\"tabelle1[Höhe H in mm]\"), G$71,
       *     INDIRECT(\"tabelle1[Bautiefe T in mm]\"), 155
       *   ) * G$72 / 1000 * ((G$78 / Log_ÜT_Norm) ^ SUMIFS(
       *     INDIRECT(\"tabelle1[Heizkörperexponent n ]\"),
       *     INDIRECT(\"tabelle1[Heizkörper_Typ]\"), \"Flachheizkoerper_senkrecht_profiliert\",
       *     INDIRECT(\"tabelle1[Heizkörper_Subtyp]\"), \"Typ_33\",
       *     INDIRECT(\"tabelle1[Höhe H in mm]\"), G$71,
       *     INDIRECT(\"tabelle1[Bautiefe T in mm]\"), 155
       *   )),
       *   IF(_xlpm.leistung > 0, _xlpm.leistung, 0)
       * )"
       */
      grid.setCell('clc_power', `${clcPowerCol}80`, (s, c, g) => {
        // Calculate the exponent from SUMIFS
        let exponent = g.SUMMEWENNS(
          g.INDIREKT_DB_REF("tabelle1", "Heizkörperexponent n "),
          g.INDIREKT_DB_REF("tabelle1", "Heizkörper_Typ"), ["Flachheizkoerper_senkrecht_profiliert"],
          g.INDIREKT_DB_REF("tabelle1", "Heizkörper_Subtyp"), ["Typ_33"],
          g.INDIREKT_DB_REF("tabelle1", "Höhe H in mm"), [g.g(s, `${clcPowerCol}71`)],
          g.INDIREKT_DB_REF("tabelle1", "Bautiefe T in mm"), [155]
        );

        // Calculate the base power with temperature adjustment
        let leistung = g.n('IN_rooms', `${roomCol}62`) * g.SUMMEWENNS(
          g.INDIREKT_DB_REF("tabelle1", "Wärmeleistung (75/65/20)  in W/m"),
          g.INDIREKT_DB_REF("tabelle1", "Heizkörper_Typ"), ["Flachheizkoerper_senkrecht_profiliert"],
          g.INDIREKT_DB_REF("tabelle1", "Heizkörper_Subtyp"), ["Typ_33"],
          g.INDIREKT_DB_REF("tabelle1", "Höhe H in mm"), [g.g(s, `${clcPowerCol}71`)],
          g.INDIREKT_DB_REF("tabelle1", "Bautiefe T in mm"), [155]
        ) * g.n(s, `${clcPowerCol}72`) / 1000 * ((g.n(s, `${clcPowerCol}78`) / g.n('Names', 'Log_ÜT_Norm')) ** exponent);

        return g.WENN(leistung > 0, leistung, 0);
      });

      /**
       * Row 81: Cast iron radiator check from IN_rooms
       * Original Excel formula: "IF(IN_rooms!R$56=\"Gliederheizkörper\",IN_rooms!R$56,\"\")"
       */
      grid.setCell('clc_power', `${clcPowerCol}81`, (s, c, g) =>
        g.WENN(
          g.g('IN_rooms', `${roomCol}56`) === "Gliederheizkörper",
          g.g('IN_rooms', `${roomCol}56`),
          ""
        )
      );

      /**
       * Row 82: Radiator subtype from IN_rooms
       * Original Excel formula: "IN_rooms!R$57"
       */
      grid.setCell('clc_power', `${clcPowerCol}82`, (s, c, g) =>
        g.g('IN_rooms', `${roomCol}57`)
      );

      /**
       * Row 83: Radiator height from IN_rooms
       * Original Excel formula: "IN_rooms!R$58"
       */
      grid.setCell('clc_power', `${clcPowerCol}83`, (s, c, g) =>
        g.g('IN_rooms', `${roomCol}58`)
      );

      /**
       * Row 84: Radiator depth calculation based on radiator type
       * Original Excel formula: "_xlfn.IFS(IN_rooms!R$60=0,0,
       * G82 = \"Stahlradiator\",
       * INDEX(Daten!$AF$13:$AF$23,_xlfn.XMATCH(MIN(IF(Daten!$AE$13:$AE$23=G83,ABS(Daten!$AF$13:$AF$23-IN_rooms!R$60))),
       *                                   IF(Daten!$AE$13:$AE$23=G83,ABS(Daten!$AF$13:$AF$23-IN_rooms!R$60)),
       *                                   0)),
       * G82 = \"Gussradiator\",
       * INDEX(Daten!$AD$13:$AD$25,_xlfn.XMATCH(MIN(IF(Daten!$AC$13:$AC$25=G83,ABS(Daten!$AD$13:$AD$25-IN_rooms!R$60))),
       *                                    IF(Daten!$AC$13:$AC$25=G83,ABS(Daten!$AD$13:$AD$25-IN_rooms!R$60)),
       *                                    0)),
       * TRUE, IN_rooms!R$60)"
       */
      grid.setCell('clc_power', `${clcPowerCol}84`, (s, c, g) => {
        const radius = g.n("IN_rooms", `${roomCol}60`);
        const typ = g.g(s, `${clcPowerCol}82`);
        const size = g.g(s, `${clcPowerCol}83`);

        return g.WENNS(
          radius === 0, 0,

          typ === "Stahlradiator", (() => {
            const rawValues = g.RANGE("Daten!AF13:AF23", s).map(Number);
            const condition = g.GLEICH(g.RANGE("Daten!AE13:AE23", s), size);
            const filtered = g.WENN_ARRAY(condition, g.ABS_ARRAY(rawValues.map(v => v - radius)));
            const idx = g.MIN_INDEX(filtered);
            return rawValues[idx];
          })(),

          typ === "Gussradiator", (() => {
            const rawValues = g.RANGE("Daten!AD13:AD25", s).map(Number);
            const condition = g.GLEICH(g.RANGE("Daten!AC13:AC25", s), size);
            const filtered = g.WENN_ARRAY(condition, g.ABS_ARRAY(rawValues.map(v => v - radius)));
            const idx = g.MIN_INDEX(filtered);
            return rawValues[idx];
          })(),

          g.WAHR(), radius
        );
      });

      /**
       * Row 85: Number of elements from IN_rooms
       * Original Excel formula: "IN_rooms!R$61"
       */
      grid.setCell('clc_power', `${clcPowerCol}85`, (s, c, g) =>
        g.g('IN_rooms', `${roomCol}61`)
      );

      /**
       * Row 86: Radiator exponent fixed value
       * Original Excel formula: "1.3"
       */
      grid.setCell('clc_power', `${clcPowerCol}86`, (s, c, g) => 1.3);

      /**
       * Row 87: Radiator power calculation at 75/65/20
       * Original Excel formula: "_xlfn.LET(
       *   _xlpm.wärmeleistung, SUMIFS(
       *     INDIRECT(\"tabelle1[Wärmeleistung (75/65/20)  in W/Glied]\"),
       *     INDIRECT(\"tabelle1[Heizkörper_Typ]\"), clc_power!G$81,
       *     INDIRECT(\"tabelle1[Heizkörper_Subtyp]\"), clc_power!G$82,
       *     INDIRECT(\"tabelle1[Höhe H in mm]\"), clc_power!G$83,
       *     INDIRECT(\"tabelle1[Bautiefe T in mm]\"), clc_power!G$84
       *   ),
       *   _xlpm.leistung, IN_rooms!R$62 * _xlpm.wärmeleistung * G$85,
       *   IF(_xlpm.leistung > 0, _xlpm.leistung, 0)
       * )"
       */
      grid.setCell('clc_power', `${clcPowerCol}87`, (s, c, g) => {
        // Calculate using LET equivalent
        let wärmeleistung = g.SUMMEWENNS(
          g.INDIREKT_DB_REF("tabelle1", "Wärmeleistung (75/65/20)  in W/Glied"),
          g.INDIREKT_DB_REF("tabelle1", "Heizkörper_Typ"), [g.g(s, `${clcPowerCol}81`)],
          g.INDIREKT_DB_REF("tabelle1", "Heizkörper_Subtyp"), [g.g(s, `${clcPowerCol}82`)],
          g.INDIREKT_DB_REF("tabelle1", "Höhe H in mm"), [g.g(s, `${clcPowerCol}83`)],
          g.INDIREKT_DB_REF("tabelle1", "Bautiefe T in mm"), [g.g(s, `${clcPowerCol}84`)]
        );

        let leistung = g.n('IN_rooms', `${roomCol}62`) * wärmeleistung * g.n(s, `${clcPowerCol}85`);

        return g.WENN(leistung > 0, leistung, 0);
      });

      /**
       * Row 88: Target flow temperature from Named cell
       * Original Excel formula: "TVL_Ziel"
       */
      grid.setCell('clc_power', `${clcPowerCol}88`, (s, c, g) =>
        g.g('Names', 'TVL_Ziel')
      );

      /**
       * Row 89: Target return temperature from Named cell
       * Original Excel formula: "TRL_Ziel"
       */
      grid.setCell('clc_power', `${clcPowerCol}89`, (s, c, g) =>
        g.g('Names', 'TRL_Ziel')
      );

      /**
       * Row 90: Logarithmic mean temperature difference
       * Original Excel formula: "(G$88-G$89)/(LN((G$88-clc_load!I$10)/(G$89-clc_load!I$10)))"
       */
      grid.setCell('clc_power', `${clcPowerCol}90`, (s, c, g) =>
        (g.n(s, `${clcPowerCol}88`) - g.n(s, `${clcPowerCol}89`)) /
        g.LN((g.n(s, `${clcPowerCol}88`) - g.n('clc_load', `${clcLoadCol}10`)) /
             (g.n(s, `${clcPowerCol}89`) - g.n('clc_load', `${clcLoadCol}10`)))
      );

      /**
       * Row 91: Radiator power at target temperature
       * Original Excel formula: "IF(G$87*((G$90/Log_ÜT_Norm)^G$86)>0,
       * G$87*((G$90/Log_ÜT_Norm)^G$86),0)"
       */
      grid.setCell('clc_power', `${clcPowerCol}91`, (s, c, g) => {
        let power = g.n(s, `${clcPowerCol}87`) *
                  ((g.n(s, `${clcPowerCol}90`) / g.n('Names', 'Log_ÜT_Norm')) ** g.n(s, `${clcPowerCol}86`));

        return g.WENN(power > 0, power, 0);
      });

      /**
       * Row 92: Alternative radiator power calculation
       * Original Excel formula: "_xlfn.LET(
       *   _xlpm.typ, \"Flachheizkoerper_senkrecht_profiliert\",
       *   _xlpm.subtyp, \"Typ_33\",
       *   _xlpm.höhe, _xlfn.XLOOKUP(G$83, Data_radiator!$G$5:$G$32, Data_radiator!$G$5:$G$32, 1000000, 1, 1),
       *   _xlpm.tiefe, 155,
       *   _xlpm.glieder, G$85,
       *   _xlpm.radiatorart, G$82,
       *   _xlpm.tempfaktor, IF(_xlpm.radiatorart = \"Gussradiator\", 50, 60),
       *   _xlpm.überschuss, G$90,
       *   _xlpm.leistung, IN_rooms!R$62 *
       *     SUMIFS(
       *       INDIRECT(\"tabelle1[Wärmeleistung (75/65/20)  in W/m]\"),
       *       INDIRECT(\"tabelle1[Heizkörper_Typ]\"), _xlpm.typ,
       *       INDIRECT(\"tabelle1[Heizkörper_Subtyp]\"), _xlpm.subtyp,
       *       INDIRECT(\"tabelle1[Höhe H in mm]\"), _xlpm.höhe,
       *       INDIRECT(\"tabelle1[Bautiefe T in mm]\"), _xlpm.tiefe
       *     ) *
       *     ((_xlpm.glieder * _xlpm.tempfaktor / 1000) *
       *     ((_xlpm.überschuss / Log_ÜT_Norm) ^
       *       SUMIFS(
       *         INDIRECT(\"tabelle1[Heizkörperexponent n ]\"),
       *         INDIRECT(\"tabelle1[Heizkörper_Typ]\"), _xlpm.typ,
       *         INDIRECT(\"tabelle1[Heizkörper_Subtyp]\"), _xlpm.subtyp,
       *         INDIRECT(\"tabelle1[Höhe H in mm]\"), _xlpm.höhe,
       *         INDIRECT(\"tabelle1[Bautiefe T in mm]\"), _xlpm.tiefe
       *       )
       *     )
       *   ),
       *   IF(_xlpm.leistung > 0, _xlpm.leistung, 0)
       * )"
       */
      grid.setCell('clc_power', `${clcPowerCol}92`, (s, c, g) => {
        // Implement the LET function parameters
        let typ = "Flachheizkoerper_senkrecht_profiliert";
        let subtyp = "Typ_33";
        let höhe = g.XVERWEIS(
          g.n(s, `${clcPowerCol}83`),
          g.getCells('Data_radiator', 'G5', 'G32').flat(),
          g.getCells('Data_radiator', 'G5', 'G32').flat(),
          { ifNotFound: 1000000, matchMode: 'exactOrNextSmaller', searchMode: 'first' }
        );
        let tiefe = 155;
        let glieder = g.n(s, `${clcPowerCol}85`);
        let radiatorart = g.g(s, `${clcPowerCol}82`);
        let tempfaktor = g.WENN(radiatorart === "Gussradiator", 50, 60);
        let überschuss = g.n(s, `${clcPowerCol}90`);

        // Calculate the exponent
        let exponent = g.SUMMEWENNS(
          g.INDIREKT_DB_REF("tabelle1", "Heizkörperexponent n "),
          g.INDIREKT_DB_REF("tabelle1", "Heizkörper_Typ"), [typ],
          g.INDIREKT_DB_REF("tabelle1", "Heizkörper_Subtyp"), [subtyp],
          g.INDIREKT_DB_REF("tabelle1", "Höhe H in mm"), [höhe ?? 0],
          g.INDIREKT_DB_REF("tabelle1", "Bautiefe T in mm"), [tiefe]
        );

        // Calculate the final power
        let leistung = g.n('IN_rooms', `${roomCol}62`) *
          g.SUMMEWENNS(
            g.INDIREKT_DB_REF("tabelle1", "Wärmeleistung (75/65/20)  in W/m"),
            g.INDIREKT_DB_REF("tabelle1", "Heizkörper_Typ"), [typ],
            g.INDIREKT_DB_REF("tabelle1", "Heizkörper_Subtyp"), [subtyp],
            g.INDIREKT_DB_REF("tabelle1", "Höhe H in mm"), [höhe ?? 0],
            g.INDIREKT_DB_REF("tabelle1", "Bautiefe T in mm"), [tiefe]
          ) *
          ((glieder * tempfaktor / 1000) *
           ((überschuss / g.n('Names', 'Log_ÜT_Norm')) ** exponent));

        return g.WENN(leistung > 0, leistung, 0);
      });

      /**
       * Row 93: Tube radiator check from IN_rooms
       * Original Excel formula: "IF(IN_rooms!R$56=\"Rohrradiator\",IN_rooms!R$56,\"\")"
       */
      grid.setCell('clc_power', `${clcPowerCol}93`, (s, c, g) =>
        g.WENN(
          g.g('IN_rooms', `${roomCol}56`) === "Rohrradiator",
          g.g('IN_rooms', `${roomCol}56`),
          ""
        )
      );

      /**
       * Row 94: Radiator subtype from IN_rooms
       * Original Excel formula: "IN_rooms!R$57"
       */
      grid.setCell('clc_power', `${clcPowerCol}94`, (s, c, g) =>
        g.g('IN_rooms', `${roomCol}57`)
      );

      /**
       * Row 95: Radiator height from IN_rooms
       * Original Excel formula: "IN_rooms!R$58"
       */
      grid.setCell('clc_power', `${clcPowerCol}95`, (s, c, g) =>
        g.g('IN_rooms', `${roomCol}58`)
      );

      /**
       * Row 96: Radiator width calculation based on type
       * Original Excel formula: "IF(G94=\"Fensterbankradiator\",
       * IF(IN_rooms!R$59=0,0,INDEX(Fensterbankradiator_b[],MATCH(MIN(ABS(Fensterbankradiator_b[]-IN_rooms!R$59)),ABS(Fensterbankradiator_b[]-IN_rooms!R$59),0))),
       * IN_rooms!R$59)"
       */
      grid.setCell('clc_power', `${clcPowerCol}96`, (s, c, g) => {
        if (g.g(s, `${clcPowerCol}94`) !== "Fensterbankradiator") {
          return g.g('IN_rooms', `${roomCol}59`);
        }

        if (g.n('IN_rooms', `${roomCol}59`) === 0) {
          return 0;
        }

        // For Fensterbankradiator, we need to find the closest width in the lookup table
        const radiatorWidths = g.INDIREKT('Fensterbankradiator_b');
        if (!radiatorWidths.length) return 0;

        const userWidth = g.n('IN_rooms', `${roomCol}59`);
        const differences = radiatorWidths.map(width => Math.abs(Number(width) - userWidth));
        const minDifference = g.MIN(...differences);
        const matchIndex = g.XMATCH(minDifference, differences, 0, 1) - 1; // -1 to convert to 0-based

        return radiatorWidths[matchIndex] || 0;
      });

      /**
       * Row 97: Radiator depth from IN_rooms
       * Original Excel formula: "IN_rooms!R$60"
       */
      grid.setCell('clc_power', `${clcPowerCol}97`, (s, c, g) =>
        g.g('IN_rooms', `${roomCol}60`)
      );

      /**
       * Row 98: Number of elements from IN_rooms
       * Original Excel formula: "IN_rooms!R$61"
       */
      grid.setCell('clc_power', `${clcPowerCol}98`, (s, c, g) =>
        g.g('IN_rooms', `${roomCol}61`)
      );

      /**
       * Row 99: Radiator exponent based on type
       * Original Excel formula: "_xlfn.IFS(
       *   G$94 = \"Stahlrohrradiator\", 1.3,
       *   G$94 = \"Fensterbankradiator\", 1.3,
       *   G$94 = \"Handtuchradiator\", 1.21,
       *   G$93 = \"\", 0
       * )"
       */
      grid.setCell('clc_power', `${clcPowerCol}99`, (s, c, g) =>
        g.WENNS(
          g.g(s, `${clcPowerCol}94`) === "Stahlrohrradiator", 1.3,
          g.g(s, `${clcPowerCol}94`) === "Fensterbankradiator", 1.3,
          g.g(s, `${clcPowerCol}94`) === "Handtuchradiator", 1.21,
          g.g(s, `${clcPowerCol}93`) === "", 0,
          // Default
          0
        )
      );

      /**
       * Row 100: Radiator power calculation for tube/special radiators
       * Original Excel formula: "_xlfn.LET(
       *   _xlpm.typ, clc_power!G$93,
       *   _xlpm.subtyp, clc_power!G$94,
       *   _xlpm.höhe, clc_power!G$95,
       *   _xlpm.breite, clc_power!G$96,
       *   _xlpm.tiefe, clc_power!G$97,
       *   _xlpm.faktor, clc_power!G$98,
       *   _xlpm.fläche, IN_rooms!R$58 * IN_rooms!R$59,
       *   _xlpm.radiatorart, G$94,
       *   _xlpm.leistung, _xlfn.IFS(
       *     _xlpm.radiatorart = \"Stahlrohrradiator\",
       *       _xlpm.faktor * SUMIFS(
       *         INDIRECT(\"tabelle1[Wärmeleistung (75/65/20)  in W/Glied]\"),
       *         INDIRECT(\"tabelle1[Heizkörper_Typ]\"), _xlpm.typ,
       *         INDIRECT(\"tabelle1[Heizkörper_Subtyp]\"), _xlpm.subtyp,
       *         INDIRECT(\"tabelle1[Höhe H in mm]\"), _xlpm.höhe,
       *         INDIRECT(\"tabelle1[Bautiefe T in mm]\"), _xlpm.tiefe
       *       ),
       *     _xlpm.radiatorart = \"Handtuchradiator\",
       *       919 * (_xlpm.fläche / 10^6) + 76.691,
       *     _xlpm.radiatorart = \"Fensterbankradiator\",
       *       SUMIFS(
       *         INDIRECT(\"tabelle1[Wärmeleistung (75/65/20)  in W]\"),
       *         INDIRECT(\"tabelle1[Heizkörper_Typ]\"), _xlpm.typ,
       *         INDIRECT(\"tabelle1[Heizkörper_Subtyp]\"), _xlpm.subtyp,
       *         INDIRECT(\"tabelle1[Höhe H in mm]\"), _xlpm.höhe,
       *         INDIRECT(\"tabelle1[Breite B in mm]\"), _xlpm.breite,
       *         INDIRECT(\"tabelle1[Bautiefe T in mm]\"), _xlpm.tiefe
       *       ),
       *     _xlpm.typ = \"\", 0
       *   ),
       *   IF(IN_rooms!R$62 * _xlpm.leistung > 0, IN_rooms!R$62 * _xlpm.leistung, 0)
       * )"
       */
      grid.setCell('clc_power', `${clcPowerCol}100`, (s, c, g) => {
        // Define LET function variables
        let typ = g.g(s, `${clcPowerCol}93`);
        let subtyp = g.g(s, `${clcPowerCol}94`);
        let höhe = g.g(s, `${clcPowerCol}95`);
        let breite = g.g(s, `${clcPowerCol}96`);
        let tiefe = g.g(s, `${clcPowerCol}97`);
        let faktor = g.n(s, `${clcPowerCol}98`);
        let fläche = g.n('IN_rooms', `${roomCol}58`) * g.n('IN_rooms', `${roomCol}59`);
        let radiatorart = g.g(s, `${clcPowerCol}94`);

        // Calculate leistung based on radiator type using the IFS equivalent
        let leistung = g.WENNS(
          radiatorart === "Stahlrohrradiator",
          faktor * g.SUMMEWENNS(
            g.INDIREKT_DB_REF("tabelle1", "Wärmeleistung (75/65/20)  in W/Glied"),
            g.INDIREKT_DB_REF("tabelle1", "Heizkörper_Typ"), [typ],
            g.INDIREKT_DB_REF("tabelle1", "Heizkörper_Subtyp"), [subtyp],
            g.INDIREKT_DB_REF("tabelle1", "Höhe H in mm"), [höhe],
            g.INDIREKT_DB_REF("tabelle1", "Bautiefe T in mm"), [tiefe]
          ),

          radiatorart === "Handtuchradiator",
          919 * (fläche / (10 ** 6)) + 76.691,

          radiatorart === "Fensterbankradiator",
          g.SUMMEWENNS(
            g.INDIREKT_DB_REF("tabelle1", "Wärmeleistung (75/65/20)  in W"),
            g.INDIREKT_DB_REF("tabelle1", "Heizkörper_Typ"), [typ],
            g.INDIREKT_DB_REF("tabelle1", "Heizkörper_Subtyp"), [subtyp],
            g.INDIREKT_DB_REF("tabelle1", "Höhe H in mm"), [höhe],
            g.INDIREKT_DB_REF("tabelle1", "Breite B in mm"), [breite],
            g.INDIREKT_DB_REF("tabelle1", "Bautiefe T in mm"), [tiefe]
          ),

          typ === "", 0,
          // Default
          0
        );

        // Final power calculation with factor and check
        return g.WENN(g.n('IN_rooms', `${roomCol}62`) * leistung > 0,
                    g.n('IN_rooms', `${roomCol}62`) * leistung,
                    0);
      });

      /**
       * Row 101: Target flow temperature from Named cell
       * Original Excel formula: "TVL_Ziel"
       */
      grid.setCell('clc_power', `${clcPowerCol}101`, (s, c, g) =>
        g.g('Names', 'TVL_Ziel')
      );

      /**
       * Row 102: Target return temperature from Named cell
       * Original Excel formula: "TRL_Ziel"
       */
      grid.setCell('clc_power', `${clcPowerCol}102`, (s, c, g) =>
        g.g('Names', 'TRL_Ziel')
      );

      /**
       * Row 103: Logarithmic mean temperature difference
       * Original Excel formula: "(G$101-G$102)/(LN((G$101-clc_load!I$10)/(G$102-clc_load!I$10)))"
       */
      grid.setCell('clc_power', `${clcPowerCol}103`, (s, c, g) =>
        (g.n(s, `${clcPowerCol}101`) - g.n(s, `${clcPowerCol}102`)) /
        g.LN((g.n(s, `${clcPowerCol}101`) - g.n('clc_load', `${clcLoadCol}10`)) /
             (g.n(s, `${clcPowerCol}102`) - g.n('clc_load', `${clcLoadCol}10`)))
      );

      /**
       * Row 104: Radiator power at target temperature
       * Original Excel formula: "IF(G$100*((G$103/Log_ÜT_Norm)^G$99)>0,
       * G$100*((G$103/Log_ÜT_Norm)^G$99),0)"
       */
      grid.setCell('clc_power', `${clcPowerCol}104`, (s, c, g) => {
        let power = g.n(s, `${clcPowerCol}100`) *
                  ((g.n(s, `${clcPowerCol}103`) / g.n('Names', 'Log_ÜT_Norm')) ** g.n(s, `${clcPowerCol}99`));

        return g.WENN(power > 0, power, 0);
      });

      /**
       * Row 105: Alternative radiator power calculation
       * Original Excel formula: "_xlfn.LET(
       *   _xlpm.typ, \"Flachheizkoerper_senkrecht_profiliert\",
       *   _xlpm.subtyp, \"Typ_33\",
       *   _xlpm.höhe, _xlfn.XLOOKUP(G$95, Data_radiator!$G$5:$G$32, Data_radiator!$G$5:$G$32, 1000000, 1, 1),
       *   _xlpm.tiefe, 155,
       *   _xlpm.glieder, IF(G$94 = \"Stahlrohrradiator\", 45, G$96),
       *   _xlpm.faktor, G$103 / Log_ÜT_Norm,
       *   _xlpm.leistung, IN_rooms!R$62 *
       *     SUMIFS(
       *       INDIRECT(\"tabelle1[Wärmeleistung (75/65/20)  in W/m]\"),
       *       INDIRECT(\"tabelle1[Heizkörper_Typ]\"), _xlpm.typ,
       *       INDIRECT(\"tabelle1[Heizkörper_Subtyp]\"), _xlpm.subtyp,
       *       INDIRECT(\"tabelle1[Höhe H in mm]\"), _xlpm.höhe,
       *       INDIRECT(\"tabelle1[Bautiefe T in mm]\"), _xlpm.tiefe
       *     ) *
       *     (_xlpm.glieder / 1000) *
       *     _xlpm.faktor ^
       *     SUMIFS(
       *       INDIRECT(\"tabelle1[Heizkörperexponent n ]\"),
       *       INDIRECT(\"tabelle1[Heizkörper_Typ]\"), _xlpm.typ,
       *       INDIRECT(\"tabelle1[Heizkörper_Subtyp]\"), _xlpm.subtyp,
       *       INDIRECT(\"tabelle1[Höhe H in mm]\"), _xlpm.höhe,
       *       INDIRECT(\"tabelle1[Bautiefe T in mm]\"), _xlpm.tiefe
       *     ),
       *   IF(_xlpm.leistung > 0, _xlpm.leistung, 0)
       * )"
       */
      grid.setCell('clc_power', `${clcPowerCol}105`, (s, c, g) => {
        // Define LET function variables
        let typ = "Flachheizkoerper_senkrecht_profiliert";
        let subtyp = "Typ_33";
        let höhe = g.XVERWEIS(
          g.n(s, `${clcPowerCol}95`),
          g.getCells('Data_radiator', 'G5', 'G32').flat(),
          g.getCells('Data_radiator', 'G5', 'G32').flat(),
          { ifNotFound: 1000000, matchMode: 'exactOrNextSmaller', searchMode: 'first' }
        );
        let tiefe = 155;
        let glieder = g.WENN(g.g(s, `${clcPowerCol}94`) === "Stahlrohrradiator", 45, g.n(s, `${clcPowerCol}96`));
        let faktor = g.n(s, `${clcPowerCol}103`) / g.n('Names', 'Log_ÜT_Norm');

        // Calculate the exponent
        let exponent = g.SUMMEWENNS(
          g.INDIREKT_DB_REF("tabelle1", "Heizkörperexponent n "),
          g.INDIREKT_DB_REF("tabelle1", "Heizkörper_Typ"), [typ],
          g.INDIREKT_DB_REF("tabelle1", "Heizkörper_Subtyp"), [subtyp],
          g.INDIREKT_DB_REF("tabelle1", "Höhe H in mm"), [höhe ?? 0],
          g.INDIREKT_DB_REF("tabelle1", "Bautiefe T in mm"), [tiefe]
        );

        // Calculate the final power
        let leistung = g.n('IN_rooms', `${roomCol}62`) *
          g.SUMMEWENNS(
            g.INDIREKT_DB_REF("tabelle1", "Wärmeleistung (75/65/20)  in W/m"),
            g.INDIREKT_DB_REF("tabelle1", "Heizkörper_Typ"), [typ],
            g.INDIREKT_DB_REF("tabelle1", "Heizkörper_Subtyp"), [subtyp],
            g.INDIREKT_DB_REF("tabelle1", "Höhe H in mm"), [höhe ?? 0],
            g.INDIREKT_DB_REF("tabelle1", "Bautiefe T in mm"), [tiefe]
          ) *
          (glieder / 1000) *
          (faktor ** exponent);

        return g.WENN(leistung > 0, leistung, 0);
      });



      /**
       * Row 120: Convector type from IN_rooms
       * Original Excel formula: "IF(IN_rooms!R$56=\"Konvektor\",IN_rooms!R$56,\"\")"
       */
      grid.setCell('clc_power', `${clcPowerCol}120`, (s, c, g) =>
        g.WENN(
          g.g('IN_rooms', `${roomCol}56`) === "Konvektor",
          g.g('IN_rooms', `${roomCol}56`),
          ""
        )
      );

      /**
       * Row 121: Convector subtype
       * Original Excel formula: "IF(G120>\"\",\"Standardkonvektor\",\"\")"
       */
      grid.setCell('clc_power', `${clcPowerCol}121`, (s, c, g) =>
        g.WENN(
          g.g(s, `${clcPowerCol}120`) > "",
          "Standardkonvektor",
          ""
        )
      );

      /**
       * Row 122: Convector height from IN_rooms
       * Original Excel formula: "IN_rooms!R$58"
       */
      grid.setCell('clc_power', `${clcPowerCol}122`, (s, c, g) =>
        g.g('IN_rooms', `${roomCol}58`)
      );

      /**
       * Row 123: Convector width from IN_rooms
       * Original Excel formula: "IN_rooms!R$59"
       */
      grid.setCell('clc_power', `${clcPowerCol}123`, (s, c, g) =>
        g.g('IN_rooms', `${roomCol}59`)
      );

      /**
       * Row 124: Convector depth from IN_rooms
       * Original Excel formula: "IN_rooms!R$60"
       */
      grid.setCell('clc_power', `${clcPowerCol}124`, (s, c, g) =>
        g.g('IN_rooms', `${roomCol}60`)
      );

      /**
       * Row 125: Convector exponent
       * Original Excel formula: "_xlfn.LET(
       *   _xlpm.typ, clc_power!G$120,
       *   _xlpm.subtyp, clc_power!G$121,
       *   _xlpm.höhe, clc_power!G$122,
       *   _xlpm.tiefe, clc_power!G$124,
       *   SUMIFS(
       *     INDIRECT(\"tabelle1[Heizkörperexponent n ]\"),
       *     INDIRECT(\"tabelle1[Heizkörper_Typ]\"), _xlpm.typ,
       *     INDIRECT(\"tabelle1[Heizkörper_Subtyp]\"), _xlpm.subtyp,
       *     INDIRECT(\"tabelle1[Höhe H in mm]\"), _xlpm.höhe,
       *     INDIRECT(\"tabelle1[Bautiefe T in mm]\"), _xlpm.tiefe
       *   )
       * )"
       */
      grid.setCell('clc_power', `${clcPowerCol}125`, (s, c, g) => {
        // Define LET function variables
        let typ = g.g(s, `${clcPowerCol}120`);
        let subtyp = g.g(s, `${clcPowerCol}121`);
        let höhe = g.g(s, `${clcPowerCol}122`);
        let tiefe = g.g(s, `${clcPowerCol}124`);

        // Return the SUMIFS result
        return g.SUMMEWENNS(
          g.INDIREKT_DB_REF("tabelle1", "Heizkörperexponent n "),
          g.INDIREKT_DB_REF("tabelle1", "Heizkörper_Typ"), [typ],
          g.INDIREKT_DB_REF("tabelle1", "Heizkörper_Subtyp"), [subtyp],
          g.INDIREKT_DB_REF("tabelle1", "Höhe H in mm"), [höhe],
          g.INDIREKT_DB_REF("tabelle1", "Bautiefe T in mm"), [tiefe]
        );
      });

      /**
       * Row 126: Convector power at 75/65/20
       * Original Excel formula: "_xlfn.LET(
       *   _xlpm.anzahl, IN_rooms!R$62,
       *   _xlpm.typ, clc_power!G$120,
       *   _xlpm.subtyp, clc_power!G$121,
       *   _xlpm.höhe, clc_power!G$122,
       *   _xlpm.breite, clc_power!G$123,
       *   _xlpm.tiefe, clc_power!G$124,
       *   _xlpm.leistung, _xlpm.anzahl *
       *     SUMIFS(
       *       INDIRECT(\"tabelle1[Wärmeleistung (75/65/20)  in W/m]\"),
       *       INDIRECT(\"tabelle1[Heizkörper_Typ]\"), _xlpm.typ,
       *       INDIRECT(\"tabelle1[Heizkörper_Subtyp]\"), _xlpm.subtyp,
       *       INDIRECT(\"tabelle1[Höhe H in mm]\"), _xlpm.höhe,
       *       INDIRECT(\"tabelle1[Bautiefe T in mm]\"), _xlpm.tiefe
       *     ) * _xlpm.breite / 1000,
       *   IF(_xlpm.leistung > 0, _xlpm.leistung, 0)
       * )"
       */
      grid.setCell('clc_power', `${clcPowerCol}126`, (s, c, g) => {
        // Define LET function variables
        let anzahl = g.n('IN_rooms', `${roomCol}62`);
        let typ = g.g(s, `${clcPowerCol}120`);
        let subtyp = g.g(s, `${clcPowerCol}121`);
        let höhe = g.g(s, `${clcPowerCol}122`);
        let breite = g.n(s, `${clcPowerCol}123`);
        let tiefe = g.g(s, `${clcPowerCol}124`);

        // Calculate power
        let leistung = anzahl *
          g.SUMMEWENNS(
            g.INDIREKT_DB_REF("tabelle1", "Wärmeleistung (75/65/20)  in W/m"),
            g.INDIREKT_DB_REF("tabelle1", "Heizkörper_Typ"), [typ],
            g.INDIREKT_DB_REF("tabelle1", "Heizkörper_Subtyp"), [subtyp],
            g.INDIREKT_DB_REF("tabelle1", "Höhe H in mm"), [höhe],
            g.INDIREKT_DB_REF("tabelle1", "Bautiefe T in mm"), [tiefe]
          ) * breite / 1000;

        return g.WENN(leistung > 0, leistung, 0);
      });

      /**
       * Row 127: Target flow temperature from Named cell
       * Original Excel formula: "TVL_Ziel"
       */
      grid.setCell('clc_power', `${clcPowerCol}127`, (s, c, g) =>
        g.g('Names', 'TVL_Ziel')
      );

      /**
       * Row 128: Target return temperature from Named cell
       * Original Excel formula: "TRL_Ziel"
       */
      grid.setCell('clc_power', `${clcPowerCol}128`, (s, c, g) =>
        g.g('Names', 'TRL_Ziel')
      );

      /**
       * Row 129: Logarithmic mean temperature difference
       * Original Excel formula: "(G$127-G$128)/(LN((G$127-clc_load!I$10)/(clc_power!G$128-clc_load!I$10)))"
       */
      grid.setCell('clc_power', `${clcPowerCol}129`, (s, c, g) =>
        (g.n(s, `${clcPowerCol}127`) - g.n(s, `${clcPowerCol}128`)) /
        g.LN((g.n(s, `${clcPowerCol}127`) - g.n('clc_load', `${clcLoadCol}10`)) /
             (g.n(s, `${clcPowerCol}128`) - g.n('clc_load', `${clcLoadCol}10`)))
      );

      /**
       * Row 130: Convector power at target temperature
       * Original Excel formula: "IF(G$126*((G$129/Log_ÜT_Norm)^G$125)>0,
       * G$126*((G$129/Log_ÜT_Norm)^G$125),0)"
       */
      grid.setCell('clc_power', `${clcPowerCol}130`, (s, c, g) => {
        let power = g.n(s, `${clcPowerCol}126`) *
                  ((g.n(s, `${clcPowerCol}129`) / g.n('Names', 'Log_ÜT_Norm')) ** g.n(s, `${clcPowerCol}125`));

        return g.WENN(power > 0, power, 0);
      });

      /**
       * Row 131: Alternative convector power calculation
       * Original Excel formula: "_xlfn.LET(
       *   _xlpm.typ, \"Flachheizkoerper_senkrecht_profiliert\",
       *   _xlpm.subtyp, \"Typ_33\",
       *   _xlpm.höhe, _xlfn.XLOOKUP(G$122, Data_radiator!$G$5:$G$32, Data_radiator!$G$5:$G$32, 1000000, 1, 1),
       *   _xlpm.tiefe, 155,
       *   _xlpm.breite, G$123 / 1000,
       *   _xlpm.exponentFaktor, G$129 / Log_ÜT_Norm,
       *   _xlpm.anzahl, IN_rooms!R$62,
       *   _xlpm.exponent, SUMIFS(
       *     INDIRECT(\"tabelle1[Heizkörperexponent n ]\"),
       *     INDIRECT(\"tabelle1[Heizkörper_Typ]\"), _xlpm.typ,
       *     INDIRECT(\"tabelle1[Heizkörper_Subtyp]\"), _xlpm.subtyp,
       *     INDIRECT(\"tabelle1[Höhe H in mm]\"), _xlpm.höhe,
       *     INDIRECT(\"tabelle1[Bautiefe T in mm]\"), _xlpm.tiefe
       *   ),
       *   _xlpm.leistung, _xlpm.anzahl *
       *     SUMIFS(
       *       INDIRECT(\"tabelle1[Wärmeleistung (75/65/20)  in W/m]\"),
       *       INDIRECT(\"tabelle1[Heizkörper_Typ]\"), _xlpm.typ,
       *       INDIRECT(\"tabelle1[Heizkörper_Subtyp]\"), _xlpm.subtyp,
       *       INDIRECT(\"tabelle1[Höhe H in mm]\"), _xlpm.höhe,
       *       INDIRECT(\"tabelle1[Bautiefe T in mm]\"), _xlpm.tiefe
       *     ) * _xlpm.breite * (_xlpm.exponentFaktor ^ _xlpm.exponent),
       *   IF(_xlpm.leistung > 0, _xlpm.leistung, 0)
       * )"
       */
      grid.setCell('clc_power', `${clcPowerCol}131`, (s, c, g) => {
        // Define LET function variables
        let typ = "Flachheizkoerper_senkrecht_profiliert";
        let subtyp = "Typ_33";
        let höhe = g.XVERWEIS(
          g.n(s, `${clcPowerCol}122`),
          g.getCells('Data_radiator', 'G5', 'G32').flat(),
          g.getCells('Data_radiator', 'G5', 'G32').flat(),
          { ifNotFound: 1000000, matchMode: 'exactOrNextSmaller', searchMode: 'first' }
        );
        let tiefe = 155;
        let breite = g.n(s, `${clcPowerCol}123`) / 1000;
        let exponentFaktor = g.n(s, `${clcPowerCol}129`) / g.n('Names', 'Log_ÜT_Norm');
        let anzahl = g.n('IN_rooms', `${roomCol}62`);

        // Calculate exponent
        let exponent = g.SUMMEWENNS(
          g.INDIREKT_DB_REF("tabelle1", "Heizkörperexponent n "),
          g.INDIREKT_DB_REF("tabelle1", "Heizkörper_Typ"), [typ],
          g.INDIREKT_DB_REF("tabelle1", "Heizkörper_Subtyp"), [subtyp],
          g.INDIREKT_DB_REF("tabelle1", "Höhe H in mm"), [höhe ?? 0],
          g.INDIREKT_DB_REF("tabelle1", "Bautiefe T in mm"), [tiefe]
        );

        // Calculate power
        let leistung = anzahl *
          g.SUMMEWENNS(
            g.INDIREKT_DB_REF("tabelle1", "Wärmeleistung (75/65/20)  in W/m"),
            g.INDIREKT_DB_REF("tabelle1", "Heizkörper_Typ"), [typ],
            g.INDIREKT_DB_REF("tabelle1", "Heizkörper_Subtyp"), [subtyp],
            g.INDIREKT_DB_REF("tabelle1", "Höhe H in mm"), [höhe ?? 0],
            g.INDIREKT_DB_REF("tabelle1", "Bautiefe T in mm"), [tiefe]
          ) * breite * (exponentFaktor ** exponent);

        return g.WENN(leistung > 0, leistung, 0);
      });




      /**
       * Row 132: Combined radiator power - power based on all radiator type checks
       * Original Excel formula: "IF(G69>\"\",G79,IF(G81>\"\",G91,IF(G93>\"\",G104,IF(G120>\"\",G130,\"\"))))"
       */
      grid.setCell('clc_power', `${clcPowerCol}132`, (s, c, g) =>
        g.WENN(
          g.g(s, `${clcPowerCol}69`) > "",
          g.n(s, `${clcPowerCol}79`),
          g.WENN(
            g.g(s, `${clcPowerCol}81`) > "",
            g.n(s, `${clcPowerCol}91`),
            g.WENN(
              g.g(s, `${clcPowerCol}93`) > "",
              g.n(s, `${clcPowerCol}104`),
              g.WENN(
                g.g(s, `${clcPowerCol}120`) > "",
                g.n(s, `${clcPowerCol}130`),
                ""
              )
            )
          )
        )
      );

      /**
       * Row 133: Combined alternative power - alternative power based on all radiator checks
       * Original Excel formula: "IF(G69>\"\",G80,IF(G81>\"\",G92,IF(G93>\"\",G105,IF(G120>\"\",G131,\"\"))))"
       */
      grid.setCell('clc_power', `${clcPowerCol}133`, (s, c, g) =>
        g.WENN(
          g.g(s, `${clcPowerCol}69`) > "",
          g.n(s, `${clcPowerCol}80`),
          g.WENN(
            g.g(s, `${clcPowerCol}81`) > "",
            g.n(s, `${clcPowerCol}92`),
            g.WENN(
              g.g(s, `${clcPowerCol}93`) > "",
              g.n(s, `${clcPowerCol}105`),
              g.WENN(
                g.g(s, `${clcPowerCol}120`) > "",
                g.n(s, `${clcPowerCol}131`),
                ""
              )
            )
          )
        )
      );

      /**
       * Row 136: Third radiator type check (Flachheizkörper) from IN_rooms
       * Original Excel formula: "IF(OR(IN_rooms!AC$63=\"Flachheizkoerper_glatt\",IN_rooms!AC$63=\"Flachheizkoerper_senkrecht_profiliert\"),IN_rooms!AC$63,\"\")"
       */
      grid.setCell('clc_power', `${clcPowerCol}136`, (s, c, g) =>
        g.WENN(
          g.ODER(
            g.g('IN_rooms', `${roomCol}63`) === 'Flachheizkoerper_glatt',
            g.g('IN_rooms', `${roomCol}63`) === 'Flachheizkoerper_senkrecht_profiliert'
          ),
          g.g('IN_rooms', `${roomCol}63`),
          ''
        ));

      /**
       * Row 137: Radiator subtype from IN_rooms
       * Original Excel formula: "IN_rooms!AC$64"
       */
      grid.setCell('clc_power', `${clcPowerCol}137`, (s, c, g) =>
        g.g('IN_rooms', `${roomCol}64`));

      /**
       * Row 138: Radiator height from IN_rooms
       * Original Excel formula: "IN_rooms!AC$65"
       */
      grid.setCell('clc_power', `${clcPowerCol}138`, (s, c, g) =>
        g.g('IN_rooms', `${roomCol}65`));

      /**
       * Row 139: Radiator length from IN_rooms
       * Original Excel formula: "IN_rooms!AC$66"
       */
      grid.setCell('clc_power', `${clcPowerCol}139`, (s, c, g) =>
        g.g('IN_rooms', `${roomCol}66`));

      /**
       * Row 140: Radiator depth lookup from Daten
       * Original Excel formula: "IF(R137=0,0,_xlfn.XLOOKUP(R137&\"_Tiefe\",Daten!$K$14:$Q$14,Daten!$K$15:$Q$15))"
       */
      grid.setCell('clc_power', `${clcPowerCol}140`, (s, c, g) =>
        g.WENN(
          g.n(s, `${clcPowerCol}137`) === 0,
          0,
          g.XVERWEIS(
            g.n(s, `${clcPowerCol}137`) + "_Tiefe",
            g.getCells('Daten', 'K14', 'Q14').flat(),
            g.getCells('Daten', 'K15', 'Q15').flat(),
            { ifNotFound: 0 }
          )
        ));

      /**
       * Row 141: Radiator exponent
       * Original Excel formula: "SUMIFS(
       *   INDIRECT(\"tabelle1[Heizkörperexponent n ]\"),
       *   INDIRECT(\"tabelle1[Heizkörper_Typ]\"), clc_power!R$136,
       *   INDIRECT(\"tabelle1[Heizkörper_Subtyp]\"), clc_power!R$137,
       *   INDIRECT(\"tabelle1[Höhe H in mm]\"), clc_power!R$138,
       *   INDIRECT(\"tabelle1[Bautiefe T in mm]\"), clc_power!R$140
       * )"
       */
      grid.setCell('clc_power', `${clcPowerCol}141`, (s, c, g) => {
        // Using SUMMEWENNS to follow the Excel formula pattern exactly
        return g.SUMMEWENNS(
          g.INDIREKT_DB_REF("tabelle1", "Heizkörperexponent n "),
          g.INDIREKT_DB_REF("tabelle1", "Heizkörper_Typ"), [g.g(s, `${clcPowerCol}136`)],
          g.INDIREKT_DB_REF("tabelle1", "Heizkörper_Subtyp"), [g.g(s, `${clcPowerCol}137`)],
          g.INDIREKT_DB_REF("tabelle1", "Höhe H in mm"), [g.g(s, `${clcPowerCol}138`)],
          g.INDIREKT_DB_REF("tabelle1", "Bautiefe T in mm"), [g.g(s, `${clcPowerCol}140`)]
        );
      });

      /**
       * Row 142: Radiator power at 75/65/20
       * Original Excel formula: "_xlfn.LET(
       *   _xlpm.leistung, IN_rooms!AC$69 * SUMIFS(
       *     INDIRECT(\"tabelle1[Wärmeleistung (75/65/20)  in W/m]\"),
       *     INDIRECT(\"tabelle1[Heizkörper_Typ]\"), clc_power!R$136,
       *     INDIRECT(\"tabelle1[Heizkörper_Subtyp]\"), clc_power!R$137,
       *     INDIRECT(\"tabelle1[Höhe H in mm]\"), clc_power!R$138,
       *     INDIRECT(\"tabelle1[Bautiefe T in mm]\"), clc_power!R$140  ) * R$139 / 1000,
       *   IF(_xlpm.leistung > 0, _xlpm.leistung, 0)
       * )"
       */
      grid.setCell('clc_power', `${clcPowerCol}142`, (s, c, g) => {
        // Using JavaScript let to match Excel LET function for leistung variable
        let leistung = g.n('IN_rooms', `${roomCol}69`) * g.SUMMEWENNS(
          g.INDIREKT_DB_REF("tabelle1", "Wärmeleistung (75/65/20)  in W/m"),
          g.INDIREKT_DB_REF("tabelle1", "Heizkörper_Typ"), [g.g(s, `${clcPowerCol}136`)],
          g.INDIREKT_DB_REF("tabelle1", "Heizkörper_Subtyp"), [g.g(s, `${clcPowerCol}137`)],
          g.INDIREKT_DB_REF("tabelle1", "Höhe H in mm"), [g.g(s, `${clcPowerCol}138`)],
          g.INDIREKT_DB_REF("tabelle1", "Bautiefe T in mm"), [g.g(s, `${clcPowerCol}140`)]
        ) * g.n(s, `${clcPowerCol}139`) / 1000;

        return g.WENN(leistung > 0, leistung, 0);
      });

      /**
       * Row 143: Target flow temperature from Named cell
       * Original Excel formula: "TVL_Ziel"
       */
      grid.setCell('clc_power', `${clcPowerCol}143`, (s, c, g) =>
        g.g('Names', 'TVL_Ziel'));

      /**
       * Row 144: Target return temperature from Named cell
       * Original Excel formula: "TRL_Ziel"
       */
      grid.setCell('clc_power', `${clcPowerCol}144`, (s, c, g) =>
        g.g('Names', 'TRL_Ziel'));

      /**
       * Row 145: Logarithmic mean temperature difference
       * Original Excel formula: "(R$143-R$144)/(LN((R$143-clc_load!T$10)/(R$144-clc_load!T$10)))"
       */
      grid.setCell('clc_power', `${clcPowerCol}145`, (s, c, g) =>
        (g.n(s, `${clcPowerCol}143`) - g.n(s, `${clcPowerCol}144`)) /
        g.LN((g.n(s, `${clcPowerCol}143`) - g.n('clc_load', `${clcLoadCol}10`)) /
             (g.n(s, `${clcPowerCol}144`) - g.n('clc_load', `${clcLoadCol}10`)))
      );

      /**
       * Row 146: Radiator power at target temperature
       * Original Excel formula: "IF(R$142*((R$145/Log_ÜT_Norm)^R$141)>0,
       * R$142*((R$145/Log_ÜT_Norm)^R$141),0)"
       */
      grid.setCell('clc_power', `${clcPowerCol}146`, (s, c, g) =>
        g.WENN(
          g.n(s, `${clcPowerCol}142`) * ((g.n(s, `${clcPowerCol}145`) / g.n('Names', 'Log_ÜT_Norm')) ** g.n(s, `${clcPowerCol}141`)) > 0,
          g.n(s, `${clcPowerCol}142`) * ((g.n(s, `${clcPowerCol}145`) / g.n('Names', 'Log_ÜT_Norm')) ** g.n(s, `${clcPowerCol}141`)),
          0
        )
      );

      /**
       * Row 147: Alternative radiator power calculation
       * Original Excel formula: "_xlfn.LET(
       *     _xlpm.leistung, IN_rooms!AC$69 * SUMIFS(
       *         INDIRECT(\"tabelle1[Wärmeleistung (75/65/20)  in W/m]\"),
       *         INDIRECT(\"tabelle1[Heizkörper_Typ]\"), \"Flachheizkoerper_senkrecht_profiliert\",
       *         INDIRECT(\"tabelle1[Heizkörper_Subtyp]\"), \"Typ_33\",
       *         INDIRECT(\"tabelle1[Höhe H in mm]\"), R$138,
       *         INDIRECT(\"tabelle1[Bautiefe T in mm]\"), 155
       *     ) * R$139 / 1000 * ((R$145 / Log_ÜT_Norm) ^ SUMIFS(
       *         INDIRECT(\"tabelle1[Heizkörperexponent n ]\"),
       *         INDIRECT(\"tabelle1[Heizkörper_Typ]\"), \"Flachheizkoerper_senkrecht_profiliert\",
       *         INDIRECT(\"tabelle1[Heizkörper_Subtyp]\"), \"Typ_33\",
       *         INDIRECT(\"tabelle1[Höhe H in mm]\"), R$138,
       *         INDIRECT(\"tabelle1[Bautiefe T in mm]\"), 155
       *     )),
       *     IF(_xlpm.leistung > 0, _xlpm.leistung, 0)
       * )"
       */
      grid.setCell('clc_power', `${clcPowerCol}147`, (s, c, g) => {
        // Calculate alternative power using type 33 radiator
        let leistung = g.n('IN_rooms', `${roomCol}69`) * g.SUMMEWENNS(
          g.INDIREKT_DB_REF("tabelle1", "Wärmeleistung (75/65/20)  in W/m"),
          g.INDIREKT_DB_REF("tabelle1", "Heizkörper_Typ"), ["Flachheizkoerper_senkrecht_profiliert"],
          g.INDIREKT_DB_REF("tabelle1", "Heizkörper_Subtyp"), ["Typ_33"],
          g.INDIREKT_DB_REF("tabelle1", "Höhe H in mm"), [g.g(s, `${clcPowerCol}138`)],
          g.INDIREKT_DB_REF("tabelle1", "Bautiefe T in mm"), [155]
        ) * g.n(s, `${clcPowerCol}139`) / 1000 * ((g.n(s, `${clcPowerCol}145`) / g.n('Names', 'Log_ÜT_Norm')) **
          g.SUMMEWENNS(
            g.INDIREKT_DB_REF("tabelle1", "Heizkörperexponent n "),
            g.INDIREKT_DB_REF("tabelle1", "Heizkörper_Typ"), ["Flachheizkoerper_senkrecht_profiliert"],
            g.INDIREKT_DB_REF("tabelle1", "Heizkörper_Subtyp"), ["Typ_33"],
            g.INDIREKT_DB_REF("tabelle1", "Höhe H in mm"), [g.g(s, `${clcPowerCol}138`)],
            g.INDIREKT_DB_REF("tabelle1", "Bautiefe T in mm"), [155]
          )
        );

        return g.WENN(leistung > 0, leistung, 0);
      });

      /**
       * Row 148: Cast iron radiator check from IN_rooms
       * Original Excel formula: "IF(IN_rooms!AC$63=\"Gliederheizkörper\",IN_rooms!AC$63,\"\")"
       */
      grid.setCell('clc_power', `${clcPowerCol}148`, (s, c, g) =>
        g.WENN(
          g.g('IN_rooms', `${roomCol}63`) === 'Gliederheizkörper',
          g.g('IN_rooms', `${roomCol}63`),
          ''
        )
      );

      /**
       * Row 149: Radiator subtype from IN_rooms
       * Original Excel formula: "IN_rooms!AC$64"
       */
      grid.setCell('clc_power', `${clcPowerCol}149`, (s, c, g) =>
        g.g('IN_rooms', `${roomCol}64`)
      );

      /**
       * Row 150: Radiator height from IN_rooms
       * Original Excel formula: "IN_rooms!AC$65"
       */
      grid.setCell('clc_power', `${clcPowerCol}150`, (s, c, g) =>
        g.g('IN_rooms', `${roomCol}65`)
      );

      /**
       * Row 151: Radiator depth calculation based on type
       * Original Excel formula: "_xlfn.IFS(IN_rooms!AC$67=0,0,
       * R149 = \"Stahlradiator\",
       * INDEX(Daten!$AF$13:$AF$23,_xlfn.XMATCH(MIN(IF(Daten!$AE$13:$AE$23=R150,ABS(Daten!$AF$13:$AF$23-IN_rooms!AC$67))),
       *                                 IF(Daten!$AE$13:$AE$23=R150,ABS(Daten!$AF$13:$AF$23-IN_rooms!AC$67)),
       *                                 0)),
       * R149 = \"Gussradiator\",
       * INDEX(Daten!$AD$13:$AD$25,_xlfn.XMATCH(MIN(IF(Daten!$AC$13:$AC$25=R150,ABS(Daten!$AD$13:$AD$25-IN_rooms!AC$67))),
       *                                  IF(Daten!$AC$13:$AC$25=R150,ABS(Daten!$AD$13:$AD$25-IN_rooms!AC$67)),
       *                                  0)),
       * TRUE, IN_rooms!AC$67)"
       */
      grid.setCell('clc_power', `${clcPowerCol}151`, (s, c, g) => {
        const radius = g.n("IN_rooms", `${roomCol}67`);
        const typ = g.g(s, `${clcPowerCol}149`);
        const size = g.g(s, `${clcPowerCol}150`);

        return g.WENNS(
          radius === 0, 0,

          typ === "Stahlradiator", (() => {
            const rawValues = g.RANGE("Daten!AF13:AF23", s).map(Number);
            const condition = g.GLEICH(g.RANGE("Daten!AE13:AE23", s), size);
            const filtered = g.WENN_ARRAY(condition, g.ABS_ARRAY(rawValues.map(v => v - radius)));
            const idx = g.MIN_INDEX(filtered);
            return rawValues[idx];
          })(),

          typ === "Gussradiator", (() => {
            const rawValues = g.RANGE("Daten!AD13:AD25", s).map(Number);
            const condition = g.GLEICH(g.RANGE("Daten!AC13:AC25", s), size);
            const filtered = g.WENN_ARRAY(condition, g.ABS_ARRAY(rawValues.map(v => v - radius)));
            const idx = g.MIN_INDEX(filtered);
            return rawValues[idx];
          })(),

          g.WAHR(), radius
        );
      });

      /**
       * Row 152: Number of elements from IN_rooms
       * Original Excel formula: "IN_rooms!AC$68"
       */
      grid.setCell('clc_power', `${clcPowerCol}152`, (s, c, g) =>
        g.g('IN_rooms', `${roomCol}68`)
      );

      /**
       * Row 153: Radiator exponent fixed value
       * Original Excel formula: "1.3"
       */
      grid.setCell('clc_power', `${clcPowerCol}153`, (s, c, g) => 1.3);

      /**
       * Row 154: Radiator power calculation at 75/65/20
       * Original Excel formula: "_xlfn.LET(
       *     _xlpm.wärmeleistung, SUMIFS(
       *         INDIRECT(\"tabelle1[Wärmeleistung (75/65/20)  in W/Glied]\"),
       *         INDIRECT(\"tabelle1[Heizkörper_Typ]\"), clc_power!R$148,
       *         INDIRECT(\"tabelle1[Heizkörper_Subtyp]\"), clc_power!R$149,
       *         INDIRECT(\"tabelle1[Höhe H in mm]\"), clc_power!R$150,
       *         INDIRECT(\"tabelle1[Bautiefe T in mm]\"), clc_power!R$151
       *     ),
       *     _xlpm.leistung, IN_rooms!AC$69 * _xlpm.wärmeleistung * R$152,
       *     IF(_xlpm.leistung > 0, _xlpm.leistung, 0)
       * )"
       */
      grid.setCell('clc_power', `${clcPowerCol}154`, (s, c, g) => {
        // Using JavaScript let variables to emulate Excel LET function
        let wärmeleistung = g.SUMMEWENNS(
          g.INDIREKT_DB_REF("tabelle1", "Wärmeleistung (75/65/20)  in W/Glied"),
          g.INDIREKT_DB_REF("tabelle1", "Heizkörper_Typ"), [g.g(s, `${clcPowerCol}148`)],
          g.INDIREKT_DB_REF("tabelle1", "Heizkörper_Subtyp"), [g.g(s, `${clcPowerCol}149`)],
          g.INDIREKT_DB_REF("tabelle1", "Höhe H in mm"), [g.g(s, `${clcPowerCol}150`)],
          g.INDIREKT_DB_REF("tabelle1", "Bautiefe T in mm"), [g.g(s, `${clcPowerCol}151`)]
        );

        let leistung = g.n('IN_rooms', `${roomCol}69`) * wärmeleistung * g.n(s, `${clcPowerCol}152`);

        return g.WENN(leistung > 0, leistung, 0);
      });

      /**
       * Row 155: Target flow temperature from Named cell
       * Original Excel formula: "TVL_Ziel"
       */
      grid.setCell('clc_power', `${clcPowerCol}155`, (s, c, g) =>
        g.g('Names', 'TVL_Ziel')
      );

      /**
       * Row 156: Target return temperature from Named cell
       * Original Excel formula: "TRL_Ziel"
       */
      grid.setCell('clc_power', `${clcPowerCol}156`, (s, c, g) =>
        g.g('Names', 'TRL_Ziel')
      );

      /**
       * Row 157: Logarithmic mean temperature difference
       * Original Excel formula: "(R$155-R$156)/(LN((R$155-clc_load!T$10)/(R$156-clc_load!T$10)))"
       */
      grid.setCell('clc_power', `${clcPowerCol}157`, (s, c, g) =>
        (g.n(s, `${clcPowerCol}155`) - g.n(s, `${clcPowerCol}156`)) /
        g.LN((g.n(s, `${clcPowerCol}155`) - g.n('clc_load', `${clcLoadCol}10`)) /
             (g.n(s, `${clcPowerCol}156`) - g.n('clc_load', `${clcLoadCol}10`)))
      );

      /**
       * Row 158: Radiator power at target temperature
       * Original Excel formula: "IF(R$154*((R$157/Log_ÜT_Norm)^R$153)>0,
       * R$154*((R$157/Log_ÜT_Norm)^R$153),0)"
       */
      grid.setCell('clc_power', `${clcPowerCol}158`, (s, c, g) =>
        g.WENN(
          g.n(s, `${clcPowerCol}154`) * ((g.n(s, `${clcPowerCol}157`) / g.n('Names', 'Log_ÜT_Norm')) ** g.n(s, `${clcPowerCol}153`)) > 0,
          g.n(s, `${clcPowerCol}154`) * ((g.n(s, `${clcPowerCol}157`) / g.n('Names', 'Log_ÜT_Norm')) ** g.n(s, `${clcPowerCol}153`)),
          0
        )
      );

      /**
       * Row 159: Alternative radiator power calculation
       * Original Excel formula: "_xlfn.LET(
       *     _xlpm.typ, \"Flachheizkoerper_senkrecht_profiliert\",
       *     _xlpm.subtyp, \"Typ_33\",
       *     _xlpm.höhe, _xlfn.XLOOKUP(R$150, Data_radiator!$G$5:$G$32, Data_radiator!$G$5:$G$32, 1000000, 1, 1),
       *     _xlpm.tiefe, 155,
       *     _xlpm.glieder, R$152,
       *     _xlpm.radiatorart, R$149,
       *     _xlpm.tempfaktor, IF(_xlpm.radiatorart = \"Gussradiator\", 50, 60),
       *     _xlpm.überschuss, R$157,
       *     _xlpm.leistung, IN_rooms!AC$69 *
       *         SUMIFS(
       *             INDIRECT(\"tabelle1[Wärmeleistung (75/65/20)  in W/m]\"),
       *             INDIRECT(\"tabelle1[Heizkörper_Typ]\"), _xlpm.typ,
       *             INDIRECT(\"tabelle1[Heizkörper_Subtyp]\"), _xlpm.subtyp,
       *             INDIRECT(\"tabelle1[Höhe H in mm]\"), _xlpm.höhe,
       *             INDIRECT(\"tabelle1[Bautiefe T in mm]\"), _xlpm.tiefe
       *         ) *
       *         ((_xlpm.glieder * _xlpm.tempfaktor / 1000) *
       *         ((_xlpm.überschuss / Log_ÜT_Norm) ^
       *             SUMIFS(
       *                 INDIRECT(\"tabelle1[Heizkörperexponent n ]\"),
       *                 INDIRECT(\"tabelle1[Heizkörper_Typ]\"), _xlpm.typ,
       *                 INDIRECT(\"tabelle1[Heizkörper_Subtyp]\"), _xlpm.subtyp,
       *                 INDIRECT(\"tabelle1[Höhe H in mm]\"), _xlpm.höhe,
       *                 INDIRECT(\"tabelle1[Bautiefe T in mm]\"), _xlpm.tiefe
       *             )
       *         )
       *     ),
       *     IF(_xlpm.leistung > 0, _xlpm.leistung, 0)
       * )"
       */
      grid.setCell('clc_power', `${clcPowerCol}159`, (s, c, g) => {
        // Define all LET variables
        let typ = "Flachheizkoerper_senkrecht_profiliert";
        let subtyp = "Typ_33";
        let höhe = g.XVERWEIS(
          g.g(s, `${clcPowerCol}150`),
          g.getCells('Data_radiator', 'G5', 'G32').flat(),
          g.getCells('Data_radiator', 'G5', 'G32').flat(),
          { ifNotFound: 1000000, matchMode: 'exactOrNextSmaller', searchMode: 'first' }
        );
        let tiefe = 155;
        let glieder = g.n(s, `${clcPowerCol}152`);
        let radiatorart = g.g(s, `${clcPowerCol}149`);
        let tempfaktor = radiatorart === "Gussradiator" ? 50 : 60;
        let überschuss = g.n(s, `${clcPowerCol}157`);

        // Calculate exponent using SUMIFS
        let exponent = g.SUMMEWENNS(
          g.INDIREKT_DB_REF("tabelle1", "Heizkörperexponent n "),
          g.INDIREKT_DB_REF("tabelle1", "Heizkörper_Typ"), [typ],
          g.INDIREKT_DB_REF("tabelle1", "Heizkörper_Subtyp"), [subtyp],
          g.INDIREKT_DB_REF("tabelle1", "Höhe H in mm"), [höhe ?? 0],
          g.INDIREKT_DB_REF("tabelle1", "Bautiefe T in mm"), [tiefe]
        );

        // Calculate power using SUMIFS and all the above variables
        let leistung = g.n('IN_rooms', `${roomCol}69`) *
          g.SUMMEWENNS(
            g.INDIREKT_DB_REF("tabelle1", "Wärmeleistung (75/65/20)  in W/m"),
            g.INDIREKT_DB_REF("tabelle1", "Heizkörper_Typ"), [typ],
            g.INDIREKT_DB_REF("tabelle1", "Heizkörper_Subtyp"), [subtyp],
            g.INDIREKT_DB_REF("tabelle1", "Höhe H in mm"), [höhe ?? 0],
            g.INDIREKT_DB_REF("tabelle1", "Bautiefe T in mm"), [tiefe]
          ) *
          ((glieder * tempfaktor / 1000) *
           ((überschuss / g.n('Names', 'Log_ÜT_Norm')) ** exponent)
          );

        return g.WENN(leistung > 0, leistung, 0);
      });

      /**
       * Row 160: Tube radiator check from IN_rooms
       * Original Excel formula: "IF(IN_rooms!AC$63=\"Rohrradiator\",IN_rooms!AC$63,\"\")"
       */
      grid.setCell('clc_power', `${clcPowerCol}160`, (s, c, g) =>
        g.WENN(
          g.g('IN_rooms', `${roomCol}63`) === 'Rohrradiator',
          g.g('IN_rooms', `${roomCol}63`),
          ''
        )
      );

      /**
       * Row 161: Radiator subtype from IN_rooms
       * Original Excel formula: "IN_rooms!AC$64"
       */
      grid.setCell('clc_power', `${clcPowerCol}161`, (s, c, g) =>
        g.g('IN_rooms', `${roomCol}64`)
      );

      /**
       * Row 162: Radiator height from IN_rooms
       * Original Excel formula: "IN_rooms!AC$65"
       */
      grid.setCell('clc_power', `${clcPowerCol}162`, (s, c, g) =>
        g.g('IN_rooms', `${roomCol}65`)
      );

      /**
       * Row 163: Radiator width calculation based on type
       * Original Excel formula: "IF(R161=\"Fensterbankradiator\",
       * IF(IN_rooms!AC$66=0,0,INDEX(Fensterbankradiator_b[],MATCH(MIN(ABS(Fensterbankradiator_b[]-IN_rooms!AC$66)),ABS(Fensterbankradiator_b[]-IN_rooms!AC$66),0))),
       * IN_rooms!AC$66)"
       */
      grid.setCell('clc_power', `${clcPowerCol}163`, (s, c, g) => {
        if (g.g(s, `${clcPowerCol}161`) === "Fensterbankradiator") {
          const userWidth = g.n('IN_rooms', `${roomCol}66`);
          if (userWidth === 0) return 0;

          // Get Fensterbankradiator_b array using INDIREKT_DB_REF
          const radiatorWidths = g.INDIREKT_DB_REF("Fensterbankradiator_b").map(Number);
          if (!radiatorWidths.length) return 0;

          // Calculate the absolute differences
          const differences = g.ABS_ARRAY(radiatorWidths.map(width => width - userWidth));

          // Find the minimum difference and its index
          const matchIndex = g.MIN_INDEX(differences);

          return radiatorWidths[matchIndex] || 0;
        } else {
          return g.g('IN_rooms', `${roomCol}66`);
        }
      });

      /**
       * Row 164: Radiator depth from IN_rooms
       * Original Excel formula: "IN_rooms!AC$67"
       */
      grid.setCell('clc_power', `${clcPowerCol}164`, (s, c, g) =>
        g.g('IN_rooms', `${roomCol}67`)
      );

      /**
       * Row 165: Number of elements from IN_rooms
       * Original Excel formula: "IN_rooms!AC$68"
       */
      grid.setCell('clc_power', `${clcPowerCol}165`, (s, c, g) =>
        g.g('IN_rooms', `${roomCol}68`)
      );

      /**
       * Row 166: Radiator exponent based on type
       * Original Excel formula: "_xlfn.IFS(
       *        R$161 = \"Stahlrohrradiator\", 1.3,
       *        R$161 = \"Fensterbankradiator\", 1.3,
       *        R$161 = \"Handtuchradiator\", 1.21,
       *        R$160 = \"\", 0
       *    )"
       */
      grid.setCell('clc_power', `${clcPowerCol}166`, (s, c, g) =>
        g.WENNS(
          g.g(s, `${clcPowerCol}161`) === "Stahlrohrradiator", 1.3,
          g.g(s, `${clcPowerCol}161`) === "Fensterbankradiator", 1.3,
          g.g(s, `${clcPowerCol}161`) === "Handtuchradiator", 1.21,
          g.g(s, `${clcPowerCol}160`) === "", 0
        )
      );

      /**
       * Row 167: Radiator power calculation for tube/special radiators
       * Original Excel formula: "_xlfn.LET(
       *    _xlpm.typ, clc_power!R$160,
       *    _xlpm.subtyp, clc_power!R$161,
       *    _xlpm.höhe, clc_power!R$162,
       *    _xlpm.breite, clc_power!R$166,
       *    _xlpm.tiefe, clc_power!R$164,
       *    _xlpm.faktor, clc_power!R$165,
       *    _xlpm.fläche, IN_rooms!AC$65 * IN_rooms!AC$66,
       *    _xlpm.radiatorart, R$161,
       *    _xlpm.leistung, _xlfn.IFS(
       *        _xlpm.radiatorart = \"Stahlrohrradiator\",
       *            _xlpm.faktor * SUMIFS(
       *                INDIRECT(\"tabelle1[Wärmeleistung (75/65/20)  in W/Glied]\"),
       *                INDIRECT(\"tabelle1[Heizkörper_Typ]\"), _xlpm.typ,
       *                INDIRECT(\"tabelle1[Heizkörper_Subtyp]\"), _xlpm.subtyp,
       *                INDIRECT(\"tabelle1[Höhe H in mm]\"), _xlpm.höhe,
       *                INDIRECT(\"tabelle1[Bautiefe T in mm]\"), _xlpm.tiefe
       *            ),
       *        _xlpm.radiatorart = \"Handtuchradiator\",
       *            919 * (_xlpm.fläche / 10^6) + 76.691,
       *        _xlpm.radiatorart = \"Fensterbankradiator\",
       *            SUMIFS(
       *                INDIRECT(\"tabelle1[Wärmeleistung (75/65/20)  in W]\"),
       *                INDIRECT(\"tabelle1[Heizkörper_Typ]\"), _xlpm.typ,
       *                INDIRECT(\"tabelle1[Heizkörper_Subtyp]\"), _xlpm.subtyp,
       *                INDIRECT(\"tabelle1[Höhe H in mm]\"), _xlpm.höhe,
       *                INDIRECT(\"tabelle1[Breite B in mm]\"), _xlpm.breite,
       *                INDIRECT(\"tabelle1[Bautiefe T in mm]\"), _xlpm.tiefe
       *            ),
       *        _xlpm.typ = \"\", 0
       *    ),
       *    IF(IN_rooms!AC$69 * _xlpm.leistung > 0, IN_rooms!AC$69 * _xlpm.leistung, 0)
       * )"
       */
      grid.setCell('clc_power', `${clcPowerCol}167`, (s, c, g) => {
        // Define LET variables
        const typ = g.g(s, `${clcPowerCol}160`);
        const subtyp = g.g(s, `${clcPowerCol}161`);
        const höhe = g.g(s, `${clcPowerCol}162`);
        const breite = g.n(s, `${clcPowerCol}166`);
        const tiefe = g.g(s, `${clcPowerCol}164`);
        const faktor = g.n(s, `${clcPowerCol}165`);
        const fläche = g.n('IN_rooms', `${roomCol}65`) * g.n('IN_rooms', `${roomCol}66`);
        const radiatorart = g.g(s, `${clcPowerCol}161`);

        // Calculate power using IFS function
        let leistung = 0;
        if (radiatorart === "Stahlrohrradiator") {
          leistung = faktor * g.SUMMEWENNS(
            g.INDIREKT_DB_REF("tabelle1", "Wärmeleistung (75/65/20)  in W/Glied"),
            g.INDIREKT_DB_REF("tabelle1", "Heizkörper_Typ"), [typ],
            g.INDIREKT_DB_REF("tabelle1", "Heizkörper_Subtyp"), [subtyp],
            g.INDIREKT_DB_REF("tabelle1", "Höhe H in mm"), [höhe],
            g.INDIREKT_DB_REF("tabelle1", "Bautiefe T in mm"), [tiefe]
          );
        } else if (radiatorart === "Handtuchradiator") {
          leistung = 919 * (fläche / Math.pow(10, 6)) + 76.691;
        } else if (radiatorart === "Fensterbankradiator") {
          leistung = g.SUMMEWENNS(
            g.INDIREKT_DB_REF("tabelle1", "Wärmeleistung (75/65/20)  in W"),
            g.INDIREKT_DB_REF("tabelle1", "Heizkörper_Typ"), [typ],
            g.INDIREKT_DB_REF("tabelle1", "Heizkörper_Subtyp"), [subtyp],
            g.INDIREKT_DB_REF("tabelle1", "Höhe H in mm"), [höhe],
            g.INDIREKT_DB_REF("tabelle1", "Breite B in mm"), [breite],
            g.INDIREKT_DB_REF("tabelle1", "Bautiefe T in mm"), [tiefe]
          );
        } else if (typ === "") {
          leistung = 0;
        }

        return g.WENN(g.n('IN_rooms', `${roomCol}69`) * leistung > 0, g.n('IN_rooms', `${roomCol}69`) * leistung, 0);
      });

      /**
       * Row 168: Target flow temperature from Named cell
       * Original Excel formula: "TVL_Ziel"
       */
      grid.setCell('clc_power', `${clcPowerCol}168`, (s, c, g) =>
        g.g('Names', 'TVL_Ziel')
      );

      /**
       * Row 169: Target return temperature from Named cell
       * Original Excel formula: "TRL_Ziel"
       */
      grid.setCell('clc_power', `${clcPowerCol}169`, (s, c, g) =>
        g.g('Names', 'TRL_Ziel')
      );

      /**
       * Row 170: Logarithmic mean temperature difference
       * Original Excel formula: "(R$168-R$169)/(LN((R$168-clc_load!T$10)/(R$169-clc_load!T$10)))"
       */
      grid.setCell('clc_power', `${clcPowerCol}170`, (s, c, g) =>
        (g.n(s, `${clcPowerCol}168`) - g.n(s, `${clcPowerCol}169`)) /
        g.LN((g.n(s, `${clcPowerCol}168`) - g.n('clc_load', `${clcLoadCol}10`)) /
             (g.n(s, `${clcPowerCol}169`) - g.n('clc_load', `${clcLoadCol}10`)))
      );

      /**
       * Row 171: Radiator power at target temperature
       * Original Excel formula: "R$167*((R$170/Log_ÜT_Norm)^R$166)"
       */
      grid.setCell('clc_power', `${clcPowerCol}171`, (s, c, g) =>
        g.n(s, `${clcPowerCol}167`) * ((g.n(s, `${clcPowerCol}170`) / g.n('Names', 'Log_ÜT_Norm')) ** g.n(s, `${clcPowerCol}166`))
      );

      /**
       * Row 172: Alternative radiator power calculation
       * Original Excel formula: "_xlfn.LET(
       *     _xlpm.typ, \"Flachheizkoerper_senkrecht_profiliert\",
       *     _xlpm.subtyp, \"Typ_33\",
       *     _xlpm.höhe, _xlfn.XLOOKUP(R$95, Data_radiator!$G$5:$G$32, Data_radiator!$G$5:$G$32, 1000000, 1, 1),
       *     _xlpm.tiefe, 155,
       *     _xlpm.glieder, IF(R$94 = \"Stahlrohrradiator\", 45, R$163),
       *     _xlpm.faktor, R$170 / Log_ÜT_Norm,
       *
       *     _xlpm.leistung, IN_rooms!AC$69 *
       *         SUMIFS(
       *             INDIRECT(\"tabelle1[Wärmeleistung (75/65/20)  in W/m]\"),
       *             INDIRECT(\"tabelle1[Heizkörper_Typ]\"), _xlpm.typ,
       *             INDIRECT(\"tabelle1[Heizkörper_Subtyp]\"), _xlpm.subtyp,
       *             INDIRECT(\"tabelle1[Höhe H in mm]\"), _xlpm.höhe,
       *             INDIRECT(\"tabelle1[Bautiefe T in mm]\"), _xlpm.tiefe
       *         ) *
       *         (_xlpm.glieder / 1000) *
       *         _xlpm.faktor ^
       *         SUMIFS(
       *             INDIRECT(\"tabelle1[Heizkörperexponent n ]\"),
       *             INDIRECT(\"tabelle1[Heizkörper_Typ]\"), _xlpm.typ,
       *             INDIRECT(\"tabelle1[Heizkörper_Subtyp]\"), _xlpm.subtyp,
       *             INDIRECT(\"tabelle1[Höhe H in mm]\"), _xlpm.höhe,
       *             INDIRECT(\"tabelle1[Bautiefe T in mm]\"), _xlpm.tiefe
       *         ),
       *
       *     IF(_xlpm.leistung > 0, _xlpm.leistung, 0)
       * )"
       */
      grid.setCell('clc_power', `${clcPowerCol}172`, (s, c, g) => {
        // Define LET variables
        const typ = "Flachheizkoerper_senkrecht_profiliert";
        const subtyp = "Typ_33";
        const höhe = g.XVERWEIS(
          g.g(s, `${clcPowerCol}95`),
          g.getCells('Data_radiator', 'G5', 'G32').flat(),
          g.getCells('Data_radiator', 'G5', 'G32').flat(),
          { ifNotFound: 1000000, matchMode: 'exactOrNextSmaller', searchMode: 'first' }
        );
        const tiefe = 155;
        const glieder = g.g(s, `${clcPowerCol}94`) === "Stahlrohrradiator" ? 45 : g.n(s, `${clcPowerCol}163`);
        const faktor = g.n(s, `${clcPowerCol}170`) / g.n('Names', 'Log_ÜT_Norm');

        // Calculate exponent using SUMIFS
        const exponent = g.SUMMEWENNS(
          g.INDIREKT_DB_REF("tabelle1", "Heizkörperexponent n "),
          g.INDIREKT_DB_REF("tabelle1", "Heizkörper_Typ"), [typ],
          g.INDIREKT_DB_REF("tabelle1", "Heizkörper_Subtyp"), [subtyp],
          g.INDIREKT_DB_REF("tabelle1", "Höhe H in mm"), [höhe ?? 0],
          g.INDIREKT_DB_REF("tabelle1", "Bautiefe T in mm"), [tiefe]
        );

        // Calculate leistung
        const leistung = g.n('IN_rooms', `${roomCol}69`) *
          g.SUMMEWENNS(
            g.INDIREKT_DB_REF("tabelle1", "Wärmeleistung (75/65/20)  in W/m"),
            g.INDIREKT_DB_REF("tabelle1", "Heizkörper_Typ"), [typ],
            g.INDIREKT_DB_REF("tabelle1", "Heizkörper_Subtyp"), [subtyp],
            g.INDIREKT_DB_REF("tabelle1", "Höhe H in mm"), [höhe ?? 0],
            g.INDIREKT_DB_REF("tabelle1", "Bautiefe T in mm"), [tiefe]
          ) *
          (glieder / 1000) *
          (faktor ** exponent);

        return g.WENN(leistung > 0, leistung, 0);
      });

      /**
       * Row 187: Convector type check from IN_rooms
       * Original Excel formula: "IF(IN_rooms!AC$63=\"Konvektor\",IN_rooms!AC$63,\"\")"
       */
      grid.setCell('clc_power', `${clcPowerCol}187`, (s, c, g) =>
        g.WENN(
          g.g('IN_rooms', `${roomCol}63`) === 'Konvektor',
          g.g('IN_rooms', `${roomCol}63`),
          ''
        )
      );

      /**
       * Row 188: Convector subtype
       * Original Excel formula: "IF(R187>\"\",\"Standardkonvektor\",\"\")"
       */
      grid.setCell('clc_power', `${clcPowerCol}188`, (s, c, g) =>
        g.WENN(
          g.g(s, `${clcPowerCol}187`) > "",
          "Standardkonvektor",
          ""
        )
      );

      /**
       * Row 189: Convector height from IN_rooms
       * Original Excel formula: "IN_rooms!AC$65"
       */
      grid.setCell('clc_power', `${clcPowerCol}189`, (s, c, g) =>
        g.g('IN_rooms', `${roomCol}65`)
      );

      /**
       * Row 190: Convector length from IN_rooms
       * Original Excel formula: "IN_rooms!AC$66"
       */
      grid.setCell('clc_power', `${clcPowerCol}190`, (s, c, g) =>
        g.g('IN_rooms', `${roomCol}66`)
      );

      /**
       * Row 191: Convector depth from IN_rooms
       * Original Excel formula: "IN_rooms!AC$67"
       */
      grid.setCell('clc_power', `${clcPowerCol}191`, (s, c, g) =>
        g.g('IN_rooms', `${roomCol}67`)
      );

      /**
       * Row 192: Convector exponent from Tabelle1
       * Original Excel formula: "_xlfn.LET(
       *   _xlpm.typ, clc_power!G$187,
       *   _xlpm.subtyp, clc_power!G$188,
       *   _xlpm.höhe, clc_power!G$189,
       *   _xlpm.tiefe, clc_power!G$191,
       *   SUMIFS(
       *       INDIRECT(\"tabelle1[Heizkörperexponent n ]\"),
       *       INDIRECT(\"tabelle1[Heizkörper_Typ]\"), _xlpm.typ,
       *       INDIRECT(\"tabelle1[Heizkörper_Subtyp]\"), _xlpm.subtyp,
       *       INDIRECT(\"tabelle1[Höhe H in mm]\"), _xlpm.höhe,
       *       INDIRECT(\"tabelle1[Bautiefe T in mm]\"), _xlpm.tiefe
       *   )
       * )"
       */
      grid.setCell('clc_power', `${clcPowerCol}192`, (s, c, g) => {
        // Implement LET function as JavaScript variables
        const typ = g.g(s, `${clcPowerCol}187`);
        const subtyp = g.g(s, `${clcPowerCol}188`);
        const höhe = g.g(s, `${clcPowerCol}189`);
        const tiefe = g.g(s, `${clcPowerCol}191`);

        // Use SUMMEWENNS to get the exponent value from Tabelle1
        return g.SUMMEWENNS(
          g.INDIREKT_DB_REF("tabelle1", "Heizkörperexponent n "),
          g.INDIREKT_DB_REF("tabelle1", "Heizkörper_Typ"), [typ],
          g.INDIREKT_DB_REF("tabelle1", "Heizkörper_Subtyp"), [subtyp],
          g.INDIREKT_DB_REF("tabelle1", "Höhe H in mm"), [höhe],
          g.INDIREKT_DB_REF("tabelle1", "Bautiefe T in mm"), [tiefe]
        );
      });

      /**
       * Row 193: Convector power at 75/65/20
       * Original Excel formula: "_xlfn.LET(
       *   _xlpm.anzahl, IN_rooms!R$69,
       *   _xlpm.typ, clc_power!G$187,
       *   _xlpm.subtyp, clc_power!G$188,
       *   _xlpm.höhe, clc_power!G$189,
       *   _xlpm.breite, clc_power!G$190,
       *   _xlpm.tiefe, clc_power!G$191,
       *
       *   _xlpm.leistung, _xlpm.anzahl *
       *     SUMIFS(
       *       INDIRECT(\"tabelle1[Wärmeleistung (75/65/20)  in W/m]\"),
       *       INDIRECT(\"tabelle1[Heizkörper_Typ]\"), _xlpm.typ,
       *       INDIRECT(\"tabelle1[Heizkörper_Subtyp]\"), _xlpm.subtyp,
       *       INDIRECT(\"tabelle1[Höhe H in mm]\"), _xlpm.höhe,
       *       INDIRECT(\"tabelle1[Bautiefe T in mm]\"), _xlpm.tiefe
       *     ) * _xlpm.breite / 1000,
       *
       *   IF(_xlpm.leistung > 0, _xlpm.leistung, 0)
       * )"
       */
      grid.setCell('clc_power', `${clcPowerCol}193`, (s, c, g) => {
        // Implement LET function as JavaScript variables
        const anzahl = g.n('IN_rooms', `${roomCol}69`);
        const typ = g.g(s, `${clcPowerCol}187`);
        const subtyp = g.g(s, `${clcPowerCol}188`);
        const höhe = g.g(s, `${clcPowerCol}189`);
        const breite = g.n(s, `${clcPowerCol}190`);
        const tiefe = g.g(s, `${clcPowerCol}191`);

        // Calculate power using SUMIFS
        const leistung = anzahl *
          g.SUMMEWENNS(
            g.INDIREKT_DB_REF("tabelle1", "Wärmeleistung (75/65/20)  in W/m"),
            g.INDIREKT_DB_REF("tabelle1", "Heizkörper_Typ"), [typ],
            g.INDIREKT_DB_REF("tabelle1", "Heizkörper_Subtyp"), [subtyp],
            g.INDIREKT_DB_REF("tabelle1", "Höhe H in mm"), [höhe],
            g.INDIREKT_DB_REF("tabelle1", "Bautiefe T in mm"), [tiefe]
          ) * breite / 1000;

        // Return result, ensuring it's positive or 0
        return g.WENN(leistung > 0, leistung, 0);
      });

      /**
       * Row 194: Target flow temperature from Named cell
       * Original Excel formula: "TVL_Ziel"
       */
      grid.setCell('clc_power', `${clcPowerCol}194`, (s, c, g) =>
        g.g('Names', 'TVL_Ziel')
      );

      /**
       * Row 195: Target return temperature from Named cell
       * Original Excel formula: "TRL_Ziel"
       */
      grid.setCell('clc_power', `${clcPowerCol}195`, (s, c, g) =>
        g.g('Names', 'TRL_Ziel')
      );

      /**
       * Row 196: Logarithmic mean temperature difference
       * Original Excel formula: "(R$194-R$195)/(LN((R$194-clc_load!T$10)/(R$195-clc_load!T$10)))"
       */
      grid.setCell('clc_power', `${clcPowerCol}196`, (s, c, g) =>
        (g.n(s, `${clcPowerCol}194`) - g.n(s, `${clcPowerCol}195`)) /
        g.LN((g.n(s, `${clcPowerCol}194`) - g.n('clc_load', `${clcLoadCol}10`)) /
             (g.n(s, `${clcPowerCol}195`) - g.n('clc_load', `${clcLoadCol}10`)))
      );

      /**
       * Row 197: Convector power at target temperature
       * Original Excel formula: "IF(R$193*((R$196/Log_ÜT_Norm)^R$192)>0, R$193*((R$196/Log_ÜT_Norm)^R$192),0)"
       */
      grid.setCell('clc_power', `${clcPowerCol}197`, (s, c, g) =>
        g.WENN(
          g.n(s, `${clcPowerCol}193`) * ((g.n(s, `${clcPowerCol}196`) / g.n('Names', 'Log_ÜT_Norm')) ** g.n(s, `${clcPowerCol}192`)) > 0,
          g.n(s, `${clcPowerCol}193`) * ((g.n(s, `${clcPowerCol}196`) / g.n('Names', 'Log_ÜT_Norm')) ** g.n(s, `${clcPowerCol}192`)),
          0
        )
      );

      /**
       * Row 198: Alternative convector power calculation
       * Original Excel formula: "_xlfn.LET(
       *   _xlpm.typ, \"Flachheizkoerper_senkrecht_profiliert\",
       *   _xlpm.subtyp, \"Typ_33\",
       *   _xlpm.höhe, _xlfn.XLOOKUP(G$189, Data_radiator!$G$5:$G$32, Data_radiator!$G$5:$G$32, 1000000, 1, 1),
       *   _xlpm.tiefe, 155,
       *   _xlpm.breite, G$190 / 1000,
       *   _xlpm.exponentFaktor, G$196 / Log_ÜT_Norm,
       *   _xlpm.anzahl, IN_rooms!R$69,
       *
       *   _xlpm.exponent, SUMIFS(
       *       INDIRECT(\"tabelle1[Heizkörperexponent n ]\"),
       *       INDIRECT(\"tabelle1[Heizkörper_Typ]\"), _xlpm.typ,
       *       INDIRECT(\"tabelle1[Heizkörper_Subtyp]\"), _xlpm.subtyp,
       *       INDIRECT(\"tabelle1[Höhe H in mm]\"), _xlpm.höhe,
       *       INDIRECT(\"tabelle1[Bautiefe T in mm]\"), _xlpm.tiefe
       *   ),
       *
       *   _xlpm.leistung, _xlpm.anzahl *
       *       SUMIFS(
       *           INDIRECT(\"tabelle1[Wärmeleistung (75/65/20)  in W/m]\"),
       *           INDIRECT(\"tabelle1[Heizkörper_Typ]\"), _xlpm.typ,
       *           INDIRECT(\"tabelle1[Heizkörper_Subtyp]\"), _xlpm.subtyp,
       *           INDIRECT(\"tabelle1[Höhe H in mm]\"), _xlpm.höhe,
       *           INDIRECT(\"tabelle1[Bautiefe T in mm]\"), _xlpm.tiefe
       *       ) * _xlpm.breite * (_xlpm.exponentFaktor ^ _xlpm.exponent),
       *
       *   IF(_xlpm.leistung > 0, _xlpm.leistung, 0)
       * )"
       */
      grid.setCell('clc_power', `${clcPowerCol}198`, (s, c, g) => {
        // Implementing LET function as JavaScript variables
        const typ = "Flachheizkoerper_senkrecht_profiliert";
        const subtyp = "Typ_33";
        const höhe = g.XVERWEIS(
          g.g(s, `${clcPowerCol}189`),
          g.getCells('Data_radiator', 'G5', 'G32').flat(),
          g.getCells('Data_radiator', 'G5', 'G32').flat(),
          { ifNotFound: 1000000, matchMode: 'exactOrNextSmaller', searchMode: 'first' }
        );
        const tiefe = 155;
        const breite = g.n(s, `${clcPowerCol}190`) / 1000;
        const exponentFaktor = g.n(s, `${clcPowerCol}196`) / g.n('Names', 'Log_ÜT_Norm');
        const anzahl = g.n('IN_rooms', `${roomCol}69`);

        const exponent = g.SUMMEWENNS(
          g.INDIREKT_DB_REF("tabelle1", "Heizkörperexponent n "),
          g.INDIREKT_DB_REF("tabelle1", "Heizkörper_Typ"), [typ],
          g.INDIREKT_DB_REF("tabelle1", "Heizkörper_Subtyp"), [subtyp],
          g.INDIREKT_DB_REF("tabelle1", "Höhe H in mm"), [höhe ?? 0],
          g.INDIREKT_DB_REF("tabelle1", "Bautiefe T in mm"), [tiefe]
        );

        const leistung = anzahl *
          g.SUMMEWENNS(
            g.INDIREKT_DB_REF("tabelle1", "Wärmeleistung (75/65/20)  in W/m"),
            g.INDIREKT_DB_REF("tabelle1", "Heizkörper_Typ"), [typ],
            g.INDIREKT_DB_REF("tabelle1", "Heizkörper_Subtyp"), [subtyp],
            g.INDIREKT_DB_REF("tabelle1", "Höhe H in mm"), [höhe ?? 0],
            g.INDIREKT_DB_REF("tabelle1", "Bautiefe T in mm"), [tiefe]
          ) * breite * (exponentFaktor ** exponent);

        return g.WENN(leistung > 0, leistung, 0);
      });

      /**
       * Row 199: Room type identifier
       * Original Excel formula: "IF(G136>\"\",G146,IF(G148>\"\",G158,IF(G160>\"\",G171,IF(G187>\"\",G197,\"\"))))"
       */
      grid.setCell('clc_power', `${clcPowerCol}199`, (s, c, g) =>
        g.WENN(
          g.g(s, `${clcPowerCol}136`) > "",
          g.n(s, `${clcPowerCol}146`),
          g.WENN(
            g.g(s, `${clcPowerCol}148`) > "",
            g.n(s, `${clcPowerCol}158`),
            g.WENN(
              g.g(s, `${clcPowerCol}160`) > "",
              g.n(s, `${clcPowerCol}171`),
              g.WENN(
                g.g(s, `${clcPowerCol}187`) > "",
                g.n(s, `${clcPowerCol}197`),
                ""
              )
            )
          )
        )
      );

      /**
       * Row 200: Combined power - final power calculation based on all heating system checks
       * Original Excel formula: "IF(G136>\"\",G147,IF(G148>\"\",G159,IF(G160>\"\",G172,IF(G187>\"\",G198,\"\"))))"
       */
      grid.setCell('clc_power', `${clcPowerCol}200`, (s, c, g) =>
        g.WENN(
          g.g(s, `${clcPowerCol}136`) > "",
          g.n(s, `${clcPowerCol}147`),
          g.WENN(
            g.g(s, `${clcPowerCol}148`) > "",
            g.n(s, `${clcPowerCol}159`),
            g.WENN(
              g.g(s, `${clcPowerCol}160`) > "",
              g.n(s, `${clcPowerCol}172`),
              g.WENN(
                g.g(s, `${clcPowerCol}187`) > "",
                g.n(s, `${clcPowerCol}198`),
                ""
              )
            )
          )
        )
      );

      /**
       * Row 203: Sum of power for heating type 1
       * Original Excel formula: "SUMIF($A$3:$A$200,$A$199,G$3:G$200)"
       */
      grid.setCell('clc_power', `${clcPowerCol}203`, (s, c, g) => {
        // Use SUMMEWENN to sum all matching cells in the range
        // SUMIF($A$3:$A$200,$A$199,G$3:G$200) where G is the current column (clcPowerCol)
        const typeIdentifier = g.g(s, "A199");

        // Get all values in column A from A3:A200 using getCells
        const columnValues = g.getCells(s, "A3", "A200").flat();

        // Get all values in current column (clcPowerCol) from row 3:200 using getCells
        const valuesToSum = g.getCells(s, `${clcPowerCol}3`, `${clcPowerCol}200`).flat();

        return g.SUMMEWENN(columnValues, typeIdentifier, valuesToSum);
      });

      /**
       * Row 204: Sum of power for heating type 2
       * Original Excel formula: "SUMIF($A$3:$A$200,$A$200,G$3:G$200)"
       */
      grid.setCell('clc_power', `${clcPowerCol}204`, (s, c, g) => {
        // Use SUMMEWENN to sum all matching cells in the range
        // SUMIF($A$3:$A$200,$A$200,G$3:G$200) where G is the current column (clcPowerCol)
        const typeIdentifier = g.g(s, "A200");

        // Get all values in column A from A3:A200 using getCells
        const columnValues = g.getCells(s, "A3", "A200").flat();

        // Get all values in current column (clcPowerCol) from row 3:200 using getCells
        const valuesToSum = g.getCells(s, `${clcPowerCol}3`, `${clcPowerCol}200`).flat();

        return g.SUMMEWENN(columnValues, typeIdentifier, valuesToSum);
      });

      /**
       * Row 205: Ratio of power to heat load for heating type 1
       * Original Excel formula: "G203/clc_load!G74"
       */
      grid.setCell('clc_power', `${clcPowerCol}205`, (s, c, g) =>
        g.n(s, `${clcPowerCol}203`) / g.n('clc_load', `${clcLoadCol}74`)
      );

      /**
       * Row 206: Ratio of power to heat load for heating type 2
       * Original Excel formula: "G204/clc_load!G74"
       */
      grid.setCell('clc_power', `${clcPowerCol}206`, (s, c, g) =>
        g.n(s, `${clcPowerCol}204`) / g.n('clc_load', `${clcLoadCol}74`)
      );
    }
  }
}
