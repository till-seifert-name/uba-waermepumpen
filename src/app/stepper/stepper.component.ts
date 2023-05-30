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
      <div class="stepper-header">
          <h1 class="step-label mat-headline-6 text-uppercase mb-0 ms-2 me-0">{{selected?.label}}</h1>

          <button mat-icon-button
                  class="btn-reset mx-0 my-n2 d-print-none"
                  *ngIf="onReset.observers.length" (click)="onReset.emit()">
              <mat-icon class="material-icons-outlined">refresh</mat-icon>
          </button>

          <span class="stepper-title mat-headline-6 text-uppercase mb-0 ms-auto">
            {{title}}
              <span class="fw-bold">{{selectedIndex + 1}}</span>/{{steps.length}}
          </span>
          <span class="stepper-graphic ms-2  d-print-none" *ngIf="graphicDirective">
            <ng-container *ngTemplateOutlet="graphicDirective.template"></ng-container>
          </span>
      </div>

      <div class="stepper-content">
          <div [ngTemplateOutlet]="selected ? selected.content : null"></div>
      </div>

      <div class="stepper-footer d-print-none">
          <button mat-button
                  color="primary"
                  cdkStepperPrevious
                  [disabled]="selectedIndex === 0">
              zurück
          </button>
          <mat-progress-bar mode="determinate"
                            [value]="(selectedIndex + 1) / steps.length * 100">
          </mat-progress-bar>
          <ng-container *ngIf="finishButtonDirective && (selectedIndex === steps.length - 1); else nextButton">
              <ng-container *ngTemplateOutlet="finishButtonDirective.template ?? null"></ng-container>
          </ng-container>
          <ng-template #nextButton>
              <button mat-stroked-button
                      color="primary"
                      cdkStepperNext
                      [disabled]="selectedIndex === steps.length - 1">
                  weiter
              </button>
          </ng-template>
      </div>
  `,
  styles: [`
    :host {
      display: flex;
      flex-direction: column;
    }

    .stepper-header {
      flex-grow: 0;
      display: flex;
      justify-content: stretch;
      align-content: center;
      align-items: center;
    }

    .stepper-header .stepper-graphic {
      flex-grow: 0;
    }

    .stepper-header .step-label {
      margin-inline-end: auto;
    }

    .stepper-content {
      flex: 1;
    }

    .stepper-footer {
      flex-grow: 0;
      display: flex;
      gap: 2rem;
      justify-content: space-between;
      align-items: center;
    }

    .stepper-footer button {
      flex-grow: 0;
    }

    mat-progress-bar {
      margin: 0 auto;
      max-width: 16rem;
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
