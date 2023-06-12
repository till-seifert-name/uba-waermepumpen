import {Component} from '@angular/core';
import {BerechnungService} from "../berechnung.service";
import {FormComponent} from "../form.component";

@Component({
  selector: 'app-vorueberlegungen',
  templateUrl: './vorueberlegungen.component.html',
  styleUrls: ['./vorueberlegungen.component.scss']
})
export class VorueberlegungenComponent extends FormComponent {

  constructor(
    berechnungService: BerechnungService,
  ) {
    super(berechnungService);
  }
}
