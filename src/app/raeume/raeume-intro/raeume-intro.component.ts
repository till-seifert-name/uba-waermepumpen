import { Component, OnInit, OnDestroy } from '@angular/core';
import { BerechnungService, Room } from '../../berechnung.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-raeume-intro',
  standalone: false,
  templateUrl: './raeume-intro.component.html',
  styleUrl: './raeume-intro.component.scss'
})
export class RaeumeIntroComponent implements OnInit, OnDestroy {
  selectedRoomId: string = '';
  selectedRoomName: string = '';
  roomList: Room[] = [];
  
  private subscriptions: Subscription[] = [];

  constructor(private berechnungService: BerechnungService) {}

  ngOnInit(): void {
    // Subscribe to room list changes
    this.subscriptions.push(
      this.berechnungService.rooms$.subscribe(rooms => {
        this.roomList = rooms;
        
        // If no room is selected yet but we have rooms, select the first one
        if (!this.selectedRoomId && rooms.length > 0) {
          this.setSelectedRoom(rooms[0].id);
        }
      })
    );
    
    // Subscribe to selected room changes
    this.subscriptions.push(
      this.berechnungService.selectedRoom$.subscribe(roomId => {
        if (roomId) {
          this.selectedRoomId = roomId;
          const room = this.roomList.find(r => r.id === roomId);
          this.selectedRoomName = room ? room.name : '';
        }
      })
    );
  }
  
  ngOnDestroy(): void {
    this.subscriptions.forEach(sub => sub.unsubscribe());
  }

  onRoomSelected(roomId: string): void {
    this.setSelectedRoom(roomId);
  }
  
  setSelectedRoom(roomId: string): void {
    this.berechnungService.setSelectedRoom(roomId);
  }
}
