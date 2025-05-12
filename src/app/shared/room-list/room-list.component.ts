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
  removeRoom(roomId: string): void {
    this.berechnungService.removeRoom(roomId);
  }

  /**
   * Renames a room
   * @param roomId The ID of the room to rename
   * @param newName The new name for the room
   */
  renameRoom(roomId: string, newName: string): void {
    if (!newName || !newName.trim()) return;

    this.berechnungService.setRoomName(roomId, newName.trim());
  }
}
