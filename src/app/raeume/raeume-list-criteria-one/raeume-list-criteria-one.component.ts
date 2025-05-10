import { Component, OnInit, OnDestroy } from '@angular/core';
import { BerechnungService, Room } from '../../berechnung.service';
import { Subscription } from 'rxjs';
import { DataGrid } from '../../data-grid';

@Component({
  selector: 'app-raeume-list-criteria-one',
  standalone: false,
  templateUrl: './raeume-list-criteria-one.component.html',
  styleUrl: './raeume-list-criteria-one.component.scss'
})
export class RaeumeListCriteriaOneComponent implements OnInit, OnDestroy {
  newColdRoomName: string = '';
  newExteriorRoomName: string = '';

  roomList: Room[] = [];
  public grid: DataGrid;
  private subscription: Subscription | null = null;

  constructor(private berechnungService: BerechnungService) {
    this.grid = berechnungService.grid;
  }

  ngOnInit(): void {
    // Subscribe to room list changes
    this.subscription = this.berechnungService.rooms$.subscribe(rooms => {
      this.roomList = rooms;
    });
  }

  ngOnDestroy(): void {
    if (this.subscription) {
      this.subscription.unsubscribe();
    }
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

    // Add a new room with 'cold' type
    this.berechnungService.addRoom(this.newColdRoomName.trim(), 'cold');

    // Clear the input field
    this.newColdRoomName = '';
  }

  addExteriorRoom(): void {
    if (!this.newExteriorRoomName.trim()) return;

    // Add a new room with 'exterior' type
    this.berechnungService.addRoom(this.newExteriorRoomName.trim(), 'exterior');

    // Clear the input field
    this.newExteriorRoomName = '';
  }

  removeRoom(roomId: string): void {
    this.berechnungService.removeRoom(roomId);
  }

  // Method to rename a room
  renameRoom(roomId: string, newName: string): void {
    if (!newName || !newName.trim()) return;
    this.berechnungService.setRoomName(roomId, newName.trim());
  }

  // Helper method for handling checkbox events
  checked(event: Event): boolean {
    return (event.target as HTMLInputElement)?.checked ?? false;
  }
}
