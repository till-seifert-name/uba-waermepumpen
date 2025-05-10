import {Component} from '@angular/core';
import {Router} from '@angular/router';
import {BerechnungService} from '../../berechnung.service';
import {DataGrid} from '../../data-grid';

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
export class GebaeudeBasicComponent {
  // Expose grid property for template binding
  public grid: DataGrid;

  buildingData: BuildingData = {
    plz: '',
    buildingType: 'EFH',
    roofType: 'flach',
    constructionYear: ''
  };

  constructor(
    private router: Router,
    private berechnungService: BerechnungService
  ) {
    this.grid = berechnungService.grid;
  }

  // Getter for building age classes from the Daten sheet (E17-E28)
  get baualtersklassen(): string[] {
    try {
      // Get the values from the Daten sheet
      return this.grid.getCells('Daten', 'E17', 'E28').map(row => row[0].toString());
    } catch (error) {
      console.error('Error loading Baualtersklassen:', error);
      return [];
    }
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
