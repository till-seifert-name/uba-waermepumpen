import {Component, ContentChild, Directive, Input, TemplateRef} from '@angular/core';
import {CdkStepper} from '@angular/cdk/stepper';

@Directive({
  selector: '[stepperGraphic]'
})
export class StepperGraphicDirective {
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
      <div class="stepper-header gap-2">
          <h1 class="step-label h5 text-uppercase mb-0 ms-2">{{selected?.label}}</h1>
          <span class="stepper-title h5 text-uppercase mb-0">
            {{title}}
              <strong>{{selectedIndex + 1}}</strong>/{{steps.length}}
          </span>
          <span class="stepper-graphic" *ngIf="graphicDirective">
            <ng-container *ngTemplateOutlet="graphicDirective.template"></ng-container>
          </span>
      </div>

      <div class="stepper-content">
          <div [ngTemplateOutlet]="selected ? selected.content : null">

          </div>
      </div>

      <div class="stepper-footer">
          <button mat-button
                  color="primary"
                  class="rounded-pill"
                  cdkStepperPrevious
                  [disabled]="selectedIndex === 0">
              Zurück
          </button>
          <mat-progress-bar mode="determinate"
                            [value]="(selectedIndex + 1) / steps.length * 100">
          </mat-progress-bar>
          <button mat-stroked-button
                  color="primary"
                  class="rounded-pill"
                  cdkStepperNext
                  [disabled]="selectedIndex === steps.length - 1">
              Weiter
          </button>
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
export class CustomStepperComponent extends CdkStepper {
  @Input() title: string = ''; // Title for the stepper
  @ContentChild(StepperGraphicDirective, {static: false}) graphicDirective: StepperGraphicDirective | undefined;
}
