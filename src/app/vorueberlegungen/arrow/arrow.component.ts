import {Component, Input, HostBinding} from '@angular/core';

@Component({
  selector: 'app-arrow',
  template: `
    <div class="shaft"></div>
    <svg class="arrowhead" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 9 5">
      <polyline points="0,5 4.5,0 9,5"></polyline>
    </svg>
  `,
  styles: [`
    :host {
      display: flex;
      align-items: center;
      color: inherit;
      flex-direction: column;
    }

    :host(.horizontal) {
      flex-direction: row;
    }

    :host(.reverse) {
      flex-direction: column-reverse;
    }

    :host(.horizontal.reverse) {
      flex-direction: row-reverse;
    }

    .shaft {
      flex-grow: 1;
      background: currentColor;
    }

    :host(.horizontal) .shaft {
      height: 1px;
    }

    :not(:host(.horizontal)) .shaft {
      width: 1px;
    }

    .arrowhead {
      transform: rotate(180deg);
      width: 9px;
      height: 5px;
      fill: transparent;
      stroke: currentColor;
      stroke-width: 1px;
      transform-origin: center;
      margin: -5px 0 0 0;
    }

    :host(.reverse) .arrowhead {
      transform: rotate(0deg);
      margin: 0 0 -5px 0;
    }

    :host(.horizontal) .arrowhead {
      transform: rotate(90deg);
      margin: 0 0 0 -6px;
    }

    :host(.horizontal.reverse) .arrowhead {
      transform: rotate(270deg);
      margin: 0 -6px 0 0;
    }
  `]
})
export class ArrowComponent {
  @Input() direction: 'right' | 'left' | 'up' | 'down' = 'right';

  @HostBinding('class.horizontal') get isHorizontal() {
    return this.direction === 'right' || this.direction === 'left';
  }

  @HostBinding('class.reverse') get isReverse() {
    return this.direction === 'left' || this.direction === 'up';
  }
}
