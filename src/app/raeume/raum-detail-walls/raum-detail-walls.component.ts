import {Component, OnDestroy, OnInit} from '@angular/core';
import {ActivatedRoute, Router} from '@angular/router';
import {BerechnungService} from '../../berechnung.service';
import {Subscription} from 'rxjs';
import {DataGrid} from '../../data-grid';

@Component({
  selector: 'app-raum-detail-walls',
  standalone: false,
  templateUrl: './raum-detail-walls.component.html',
  styleUrl: './raum-detail-walls.component.scss'
})
export class RaumDetailWallsComponent implements OnInit, OnDestroy {
  roomId: number = 1;
  public grid: DataGrid;
  private subscriptions: Subscription[] = [];

  // Getter for window year options from Daten sheet (same as building years)
  get windowYearOptions(): string[] {
    // Get the values from the Daten sheet
    const Baujahre = this.grid.getCells('Daten', 'E17', 'E29').map(row => row[0].toString());
    // Add 'wie Gebäude' option at the beginning
    return ['', ...Baujahre];
  }

  // Helper to get display text for building year option
  getWindowYearLabel(year: string): string {
    if (year === '') {
      return `wie Gebäude (${this.grid.getCell('IN_build', 'P5').toString() || 'nicht angegeben'})`;
    }
    return year;
  }

  // Track visible window types
  window2Visible: boolean = false;
  window3Visible: boolean = false;

  // Track visible roof window types
  roofWindow2Visible: boolean = false;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    public berechnungService: BerechnungService
  ) {
    this.grid = berechnungService.grid;
  }

  ngOnInit(): void {

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

  loadRoomData(roomId: number): void {
    // Check if window types 2 and 3 have any data and should be shown
    this.window2Visible = this.berechnungService.getWindowWidth(roomId, 2) > 0;
    this.window3Visible = this.berechnungService.getWindowWidth(roomId, 3) > 0;

    // Check if roof window type 2 has any data and should be shown
    this.roofWindow2Visible = this.berechnungService.getL_roof_win2_wid(roomId) > 0;
  }

  // Get the building insulation thickness from the service
  get buildingInsulationThickness(): number | string {
    // TODO: use cell R74 and so on
    return this.berechnungService.getBuildingWallInsulationThickness() || "";
  }

  addWindowType(): void {
    // Show the next window type and copy values from window type 1
    const sourceWidth = this.berechnungService.getWindowWidth(this.roomId, 1);
    const sourceHeight = this.berechnungService.getWindowHeight(this.roomId, 1);
    const sourceYear = this.berechnungService.getWindowYear(this.roomId, 1);
    const sourceCount = this.berechnungService.getWindowCount(this.roomId, 1) || 1;

    if (!this.window2Visible) {
      // Initialize window type 2 with values from window type 1
      this.window2Visible = true;
      this.berechnungService.setWindowWidth(this.roomId, sourceWidth, 2);
      this.berechnungService.setWindowHeight(this.roomId, sourceHeight, 2);
      this.berechnungService.setWindowYear(this.roomId, sourceYear, 2);
      this.berechnungService.setWindowCount(this.roomId, sourceCount, 2);
    } else if (!this.window3Visible) {
      // Initialize window type 3 with values from window type 1
      this.window3Visible = true;
      this.berechnungService.setWindowWidth(this.roomId, sourceWidth, 3);
      this.berechnungService.setWindowHeight(this.roomId, sourceHeight, 3);
      this.berechnungService.setWindowYear(this.roomId, sourceYear, 3);
      this.berechnungService.setWindowCount(this.roomId, sourceCount, 3);
    }
  }

  removeWindowType(windowType: number): void {
    // Hide the window type and clear its data
    if (windowType === 2) {
      this.window2Visible = false;
      this.berechnungService.setWindowWidth(this.roomId, 0, 2);
      this.berechnungService.setWindowHeight(this.roomId, 0, 2);
      this.berechnungService.setWindowCount(this.roomId, 0, 2);
    } else if (windowType === 3) {
      this.window3Visible = false;
      this.berechnungService.setWindowWidth(this.roomId, 0, 3);
      this.berechnungService.setWindowHeight(this.roomId, 0, 3);
      this.berechnungService.setWindowCount(this.roomId, 0, 3);
    }
  }

  // Method to show the second roof window type
  showRoofWindow2(): void {
    // Show the second roof window type and copy values from the first one
    const sourceWidth = this.berechnungService.getL_roof_win1_wid(this.roomId);
    const sourceHeight = this.berechnungService.getL_roof_win1_hei(this.roomId);
    const sourceYear = this.berechnungService.getYEAR_roof_win1(this.roomId);
    const sourceCount = this.berechnungService.getNO_roof_win1(this.roomId) || 1;

    this.roofWindow2Visible = true;
    this.berechnungService.setL_roof_win2_wid(this.roomId, sourceWidth);
    this.berechnungService.setL_roof_win2_hei(this.roomId, sourceHeight);
    this.berechnungService.setYEAR_roof_win2(this.roomId, sourceYear);
    this.berechnungService.setNO_roof_win2(this.roomId, sourceCount);
  }

  // Method to remove the second roof window type
  removeRoofWindowType(windowType: number): void {
    if (windowType === 2) {
      this.roofWindow2Visible = false;
      this.berechnungService.setL_roof_win2_wid(this.roomId, "");
      this.berechnungService.setL_roof_win2_hei(this.roomId, "");
      this.berechnungService.setYEAR_roof_win2(this.roomId, "");
      this.berechnungService.setNO_roof_win2(this.roomId, "");
    }
  }

  onComplete(): void {
    // Navigate to the Heizkörper info page for this room
    this.router.navigate(['/raeume/detail-heizkoerper-info'], {
      queryParams: {room: this.roomId}
    });
  }
}
