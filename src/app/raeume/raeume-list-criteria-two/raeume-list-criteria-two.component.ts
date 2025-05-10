import { Component, OnInit, OnDestroy } from '@angular/core';
import { BerechnungService, Room } from '../../berechnung.service';
import { Subscription } from 'rxjs';
import { DataGrid } from '../../data-grid';

@Component({
  selector: 'app-raeume-list-criteria-two',
  standalone: false,
  templateUrl: './raeume-list-criteria-two.component.html',
  styleUrl: './raeume-list-criteria-two.component.scss'
})
export class RaeumeListCriteriaTwoComponent implements OnInit, OnDestroy {
  newBoundaryRoomName: string = '';
  newWindowRoomName: string = '';
  newOtherRoomName: string = '';

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

  // Room management functions
  addBoundaryRoom(): void {
    if (!this.newBoundaryRoomName.trim()) return;

    // Add a new room with 'boundary' type
    this.berechnungService.addRoom(this.newBoundaryRoomName.trim(), 'boundary');

    // Clear the input field
    this.newBoundaryRoomName = '';
  }

  addWindowRoom(): void {
    if (!this.newWindowRoomName.trim()) return;

    // Add a new room with 'windows' type
    this.berechnungService.addRoom(this.newWindowRoomName.trim(), 'windows');

    // Clear the input field
    this.newWindowRoomName = '';
  }

  addOtherRoom(): void {
    if (!this.newOtherRoomName.trim()) return;

    // Add a new room with 'other' type
    this.berechnungService.addRoom(this.newOtherRoomName.trim(), 'other');

    // Clear the input field
    this.newOtherRoomName = '';
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
