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

  // Room data interface for type safety
  private _currentRoomData: any = {};

  // Getter that combines actual room data with generated dummy values
  get roomData(): {
    id: string;
    name: string;
    heizlast_w: number;
    heizlast_w_m2: number;
    aktuellHK: {
      watt: number;
      deckungProzent: number;
    };
    besserHK: {
      watt: number;
      deckungProzent: number;
    };
  } {
    return {
      ...(this._currentRoomData || {}),
      name: this._currentRoomData?.name || 'Raum 1',
      heizlast_w: this._currentRoomData?.heizlast_w || 2500,
      heizlast_w_m2: this._currentRoomData?.heizlast_w_m2 || 80,
      aktuellHK: {
        ...(this._currentRoomData?.aktuellHK || {}),
        watt: this._currentRoomData?.aktuellHK?.watt || 1800,
        deckungProzent: this._currentRoomData?.aktuellHK?.deckungProzent || 40
      },
      besserHK: {
        ...(this._currentRoomData?.besserHK || {}),
        watt: this._currentRoomData?.besserHK?.watt || 2200,
        deckungProzent: this._currentRoomData?.besserHK?.deckungProzent || 90
      }
    };
  }

  // Room assessment data (placeholder for calculations)
  assessment = {
    heatLoss: 0,      // W - total heat loss
    heatDensity: 0,   // W/m² - heat loss per square meter
    heatingPower: 0,  // W - total heating power available
    suitable: true,   // Whether room is suitable for heat pump
    recommendations: [] as string[] // Recommendations for improvement
  };

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
    private berechnungService: BerechnungService
  ) {
  }

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
    const rooms = this.berechnungService.getAllRooms();
    const room = rooms.find(r => r.id === this.roomId);

    if (room) {
      // Store the actual room data - the getter will handle adding defaults
      this._currentRoomData = room;

      // Set a placeholder recommendation - detailed implementation will come later
      this.assessment.recommendations = ['Raum grundsätzlich geeignet für Wärmepumpenbetrieb'];
    }
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
