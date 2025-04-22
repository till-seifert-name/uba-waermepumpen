import { Component, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { BerechnungService, Room } from '../../berechnung.service';
import { Subscription } from 'rxjs';

interface WindowData {
  width: number;
  height: number;
  constructionYear: string;
  count: number;
}

interface WallData {
  length: number;
  insulationThickness: number;
}

@Component({
  selector: 'app-raum-detail-walls',
  standalone: false,
  templateUrl: './raum-detail-walls.component.html',
  styleUrl: './raum-detail-walls.component.scss'
})
export class RaumDetailWallsComponent implements OnInit, OnDestroy {
  roomId: string = '';
  roomList: Room[] = [];
  private subscriptions: Subscription[] = [];
  
  roomData = {
    name: ''
  };
  
  wallData: WallData = {
    length: 0,
    insulationThickness: 6 // Default from mockup
  };
  
  windowData: WindowData = {
    width: 0,
    height: 0,
    constructionYear: '1969-1979', // Default from mockup
    count: 1
  };
  
  // Additional window types
  additionalWindows: WindowData[] = [];

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
    
    // Get room ID from query params
    this.subscriptions.push(
      this.route.queryParams.subscribe(params => {
        const id = params['room'];
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
        // Load wall and window data if available
        if (room.data.wallData) {
          this.wallData = { ...this.wallData, ...room.data.wallData };
        }
        
        if (room.data.windowData) {
          this.windowData = { ...this.windowData, ...room.data.windowData };
        }
        
        if (room.data.additionalWindows) {
          this.additionalWindows = [...room.data.additionalWindows];
        }
      }
    } else {
      // Room not found, redirect to room list
      this.router.navigate(['/raeume/intro']);
    }
  }
  
  addWindowType(): void {
    // Add a new window type
    this.additionalWindows.push({
      width: 0,
      height: 0,
      constructionYear: '2003-2008',
      count: 1
    });
  }
  
  removeWindowType(index: number): void {
    // Remove a window type by index
    this.additionalWindows.splice(index, 1);
  }
  
  // Save room data before leaving
  saveRoomData(): void {
    // Create a complete data object with all wall and window details
    const completeData = {
      wallData: this.wallData,
      windowData: this.windowData,
      additionalWindows: this.additionalWindows
    };
    
    this.berechnungService.updateRoomData(this.roomId, completeData);
  }
  
  // Helper method to check if this is the last room
  isLastRoom(): boolean {
    const currentRoomIndex = this.roomList.findIndex(room => room.id === this.roomId);
    return currentRoomIndex === this.roomList.length - 1;
  }
  
  // Helper method to check if there are more rooms
  hasNextRoom(): boolean {
    const currentRoomIndex = this.roomList.findIndex(room => room.id === this.roomId);
    return currentRoomIndex < this.roomList.length - 1;
  }
  
  onComplete(): void {
    // Save current room data
    this.saveRoomData();
    
    // Find the index of the current room
    const currentRoomIndex = this.roomList.findIndex(room => room.id === this.roomId);
    
    // Check if there's a next room to navigate to
    if (this.hasNextRoom()) {
      // There's a next room - navigate to it
      const nextRoom = this.roomList[currentRoomIndex + 1];
      this.router.navigate(['/raeume/detail-basis'], { 
        queryParams: { room: nextRoom.id }
      });
    } else {
      // This was the last room - navigate to results
      this.router.navigate(['/ergebnis']);
    }
  }
}
