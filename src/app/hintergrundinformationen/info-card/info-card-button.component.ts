import {
  AfterViewInit,
  Component, ContentChild,
  Directive,
  ElementRef, HostBinding,
  HostListener,
  Input, Renderer2,
  TemplateRef,
  ViewChild
} from '@angular/core';
import {InfoCardComponent} from "./info-card.component";

@Component({
  selector: 'app-info-card-button',
  styles: [`
    :host {
      display: block;
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
    <ng-content (dialogTrigger)="openDialog()"></ng-content>

    <dialog #dialog (click)="onDialogClick($event)">
      <mat-card appearance="outlined" class="mat-card-print">

        <mat-card-content>
          <ng-template [ngTemplateOutlet]="dialogContent"></ng-template>
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
export class InfoCardButtonComponent extends InfoCardComponent implements AfterViewInit {
  @ViewChild('dialog') override dialog!: ElementRef<HTMLDialogElement>;
  @ContentChild('dialogContent') dialogContent!: TemplateRef<any>;
}


@Directive({
  selector: '[dialogTrigger]'
})
export class DialogTriggerDirective {
  @Input('dialogTrigger') dialogComponent!: InfoCardButtonComponent;

  // Add tabindex to host element
  @HostBinding('attr.tabindex') tabindex = '0';

  constructor(private el: ElementRef, private renderer: Renderer2) {
    // Add role and aria-label to host element
    this.renderer.setAttribute(this.el.nativeElement, 'role', 'button');
    this.renderer.setAttribute(this.el.nativeElement, 'aria-label', 'Open dialog');
  }

  @HostListener('click', ['$event'])
  @HostListener('keydown.space', ['$event'])
  @HostListener('keydown.enter', ['$event'])
  onClick(event: Event) {
    this.dialogComponent.openDialog();
    event.stopPropagation();
  }
}
