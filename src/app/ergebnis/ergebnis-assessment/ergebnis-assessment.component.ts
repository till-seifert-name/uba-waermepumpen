import { Component, OnInit } from '@angular/core';
import { BerechnungService } from '../../berechnung.service';

// Interfaces for assessment results
interface RoomRecommendation {
  name: string;
  status: 'good' | 'medium' | 'problematic';
  statusText: string;
  recommendations: string[];
}

interface GeneralRecommendation {
  title: string;
  description: string;
}

interface AssessmentResult {
  suitability: 'high' | 'medium' | 'low';
  suitabilityText: string;
  summary: string;
  recommendedType: string;
  efficiency: string;
  flowTemperature: number;
  roomRecommendations: RoomRecommendation[];
  generalRecommendations: GeneralRecommendation[];
}

@Component({
  selector: 'app-ergebnis-assessment',
  standalone: false,
  templateUrl: './ergebnis-assessment.component.html',
  styleUrl: './ergebnis-assessment.component.scss'
})
export class ErgebnisAssessmentComponent implements OnInit {
  // Mock assessment result data
  assessmentResult: AssessmentResult = {
    suitability: 'high',
    suitabilityText: 'Geeignet',
    summary: 'Ihr Gebäude ist grundsätzlich für den Einsatz einer Wärmepumpe geeignet.',
    recommendedType: 'Luft-Wasser-Wärmepumpe',
    efficiency: 'Gut',
    flowTemperature: 50,
    
    roomRecommendations: [
      {
        name: 'Wohnzimmer',
        status: 'good',
        statusText: 'Gut geeignet',
        recommendations: [
          'Keine Maßnahmen erforderlich'
        ]
      },
      {
        name: 'Kinderzimmer',
        status: 'medium',
        statusText: 'Bedingt geeignet',
        recommendations: [
          'Heizkörper auf Niedertemperatur-geeigneten Typ upgraden',
          'Außenwanddämmung prüfen'
        ]
      },
      {
        name: 'Schlafzimmer',
        status: 'problematic',
        statusText: 'Problematisch',
        recommendations: [
          'Heizkörper ersetzen durch größeren Typ',
          'Fenster auf dreifach-verglaste Variante aufrüsten'
        ]
      }
    ],
    
    generalRecommendations: [
      {
        title: 'Hydraulischer Abgleich',
        description: 'Für eine optimale Wärmeverteilung im gesamten Heizsystem.'
      },
      {
        title: 'Modernisierung der Heizkörper',
        description: 'Tauschen Sie die Heizkörper in den kritischen Räumen gegen Niedertemperatur-geeignete Modelle aus.'
      },
      {
        title: 'Wärmepumpenanpassung',
        description: 'Achten Sie auf eine Wärmepumpe mit Vorlauftemperatur von mindestens 55°C für optimale Effizienz.'
      }
    ]
  };

  constructor(private berechnungService: BerechnungService) {}

  ngOnInit(): void {
    // In a real implementation, we would calculate the assessment from the grid data
    // this.calculateAssessment();
  }

  // In a real implementation, this method would calculate the assessment
  // based on the collected building and room data
  /*
  private calculateAssessment(): void {
    const grid = this.berechnungService.grid;
    
    // Example calculations (would be much more complex in reality)
    const buildingType = grid.getCell("Names", "F_GB1") as string;
    const constructionYear = grid.getCell("Names", "F_BJ1") as string;
    const heatingType = grid.getCell("Names", "F_HK1") as string;
    
    // Calculate suitability based on factors
    // ...
    
    // Update assessment result
    // ...
  }
  */
}
