import { Component, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { BerechnungService } from '../../berechnung.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-raum-detail-basic',
  standalone: false,
  templateUrl: './raum-detail-basic.component.html',
  styleUrl: './raum-detail-basic.component.scss'
})
export class RaumDetailBasicComponent implements OnInit, OnDestroy {
  roomId: string = '';
  roomName: string = '';
  private subscriptions: Subscription[] = [];

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private berechnungService: BerechnungService
  ) {}

  ngOnInit(): void {
    // Get room ID from query params
    this.subscriptions.push(
      this.route.queryParams.subscribe(params => {
        const id = params['room'];
        if (id) {
          this.roomId = id;
          this.berechnungService.setSelectedRoom(id);
          this.loadRoomName(id);
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

  loadRoomName(roomId: string): void {
    try {
      // Get room name directly from the grid
      this.roomName = this.berechnungService.getRoomName(roomId);
    } catch (error) {
      console.error('Error loading room:', error);
      // Room not found, redirect to room list
      this.router.navigate(['/raeume/intro']);
    }
  }

  // Direct access to room data through BerechnungService
  get area(): number {
    return this.berechnungService.getRoomArea(this.roomId);
  }

  set area(value: number) {
    this.berechnungService.setRoomArea(this.roomId, value);
  }

  get height(): number {
    return this.berechnungService.getRoomHeight(this.roomId);
  }

  set height(value: number) {
    this.berechnungService.setRoomHeight(this.roomId, value);
  }

  get temperature(): number {
    return this.berechnungService.getRoomTemperature(this.roomId);
  }

  set temperature(value: number) {
    this.berechnungService.setRoomTemperature(this.roomId, value);
  }

  get ceilingType(): string {
    return this.berechnungService.getRoomCeilingType(this.roomId);
  }

  set ceilingType(value: string) {
    this.berechnungService.setRoomCeilingType(this.roomId, value);
  }

  get floorType(): string {
    return this.berechnungService.getRoomFloorType(this.roomId);
  }

  set floorType(value: string) {
    this.berechnungService.setRoomFloorType(this.roomId, value);
  }

  // Navigate to the next component (wall details)
  onNext(): void {
    this.router.navigate(['/raeume/detail-wand'], {
      queryParams: { room: this.roomId }
    });
  }


}
