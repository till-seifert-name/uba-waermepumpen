import {Component, OnDestroy, OnInit, TrackByFunction} from '@angular/core';
import {ActivatedRoute, Router} from '@angular/router';
import {BerechnungService, RoofSurfaceType} from '../../berechnung.service';
import {Subscription} from 'rxjs';
import {DataGrid} from '../../data-grid';
import {extractPopupText, extractUntertext, extractYear, hasPopupText, hasUntertext} from '../../text-utils';
import {AppComponent} from '../../app.component';

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

  get basePath() {
    return AppComponent.basePath;
  }

  // Roof type options from Daten B29:B33
  get roofTypeOptions(): Array<{value: RoofSurfaceType, icon: string}> {
    return [
      { value: this.grid.g('Daten', 'B29').toString() as RoofSurfaceType, icon: 'AbfrageRadioButton_Dachform_keine.svg' },
      { value: this.grid.g('Daten', 'B30').toString() as RoofSurfaceType, icon: 'AbfrageRadioButton_Dachform_eine.svg' },
      { value: this.grid.g('Daten', 'B31').toString() as RoofSurfaceType, icon: 'AbfrageRadioButton_Dachform_zwei_symmetrisch.svg' },
      { value: this.grid.g('Daten', 'B32').toString() as RoofSurfaceType, icon: 'AbfrageRadioButton_Dachform_komplex.svg' },
      { value: this.grid.g('Daten', 'B33').toString() as RoofSurfaceType, icon: 'AbfrageRadioButton_Dachform_anbau.svg' }
    ];
  }

  // Helper for trackBy
  value: TrackByFunction<typeof this.roofTypeOptions[number]> = (_, v) => v.value;

  // Getter for window year options from Daten sheet (filtered by building year)
  get windowYearOptions(): string[] {
    const allYears = this.grid.getCells('Daten', 'E17', 'E29').map(row => row[0].toString());
    const buildingYear = this.grid.getCell('IN_build', 'P5').toString();
    const buildingYearNum = extractYear(buildingYear);

    return allYears.filter(year => {
      // Always include empty option
      if (year === '') return true;

      // If no building year set, include all
      if (!buildingYearNum) return true;

      // Include years that are same or newer than building year
      const yearNum = extractYear(year);
      if (yearNum && yearNum >= buildingYearNum) return true;

      // Include currently selected values even if they would be filtered out
      // TODO: What happens when a selected option disappears? Keep it visible for UX.
      const currentSelections = [
        this.berechnungService.getWindowYear(this.roomId, 1),
        this.berechnungService.getWindowYear(this.roomId, 2),
        this.berechnungService.getWindowYear(this.roomId, 3),
        this.berechnungService.getYEAR_roof_win1(this.roomId),
        this.berechnungService.getYEAR_roof_win2(this.roomId)
      ];

      return currentSelections.includes(year);
    });
  }

  // Helper to get display text for building year option
  getWindowYearLabel(year: string): string {
    if (year === '') {
      return 'wie Gebäude';
    }
    return year;
  }


  // Getter for Modernisierungsjahr from the Daten sheet (filtered by building year)
  get modernisierungsjahr(): string[] {
    try {
      const allYears = this.grid.getCells('Daten', 'B19', 'B25').map(row => row[0].toString());
      const buildingYear = this.grid.getCell('IN_build', 'P5').toString();
      const buildingYearNum = extractYear(buildingYear);

      return allYears.filter(year => {
        // Always include empty option
        if (year === '') return true;

        // If no building year set, include all
        if (!buildingYearNum) return true;

        // Include years that are same or newer than building year
        const yearNum = extractYear(year);
        if (yearNum && yearNum >= buildingYearNum) return true;

        // Include currently selected value even if filtered out
        // TODO: What happens when a selected option disappears? Keep it visible for UX.
        const currentSelection = this.roomModernisierungsjahr.toString();
        return currentSelection === year;
      });
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
    const column = this.berechnungService.getRoomColumn(this.roomId);
    return this.berechnungService.grid.getCell('IN_rooms', `${column}10`) || '';
  }

  set roomModernisierungsjahr(value: string | number) {
    const column = this.berechnungService.getRoomColumn(this.roomId);
    this.berechnungService.grid.setCell('IN_rooms', `${column}10`, value);
  }

  // Getters for window visibility based on width
  get window1Visible(): boolean {
    return this.berechnungService.getWindowWidth(this.roomId, 1) > 0;
  }

  get window2Visible(): boolean {
    return this.berechnungService.getWindowWidth(this.roomId, 2) > 0;
  }

  get window3Visible(): boolean {
    return this.berechnungService.getWindowWidth(this.roomId, 3) > 0;
  }

  get roofWindow1Visible(): boolean {
    return this.berechnungService.getL_roof_win1_wid(this.roomId) > 0;
  }

  get roofWindow2Visible(): boolean {
    return this.berechnungService.getL_roof_win2_wid(this.roomId) > 0;
  }

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
        } else {
          // No ID provided, redirect to room list
          this.router.navigate(['/gebaeude/raeume/liste']);
        }
      })
    );
  }

  ngOnDestroy(): void {
    this.subscriptions.forEach(sub => sub.unsubscribe());
  }

  // Get the building insulation thickness from the service
  get buildingInsulationThickness(): number | string {
    // TODO: use cell R74 and so on
    return this.berechnungService.getBuildingWallInsulationThickness() || "";
  }

  addWindowType(): void {
    // Find the first available window type to add
    let targetWindowType = 0;
    if (!this.window1Visible) targetWindowType = 1;
    else if (!this.window2Visible) targetWindowType = 2;
    else if (!this.window3Visible) targetWindowType = 3;

    if (targetWindowType === 0) return; // All window types already visible

    // Find the first visible window to copy values from
    let sourceWindowType = 0;
    if (this.window1Visible) sourceWindowType = 1;
    else if (this.window2Visible) sourceWindowType = 2;
    else if (this.window3Visible) sourceWindowType = 3;

    const sourceWidth = sourceWindowType > 0 ? this.berechnungService.getWindowWidth(this.roomId, sourceWindowType) : 1;
    const sourceHeight = sourceWindowType > 0 ? this.berechnungService.getWindowHeight(this.roomId, sourceWindowType) : 1;
    const sourceYear = sourceWindowType > 0 ? this.berechnungService.getWindowYear(this.roomId, sourceWindowType) : '';
    const sourceCount = sourceWindowType > 0 ? (this.berechnungService.getWindowCount(this.roomId, sourceWindowType) || 1) : 1;

    // Initialize values for target window type
    this.berechnungService.setWindowWidth(this.roomId, sourceWidth, targetWindowType);
    this.berechnungService.setWindowHeight(this.roomId, sourceHeight, targetWindowType);
    this.berechnungService.setWindowYear(this.roomId, sourceYear, targetWindowType);
    this.berechnungService.setWindowCount(this.roomId, sourceCount, targetWindowType);
  }

  removeLastWindowType(): void {
    // Find the last visible window type to remove (from top down: 3 -> 2 -> 1)
    let targetWindowType = 0;
    if (this.window3Visible) targetWindowType = 3;
    else if (this.window2Visible) targetWindowType = 2;
    else if (this.window1Visible) targetWindowType = 1;

    if (targetWindowType === 0) return; // No windows visible

    // Clear values for target window type
    this.berechnungService.setWindowWidth(this.roomId, 0, targetWindowType);
    this.berechnungService.setWindowHeight(this.roomId, 0, targetWindowType);
    this.berechnungService.setWindowCount(this.roomId, 0, targetWindowType);
  }

  // Method to add a roof window type
  addRoofWindowType(): void {
    // Find the first available roof window type to add
    let targetWindowType = 0;
    if (!this.roofWindow1Visible) targetWindowType = 1;
    else if (!this.roofWindow2Visible) targetWindowType = 2;

    if (targetWindowType === 0) return; // All roof window types already visible

    // Find the first visible roof window to copy values from
    let sourceWindowType = 0;
    if (this.roofWindow1Visible) sourceWindowType = 1;
    else if (this.roofWindow2Visible) sourceWindowType = 2;

    const sourceWidth = sourceWindowType > 0 ? this.berechnungService.getL_roof_win1_wid(this.roomId) : 1;
    const sourceHeight = sourceWindowType > 0 ? this.berechnungService.getL_roof_win1_hei(this.roomId) : 1;
    const sourceYear = sourceWindowType > 0 ? this.berechnungService.getYEAR_roof_win1(this.roomId) : '';
    const sourceCount = sourceWindowType > 0 ? (this.berechnungService.getNO_roof_win1(this.roomId) || 1) : 1;

    // Initialize values for target window type
    if (targetWindowType === 1) {
      this.berechnungService.setL_roof_win1_wid(this.roomId, sourceWidth);
      this.berechnungService.setL_roof_win1_hei(this.roomId, sourceHeight);
      this.berechnungService.setYEAR_roof_win1(this.roomId, sourceYear);
      this.berechnungService.setNO_roof_win1(this.roomId, sourceCount);
    } else if (targetWindowType === 2) {
      this.berechnungService.setL_roof_win2_wid(this.roomId, sourceWidth);
      this.berechnungService.setL_roof_win2_hei(this.roomId, sourceHeight);
      this.berechnungService.setYEAR_roof_win2(this.roomId, sourceYear);
      this.berechnungService.setNO_roof_win2(this.roomId, sourceCount);
    }
  }

  // Method to remove the last visible roof window type
  removeLastRoofWindowType(): void {
    // Find the last visible roof window type to remove (from top down: 2 -> 1)
    let targetWindowType = 0;
    if (this.roofWindow2Visible) targetWindowType = 2;
    else if (this.roofWindow1Visible) targetWindowType = 1;

    if (targetWindowType === 0) return; // No roof windows visible

    // Clear values for target window type
    if (targetWindowType === 1) {
      this.berechnungService.setL_roof_win1_wid(this.roomId, 0);
      this.berechnungService.setL_roof_win1_hei(this.roomId, 0);
      this.berechnungService.setYEAR_roof_win1(this.roomId, "");
      this.berechnungService.setNO_roof_win1(this.roomId, 0);
    } else if (targetWindowType === 2) {
      this.berechnungService.setL_roof_win2_wid(this.roomId, 0);
      this.berechnungService.setL_roof_win2_hei(this.roomId, 0);
      this.berechnungService.setYEAR_roof_win2(this.roomId, "");
      this.berechnungService.setNO_roof_win2(this.roomId, 0);
    }
  }

  // Mapper for internal Excel values to user-friendly UI strings
  mapRoofTypeToUIString(roofType: RoofSurfaceType): string {
    const mapping: Record<RoofSurfaceType, string> = {
      'Keine': 'Keine',
      'Eine': 'Eine Dachfläche',
      'Zwei (symmetrisch)': 'Zwei Dachflächen (symmetrisch)',
      'Komplex': 'Komplexe Dachfläche',
      'Flachdach': 'Flachdach (bei Anbau)'
    };
    return mapping[roofType] ?? roofType;
  }

  // Expose utility functions for template
  extractPopupText = extractPopupText;
  extractUntertext = extractUntertext;
  hasPopupText = hasPopupText;
  hasUntertext = hasUntertext;

  onComplete(): void {
    // For first room, show info page. For subsequent rooms, skip directly to heizflaechen
    const targetRoute = this.roomId == 1 ? '/gebaeude/raeume/detail-heizkoerper-info' : '/gebaeude/raeume/detail-heizflaechen';
    this.router.navigate([targetRoute], {
      queryParams: {room: this.roomId}
    });
  }
}
