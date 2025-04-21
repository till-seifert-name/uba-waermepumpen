import { Component, EventEmitter, Input, Output } from '@angular/core';
import { Router } from '@angular/router';

interface RoomItem {
  id: string;
  name: string;
}

@Component({
  selector: 'app-room-selector',
  standalone: false,
  templateUrl: './room-selector.component.html',
  styleUrl: './room-selector.component.scss'
})
export class RoomSelectorComponent {
  @Input() rooms: RoomItem[] = [];
  @Input() currentRoom: string = '';
  @Input() selectedRoomId: string = '';
  @Input() routePrefix: string = '/raeume/detail-basis';
  
  @Output() roomSelected = new EventEmitter<string>();
  
  constructor(private router: Router) {}
  
  selectRoom(roomId: string): void {
    this.roomSelected.emit(roomId);
    // Navigate to the same route type but with the new room ID
    const baseUrl = this.router.url.split('/').slice(0, -1).join('/');
    this.router.navigate([`${baseUrl}/${roomId}`]);
  }
}
