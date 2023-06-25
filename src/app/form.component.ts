import {DOCUMENT, isPlatformBrowser} from '@angular/common';
import {DataGrid} from "./data-grid";
import {debounceTime, Subject} from "rxjs";
import {BerechnungService} from "./berechnung.service";
import {Inject, PLATFORM_ID} from "@angular/core";

export class FormComponent {
  public grid: DataGrid;

  public viewstate = {
    uebersichtsgrafikVisible: false,
  }

  /**
   * Stream for events that should cause the first/next input to be focused
   */
  protected focusSubject = new Subject<void>();

  constructor(
    public berechnungService: BerechnungService,
    @Inject(DOCUMENT) public document: Document,
    @Inject(PLATFORM_ID) public platformId: Object,
  ) {
    this.grid = this.berechnungService.grid;

    // Focus the first/next input when the stepper chnages ot a form element is usbmitted
    this.focusSubject.pipe(
      debounceTime(20)
    ).subscribe(() => this.focusNextInput());
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

  focusNextInput(): void {
    if (!isPlatformBrowser(this.platformId)) return;

    const inputs: HTMLElement[] = Array.from(
      this.document.querySelectorAll('input, select, textarea, mat-select, mat-button-toggle, button[type=submit]') as NodeListOf<HTMLElement>)
      .filter(input => !isHidden(input));

    const nextInput = inputs[(inputs.indexOf(this.document.activeElement as HTMLElement) ?? -1) + 1] ?? inputs[0];
    nextInput?.focus();
  }

  stepperChanged() {
    this.focusSubject.next();
  }

  submit() {
    this.focusSubject.next();
  }
}

function isHidden(el: HTMLElement): boolean {
  return window.getComputedStyle(el).display === 'none' ? true
    : el.parentElement ? isHidden(el.parentElement) : false;
}
