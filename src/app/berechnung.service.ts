import { Injectable } from '@angular/core';
import {Empfehlungslisten_data, Fragen_Prototyp_Einzelfahrzeug_data} from "./data";
import {DataGrid, ISTLEER, ODER, UND, WAHR, WENNS} from "./data-grid";
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
        " "
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
        WAHR(), " ");

    });


    // load saved state

    const cellsToSave: string[] = [
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
    ];

    // Subscribe to (some) cell changes save to localStorage
    grid.onCellChanged().pipe(
      filter(cellChange => cellsToSave.includes(cellChange.cell)),
      debounceTime(1000)
    ).subscribe(cellChange => {
      console.log(`Cell changed: ${cellChange.sheet}!${cellChange.cell} = ${cellChange.value}`);
      localStorage.setItem(STORAGE_KEY, grid.serializeWhitelistedCells(cellsToSave));
    });

    // Restore cells from localStorage if available
    const serializedData = localStorage.getItem(STORAGE_KEY);
    if (serializedData) {
      grid.restoreCells(serializedData);
      console.log(`Input restored: ${serializedData}`);
    }
  }
}
