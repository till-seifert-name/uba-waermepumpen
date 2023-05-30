import {Component, Input} from '@angular/core';

@Component({
  selector: 'app-resizable-circle',
  template: `
    <svg class="circle" [class]="circleClass"
         [style.grid-column]="gridColumn"
         [style.grid-row]="gridRow"
         [style.width.px]="getCircleDimension(size) * 2"
         [style.height.px]="getCircleDimension(size) * 2">
      <title>{{title}}</title>
      <circle [attr.r]="getCircleDimension(size) - 3"
              [attr.cx]="getCircleDimension(size)"
              [attr.cy]="getCircleDimension(size)"></circle>
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
  @Input() size: number = 30;

  getCircleDimension(baseDimension: number): number {
    return baseDimension * (1 + 0.3 * (this.gridColumn - 4));
  }
}
