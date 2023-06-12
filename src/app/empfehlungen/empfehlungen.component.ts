import {Component} from '@angular/core';
import {BerechnungService} from "../berechnung.service";
import {FormComponent} from "../form.component";

@Component({
  selector: 'app-empfehlungen',
  templateUrl: './empfehlungen.component.html',
  styleUrls: ['./empfehlungen.component.scss']
})
export class EmpfehlungenComponent extends FormComponent {

  constructor(
    berechnungService: BerechnungService,
  ) {
    super(berechnungService);
  }
}
