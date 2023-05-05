import {Component} from '@angular/core';
import {DataGrid, ISTLEER, ODER, UND, WAHR, WENNS} from "../data-grid";
import {NgForm} from "@angular/forms";
import {BerechnungService} from "../berechnung.service";


@Component({
  selector: 'app-vorueberlegungen',
  templateUrl: './vorueberlegungen.component.html',
  styleUrls: ['./vorueberlegungen.component.scss']
})
export class VorueberlegungenComponent {
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
