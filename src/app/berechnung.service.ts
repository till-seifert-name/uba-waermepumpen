import {Injectable} from '@angular/core';
import {Empfehlungslisten_data, Fragen_Prototyp_Einzelfahrzeug_data, Hinweislisten_für_Flotte} from "./data";
import {ABS, CellContent, DataGrid, ISTLEER, ODER, UND, WAHR, WENN, WENNS} from "./data-grid";
import {debounceTime, filter} from "rxjs";

const STORAGE_KEY = 'DBU-DATA';

@Injectable({
  providedIn: 'root'
})
export class BerechnungService {

  public grid: DataGrid = new DataGrid();

  constructor() {
    const grid = this.grid;

    for (const [cell, content] of Object.entries(Fragen_Prototyp_Einzelfahrzeug_data)) {
      grid.setCell("Names", cell, content);
    }

    for (const [cell, content] of Object.entries(Empfehlungslisten_data)) {
      grid.setCell("Names", cell, content);
    }

    for (const [cell, content] of Object.entries(Hinweislisten_für_Flotte)) {
      grid.setCell("Names", cell, content);
    }

    // Function for Empfehlung zur Antriebsart:
    grid.setCell("Names", "E_A0", (sheet, cell, grid) => {

      const {
        A_JN1,
        A_JN2,
        A_R1,
        A_S1,
        A_S2,
        A_S3,
        A_SV1,
        A_SV2,
        A_SV3,
        E_A1,
        E_A10,
        E_A11,
        E_A2,
        E_A3,
        E_A4,
        E_A5,
        E_A6,
        E_A7,
        E_A8,
        E_A9,
        F_F1,
        F_L1,
        F_L2,
        F_R1,
        F_S1,
        F_SZ1
      } = grid.cells["Names"];

      return WENNS(
        F_L1 === A_JN2,
        E_A1,
        UND(F_R1 <= A_R1, F_S1 === A_S1, F_F1 === A_JN1),
        E_A2,
        UND(F_R1 <= A_R1, F_S1 === A_S1, F_F1 === A_JN2),
        E_A3,
        UND(F_R1 <= A_R1, F_S1 === A_S2, F_F1 === A_JN1),
        E_A4,
        UND(F_R1 <= A_R1, F_S1 === A_S2, F_F1 === A_JN2),
        E_A5,
        UND(F_R1 <= A_R1, F_S1 === A_S3),
        E_A6,
        UND(F_R1 > A_R1, F_S1 === A_S1),
        E_A6,
        UND(F_R1 > A_R1, F_SZ1 === A_SV1),
        E_A9,
        UND(F_R1 > A_R1, F_S1 === A_S2, F_SZ1 === A_SV2, F_L2 === A_JN1),
        E_A8,
        UND(F_R1 > A_R1, F_SZ1 === A_SV2, F_L2 === A_JN2),
        E_A10,
        UND(F_R1 > A_R1, F_S1 === A_S2, F_SZ1 === A_SV3, F_L2 === A_JN1),
        E_A7,
        UND(F_R1 > A_R1, F_S1 === A_S2, F_SZ1 === A_SV3, F_L2 === A_JN2),
        E_A11,
        UND(F_R1 > A_R1, F_S1 === A_S3, F_SZ1 === A_SV2, F_L2 === A_JN1),
        E_A8,
        UND(F_R1 > A_R1, F_S1 === A_S3, F_SZ1 === A_SV3, F_L2 === A_JN1),
        E_A8,
        UND(F_R1 > A_R1, F_S1 === A_S3, F_SZ1 === A_SV3, F_L2 === A_JN2),
        E_A11,
        WAHR(),
        ""
      );
    });


    // Function for Empfehlung zum Fahrzeugsegment:
    grid.setCell("Names", "E_F0", (sheet, cell, grid) => {

      const {
        F_F1,
        F_P1,
        F_T1,
        E_F1,
        A_T1,
        A_T2,
        A_T3,
        F_LE1,
        A_JN1,
        E_F2,
        A_JN2,
        F_S1,
        A_S1,
        E_F3,
        A_S2,
        A_S3,
        E_F4,
        F_SP1,
        A_SP1,
        E_F5,
        E_F6,
        A_SP2,
        E_F7,
        A_SP3,
        E_F8,
        E_F9,
        E_F10,
        E_F11,
        E_F12,
        E_F13,
        E_F14,
        E_F15,
        E_F16,
        E_F17,
        E_F18,
        E_F19,
        E_F20,
        E_F21,
        E_F22,
        E_F23,
        E_F24,
        E_F25,
        E_F26,
        E_F27,
        E_F28,
        E_F29,
        E_F30,
        E_F31,
        E_F32,
        E_F33,
        E_F34,
        E_F35,
        E_F36,
        E_F37,
        E_F38,
        E_F39,
        E_F40,
        E_F41,
        E_F42
      } = grid.cells['Names'];

      return WENNS(
        UND(F_P1 < 6, F_T1 == A_T3), E_F1,
        UND(F_P1 < 6, ODER(F_T1 == A_T1, ISTLEER(F_T1)), F_LE1 == A_JN1), E_F2,
        UND(F_P1 >= 1, F_P1 <= 2, F_T1 == A_T1, F_LE1 == A_JN2, F_S1 == A_S1), E_F3,
        UND(F_P1 >= 1, F_P1 <= 2, F_T1 == A_T1, F_LE1 == A_JN2, ODER(F_S1 == A_S2, F_S1 == A_S3)), E_F4,
        UND(F_P1 >= 3, F_P1 <= 4, F_SP1 == A_SP1, F_T1 == A_T1, F_LE1 == A_JN2, F_S1 == A_S1), E_F5,
        UND(F_P1 >= 3, F_P1 <= 4, F_SP1 == A_SP1, F_T1 == A_T1, F_LE1 == A_JN2, ODER(F_S1 == A_S2, F_S1 == A_S3)), E_F6,
        UND(F_P1 >= 3, F_P1 <= 4, F_SP1 == A_SP2, F_T1 == A_T1, F_LE1 == A_JN2), E_F7,
        UND(F_P1 >= 3, F_P1 <= 4, F_SP1 == A_SP3, F_T1 == A_T1, F_LE1 == A_JN2), E_F8,
        UND(F_P1 == 5, F_SP1 == A_SP1, F_T1 == A_T1, F_LE1 == A_JN2), E_F9,
        UND(F_P1 == 5, ODER(F_SP1 == A_SP2, F_SP1 == A_SP3), F_T1 == A_T1, F_LE1 == A_JN2), E_F10,
        UND(F_P1 >= 6, F_P1 <= 7, F_SP1 == A_SP1, F_T1 == A_T1, F_F1 == A_JN1), E_F11,
        UND(F_P1 >= 6, F_P1 <= 7, F_SP1 == A_SP1, F_T1 == A_T1, F_F1 == A_JN2), E_F12,
        UND(F_P1 >= 6, F_P1 <= 7, F_SP1 == A_SP1, F_T1 == A_T3, F_F1 == A_JN1), E_F13,
        UND(F_P1 >= 6, F_P1 <= 7, F_SP1 == A_SP1, F_T1 == A_T3, F_F1 == A_JN2), E_F14,
        UND(F_P1 >= 6, F_P1 <= 7, ODER(F_SP1 == A_SP2, F_SP1 == A_SP3)), E_F15,
        UND(F_P1 >= 8, F_P1 <= 9, F_SP1 == A_SP1, F_T1 == A_T1, F_F1 == A_JN1), E_F16,
        UND(F_P1 >= 8, F_P1 <= 9, F_SP1 == A_SP1, F_T1 == A_T1, F_F1 == A_JN2), E_F17,
        UND(F_P1 >= 8, F_P1 <= 9, F_SP1 == A_SP1, F_T1 == A_T3, F_F1 == A_JN1), E_F18,
        UND(F_P1 >= 8, F_P1 <= 9, F_SP1 == A_SP1, F_T1 == A_T3, F_F1 == A_JN2), E_F19,
        UND(F_P1 >= 8, F_P1 <= 9, ODER(F_SP1 == A_SP2, F_SP1 == A_SP3)), E_F20,
        UND(F_P1 < 6, F_T1 == A_T2, F_LE1 == A_JN1, F_F1 == A_JN1), E_F21, UND(F_P1 < 6, F_T1 == A_T2, F_LE1 == A_JN1, F_F1 == A_JN2), E_F22,
        UND(F_P1 >= 1, F_P1 <= 2, F_T1 == A_T2, F_LE1 == A_JN2, F_F1 == A_JN1, F_S1 == A_S1), E_F23,
        UND(F_P1 >= 1, F_P1 <= 2, F_T1 == A_T2, F_LE1 == A_JN2, F_F1 == A_JN2, F_S1 == A_S1), E_F24,
        UND(F_P1 >= 1, F_P1 <= 2, F_T1 == A_T2, F_LE1 == A_JN2, F_F1 == A_JN1, ODER(F_S1 == A_S2, F_S1 == A_S3)), E_F25,
        UND(F_P1 >= 1, F_P1 <= 2, F_T1 == A_T2, F_LE1 == A_JN2, F_F1 == A_JN2, ODER(F_S1 == A_S2, F_S1 == A_S3)), E_F26,
        UND(F_P1 >= 3, F_P1 <= 4, F_SP1 == A_SP1, F_T1 == A_T2, F_LE1 == A_JN2, F_F1 == A_JN1, F_S1 == A_S1), E_F27,
        UND(F_P1 >= 3, F_P1 <= 4, F_SP1 == A_SP1, F_T1 == A_T2, F_LE1 == A_JN2, F_F1 == A_JN2, F_S1 == A_S1), E_F28,
        UND(F_P1 >= 3, F_P1 <= 4, F_SP1 == A_SP1, F_T1 == A_T2, F_LE1 == A_JN2, F_F1 == A_JN1, ODER(F_S1 == A_S2, F_S1 == A_S3)), E_F29,
        UND(F_P1 >= 3, F_P1 <= 4, F_SP1 == A_SP1, F_T1 == A_T2, F_LE1 == A_JN2, F_F1 == A_JN2, ODER(F_S1 == A_S2, F_S1 == A_S3)), E_F30,
        UND(F_P1 >= 3, F_P1 <= 4, F_SP1 == A_SP2, F_T1 == A_T2, F_LE1 == A_JN2, F_F1 == A_JN1), E_F31,
        UND(F_P1 >= 3, F_P1 <= 4, F_SP1 == A_SP2, F_T1 == A_T2, F_LE1 == A_JN2, F_F1 == A_JN2), E_F32,
        UND(F_P1 >= 3, F_P1 <= 4, F_SP1 == A_SP3, F_T1 == A_T2, F_LE1 == A_JN2, F_F1 == A_JN1), E_F33,
        UND(F_P1 >= 3, F_P1 <= 4, F_SP1 == A_SP3, F_T1 == A_T2, F_LE1 == A_JN2, F_F1 == A_JN2), E_F34,
        UND(F_P1 == 5, F_SP1 == A_SP1, F_T1 == A_T2, F_LE1 == A_JN2, F_F1 == A_JN1), E_F35,
        UND(F_P1 == 5, F_SP1 == A_SP1, F_T1 == A_T2, F_LE1 == A_JN2, F_F1 == A_JN2), E_F36,
        UND(F_P1 == 5, ODER(F_SP1 == A_SP2, F_SP1 == A_SP3), F_T1 == A_T2, F_LE1 == A_JN2, F_F1 == A_JN1), E_F37,
        UND(F_P1 == 5, ODER(F_SP1 == A_SP2, F_SP1 == A_SP3), F_T1 == A_T2, F_LE1 == A_JN2, F_F1 == A_JN2), E_F38,
        UND(F_P1 >= 6, F_P1 <= 7, F_SP1 == A_SP1, F_T1 == A_T2, F_F1 == A_JN1), E_F39,
        UND(F_P1 >= 6, F_P1 <= 7, F_SP1 == A_SP1, F_T1 == A_T2, F_F1 == A_JN2), E_F40,
        UND(F_P1 >= 8, F_P1 <= 9, F_SP1 == A_SP1, F_T1 == A_T2, F_F1 == A_JN1), E_F41,
        UND(F_P1 >= 8, F_P1 <= 9, F_SP1 == A_SP1, F_T1 == A_T2, F_F1 == A_JN2), E_F42,
        WAHR(), "");
    });

    // Function for Umfang der Pkw-Beschaffung:
    grid.setCell("Fragen_Prototyp_Flotte", "B16", (sheet, cell, grid) => {
      const {F_B1, F_E1, H_F1, H_F2,} = grid.cells['Names'];
      return WENN(ODER(ISTLEER(F_B1), ISTLEER(F_E1)), "", "Mit dieser Beschaffung");
    });

    grid.setCell("Fragen_Prototyp_Flotte", "E16", (sheet, cell, grid) => {
      const {F_B1, F_E1, H_F1, H_F2,} = grid.cells['Names'];
      return WENNS(ODER(ISTLEER(F_B1), ISTLEER(F_E1)), "", F_E1 >= F_B1, H_F1, WAHR(), H_F2);
    });

    grid.setCell("Fragen_Prototyp_Flotte", "F16", (sheet, cell, grid) => {
      const {F_B1, F_E1, H_F1, H_F2,} = grid.cells['Names'];
      return WENN(ODER(ISTLEER(F_B1), ISTLEER(F_E1)), "", "Sie Ihren Fuhrpark um");
    });

    grid.setCell("Fragen_Prototyp_Flotte", "G16", (sheet, cell, grid) => {
      const {F_B1, F_E1, H_F1, H_F2,} = grid.cells['Names'];
      // @ts-ignore
      return WENN(ODER(ISTLEER(F_B1), ISTLEER(F_E1)), "", ABS((F_E1 - F_B1) / F_E1));
    });

    grid.setCell("Fragen_Prototyp_Flotte", "H16", (sheet, cell, grid) => {
      const {F_B1, F_E1, H_F1, H_F2,} = grid.cells['Names'];
      return WENN(ODER(ISTLEER(F_B1), ISTLEER(F_E1)), "", ".");
    });


    grid.setCell("Fragen_Prototyp_Flotte", "B17", (sheet, cell, grid) => {
      const {F_B1, F_E1, H_F5, H_F3, H_F4} = grid.cells['Names'];
      return WENNS(
        ODER(ISTLEER(F_B1), ISTLEER(F_E1)), "",
        F_E1 > F_B1, H_F5,
        F_E1 < F_B1, H_F3,
        WAHR(), H_F4
      );
    });


    grid.setCell("Fragen_Prototyp_Flotte", "B59", (sheet, cell, grid) => {
      let F_B1: number,
        F_E1: number,
        F_E2: number,
        H_V3: CellContent,
        H_V2: CellContent,
        H_V4: CellContent,
        H_V5: CellContent,
        H_V1: CellContent
      // @ts-ignore
      ({F_B1, F_E1, F_E2, H_V3, H_V2, H_V4, H_V5, H_V1} = grid.cells['Names']);

      return WENNS(
        ISTLEER(F_E2), "",
        UND(F_E2 == 0, F_E1 <= F_B1), H_V3,
        UND(F_E2 == 0, F_E1 > F_B1), H_V2,
        UND(F_E2 > 0, F_E1 < F_B1, F_E2 < (F_B1 - F_E1)), H_V4,
        UND(F_E2 > 0, F_E1 < F_B1, F_E2 == (F_B1 - F_E1)), H_V5,
        WAHR(), H_V1
      );
    });


// Set values
    grid.setCell("Darstellung_Flotte", "B10", "Verkehrsmittel");
    grid.setCell("Darstellung_Flotte", "B11", "Mietwagen");
    grid.setCell("Darstellung_Flotte", "B12", "Car-Sharing");
    grid.setCell("Darstellung_Flotte", "B13", "Car-Pooling");
    grid.setCell("Darstellung_Flotte", "B14", "Fahrrad");
    grid.setCell("Darstellung_Flotte", "B15", "ÖPNV/Bahn/Fernbus");
    grid.setCell("Darstellung_Flotte", "B2", "Semiquantitatives Diagramm: Verkehrsmittel zur Deckung des Mobilitätsbedarfs");
    grid.setCell("Darstellung_Flotte", "B5", 'Umformung der Anteile:');
    grid.setCell("Darstellung_Flotte", "C10", "Semiquantitativer Anteil");
    grid.setCell("Darstellung_Flotte", "C5", "Semiquantitativer Anteil");
    grid.setCell("Darstellung_Flotte", "D10", "Substitutionsmöglichkeit");
    grid.setCell("Darstellung_Flotte", "D5", "Zahlenwert für die Darstellung");
    grid.setCell("Darstellung_Flotte", "D6", 2);
    grid.setCell("Darstellung_Flotte", "D7", 4);
    grid.setCell("Darstellung_Flotte", "D8", 6);
    grid.setCell("Darstellung_Flotte", "E10", "Umweltvorteil");
    grid.setCell("Darstellung_Flotte", "E11", 1);
    grid.setCell("Darstellung_Flotte", "E12", 1);
    grid.setCell("Darstellung_Flotte", "E13", 1);
    grid.setCell("Darstellung_Flotte", "E14", 2);
    grid.setCell("Darstellung_Flotte", "E15", 2);

// Set formulas
    grid.setCell("Darstellung_Flotte", "C11", (sheet, cell, grid) => grid.getCell('Names', 'F_M1'));

    grid.setCell("Darstellung_Flotte", "C12", (sheet, cell, grid) => grid.getCell('Names', 'F_CS1'));

    grid.setCell("Darstellung_Flotte", "C13", (sheet, cell, grid) => grid.getCell('Names', 'F_CP1'));

    grid.setCell("Darstellung_Flotte", "C14", (sheet, cell, grid) => grid.getCell('Names', 'F_FL1'));

    grid.setCell("Darstellung_Flotte", "C15", (sheet, cell, grid) => grid.getCell('Names', 'F_BF1'));

    grid.setCell("Darstellung_Flotte", "C6", (sheet, cell, grid) => grid.getCell('Names', 'A_SV1'));

    grid.setCell("Darstellung_Flotte", "C7", (sheet, cell, grid) => grid.getCell('Names', 'A_SV2'));

    grid.setCell("Darstellung_Flotte", "C8", (sheet, cell, grid) => grid.getCell('Names', 'A_SV3'));

    grid.setCell("Darstellung_Flotte", "D11", (sheet, cell, grid) => {
      const C11 = grid.getCell('Darstellung_Flotte', 'C11');
      return grid.SVERWEIS(sheet, C11, 'C6', 'D8', 2, false);
    });

    grid.setCell("Darstellung_Flotte", "D12", (sheet, cell, grid) => {
      const C12 = grid.getCell('Darstellung_Flotte', 'C12');
      return grid.SVERWEIS(sheet, C12, 'C6', 'D8', 2, false);
    });

    grid.setCell("Darstellung_Flotte", "D13", (sheet, cell, grid) => {
      const C13 = grid.getCell('Darstellung_Flotte', 'C13');
      return grid.SVERWEIS(sheet, C13, 'C6', 'D8', 2, false);
    });

    grid.setCell("Darstellung_Flotte", "D14", (sheet, cell, grid) => {
      const C14 = grid.getCell('Darstellung_Flotte', 'C14');
      return grid.SVERWEIS(sheet, C14, 'C6', 'D8', 2, false);
    });

    grid.setCell("Darstellung_Flotte", "D15", (sheet, cell, grid) => {
      const C15 = grid.getCell('Darstellung_Flotte', 'C15');
      return grid.SVERWEIS(sheet, C15, 'C6', 'D8', 2, false);
    });


    // load saved state

    // Subscribe to (some) cell changes save to localStorage
    grid.onCellChanged().pipe(
      filter(cellChange => this.cellsToSave.includes(cellChange.cell)),
      debounceTime(1000)
    ).subscribe(cellChange => {
      console.log(`Cell changed: ${cellChange.sheet}!${cellChange.cell} = ${cellChange.value}`);
      localStorage.setItem(STORAGE_KEY, grid.serializeWhitelistedCells(this.cellsToSave));
    });

    // Restore cells from localStorage if available
    const serializedData = localStorage.getItem(STORAGE_KEY);
    if (serializedData) {
      grid.restoreCells(serializedData);
      console.log(`Input restored: ${serializedData}`);
    }
  }

  /**
   * Cells to load/save
   */
  private cellsToSave: string[] = [
    'F_R1',
    'F_S1',
    'F_SZ1',
    'F_L1',
    'F_L2',
    'F_F1',

    'F_P1',
    'F_SP1',
    'F_T1',
    'F_LE1',

    'F_B1', 'F_E1',
    'F_BF1', 'F_FL1', 'F_CP1', 'F_CS1', 'F_M1',
    'F_E2',
  ];

  resetInputs() {
    this.grid.clearListed(this.cellsToSave);
  }
}
