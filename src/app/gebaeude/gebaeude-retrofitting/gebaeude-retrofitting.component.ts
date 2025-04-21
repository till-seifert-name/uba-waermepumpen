import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { BerechnungService } from '../../berechnung.service';

interface RetrofittingData {
  // Wall
  wallUpgraded: boolean;
  wallModYear: string;
  wallInsulationThickness: number;
  
  // Windows
  windowsUpgraded: boolean;
  windowsModYear: string;
  
  // Roof
  roofUpgraded: boolean;
  roofModYear: string;
  roofInsulationThickness: number;
  
  // Top Floor Ceiling
  topFloorUpgraded: boolean;
  topFloorModYear: string;
  topFloorInsulationThickness: number;
  
  // Basement/Floor
  basementUpgraded: boolean;
  basementModYear: string;
  basementInsulationThickness: number;
}

@Component({
  selector: 'app-gebaeude-retrofitting',
  standalone: false,
  templateUrl: './gebaeude-retrofitting.component.html',
  styleUrl: './gebaeude-retrofitting.component.scss'
})
export class GebaeudeRetrofittingComponent implements OnInit {
  retrofittingData: RetrofittingData = {
    wallUpgraded: false,
    wallModYear: '2003-2008',
    wallInsulationThickness: 6,
    
    windowsUpgraded: false,
    windowsModYear: '2003-2008',
    
    roofUpgraded: false,
    roofModYear: '2003-2008',
    roofInsulationThickness: 6,
    
    topFloorUpgraded: true, // Default checked in mockup
    topFloorModYear: '2003-2008',
    topFloorInsulationThickness: 6,
    
    basementUpgraded: false,
    basementModYear: '2003-2008',
    basementInsulationThickness: 6
  };

  constructor(
    private router: Router,
    private berechnungService: BerechnungService
  ) {}

  ngOnInit(): void {
    // Here we would load existing data from the grid
    // For the mockup, we're using hardcoded defaults
  }
  
  onSubmit(): void {
    // Here we would save data to the grid
    // For the mockup, we'll just navigate to the next step
    this.router.navigate(['/gebaeude/heizung']);
  }
}
