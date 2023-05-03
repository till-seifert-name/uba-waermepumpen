import {Component} from '@angular/core';
import {NgForm} from '@angular/forms';
import {DataGrid, UND, WAHR, WENNS} from "./data-grid";
import {Empfehlungslisten_data, Fragen_Prototyp_Einzelfahrzeug_data} from "./data";
import {debounceTime, filter} from "rxjs";


const STORAGE_KEY = 'DBU-DATA';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {


  publicTransport: string = '';
  bicycle: string = '';
  carPooling: string = '';
  carSharing: string = '';
  carRenting: string = '';


  public grid: DataGrid = new DataGrid();

  onSubmit(form: NgForm) {
    console.log('Form data:', form.value);
  }

  constructor() {
    const grid = this.grid;

    for (const [cell, content] of Object.entries(Fragen_Prototyp_Einzelfahrzeug_data)) {
      grid.setCell("Names", cell, content);
    }

    for (const [cell, content] of Object.entries(Empfehlungslisten_data)) {
      grid.setCell("Names", cell, content);
    }

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


    // load saved state

    const cellsToSave: string[] = [
      'F_R1',
      'F_S1',
      'F_SZ1',
      'F_L1',
      'F_L2',
      'F_F1',
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

