import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { BerechnungService } from '../../berechnung.service';
import { DataGrid } from '../../data-grid';

@Component({
  selector: 'app-gebaeude-heating',
  standalone: false,
  templateUrl: './gebaeude-heating.component.html',
  styleUrl: './gebaeude-heating.component.scss'
})
export class GebaeudeHeatingComponent {
  // Expose grid property for template binding
  public grid: DataGrid;

  constructor(
    private router: Router,
    private berechnungService: BerechnungService
  ) {
    this.grid = berechnungService.grid;
  }

  // Getter for Effizienzklasse options from the Daten sheet (E31-E40)
  get effizienzklassen(): string[] {
    try {
      // Get the values from the Daten sheet
      return this.grid.getCells('Daten', 'E31', 'E40')
        .map(row => row[0].toString())
        .filter(value => value !== ""); // Filter out empty values
    } catch (error) {
      console.error('Error loading Effizienzklassen:', error);
      return [];
    }
  }

  onSubmit(): void {
    // If storage heater is selected, route to special feedback
    const heatingType = this.grid.getCell('IN_build', 'P14');
    if (heatingType === 'Nachtspeicherheizung') {
      this.router.navigate(['/gebaeude/feedback-heizung']);
    } else {
      // Otherwise continue to flow temperature
      this.router.navigate(['/gebaeude/vorlauftemperatur']);
    }
  }

  checked(event: Event): boolean {
    return (event.target as HTMLInputElement)?.checked ?? false;
  }
}
