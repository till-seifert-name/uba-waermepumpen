import {Component, OnInit} from '@angular/core';
import {BerechnungService, Room} from '../../berechnung.service';
import {Router} from '@angular/router';

interface AssessmentResult {
  suitability: 'high' | 'medium' | 'low';
  suitabilityText: string;
  summary: string;
}

interface RoomAssessment {
  id: string;
  name: string;
  type: string;

  // Heat density metrics
  heizlast_w: number;
  heizlast_w_m2: number;
  heatDensityStatus: 'success' | 'warning' | 'danger';
  worstEnvelopeComponent: string;  // e.g., 'Außenwände', 'Fenster', etc.

  // Radiator metrics
  aktuellHK: {
    watt: number;
    deckungProzent: number;
  };
  besserHK: {
    watt: number;
    deckungProzent: number;
  };
  radiatorStatus: 'success' | 'warning' | 'danger';
  radiatorAction: 'vergrößern' | 'verbessern' | 'okay';
}

@Component({
  selector: 'app-ergebnis-assessment',
  standalone: false,
  templateUrl: './ergebnis-assessment.component.html',
  styleUrl: './ergebnis-assessment.component.scss'
})
export class ErgebnisAssessmentComponent implements OnInit {
  // Overall building assessment
  assessmentResult: AssessmentResult = {
    suitability: 'medium',
    suitabilityText: 'Bedingt geeignet',
    summary: 'Ihr Gebäude kann mit einer Wärmepumpe beheizt werden, benötigt jedoch einige Anpassungen für optimalen Betrieb. Für einzelne Räume sind Maßnahmen zur Verbesserung der Energieeffizienz empfehlenswert.',
  };

  // Detailed room-by-room assessments
  roomAssessments: RoomAssessment[] = [];


  // NT-Readiness gauge configuration
  ntReadinessZones = [
    { value: 0, label: '' },
    { value: 33, label: 'Noch nicht gut geeignet' },
    { value: 66, label: 'Eingeschränkt geeignet' },
    { value: 100, label: 'NT-ready' }
  ];

  constructor(
    private berechnungService: BerechnungService,
    private router: Router
  ) {}

  ngOnInit(): void {
    // Load room data and calculate assessments
    this.loadRoomData();

    // In a real implementation, we would calculate the assessment from the grid data
    // this.calculateOverallAssessment();
  }

  /**
   * Load room data from the BerechnungService and generate assessments
   */
  private loadRoomData(): void {
    const rooms = this.berechnungService.rooms$.getValue();

    this.roomAssessments = rooms.map(room => this.calculateRoomAssessment(room));

    // After calculating individual room assessments, determine overall suitability
    this.calculateOverallSuitability();
  }

  /**
   * Calculate assessment for a single room based on its data
   */
  private calculateRoomAssessment(room: Room): RoomAssessment {
    // Get stored room data or generate reasonable defaults
    const roomData:any =  {};     // TODO: get from daat grid

    // Heat density metrics with defaults
    const heizlast_w = roomData.heizlast_w || this.generateRandomHeatLoad(room.type);
    const heizlast_w_m2 = roomData.heizlast_w_m2 || this.generateRandomHeatDensity(room.type);

    // Determine heat density status based on W/m²
    const heatDensityStatus = this.getHeatDensityStatus(heizlast_w_m2);

    // Radiator metrics with defaults
    const deckungProzent = roomData.aktuellHK?.deckungProzent ||
                          this.generateRandomCoverage(room.type);

    // Calculate better radiator with ~20-30% improvement
    const besserDeckungProzent = Math.min(100, Math.round(deckungProzent * 1.25));

    // Determine radiator status and required action
    const radiatorStatus = this.getRadiatorStatus(deckungProzent);
    const radiatorAction = this.getRadiatorAction(deckungProzent, besserDeckungProzent);

    // Determine worst envelope component based on room type
    const worstEnvelopeComponent = this.getWorstEnvelopeComponent(room.type);

    return {
      id: room.id,
      name: room.name,
      type: room.type,
      heizlast_w: heizlast_w,
      heizlast_w_m2: heizlast_w_m2,
      heatDensityStatus: heatDensityStatus,
      worstEnvelopeComponent: worstEnvelopeComponent,
      aktuellHK: {
        watt: roomData.aktuellHK?.watt || Math.round(heizlast_w * deckungProzent / 100),
        deckungProzent: deckungProzent
      },
      besserHK: {
        watt: roomData.besserHK?.watt || Math.round(heizlast_w * besserDeckungProzent / 100),
        deckungProzent: besserDeckungProzent
      },
      radiatorStatus: radiatorStatus,
      radiatorAction: radiatorAction
    };
  }

  /**
   * Calculate overall building suitability based on individual room assessments
   */
  private calculateOverallSuitability(): void {
    if (this.roomAssessments.length === 0) {
      this.assessmentResult = {
        suitability: 'low',
        suitabilityText: 'Keine Bewertung möglich',
        summary: 'Es wurden keine Räume erfasst. Bitte fügen Sie Räume hinzu, um eine Bewertung zu erhalten.'
      };
      return;
    }

    // Count rooms by status
    const dangerCount = this.roomAssessments.filter(r =>
      r.radiatorStatus === 'danger' || r.heatDensityStatus === 'danger').length;

    const warningCount = this.roomAssessments.filter(r =>
      (r.radiatorStatus === 'warning' || r.heatDensityStatus === 'warning') &&
      !(r.radiatorStatus === 'danger' || r.heatDensityStatus === 'danger')).length;

    const totalRooms = this.roomAssessments.length;

    // Determine overall suitability based on percentages
    if (dangerCount > totalRooms * 0.3) {
      this.assessmentResult = {
        suitability: 'low',
        suitabilityText: 'Eingeschränkt geeignet',
        summary: 'Ihr Gebäude benötigt deutliche Verbesserungen für den Einsatz einer Wärmepumpe. Die erforderlichen Vorlauftemperaturen sind aktuell zu hoch für einen effizienten Betrieb. Empfohlen wird eine Kombination aus energetischen Maßnahmen und verbesserten Heizkörpern.'
      };
    } else if (warningCount > totalRooms * 0.5) {
      this.assessmentResult = {
        suitability: 'medium',
        suitabilityText: 'Bedingt geeignet',
        summary: 'Ihr Gebäude kann mit einer Wärmepumpe beheizt werden, benötigt jedoch einige Anpassungen für optimalen Betrieb. Für einzelne Räume sind Maßnahmen zur Verbesserung der Energieeffizienz empfehlenswert.'
      };
    } else {
      this.assessmentResult = {
        suitability: 'high',
        suitabilityText: 'Gut geeignet',
        summary: 'Ihr Gebäude ist grundsätzlich für den Einsatz einer Wärmepumpe geeignet. Die meisten Räume können mit niedrigen Vorlauftemperaturen beheizt werden, was einen effizienten Betrieb ermöglicht.'
      };
    }
  }

  /**
   * Helper for generating random but plausible heat load in Watts
   * based on room type (for demonstration data)
   */
  private generateRandomHeatLoad(roomType: string): number {
    // Base heat load between 1000 and 3000 watts
    let base = 1000 + Math.round(Math.random() * 2000);

    // Adjust based on room type
    switch (roomType) {
      case 'exterior':
        base *= 1.2; // Exterior rooms have higher heat loss
        break;
      case 'cold':
        base *= 1.3; // Cold rooms have even higher heat loss
        break;
    }

    return Math.round(base);
  }

  /**
   * Helper for generating random but plausible heat density in W/m²
   * based on room type (for demonstration data)
   */
  private generateRandomHeatDensity(roomType: string): number {
    let base: number;

    // Generate values that fall into different assessment categories
    // for demonstration purposes
    switch (roomType) {
      case 'exterior':
        base = 70 + Math.round(Math.random() * 30); // 70-100 W/m²
        break;
      case 'cold':
        base = 80 + Math.round(Math.random() * 40); // 80-120 W/m²
        break;
      default:
        base = 40 + Math.round(Math.random() * 40); // 40-80 W/m²
    }

    return base;
  }

  /**
   * Helper for generating random but plausible coverage percentage
   * based on room type (for demonstration data)
   */
  private generateRandomCoverage(roomType: string): number {
    let base: number;

    // Generate values that fall into different assessment categories
    // for demonstration purposes
    switch (roomType) {
      case 'exterior':
        base = 40 + Math.round(Math.random() * 30); // 40-70%
        break;
      case 'cold':
        base = 30 + Math.round(Math.random() * 30); // 30-60%
        break;
      default:
        base = 60 + Math.round(Math.random() * 30); // 60-90%
    }

    return base;
  }

  /**
   * Determine heat density status based on W/m²
   */
  private getHeatDensityStatus(w_m2: number): 'success' | 'warning' | 'danger' {
    if (w_m2 <= 50) return 'success';
    if (w_m2 <= 70) return 'warning';
    return 'danger';
  }

  /**
   * Determine radiator status based on coverage percentage
   */
  private getRadiatorStatus(coverage: number): 'success' | 'warning' | 'danger' {
    if (coverage >= 80) return 'success';
    if (coverage >= 50) return 'warning';
    return 'danger';
  }

  /**
   * Determine required radiator action based on coverage percentages
   */
  private getRadiatorAction(currentCoverage: number, betterCoverage: number): 'vergrößern' | 'verbessern' | 'okay' {
    if (currentCoverage < 50 && betterCoverage < 70) {
      return 'vergrößern'; // Need significantly larger radiator
    } else if (currentCoverage < 70) {
      return 'verbessern'; // Better type might be sufficient
    }
    return 'okay'; // Current radiator is acceptable
  }

  /**
   * Determine the worst envelope component based on room type
   */
  private getWorstEnvelopeComponent(roomType: string): string {
    switch (roomType) {
      case 'exterior':
        return 'Außenwände';
      case 'cold':
        return 'Fenster';
      case 'ceiling':
        return 'Decke';
      case 'windows':
        return 'Fenster';
      default:
        return 'Wärmebrücken';
    }
  }


  /**
   * Navigate to room detail page
   */
  navigateToRoom(roomId: string): void {
    this.router.navigate(['/raeume/detail-ergebnis'], { queryParams: { room: roomId } });
  }

  /**
   * Calculate overall NT-Readiness score (0-100)
   */
  getOverallNTReadiness(): number {
    if (this.roomAssessments.length === 0) return 0;

    // Calculate based on both radiator coverage and heat density
    let radiatorScore = 0;
    let envelopeScore = 0;

    // Add up radiator scores (0-100)
    this.roomAssessments.forEach(room => {
      radiatorScore += room.aktuellHK.deckungProzent;

      // Convert heat density to a 0-100 score (inverted, lower is better)
      // 50 W/m² or less is perfect (100), 120 W/m² or more is bad (0)
      const heatDensity = room.heizlast_w_m2;
      const densityScore = Math.max(0, Math.min(100, (120 - heatDensity) * (100 / 70)));
      envelopeScore += densityScore;
    });

    // Average scores (50% weight for radiators, 50% for envelope)
    const avgRadiatorScore = radiatorScore / this.roomAssessments.length;
    const avgEnvelopeScore = envelopeScore / this.roomAssessments.length;

    return Math.round((avgRadiatorScore + avgEnvelopeScore) / 2);
  }

  /**
   * Get appropriate title for NT-Readiness section
   */
  getNTReadinessTitle(): string {
    const score = this.getOverallNTReadiness();

    if (score >= 80) {
      return 'Größtenteils niedertemperaturfähig – Wenige Maßnahmen erforderlich';
    } else if (score >= 50) {
      return 'Teilweise niedertemperaturfähig – Maßnahmen erforderlich';
    } else {
      return 'Aktuell nicht niedertemperaturfähig – Umfangreiche Maßnahmen erforderlich';
    }
  }

  /**
   * Get description of NT-Readiness
   */
  getNTReadinessDescription(): string {
    const score = this.getOverallNTReadiness();

    if (score >= 80) {
      return 'größtenteils gut';
    } else if (score >= 50) {
      return 'teilweise';
    } else {
      return 'noch nicht ausreichend';
    }
  }

  /**
   * Get count of NT-ready rooms as text
   */
  getNTReadinessRoomCount(): string {
    if (this.roomAssessments.length === 0) {
      return 'Keine Räume';
    }

    const goodRooms = this.roomAssessments.filter(r =>
      r.radiatorStatus === 'success' && r.heatDensityStatus !== 'danger').length;

    if (goodRooms === 0) {
      return 'Aktuell keine Räume';
    } else if (goodRooms === 1) {
      return '1 Raum';
    } else if (goodRooms === this.roomAssessments.length) {
      return 'Alle Räume';
    } else {
      return `${goodRooms} von ${this.roomAssessments.length} Räumen`;
    }
  }

  /**
   * Get count of bad rooms as text
   */
  getBadRoomCount(): string {
    if (this.roomAssessments.length === 0) {
      return 'keine Räume';
    }

    const badRooms = this.roomAssessments.filter(r =>
      r.radiatorStatus !== 'success' || r.heatDensityStatus === 'danger').length;

    if (badRooms === 0) {
      return 'keine weiteren Räume';
    } else if (badRooms === 1) {
      return '1 Raum';
    } else if (badRooms === this.roomAssessments.length) {
      return 'alle Räume';
    } else {
      return `${badRooms} Räume`;
    }
  }

  /**
   * Get radiator summary title based on assessment
   */
  getRadiatorSummaryTitle(): string {
    if (this.roomAssessments.length === 0) {
      return 'Keine Bewertung möglich – Bitte erfassen Sie Räume';
    }

    const badRadiators = this.roomAssessments.filter(r => r.radiatorStatus !== 'success').length;
    const totalRooms = this.roomAssessments.length;

    if (badRadiators === 0) {
      return 'Alle Heizkörper sind geeignet – Keine Maßnahmen erforderlich';
    } else if (badRadiators <= totalRooms * 0.25) {
      return 'Einige Heizkörper sind nicht optimal – Punktuelle Maßnahmen empfohlen';
    } else if (badRadiators <= totalRooms * 0.75) {
      return 'Mehrere Heizkörper sind nicht geeignet – Maßnahmen erforderlich';
    } else {
      return 'Viele Heizkörper sind nicht geeignet – Umfassende Maßnahmen erforderlich';
    }
  }

  /**
   * Get radiator replacement summary
   */
  getRadiatorReplacementSummary(): string {
    if (this.roomAssessments.length === 0) {
      return '';
    }

    const needsReplacement = this.roomAssessments.filter(r => r.radiatorStatus !== 'success').length;
    const totalRooms = this.roomAssessments.length;

    if (needsReplacement === 0) {
      return 'Alle Heizkörper sind ausreichend dimensioniert';
    } else if (needsReplacement === totalRooms) {
      return 'Alle Heizkörper';
    } else {
      return `${needsReplacement} von ${totalRooms} Heizkörpern`;
    }
  }

  /**
   * Get number of rooms affected by a specific envelope component
   */
  getComponentRoomCount(component: string): string {
    const componentRooms = this.roomAssessments.filter(r =>
      r.worstEnvelopeComponent === component && r.heatDensityStatus !== 'success').length;

    // Return appropriate count text
    if (componentRooms === 0) {
      return 'einzelnen Räumen';
    } else if (componentRooms === 1) {
      return '1 Raum';
    } else if (componentRooms === this.roomAssessments.length) {
      return 'allen Räumen';
    } else {
      return `${componentRooms} Räumen`;
    }
  }

  /**
   * Get background color class based on numeric value
   * Later this can be connected to the BerechnungService
   */
  getStatusColor(value: number): string {
    if (value >= 80) return 'bg-success';
    if (value >= 50) return 'bg-warning';
    return 'bg-danger';
  }

  /**
   * Get text color class based on numeric value
   * Later this can be connected to the BerechnungService
   */
  getTextColor(value: number): string {
    if (value >= 80) return 'text-success';
    if (value >= 50) return 'text-warning';
    return 'text-danger';
  }

  /**
   * Get icon color class based on numeric value
   * Later this can be connected to the BerechnungService
   */
  getIconColor(value: number): string {
    if (value >= 80) return 'icon-success';
    if (value >= 50) return 'icon-warning';
    return 'icon-danger';
  }

  protected readonly location = location;
}
