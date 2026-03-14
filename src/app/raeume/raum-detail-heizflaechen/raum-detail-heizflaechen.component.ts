import {Component, OnDestroy, OnInit} from '@angular/core';
import {ActivatedRoute, Router} from '@angular/router';
import {BerechnungService} from '../../berechnung.service';
import {Subscription} from 'rxjs';
import {DataGrid} from '../../data-grid';

@Component({
  selector: 'app-raum-detail-heizflaechen',
  standalone: false,
  templateUrl: './raum-detail-heizflaechen.component.html',
  styleUrl: './raum-detail-heizflaechen.component.scss'
})
export class RaumDetailHeizflaechenComponent implements OnInit, OnDestroy {
  roomId: number = 1;
  public grid: DataGrid;

  // Track visible heater types
  heater1Visible: boolean = false;
  heater2Visible: boolean = false;

  // Track third heater visibility
  heater3Visible: boolean = false;

  private subscriptions: Subscription[] = [];

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    public berechnungService: BerechnungService
  ) {
    this.grid = berechnungService.grid;
  }

  ngOnInit(): void {
    // Subscribe to query params to get room ID
    this.subscriptions.push(
      this.route.queryParams.subscribe(params => {
        if (params['room']) {
          this.roomId = parseInt(params['room']) ?? 1;
          this.berechnungService.setSelectedRoom(this.roomId);
          this.loadRoomData();
        } else {
          // No room ID provided, redirect to room list
          this.router.navigate(['/gebaeude/raeume/liste']);
        }
      })
    );
  }

  loadRoomData(): void {
    // Check if heating types have any data and should be shown
    this.heater1Visible = this.berechnungService.getHeatingWidth(this.roomId, 1) > 0;
    this.heater2Visible = this.berechnungService.getHeatingWidth(this.roomId, 2) > 0;
    this.heater3Visible = this.berechnungService.getHeatingWidth(this.roomId, 3) > 0;

    // Set default values if no data exists
    if (!this.heater1Visible) {
      const defaultType = this.berechnungService.getDefaultHeaterType();

      // Set main type
      this.berechnungService.setHeatingMainType(this.roomId, defaultType.mainType, 1);

      // Set subtype if available
      if (defaultType.subType) {
        this.berechnungService.setHeatingSubType(this.roomId, defaultType.subType, 1);
      }
    }
  }

  // Helper methods for managing heaters
  addHeaterType(): void {
    if (!this.heater1Visible) {
      // Initialize first heater with default values
      this.heater1Visible = true;
      const defaultType = this.berechnungService.getDefaultHeaterType();

      // Set main type
      this.berechnungService.setHeatingMainType(this.roomId, defaultType.mainType, 1);

      // Set subtype if available
      if (defaultType.subType) {
        this.berechnungService.setHeatingSubType(this.roomId, defaultType.subType, 1);
      }

      this.berechnungService.setHeatingWidth(this.roomId, 1000, 1);
      this.berechnungService.setHeatingHeight(this.roomId, 600, 1);
      this.berechnungService.setHeatingDepth(this.roomId, 100, 1); // Default depth 100mm
      this.berechnungService.setHeatingCount(this.roomId, 1, 1);
      // Initialize n_rad_col for Gliederheizkörper if needed
      if (this.berechnungService.getHeatingMainType(this.roomId, 1) === 'Gliederheizkörper') {
        this.berechnungService.setn_rad_col(this.roomId, 10, 1); // Default to 10 elements
      }
    } else if (!this.heater2Visible) {
      // Get values from heater 1 to initialize heater 2
      const sourceMainType = this.berechnungService.getHeatingMainType(this.roomId, 1) || this.berechnungService.getDefaultHeaterType().mainType;
      const sourceSubType = this.berechnungService.getHeatingSubType(this.roomId, 1);
      const sourceLength = this.berechnungService.getHeatingWidth(this.roomId, 1) || 1000;
      const sourceHeight = this.berechnungService.getHeatingHeight(this.roomId, 1) || 600;
      const sourceDepth = this.berechnungService.getHeatingDepth(this.roomId, 1) || 100;
      const sourceCount = this.berechnungService.getHeatingCount(this.roomId, 1) || 1;

      // Initialize heater 2 with values from heater 1
      this.heater2Visible = true;
      this.berechnungService.setHeatingMainType(this.roomId, sourceMainType, 2);
      this.berechnungService.setHeatingSubType(this.roomId, sourceSubType, 2);
      this.berechnungService.setHeatingWidth(this.roomId, sourceLength, 2);
      this.berechnungService.setHeatingHeight(this.roomId, sourceHeight, 2);
      this.berechnungService.setHeatingDepth(this.roomId, sourceDepth, 2);
      this.berechnungService.setHeatingCount(this.roomId, sourceCount, 2);
      // If it's a Gliederheizkörper, also copy the elements count
      if (sourceMainType === 'Gliederheizkörper') {
        const sourceElements = this.berechnungService.getn_rad_col(this.roomId, 1) || 10;
        this.berechnungService.setn_rad_col(this.roomId, sourceElements, 2);
      }
    } else if (!this.heater3Visible) {
      // Get values from heater 2 to initialize heater 3
      const sourceMainType = this.berechnungService.getHeatingMainType(this.roomId, 2) || this.berechnungService.getDefaultHeaterType().mainType;
      const sourceSubType = this.berechnungService.getHeatingSubType(this.roomId, 2);
      const sourceLength = this.berechnungService.getHeatingWidth(this.roomId, 2) || 1000;
      const sourceHeight = this.berechnungService.getHeatingHeight(this.roomId, 2) || 600;
      const sourceDepth = this.berechnungService.getHeatingDepth(this.roomId, 2) || 100;
      const sourceCount = this.berechnungService.getHeatingCount(this.roomId, 2) || 1;

      // Initialize heater 3 with values from heater 2
      this.heater3Visible = true;
      this.berechnungService.setHeatingMainType(this.roomId, sourceMainType, 3);
      this.berechnungService.setHeatingSubType(this.roomId, sourceSubType, 3);
      this.berechnungService.setHeatingWidth(this.roomId, sourceLength, 3);
      this.berechnungService.setHeatingHeight(this.roomId, sourceHeight, 3);
      this.berechnungService.setHeatingDepth(this.roomId, sourceDepth, 3);
      this.berechnungService.setHeatingCount(this.roomId, sourceCount, 3);
      // If it's a Gliederheizkörper, also copy the elements count
      if (sourceMainType === 'Gliederheizkörper') {
        const sourceElements = this.berechnungService.getn_rad_col(this.roomId, 2) || 10;
        this.berechnungService.setn_rad_col(this.roomId, sourceElements, 3);
      }
    }
  }

  removeHeaterType(heaterType: number): void {
    // Hide the heater type and clear its data
    if (heaterType === 1) {
      // If we have a heater 2, move it to position 1
      if (this.heater2Visible) {
        // Copy heater 2 data to heater 1
        const mainType2 = this.berechnungService.getHeatingMainType(this.roomId, 2);
        const subType2 = this.berechnungService.getHeatingSubType(this.roomId, 2);
        const length2 = this.berechnungService.getHeatingWidth(this.roomId, 2);
        const height2 = this.berechnungService.getHeatingHeight(this.roomId, 2);
        const depth2 = this.berechnungService.getHeatingDepth(this.roomId, 2);
        const count2 = this.berechnungService.getHeatingCount(this.roomId, 2);

        this.berechnungService.setHeatingMainType(this.roomId, mainType2, 1);
        this.berechnungService.setHeatingSubType(this.roomId, subType2, 1);
        this.berechnungService.setHeatingWidth(this.roomId, length2, 1);
        this.berechnungService.setHeatingHeight(this.roomId, height2, 1);
        this.berechnungService.setHeatingDepth(this.roomId, depth2, 1);
        this.berechnungService.setHeatingCount(this.roomId, count2, 1);
        // Also move n_rad_col if it's a Gliederheizkörper
        if (mainType2 === 'Gliederheizkörper') {
          const elementsCount = this.berechnungService.getn_rad_col(this.roomId, 2) || 10;
          this.berechnungService.setn_rad_col(this.roomId, elementsCount, 1);
        }

        // If we have a heater 3, move it to position 2
        if (this.heater3Visible) {
          const mainType3 = this.berechnungService.getHeatingMainType(this.roomId, 3);
          const subType3 = this.berechnungService.getHeatingSubType(this.roomId, 3);
          const length3 = this.berechnungService.getHeatingWidth(this.roomId, 3);
          const height3 = this.berechnungService.getHeatingHeight(this.roomId, 3);
          const depth3 = this.berechnungService.getHeatingDepth(this.roomId, 3);
          const count3 = this.berechnungService.getHeatingCount(this.roomId, 3);

          this.berechnungService.setHeatingMainType(this.roomId, mainType3, 2);
          this.berechnungService.setHeatingSubType(this.roomId, subType3, 2);
          this.berechnungService.setHeatingWidth(this.roomId, length3, 2);
          this.berechnungService.setHeatingHeight(this.roomId, height3, 2);
          this.berechnungService.setHeatingDepth(this.roomId, depth3, 2);
          this.berechnungService.setHeatingCount(this.roomId, count3, 2);
          // Also move n_rad_col if it's a Gliederheizkörper
          if (mainType3 === 'Gliederheizkörper') {
            const elementsCount = this.berechnungService.getn_rad_col(this.roomId, 3) || 10;
            this.berechnungService.setn_rad_col(this.roomId, elementsCount, 2);
          }

          // Clear heater 3
          this.heater3Visible = false;
          this.berechnungService.setHeatingWidth(this.roomId, 0, 3);
          this.berechnungService.setHeatingHeight(this.roomId, 0, 3);
          this.berechnungService.setHeatingDepth(this.roomId, 0, 3);
          this.berechnungService.setHeatingCount(this.roomId, 0, 3);
        } else {
          // Clear heater 2
          this.heater2Visible = false;
          this.berechnungService.setHeatingWidth(this.roomId, 0, 2);
          this.berechnungService.setHeatingHeight(this.roomId, 0, 2);
          this.berechnungService.setHeatingDepth(this.roomId, 0, 2);
          this.berechnungService.setHeatingCount(this.roomId, 0, 2);
        }
      } else {
        // Just clear heater 1
        this.heater1Visible = false;
        this.berechnungService.setHeatingWidth(this.roomId, 0, 1);
        this.berechnungService.setHeatingHeight(this.roomId, 0, 1);
        this.berechnungService.setHeatingDepth(this.roomId, 0, 1);
        this.berechnungService.setHeatingCount(this.roomId, 0, 1);
      }
    } else if (heaterType === 2) {
      // If we have a heater 3, move it to position 2
      if (this.heater3Visible) {
        const mainType3 = this.berechnungService.getHeatingMainType(this.roomId, 3);
        const subType3 = this.berechnungService.getHeatingSubType(this.roomId, 3);
        const length3 = this.berechnungService.getHeatingWidth(this.roomId, 3);
        const height3 = this.berechnungService.getHeatingHeight(this.roomId, 3);
        const depth3 = this.berechnungService.getHeatingDepth(this.roomId, 3);
        const count3 = this.berechnungService.getHeatingCount(this.roomId, 3);

        this.berechnungService.setHeatingMainType(this.roomId, mainType3, 2);
        this.berechnungService.setHeatingSubType(this.roomId, subType3, 2);
        this.berechnungService.setHeatingWidth(this.roomId, length3, 2);
        this.berechnungService.setHeatingHeight(this.roomId, height3, 2);
        this.berechnungService.setHeatingDepth(this.roomId, depth3, 2);
        this.berechnungService.setHeatingCount(this.roomId, count3, 2);

        // Clear heater 3
        this.heater3Visible = false;
        this.berechnungService.setHeatingWidth(this.roomId, 0, 3);
        this.berechnungService.setHeatingHeight(this.roomId, 0, 3);
        this.berechnungService.setHeatingDepth(this.roomId, 0, 3);
        this.berechnungService.setHeatingCount(this.roomId, 0, 3);
      } else {
        // Just clear heater 2
        this.heater2Visible = false;
        this.berechnungService.setHeatingWidth(this.roomId, 0, 2);
        this.berechnungService.setHeatingHeight(this.roomId, 0, 2);
        this.berechnungService.setHeatingDepth(this.roomId, 0, 2);
        this.berechnungService.setHeatingCount(this.roomId, 0, 2);
      }
    } else if (heaterType === 3) {
      // Clear heater 3
      this.heater3Visible = false;
      this.berechnungService.setHeatingWidth(this.roomId, 0, 3);
      this.berechnungService.setHeatingHeight(this.roomId, 0, 3);
      this.berechnungService.setHeatingDepth(this.roomId, 0, 3);
      this.berechnungService.setHeatingCount(this.roomId, 0, 3);
    }
  }

  onNext(): void {
    // Navigate to the next tab (Ergebnis)
    this.router.navigate(['/gebaeude/raeume/detail-ergebnis'], { queryParams: { room: this.roomId } });
  }

  ngOnDestroy(): void {
    // Clean up subscriptions
    this.subscriptions.forEach(sub => sub.unsubscribe());
  }
}
