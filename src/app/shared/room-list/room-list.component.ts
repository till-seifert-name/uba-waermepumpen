import { Component, Output, EventEmitter, Input } from '@angular/core';
import { BerechnungService, Room } from '../../berechnung.service';

@Component({
  selector: 'app-room-list',
  standalone: false,
  templateUrl: './room-list.component.html',
  styleUrl: './room-list.component.scss'
})
export class RoomListComponent   {

  constructor(public berechnungService: BerechnungService) { }


  /**
   * Adds a new room with the specified name and type
   * @param name The name of the room
   * @param type The type of room ('cold', 'exterior', etc.)
   */
  addRoom(name: string, type: string): void {
    if (!name.trim()) return;

    // Add the room via the service
    this.berechnungService.addRoom(name.trim(), type);
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
      // If the name is empty, restore the previous name
      // We shouldn't allow empty names since they're used to determine room existence
      const currentRooms = this.berechnungService.getAllRooms();
      const currentRoom = currentRooms.find(room => room.id === roomId);
      if (currentRoom) {
        // There must be a name since the room exists
        return;
      }
    }

    this.berechnungService.setRoomName(roomId, newName.trim());
  }
}
