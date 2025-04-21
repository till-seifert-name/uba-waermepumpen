import { Component, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { BerechnungService, Room } from '../../berechnung.service';
import { Subscription } from 'rxjs';

interface RoomDetailData {
  name: string;
  area: number;
  height: number;
  temperature: number;
  ceilingType: string;
  floorType: string;
}

@Component({
  selector: 'app-raum-detail-basic',
  standalone: false,
  templateUrl: './raum-detail-basic.component.html',
  styleUrl: './raum-detail-basic.component.scss'
})
export class RaumDetailBasicComponent implements OnInit, OnDestroy {
  roomId: string = '';
  roomList: Room[] = [];
  private subscriptions: Subscription[] = [];
  
  roomData: RoomDetailData = {
    name: '',
    area: 0,
    height: 2.5, // Default values
    temperature: 20, // Default values
    ceilingType: 'unbeheizt',
    floorType: 'erdreich'
  };

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private berechnungService: BerechnungService
  ) {}

  ngOnInit(): void {
    // Subscribe to room list changes
    this.subscriptions.push(
      this.berechnungService.rooms$.subscribe(rooms => {
        this.roomList = rooms;
      })
    );
    
    // Get room ID from route params
    this.subscriptions.push(
      this.route.paramMap.subscribe(params => {
        const id = params.get('id');
        if (id) {
          this.roomId = id;
          this.berechnungService.setSelectedRoom(id);
          this.loadRoomData(id);
        } else {
          // No ID provided, redirect to room list
          this.router.navigate(['/raeume/intro']);
        }
      })
    );
  }
  
  ngOnDestroy(): void {
    this.subscriptions.forEach(sub => sub.unsubscribe());
  }
  
  loadRoomData(roomId: string): void {
    const room = this.roomList.find(r => r.id === roomId);
    if (room) {
      this.roomData.name = room.name;
      
      // If this room has saved data, load it
      if (room.data) {
        this.roomData = {
          ...this.roomData,
          ...room.data
        };
      }
    } else {
      // Room not found, redirect to room list
      this.router.navigate(['/raeume/intro']);
    }
  }
  
  // Save room data when navigating away or making changes
  saveRoomData(): void {
    this.berechnungService.updateRoomData(this.roomId, this.roomData);
  }
  
  // Navigate to the next component (wall details)
  onNext(): void {
    this.saveRoomData();
    this.router.navigate(['/raeume/detail-wand', this.roomId]);
  }
  
  // Helper method for template to determine if this is the last room
  isLastRoom(): boolean {
    const currentRoomIndex = this.roomList.findIndex(room => room.id === this.roomId);
    return currentRoomIndex === this.roomList.length - 1;
  }
}
