import { Component, OnInit, TrackByFunction } from '@angular/core';
import { BerechnungService } from '../../berechnung.service';
import { DataGrid } from '../../data-grid';

@Component({
  selector: 'app-raeume-list-consolidated',
  standalone: false,
  templateUrl: './raeume-list-consolidated.component.html',
  styleUrl: './raeume-list-consolidated.component.scss'
})
export class RaeumeListConsolidatedComponent implements OnInit {
  public grid: DataGrid;
  roomId: TrackByFunction<any> = (_, r) => r.id;

  constructor(public berechnungService: BerechnungService) {
    this.grid = berechnungService.grid;
  }

  ngOnInit(): void {
    // Initialize the component
  }


  // Add room with smart default name
  addRoomWithDefaultName(): void {
    try {
      const defaultName = this.generateDefaultRoomName();
      this.berechnungService.addRoom(defaultName);
    } catch (error) {
      // Handle maximum room limit gracefully
      console.warn('Cannot add more rooms:', error);
    }
  }

  // Check if we can add more rooms (limit is 15)
  get canAddMoreRooms(): boolean {
    return this.berechnungService.getAllRooms().length < 15;
  }

  // Generate smart default room name like "Raum 1", "Raum 2", etc.
  private generateDefaultRoomName(): string {
    const existingRooms = this.berechnungService.getAllRooms();
    const raumPattern = /^Raum\s+(\d+)/;

    // Find all existing "Raum X" numbers
    const existingNumbers = existingRooms
      .map(room => {
        const match = room.name.match(raumPattern);
        return match ? parseInt(match[1], 10) : null;
      })
      .filter(num => num !== null)
      .sort((a, b) => a! - b!);

    // Find the next available number
    let nextNumber = 1;
    for (const num of existingNumbers) {
      if (num === nextNumber) {
        nextNumber++;
      } else {
        break;
      }
    }

    return `Raum ${nextNumber}`;
  }


  /**
   * Removes the room with the specified ID
   * Only the last room can be removed (enforced by the service)
   */
  removeRoom(roomId: number): void {
    this.berechnungService.removeRoom(roomId);
  }

  /**
   * Renames a room
   * @param roomId The ID of the room to rename
   * @param newName The new name for the room
   */
  renameRoom(roomId: number, newName: string): void {
    if (!newName || !newName.trim()) {
      // If the name is empty, don't update (keep current name)
      return;
    }

    this.berechnungService.setRoomName(roomId, newName.trim());
  }
}
