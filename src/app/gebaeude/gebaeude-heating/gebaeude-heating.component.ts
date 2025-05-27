import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { BerechnungService } from '../../berechnung.service';
import { DataGrid } from '../../data-grid';
import { data as Daten } from '../../../../20250507_WP_Check_Vorlage_ts_export/Daten';

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
      return this.grid.getCells('Daten', 'E31', 'E40').map(row => row[0].toString())
    } catch (error) {
      console.error('Error loading Effizienzklassen:', error);
      return [];
    }
  }

  // Getter für Wärmeübergabe-Typen aus dem Daten-Sheet (E57-E63)
  get waermeuebergabeTypen(): string[] {
    try {
      // Werte aus dem Daten-Sheet abrufen
      return this.grid.getCells('Daten', 'E57', 'E61').map(row => row[0].toString());
    } catch (error) {
      console.error('Fehler beim Laden der Wärmeübergabe-Typen:', error);
      return [];
    }
  }

  // Getter für Heizkreislauf-Typen aus dem Daten-Sheet (E70-E71)
  get heizkreislaufTypen(): string[] {
    try {
      // Werte aus dem Daten-Sheet abrufen
      return this.grid.getCells('Daten', 'E70', 'E71').map(row => row[0].toString());
    } catch (error) {
      console.error('Fehler beim Laden der Heizkreislauf-Typen:', error);
      return [];
    }
  }

  onSubmit(): void {
    // Check if efficiency class is B or better (A+, A, B)
    const effizienzklasse = this.grid.getCell('IN_build', 'P12');
    if (effizienzklasse === Daten['E31'] || // A+
        effizienzklasse === Daten['E32'] || // A  
        effizienzklasse === Daten['E33']) { // B
      this.router.navigate(['/gebaeude/feedback-efficiency']);
      return;
    }

    // Wenn Nachtspeicherheizung ausgewählt wurde, zu speziellem Feedback navigieren
    const heizungstyp = this.grid.getCell('IN_build', 'P14');
    if (heizungstyp === Daten['E60']) { // Nachtspeicherheizung
      this.router.navigate(['/gebaeude/feedback-heizung']);
    } else {
      // Ansonsten zur Vorlauftemperatur weiterleiten
      this.router.navigate(['/gebaeude/vorlauftemperatur']);
    }
  }

  checked(event: Event): boolean {
    return (event.target as HTMLInputElement)?.checked ?? false;
  }
}
