import {Component, OnDestroy, OnInit} from '@angular/core';
import {ActivatedRoute, Router} from '@angular/router';
import {BerechnungService} from '../../berechnung.service';
import {Subscription} from 'rxjs';
import {DataGrid} from '../../data-grid';

@Component({
  selector: 'app-raum-detail-ergebnis',
  standalone: false,
  templateUrl: './raum-detail-ergebnis.component.html',
  styleUrl: './raum-detail-ergebnis.component.scss'
})
export class RaumDetailErgebnisComponent implements OnInit, OnDestroy {
  roomId: string = '';
  
  // Direct DataGrid access for templates
  get grid(): DataGrid {
    return this.berechnungService.grid;
  }

  // Helper method to get the room column in OUT_rooms sheet
  getRoomOutColumn(): string {
    // OUT_rooms columns H-V for rooms 1-15
    const outRoomsCols = ['H', 'I', 'J', 'K', 'L', 'M', 'N', 'O', 'P', 'Q', 'R', 'S', 'T', 'U', 'V'];
    const roomIndex = parseInt(this.roomId, 10) - 1;
    
    // Return corresponding column or default to first column if out of bounds
    return roomIndex >= 0 && roomIndex < outRoomsCols.length 
      ? outRoomsCols[roomIndex] 
      : outRoomsCols[0];
  }
  
  // Helper method to get the room column in clc_build sheet
  getRoomBuildColumn(): string {
    // clc_build columns G-U for rooms 1-15
    const clcBuildCols = ['G', 'H', 'I', 'J', 'K', 'L', 'M', 'N', 'O', 'P', 'Q', 'R', 'S', 'T', 'U'];
    const roomIndex = parseInt(this.roomId, 10) - 1;
    
    // Return corresponding column or default to first column if out of bounds
    return roomIndex >= 0 && roomIndex < clcBuildCols.length 
      ? clcBuildCols[roomIndex] 
      : clcBuildCols[0];
  }

  // Gauge configurations
  // Heat density gauge zones with integrated labels
  get heizlastZones() {
    return [
      {value: 0, label: '0'},           // Min value point (needed for proper gradient)
      {value: 25, label: '50'},         // First transition point: good -> warning
      {value: 50, label: '70'},         // Second transition point: warning -> danger
      {value: 75, label: '90 W/m²'}   // Max value point (matches maxValue input)
    ];
  }

  // Heater capability gauge zones with integrated labels
  get heizkoerperZones() {
    return [
      {value: 0, label: ''},
      {value: 25, label: 'NT-ready'},
      {value: 50, label: 'eingeschränkt geeignet'},
      {value: 75, label: 'noch nicht gut geeignet'},
      {value: 100, label: ''},
    ];
  }

  private subscriptions: Subscription[] = [];

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    public berechnungService: BerechnungService
  ) {
  }

  ngOnInit(): void {
    // Subscribe to query params to get room ID
    this.subscriptions.push(
      this.route.queryParams.subscribe(params => {
        if (params['room']) {
          this.roomId = params['room'];
          this.berechnungService.setSelectedRoom(this.roomId);
        } else {
          // No room ID provided, redirect to room list
          this.router.navigate(['/raeume/intro']);
        }
      })
    );
  }

  hasNextRoom(): boolean {
    const rooms = this.berechnungService.getAllRooms();
    const currentRoomIndex = rooms.findIndex(r => r.id === this.roomId);
    return currentRoomIndex < rooms.length - 1;
  }

  onContinue(): void {
    // Check if there are more rooms
    const rooms = this.berechnungService.rooms$.getValue();
    const currentRoomIndex = rooms.findIndex(r => r.id === this.roomId);

    if (this.hasNextRoom()) {
      // Navigate to next room's basic data
      const nextRoom = rooms[currentRoomIndex + 1];
      this.router.navigate(['/raeume/detail-basis'], {queryParams: {room: nextRoom.id}});
    } else {
      // Navigate to the final results page
      this.router.navigate(['/ergebnis']);
    }
  }

  ngOnDestroy(): void {
    // Clean up subscriptions
    this.subscriptions.forEach(sub => sub.unsubscribe());
  }
}
