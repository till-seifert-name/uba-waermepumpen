import {
  ChangeDetectorRef,
  Component,
  ContentChild,
  Directive,
  ElementRef, EventEmitter, HostBinding,
  Input,
  OnInit, Output,
  TemplateRef
} from '@angular/core';
import {CdkStepper} from '@angular/cdk/stepper';
import {ActivatedRoute, Router} from "@angular/router";
import {Directionality} from "@angular/cdk/bidi";

@Directive({
  selector: '[stepperGraphic]'
})
export class StepperGraphicDirective {
  constructor(public template: TemplateRef<any>) {
  }
}

@Directive({
  selector: '[finishButton]'
})
export class FinishButtonDirective {
  constructor(public template: TemplateRef<any>) {
  }
}

/**
 * Custom CDK stepper component
 *
 * Example usage:
 *
 * <app-custom-stepper [title]="title">
 *   <cdk-step label="Label 1>
 *     Content 1
 *   </cdk-step>
 * </app-custom-stepper>
 */
@Component({
  selector: 'app-custom-stepper',
  template: `
      <div class="stepper-header d-print-none">
          <h1 class="step-label mat-headline-6 text-uppercase text-truncate mb-0 ms-2 me-0">{{selected?.label}}</h1>

          <button mat-icon-button
                  matTooltip="Eingaben zurücksetzen"
                  class="btn-reset mx-0 my-n2 d-print-none"
                  type="button"
                  *ngIf="onReset.observers.length" (click)="onReset.emit()">
              <mat-icon class="material-icons-outlined">refresh</mat-icon>
          </button>

          <span class="stepper-title mat-headline-6 text-uppercase text-truncate mb-0 ms-auto">
            {{title}}
              <span class="fw-bold">{{selectedIndex + 1}}</span>/{{steps.length}}
          </span>
          <span class="stepper-graphic ms-2 d-none d-sm-block d-print-none" *ngIf="graphicDirective">
            <ng-container *ngTemplateOutlet="graphicDirective.template"></ng-container>
          </span>
      </div>

      <div *ngFor="let s of steps; let index = index"
           [id]="'step-content-' + index"
           class="stepper-content d-print-block"
           [class.d-block]="s === selected"
           [class.d-none]="s !== selected"
      >
          <h2 class="d-none d-print-block text-uppercase">{{s.label}}</h2>
          <ng-container [ngTemplateOutlet]="s.content"></ng-container>
      </div>

      <div class="stepper-footer d-print-none">
          <div>
              <button mat-button
                      type="button"
                      color="primary"
                      cdkStepperPrevious
                      [disabled]="selectedIndex === 0">
                  zurück
              </button>
          </div>

          <div class="stepper-dots d-flex gap-5" role="tablist">
              <button *ngFor="let step of steps; let index = index"
                      [class.bg-A400-blues]="index <= selectedIndex"
                      class="border-0 p-0 stepper-dot rounded-pill"
                      role="tab"
                      type="button"
                      [attr.aria-selected]="index === selectedIndex"
                      [attr.aria-controls]="'step-content-' + index"
                      (click)="selectedIndex = index">
              </button>
          </div>

          <div>
              <ng-container *ngIf="finishButtonDirective && (selectedIndex === steps.length - 1); else nextButton">
                  <ng-container *ngTemplateOutlet="finishButtonDirective.template ?? null"></ng-container>
              </ng-container>
              <ng-template #nextButton>
                  <button mat-stroked-button
                          type="submit"
                          color="primary"
                          cdkStepperNext
                          [disabled]="selectedIndex === steps.length - 1">
                      weiter
                  </button>
              </ng-template>
          </div>
      </div>
  `,
  styles: [`
    :host {
      display: flex;
      flex-direction: column;

      @media print {
        display: block;
      }
    }

    .stepper-header {
      flex-grow: 0;
      display: flex;
      justify-content: stretch;
      align-content: center;
      align-items: center;

      .stepper-graphic {
        flex-grow: 0;
      }

      .step-label {
        margin-inline-end: auto;
      }
    }

    .stepper-content {
      flex: 1;
      overflow-y: auto;

      @media print {
        break-inside: avoid;
      }
    }

    .stepper-footer {
      flex-grow: 0;
      display: flex;
      gap: 2rem;
      justify-content: space-between;
      align-items: center;

      > div {
        flex: 1;
        display: flex;
        justify-content: center;

        &:first-child {
          justify-content: start;
        }

        &:last-child {
          justify-content: end;
        }
      }

      .stepper-dot {
        height: 10px;
        width: 10px;
        background: var(--bs-gray-300);
      }
    }

    [role="tab"] {
      cursor: pointer;
    }
  `],
  providers: [{provide: CdkStepper, useExisting: CustomStepperComponent}],
})
export class CustomStepperComponent extends CdkStepper implements OnInit {
  @Input() title: string = ''; // Title for the stepper
  @ContentChild(StepperGraphicDirective, {static: false}) graphicDirective: StepperGraphicDirective | undefined;
  @ContentChild(FinishButtonDirective, {static: false}) finishButtonDirective: FinishButtonDirective | undefined;

  @Output() onReset = new EventEmitter<void>();

  @HostBinding('attr.data-current-step') get currentStep() {
    return this.selectedIndex;
  }


  constructor(_dir: Directionality,
              _changeDetectorRef: ChangeDetectorRef,
              _elementRef: ElementRef<HTMLElement>,
              private route: ActivatedRoute,
              private router: Router) {
    super(_dir, _changeDetectorRef, _elementRef);
  }

  ngOnInit() {
    // get the step from the current fragment
    const {step = ''} = this.parseFragment(this.route.snapshot.fragment || '');
    const index = parseInt(step, 10);
    if (step && !isNaN(index)) {
      super.selectedIndex = index;
    }
  }

  override ngAfterViewInit() {
    super.ngAfterViewInit();

    this.selectionChange.subscribe(event => {
      // Parse the current fragment
      const fragmentParams = this.parseFragment(this.route.snapshot.fragment || '');

      // Update the step in the parsed fragment
      fragmentParams['step'] = event.selectedIndex ? event.selectedIndex.toString() : undefined;

      // Stringify the updated fragment
      const newFragment = this.stringifyFragment(fragmentParams);

      this.router.navigate([], {
        relativeTo: this.route,
        replaceUrl: true,
        fragment: newFragment,
        queryParamsHandling: 'merge', // preserve the other existing query parameters
      });
    });
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
