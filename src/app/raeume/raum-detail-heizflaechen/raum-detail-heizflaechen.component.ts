import {Component, OnDestroy, OnInit} from '@angular/core';
import {ActivatedRoute, Router} from '@angular/router';
import {BerechnungService} from '../../berechnung.service';
import {Subscription} from 'rxjs';

interface HeatingData {
  type: string;
  length: number;
  height: number;
  count: number;
}

@Component({
  selector: 'app-raum-detail-heizflaechen',
  standalone: false,
  templateUrl: './raum-detail-heizflaechen.component.html',
  styleUrl: './raum-detail-heizflaechen.component.scss'
})
export class RaumDetailHeizflaechenComponent implements OnInit, OnDestroy {
  roomId: string = '';
  roomData: any = {};
  heatingData: HeatingData = {
    type: 'radiator',
    length: 100,
    height: 60,
    count: 1
  };
  additionalHeaters: HeatingData[] = [];

  private subscriptions: Subscription[] = [];

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private berechnungService: BerechnungService
  ) { }

  ngOnInit(): void {
    // Subscribe to query params to get room ID
    this.subscriptions.push(
      this.route.queryParams.subscribe(params => {
        if (params['room']) {
          this.roomId = params['room'];
          this.berechnungService.setSelectedRoom(this.roomId);
          this.loadRoomData();
        } else {
          // No room ID provided, redirect to room list
          this.router.navigate(['/raeume/intro']);
        }
      })
    );
  }

  loadRoomData(): void {
    const rooms = this.berechnungService.rooms$.getValue();
    const room = rooms.find(r => r.id === this.roomId);

    if (room) {
      this.roomData = room;
      // Detailed implementation will be added in a later phase
    }
  }

  onNext(): void {
    // Basic navigation functionality without the detailed implementation
    // Detailed data saving will be implemented in a later phase
    
    // Navigate to the next tab (Ergebnis)
    this.router.navigate(['/raeume/detail-ergebnis'], { queryParams: { room: this.roomId } });
  }

  ngOnDestroy(): void {
    // Clean up subscriptions
    this.subscriptions.forEach(sub => sub.unsubscribe());
  }
}
