import { Component, OnInit } from '@angular/core';
import { BerechnungService } from '../../berechnung.service';
import { DataGrid } from '../../data-grid';

@Component({
  selector: 'app-raeume-list-criteria-one',
  standalone: false,
  templateUrl: './raeume-list-criteria-one.component.html',
  styleUrl: './raeume-list-criteria-one.component.scss'
})
export class RaeumeListCriteriaOneComponent implements OnInit {
  newColdRoomName: string = '';
  newExteriorRoomName: string = '';

  public grid: DataGrid;

  constructor(private berechnungService: BerechnungService) {
    this.grid = berechnungService.grid;
  }

  ngOnInit(): void {
    // Initialize the component
  }

  // Direct access to hasRoomsThatDontGetWarm through DataGrid
  get hasRoomsThatDontGetWarm(): boolean {
    return this.grid.getCell('IN_build', 'P21') === 'Ja';
  }

  set hasRoomsThatDontGetWarm(value: boolean) {
    this.grid.setCell('IN_build', 'P21', value ? 'Ja' : 'Nein');
  }

  // Room management functions
  addColdRoom(): void {
    if (!this.newColdRoomName.trim()) return;

    // Clear the input field after adding the room
    const name = this.newColdRoomName.trim();
    this.newColdRoomName = '';

    // The actual room addition is now handled by the room-list component
    this.onAddRoom(name, 'cold');
  }

  addExteriorRoom(): void {
    if (!this.newExteriorRoomName.trim()) return;

    // Clear the input field after adding the room
    const name = this.newExteriorRoomName.trim();
    this.newExteriorRoomName = '';

    // The actual room addition is now handled by the room-list component
    this.onAddRoom(name, 'exterior');
  }

  // Event handlers for room-list component events
  onAddRoom(name: string, type: string): void {
    if (!name || !name.trim()) return;
    // Call the service directly since we need to specify the type
    this.berechnungService.addRoom(name, type);
  }

  // Helper method for handling checkbox events
  checked(event: Event): boolean {
    return (event.target as HTMLInputElement)?.checked ?? false;
  }
}
