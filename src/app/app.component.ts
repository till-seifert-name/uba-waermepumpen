import {Component} from '@angular/core';
import {NgForm} from '@angular/forms';
import {CellContent, DataGrid, UND, WAHR, WENNS} from "./data-grid";
import {Fragen_Prototyp_Einzelfahrzeug_data, Empfehlungslisten_data} from "./data";


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
  }


}

