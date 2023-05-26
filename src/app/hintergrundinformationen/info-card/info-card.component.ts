import {Component, ElementRef, Input, ViewChild} from '@angular/core';

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
      max-width: 700px;
      border: none;
      padding: 0;
      background: transparent;

      &::backdrop {
        background: rgba(0, 0, 0, 0.25);
      }
    }

    @media print {
      ::ng-deep body:has(dialog[open]) * {
        visibility: hidden;

        dialog[open] mat-card-content,
        dialog[open] mat-card-content * {
          visibility: visible !important;
        }
      }

      dialog[open] mat-card-content, dialog[open] mat-card-content * {
        visibility: visible !important;
      }

      dialog::backdrop {
        display: none;
      }

       dialog[open] mat-card-actions {
        display: none;
      }

      dialog[open] mat-card-content:first-of-type {
        padding: 1cm;
        position: fixed;
        z-index: 2000;
        left: 0;
        top: 0;
        margin: 0;
        width: 100%;
        min-height: 100%;
        background: white;
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
                  <p *ngIf="cardTitle" class="mat-body-strong" [class.mb-1]="cardBodyText">
                      {{cardTitle}}
                  </p>
                  <p *ngIf="cardBodyText" class="mat-h5">
                      {{cardBodyText}}
                  </p>
              </mat-card-content>
          </mat-card>
      </mat-card>

      <dialog #dialog (click)="onDialogClick($event)">
          <mat-card appearance="outlined">

              <mat-card-content>
                  <ng-content></ng-content>
              </mat-card-content>

              <mat-card-actions align="end" class="position-absolute top-0 end-0">
                  <button autofocus mat-icon-button (click)="closeDialog()">
                      <mat-icon class="material-icons-outlined">close</mat-icon>
                  </button>
              </mat-card-actions>
              <mat-card-actions align="end">
                  <button mat-icon-button>
                      <mat-icon class="material-icons-outlined">share</mat-icon>
                  </button>
                  <button mat-icon-button (click)="downloadAsPDF()">
                      <mat-icon class="material-icons-outlined">file_download</mat-icon>
                  </button>
              </mat-card-actions>
          </mat-card>
      </dialog>
  `,
})
export class InfoCardComponent {
  @Input() cardTitle?: string;
  @Input() cardBodyText?: string;
  @Input() outerCardClass!: string;
  @Input() innerCardClass!: string;

  @ViewChild('dialog') dialog!: ElementRef<HTMLDialogElement>;


  openDialog(): void {
    this.dialog.nativeElement.showModal();
  }

  closeDialog(): void {
    this.dialog.nativeElement.close();
  }

  onDialogClick(event: Event): void {
    if (event.target === this.dialog.nativeElement) {
      this.closeDialog();
    }
  }

  downloadAsPDF() {
    print()
  }
}
