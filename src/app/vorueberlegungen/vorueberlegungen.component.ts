import {Component} from '@angular/core';
import {DataGrid} from "../data-grid";
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
    if (confirm('Alle Eingaben zurücksetzen?'))
      this.berechnungService.resetInputs()
  }

  downloadAsPDF() {
    print()
  }
}
