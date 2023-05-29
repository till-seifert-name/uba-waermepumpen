import {Component} from '@angular/core';
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

  public viewstate = {
    uebersichtsgrafikVisible: false,
  }

  constructor(
    public berechnungService: BerechnungService,
  ) {

    this.grid = this.berechnungService.grid;
  }

  toggleUebersichtsgrafikVisible() {
    this.viewstate.uebersichtsgrafikVisible = !this.viewstate.uebersichtsgrafikVisible;
  }
}
