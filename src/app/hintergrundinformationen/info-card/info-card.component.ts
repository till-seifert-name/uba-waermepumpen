import {DomPortal, DomPortalOutlet} from '@angular/cdk/portal';
import {
  AfterViewInit,
  Component,
  ElementRef,
  Input,
  ViewChild
} from '@angular/core';
import {ActivatedRoute, Router} from "@angular/router";

@Component({
  selector: 'app-info-card',
  styles: [`
    :host {
      display: block;
    }

    .outer-card {
      margin-inline-end: 90px;

      &.info-card-all,
      &.info-card-budget,
      &.info-card-pkw,
      &.info-card-oepnv,
      &.info-card-bike {
        margin-inline-end: 0;
        padding-inline-end: 90px;
        background-repeat: no-repeat;
      }

      &.info-card-all {
        background-image: url('../../../assets/Hintergrundinfos/pkw_Zeichenfläche 1 1.svg'),
        url('../../../assets/Hintergrundinfos/oeffentliche_2 2.svg'),
        url('../../../assets/Hintergrundinfos/fahrrad 1.svg');

        background-position: right 50px top 7px,
        right 6px top 13px,
        right 56px top 44px;

        background-size: auto 24px,
        auto 48px,
        auto 30px;
      }

      &.info-card-budget {
        background-image: url('../../../assets/Hintergrundinfos/sparschwein 1.svg');
        background-position: right 21px top 50%;
        background-size: 48px auto;
      }

      &.info-card-pkw {
        background-image: url('../../../assets/Hintergrundinfos/pkw_Zeichenfläche 1 1.svg');
        background-position: right 11px top 50%;
        background-size: 70px auto;
      }

      &.info-card-oepnv {
        background-image: url('../../../assets/Hintergrundinfos/oeffentliche_2 2.svg');
        background-position: right 6px top 50%;
        background-size: 76px auto;
      }

      &.info-card-bike {
        background-image: url('../../../assets/Hintergrundinfos/fahrrad 1.svg');
        background-position: right 22px top 50%;
        background-size: 51px auto;
      }
    }

    /* Popup */
    dialog {
      width: 80%;
      min-width: 10rem;
      max-width: 74rem;
      border: none;
      padding: 0;
      background: transparent;

      &::backdrop {
        background: rgba(0, 0, 0, 0.25);
      }
    }

    @media print {
      ::ng-deep body.dialog-open > :not(dialog[open]) {
        display: none;
      }

      dialog[open] {
        display: block;
        position: static;
        width: auto;
        max-width: unset;
        min-width: unset;
        max-height: unset;
        overflow: unset;
        height: unset;
      }

      dialog::backdrop {
        display: none;
      }
    }
  `],
  template: `
    <mat-card role="button"
              tabindex="0"
              class="outer-card"
              [ngClass]="outerCardClass"
              appearance="outlined"
              (keydown.enter)="openDialog()" (keydown.space)="openDialog()" (click)="openDialog()">
      <mat-card [ngClass]="innerCardClass" appearance="outlined">
        <mat-card-content class="p-2 px-3 str">
          <h2 *ngIf="cardTitle" class="mat-body-strong" [class.mb-1]="cardBodyText">
            {{cardTitle}}
          </h2>
          <p *ngIf="cardBodyText" class="mat-h5">
            {{cardBodyText}}
          </p>
        </mat-card-content>
      </mat-card>
    </mat-card>

    <dialog #dialog (click)="onDialogClick($event)">
      <mat-card appearance="outlined" class="mat-card-print">

        <mat-card-content>
          <ng-content></ng-content>
        </mat-card-content>

        <mat-card-actions align="end" class="position-absolute top-0 end-0 d-print-none">
          <button mat-icon-button (click)="closeDialog()">
            <mat-icon class="material-icons-outlined">close</mat-icon>
          </button>
        </mat-card-actions>
        <mat-card-actions align="end" class="d-print-none">
          <!--<button mat-icon-button>
            <mat-icon class="material-icons-outlined">share</mat-icon>
          </button>-->
          <button mat-icon-button (click)="downloadAsPDF()" matTooltip="Drucken" matTooltipPosition="below">
            <mat-icon class="material-icons-outlined">file_download</mat-icon>
          </button>
        </mat-card-actions>
      </mat-card>
    </dialog>
  `,
})
export class InfoCardComponent implements AfterViewInit {
  @Input() cardTitle?: string;
  @Input() cardBodyText?: string;
  @Input() outerCardClass!: string;
  @Input() innerCardClass!: string;

  @ViewChild('dialog') dialog!: ElementRef<HTMLDialogElement>;
  portalOutlet!: DomPortalOutlet;

  /**
   * @param route
   * @param router
   * @param elementRef is neede to access the test from outside for the search feature
   */
  constructor(private route: ActivatedRoute, private router: Router, public elementRef: ElementRef<Element>) {

  }

  fragmentName: string = '';

  ngAfterViewInit(): void {

    // init portal to put dialog in
    this.portalOutlet = new DomPortalOutlet(document.body, undefined, undefined, undefined, document);

    if (this.cardTitle) {
      this.fragmentName = this.cardTitle.replace(/[^a-z0-9üäöß]+/iug, '-').toLowerCase();

      this.route.fragment.subscribe(fragment => {
        const params = this.parseFragment(fragment || '');
        if (params[this.fragmentName]) {
          setTimeout(() => this.openDialog(), 0);
        } else {
          setTimeout(() => this.closeDialog(), 0);
        }
      });
    }
  }

  private closeListener = () => this.closeDialog();

  openDialog(): void {
    if (!this.dialog || this.dialog.nativeElement.open)
      return;

    // insert dialog into portal at the end of the body
    this.portalOutlet.attach(new DomPortal(this.dialog));

    this.dialog.nativeElement.showModal();
    document.body.classList.add('dialog-open');

    // react to native close with ESC
    this.dialog.nativeElement.addEventListener('cancel', this.closeListener);

    const fragment = this.route.snapshot.fragment;
    const params = this.parseFragment(fragment ?? '');
    params[this.fragmentName] = '1';
    const newFragment = this.stringifyFragment(params);
    this.router.navigate([], {fragment: newFragment, replaceUrl: true});
  }

  closeDialog(): void {
    if (!this.dialog || !this.dialog.nativeElement.open)
      return;
    // remove listener
    this.dialog.nativeElement.removeEventListener('cancel', this.closeListener);

    this.dialog.nativeElement.close();
    document.body.classList.remove('dialog-open');

    // remove dialog from portal
    this.portalOutlet.detach();

    const fragment = this.route.snapshot.fragment;
    const params = this.parseFragment(fragment ?? '');
    delete params[this.fragmentName];
    const newFragment = this.stringifyFragment(params);
    this.router.navigate([], {fragment: newFragment, replaceUrl: true});
  }

  onDialogClick(event: Event): void {
    if (event.target === this.dialog.nativeElement) {
      this.closeDialog();
    }
  }

  downloadAsPDF() {
    print()
  }

  // Parse the URL fragment into an object
  private parseFragment(fragment: string): Record<string, string | undefined> {
    return fragment.split('&').reduce((params, pair) => {
      const [key, value] = pair.split('=');
      return {...params, [key]: value};
    }, {});
  }

  // Stringify an object into a URL fragment
  private stringifyFragment(params: Record<string, string | number | undefined>): string {
    return Object.entries(params)
      .map(([key, value]) => value !== undefined ? `${key}=${value}` : '')
      .filter(kv => kv !== '')
      .join('&');
  }
}
