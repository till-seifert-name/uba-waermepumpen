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

  public viewstate = {
    uebersichtsgrafikVisible: false,
  }

  constructor(
    public berechnungService: BerechnungService,
  ) {

    this.grid = this.berechnungService.grid;
  }

  toggleUebersichtsgrafikVisible(forceState?: boolean) {
    if (forceState !== undefined) {
      this.viewstate.uebersichtsgrafikVisible = forceState;
    } else {
      this.viewstate.uebersichtsgrafikVisible = !this.viewstate.uebersichtsgrafikVisible;
    }
  }

  resetInput() {
    this.berechnungService.resetInputs()
  }

  downloadAsPDF() {
    print()
  }
}
