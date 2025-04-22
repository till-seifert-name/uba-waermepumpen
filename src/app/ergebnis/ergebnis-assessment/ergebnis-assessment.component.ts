import {Component, OnInit} from '@angular/core';
import {BerechnungService} from '../../berechnung.service';

interface AssessmentResult {
  suitability: 'high' | 'medium' | 'low';
  suitabilityText: string;
  summary: string;

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

  };

  constructor(private berechnungService: BerechnungService) {
  }

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
