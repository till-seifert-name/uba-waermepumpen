import {Component, OnDestroy, OnInit} from '@angular/core';
import {ActivatedRoute, Router} from '@angular/router';
import {BerechnungService} from '../../berechnung.service';
import {Subscription} from 'rxjs';
import {DataGrid} from '../../data-grid';
import {OUT_ROOMS_COLS} from "../../formula-overlays/base-overlay";

@Component({
  selector: 'app-raum-detail-ergebnis',
  standalone: false,
  templateUrl: './raum-detail-ergebnis.component.html',
  styleUrl: './raum-detail-ergebnis.component.scss'
})
export class RaumDetailErgebnisComponent implements OnInit, OnDestroy {
  roomId: number = 1;

  // Direct DataGrid access for templates
  get grid(): DataGrid {
    return this.berechnungService.grid;
  }

  // Helper method to get the room column in OUT_rooms sheet
  getRoomOutColumn(): string {
    // OUT_rooms columns H-V for rooms 1-15
    return OUT_ROOMS_COLS[this.roomId - 1]
  }

  // Helper method to get the room column in clc_build sheet
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
          this.roomId = parseInt(params['room']) ?? 1;
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
