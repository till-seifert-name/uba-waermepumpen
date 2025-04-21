import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { BerechnungService } from '../../berechnung.service';

interface BuildingData {
  plz: string;
  buildingType: string;
  roofType: string;
  constructionYear: string;
}

@Component({
  selector: 'app-gebaeude-basic',
  standalone: false,
  templateUrl: './gebaeude-basic.component.html',
  styleUrl: './gebaeude-basic.component.scss'
})
export class GebaeudeBasicComponent implements OnInit {
  buildingData: BuildingData = {
    plz: '',
    buildingType: 'EFH',
    roofType: 'flach',
    constructionYear: ''
  };

  constructor(
    private router: Router,
    private berechnungService: BerechnungService
  ) {}

  ngOnInit(): void {
    // In the real implementation, we would load data from the grid
    // For now, we'll use placeholder dummy data
    const grid = this.berechnungService.grid;
    
    // This is just a placeholder - in the real implementation we'd
    // map from the grid cells to our component model
    /* 
    this.buildingData = {
      plz: grid.getCell("Names", "F_PLZ") as string,
      buildingType: grid.getCell("Names", "F_GB1") as string,
      roofType: grid.getCell("Names", "F_DF1") as string,
      constructionYear: grid.getCell("Names", "F_BJ1") as string
    };
    */
  }

  onSubmit(): void {
    // Here we would map the form data back to the grid
    // For the mockup, we'll just navigate to the next screen
    
    // For year after 2000, we would show the early feedback
    if (this.buildingData.constructionYear === '2003-2008' || 
        this.buildingData.constructionYear === 'nach2009') {
      this.router.navigate(['/gebaeude/feedback-early']);
    } else {
      // Otherwise continue to modernization questions
      this.router.navigate(['/gebaeude/modernisierung']);
    }
  }
}
