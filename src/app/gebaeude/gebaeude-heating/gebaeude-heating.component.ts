import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { BerechnungService } from '../../berechnung.service';

interface HeatingData {
  efficiencyClass: string;
  historicBuilding: boolean;
  heatingType: string;
  distributionType: string;
}

@Component({
  selector: 'app-gebaeude-heating',
  standalone: false,
  templateUrl: './gebaeude-heating.component.html',
  styleUrl: './gebaeude-heating.component.scss'
})
export class GebaeudeHeatingComponent implements OnInit {
  heatingData: HeatingData = {
    efficiencyClass: '',
    historicBuilding: false,
    heatingType: 'radiator',
    distributionType: 'zwei'
  };

  constructor(
    private router: Router,
    private berechnungService: BerechnungService
  ) {}

  ngOnInit(): void {
    // Here we would load existing data from the grid
    // For the mockup, we use hardcoded defaults
  }

  onSubmit(): void {
    // Here we would save data to the grid
    // For the mockup, we'll conditionally navigate based on heating type
    
    // If storage heater is selected, route to special feedback
    if (this.heatingData.heatingType === 'storage') {
      this.router.navigate(['/gebaeude/feedback-heizung']);
    } else {
      // Otherwise continue to flow temperature
      this.router.navigate(['/gebaeude/vorlauftemperatur']);
    }
  }
}
