import { Component, OnInit } from '@angular/core';
import { BerechnungService } from '../../berechnung.service';
import { DataGrid } from '../../data-grid';

@Component({
  selector: 'app-raeume-list-criteria-two',
  standalone: false,
  templateUrl: './raeume-list-criteria-two.component.html',
  styleUrl: './raeume-list-criteria-two.component.scss'
})
export class RaeumeListCriteriaTwoComponent implements OnInit {
  newBoundaryRoomName: string = '';
  newWindowRoomName: string = '';
  newOtherRoomName: string = '';

  public grid: DataGrid;

  constructor(private berechnungService: BerechnungService) {
    this.grid = berechnungService.grid;
  }

  ngOnInit(): void {
    // Initialize the component
  }

  // Room management functions
  addBoundaryRoom(): void {
    if (!this.newBoundaryRoomName.trim()) return;

    // Clear the input field after adding the room
    const name = this.newBoundaryRoomName.trim();
    this.newBoundaryRoomName = '';

    // The actual room addition is now handled by the room-list component
    this.onAddRoom(name, 'boundary');
  }

  addWindowRoom(): void {
    if (!this.newWindowRoomName.trim()) return;

    // Clear the input field after adding the room
    const name = this.newWindowRoomName.trim();
    this.newWindowRoomName = '';

    // The actual room addition is now handled by the room-list component
    this.onAddRoom(name, 'windows');
  }

  addOtherRoom(): void {
    if (!this.newOtherRoomName.trim()) return;

    // Clear the input field after adding the room
    const name = this.newOtherRoomName.trim();
    this.newOtherRoomName = '';

    // The actual room addition is now handled by the room-list component
    this.onAddRoom(name, 'other');
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
