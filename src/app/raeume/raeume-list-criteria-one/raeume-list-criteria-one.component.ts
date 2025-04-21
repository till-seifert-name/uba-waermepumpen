import { Component, OnInit, OnDestroy } from '@angular/core';
import { BerechnungService, Room } from '../../berechnung.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-raeume-list-criteria-one',
  standalone: false,
  templateUrl: './raeume-list-criteria-one.component.html',
  styleUrl: './raeume-list-criteria-one.component.scss'
})
export class RaeumeListCriteriaOneComponent implements OnInit, OnDestroy {
  hasRoomsThatDontGetWarm: boolean = false;
  newColdRoomName: string = ''; 
  newExteriorRoomName: string = '';
  
  roomList: Room[] = [];
  private subscription: Subscription | null = null;

  constructor(private berechnungService: BerechnungService) {}

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

  addColdRoom(): void {
    if (!this.newColdRoomName.trim()) return;
    this.berechnungService.addRoom(this.newColdRoomName, 'cold');
    this.newColdRoomName = '';
  }

  addExteriorRoom(): void {
    if (!this.newExteriorRoomName.trim()) return;
    this.berechnungService.addRoom(this.newExteriorRoomName, 'exterior');
    this.newExteriorRoomName = '';
  }

  removeRoom(roomId: string): void {
    this.berechnungService.removeRoom(roomId);
  }
}
