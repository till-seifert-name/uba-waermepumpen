import {Component, Input, Output, EventEmitter, OnInit} from '@angular/core';

@Component({
  selector: 'app-button-toggle-group',
  template: `
    <mat-button-toggle-group [value]="selectedOption" (change)="onChange($event)">
      <mat-button-toggle *ngFor="let option of options" [value]="option">
        <mat-icon class="material-icons-outlined" *ngIf="selectedOption === option">check</mat-icon>
        {{ option }}
      </mat-button-toggle>
    </mat-button-toggle-group>
  `,
  styleUrls: ['./button-toggle-group.component.scss']
})
export class ButtonToggleGroupComponent {
  @Input() options: any[] = [];
  @Input() selectedOption: any;
  @Output() selectedOptionChange = new EventEmitter<any>();

  onChange(event: any) {
    this.selectedOption = event.value;
    this.selectedOptionChange.emit(this.selectedOption);
  }
}
