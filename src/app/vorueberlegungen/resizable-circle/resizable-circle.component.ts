import {Component, Input} from '@angular/core';

@Component({
  selector: 'app-resizable-circle',
  template: `
    <svg class="circle" [matTooltip]="title" [class]="circleClass"
         [style.grid-column]="gridColumn"
         [style.grid-row]="gridRow"
         [style.width.px]="getCircleDimension(size)"
         [style.height.px]="getCircleDimension(size)">
      <circle [attr.r]="getCircleDimension(size) / 2 - 3"
              [attr.cx]="getCircleDimension(size) / 2"
              [attr.cy]="getCircleDimension(size) / 2"></circle>
    </svg>
  `,
  styles: [`
    :host {
      display: contents;
    }

    .circle {
      stroke: currentColor;
      stroke-width: 2px;
      fill: transparent;

      align-self: center;
      justify-self: center;
    }
  `]
})
export class ResizableCircleComponent {
  @Input() circleClass: string = '';
  @Input() gridColumn: number = 1;
  @Input() gridRow: number = 1;
  @Input() title: string = '';
  @Input() size: number = 36;

  getCircleDimension(baseDimension: number): number {
    return baseDimension * (1 + 0.88 * (this.gridColumn - 4));
  }
}
