import { Component } from '@angular/core';
import {DataGrid} from "../data-grid";
import {BerechnungService} from "../berechnung.service";
import {NgForm} from "@angular/forms";

@Component({
  selector: 'app-empfehlungen',
  templateUrl: './empfehlungen.component.html',
  styleUrls: ['./empfehlungen.component.scss']
})
export class EmpfehlungenComponent {
  public grid: DataGrid;

  constructor(
    public berechnungService: BerechnungService,
  ) {

    this.grid = this.berechnungService.grid;
  }

  onSubmit(form: NgForm) {
    console.log('Form data:', form.value);
  }
}
