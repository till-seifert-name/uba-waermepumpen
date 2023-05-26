import {Component, Input} from '@angular/core';

@Component({
  selector: 'app-info-card',
  styles: [`
    :host {
      display: block;
    }

    .outer-card {
      margin-inline-end: 90px;

      &.info-card-all {
        margin-inline-end: 0;
        padding-inline-end: 90px;
        background-repeat: no-repeat;

        background-image: url('../../../assets/Hintergrundinfos/pkw_Zeichenfläche 1 2.svg'),
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
        margin-inline-end: 0;
        padding-inline-end: 90px;
        background-repeat: no-repeat;

        background-image: url('../../../assets/Hintergrundinfos/sparschwein 1.svg');
        background-position: right 21px top 50%;
        background-size: 48px auto;
      }

      &.info-card-pkw {
        margin-inline-end: 0;
        padding-inline-end: 90px;
        background-repeat: no-repeat;

        background-image: url('../../../assets/Hintergrundinfos/pkw_Zeichenfläche 1 1.svg');
        background-position: right 11px top 50%;
        background-size: 70px auto;
      }

      &.info-card-oepnv {
        margin-inline-end: 0;
        padding-inline-end: 90px;
        background-repeat: no-repeat;

        background-image: url('../../../assets/Hintergrundinfos/oeffentliche_2 2.svg');
        background-position: right 6px top 50%;
        background-size: 76px auto;
      }

      &.info-card-bike {
        margin-inline-end: 0;
        padding-inline-end: 90px;
        background-repeat: no-repeat;

        background-image: url('../../../assets/Hintergrundinfos/fahrrad 1.svg');
        background-position: right 22px top 50%;
        background-size: 51px auto;
      }
    }

  `],
  template: `
      <mat-card class="outer-card" [ngClass]="outerCardClass" appearance="outlined">
          <mat-card [ngClass]="innerCardClass" appearance="outlined">
              <mat-card-content class="p-2 px-3">
                  <h4 *ngIf="cardTitle" class="mat-body-strong" [class.mb-1]="cardBodyText">
                    {{cardTitle}}
                  </h4>
                  <p *ngIf="cardBodyText" class="mat-h5">
                    {{cardBodyText}}
                  </p>
              </mat-card-content>
          </mat-card>
      </mat-card>
  `,
})
export class InfoCardComponent {
  @Input() cardTitle?: string;
  @Input() cardBodyText?: string;
  @Input() outerCardClass!: string;
  @Input() innerCardClass!: string;
}
