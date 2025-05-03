import {Component, OnDestroy, OnInit} from '@angular/core';
import {ActivatedRoute, Router} from '@angular/router';
import {BerechnungService} from '../../berechnung.service';
import {Subscription} from 'rxjs';

@Component({
  selector: 'app-raum-detail-ergebnis',
  standalone: false,
  templateUrl: './raum-detail-ergebnis.component.html',
  styleUrl: './raum-detail-ergebnis.component.scss'
})
export class RaumDetailErgebnisComponent implements OnInit, OnDestroy {
  roomId: string = '';
  roomData: any = {};

  // Room assessment data (placeholder for calculations)
  assessment = {
    heatLoss: 0,      // W - total heat loss
    heatDensity: 0,   // W/m² - heat loss per square meter
    heatingPower: 0,  // W - total heating power available
    suitable: true,   // Whether room is suitable for heat pump
    recommendations: [] as string[] // Recommendations for improvement
  };

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
      // Set a placeholder recommendation - detailed implementation will come later
      this.assessment.recommendations = ['Raum grundsätzlich geeignet für Wärmepumpenbetrieb'];
    }
  }

  hasNextRoom(): boolean {
    const rooms = this.berechnungService.rooms$.getValue();
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
      this.router.navigate(['/raeume/detail-basis'], { queryParams: { room: nextRoom.id } });
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
