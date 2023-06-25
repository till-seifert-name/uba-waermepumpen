import {Component, Inject, PLATFORM_ID} from '@angular/core';
import {BerechnungService} from "../berechnung.service";
import {FormComponent} from "../form.component";
import {DOCUMENT} from "@angular/common";

@Component({
  selector: 'app-vorueberlegungen',
  templateUrl: './vorueberlegungen.component.html',
  styleUrls: ['./vorueberlegungen.component.scss']
})
export class VorueberlegungenComponent extends FormComponent {

  constructor(
    berechnungService: BerechnungService,
    @Inject(DOCUMENT) override document: Document,
    @Inject(PLATFORM_ID) override platformId: Object,
  ) {
    super(berechnungService, document, platformId);
  }
}
