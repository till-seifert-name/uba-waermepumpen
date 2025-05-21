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

  // Getter für Decken-Grenzen aus dem Daten-Sheet (E106-E108)
  get deckenGrenzen(): string[] {
    try {
      // Werte aus dem Daten-Sheet abrufen (ohne Erdreich)
      return this.berechnungService.grid.getCells('Daten', 'E106', 'E108')
        .map(row => row[0].toString());
    } catch (error) {
      console.error('Fehler beim Laden der Decken-Grenzen:', error);
      return [];
    }
  }

  // Getter für Boden-Grenzen aus dem Daten-Sheet (E106-E109)
  get bodenGrenzen(): string[] {
    try {
      // Werte aus dem Daten-Sheet abrufen (mit Erdreich)
      return this.berechnungService.grid.getCells('Daten', 'E106', 'E109')
        .map(row => row[0].toString());
    } catch (error) {
      console.error('Fehler beim Laden der Boden-Grenzen:', error);
      return [];
    }
  }

  // Getter for Modernisierungsjahr from the Daten sheet (B19-B25)
  get modernisierungsjahr(): string[] {
    try {
      // Get the values from the Daten sheet
      return this.berechnungService.grid.getCells('Daten', 'B19', 'B25').map(row => row[0].toString());
    } catch (error) {
      console.error('Error loading Modernisierungsjahr:', error);
      return [];
    }
  }

  // Method to get user-friendly display labels for modernisierungsjahr values
  getModernisierungsjahrLabel(value: string): string {
    if (value === '') {
      return 'unbekannt';
    }
    return value;
  }

  // Getter and Setter for Room Modernisierungsjahr (IN_rooms row 10)
  get roomModernisierungsjahr(): string | number {
    return this.berechnungService.grid.getCell('IN_rooms', this.roomId + '10') || '';
  }

  set roomModernisierungsjahr(value: string | number) {
    this.berechnungService.grid.setCell('IN_rooms', this.roomId + '10', value);
  }

  // Methode zum Abbilden von internen Werten auf Anzeigelabels für die Benutzeroberfläche
  getBauteilGrenzeLabel(value: string): string {
    // Mapping von internen Werten zu Benutzeroberflächen-Labels
    if (value === 'beheizt ') return 'beheizter Raum';
    if (value === 'unbeheizt') return 'unbeheizter Raum';
    if (value === 'Außenluft') return 'Außenluft';
    if (value === 'Erdreich') return 'Erdreich';
    return value;
  }

  // Navigate to the next component (wall details)
  onNext(): void {
    this.router.navigate(['/raeume/detail-wand'], {
      queryParams: { room: this.roomId }
    });
  }


}
