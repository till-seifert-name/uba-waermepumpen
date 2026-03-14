import {Component, TrackByFunction} from '@angular/core';
import {Router} from '@angular/router';
import {BerechnungService} from '../../berechnung.service';
import {DataGrid} from '../../data-grid';
import {data as Daten} from '../../../../WP_Check_Methode_v1_ts_export/Daten';
import {extractPopupText, extractUntertext, hasPopupText, hasUntertext} from '../../text-utils';
import {AppComponent} from '../../app.component';

@Component({
  selector: 'app-gebaeude-basic',
  standalone: false,
  templateUrl: './gebaeude-basic.component.html',
  styleUrl: './gebaeude-basic.component.scss'
})
export class GebaeudeBasicComponent {
  // Expose grid property for template binding
  public grid: DataGrid;

  get basePath() {
    return AppComponent.basePath;
  }

  constructor(
    private router: Router,
    private berechnungService: BerechnungService
  ) {
    this.grid = berechnungService.grid;
  }

  // Getter for building age classes from the Daten sheet (E17-E29)
  get baualtersklassen(): string[] {
    try {
      // Get the values from the Daten sheet
      return this.grid.getCells('Daten', 'E17', 'E29').map(row => row[0].toString());
    } catch (error) {
      console.error('Error loading Baualtersklassen:', error);
      return [];
    }
  }

  // Getter für Gebäudetypen aus dem Daten-Sheet (E10-E14)
  get gebaeudetypen(): string[] {
    try {
      // Werte aus dem Daten-Sheet abrufen
      return this.grid.getCells('Daten', 'E10', 'E12').map(row => row[0].toString());
    } catch (error) {
      console.error('Fehler beim Laden der Gebäudetypen:', error);
      return [];
    }
  }

  // Getter für Dachtypen aus dem Daten-Sheet (B10-B13) with icons
  get dachtypOptions(): { value: string; icon: string }[] {
    try {
      // Mapping of roof types to their corresponding icon files
      const iconMapping: { [key: string]: string } = {
        'Flach bzw. Flachdach': 'pic_Dachneigung_flach.svg',
        'geneigt': 'pic_Dachneigung_geneigt.svg',
        'steil': 'pic_Dachneigung_steil.svg',
        'sehr steil': 'pic_Dachneigung_sehr_steil.svg'
      };
      
      // Werte aus dem Daten-Sheet abrufen und mit Icons verknüpfen
      return this.grid.getCells('Daten', 'B10', 'B13').map(row => {
        const value = row[0].toString();
        return {
          value: value,
          icon: iconMapping[value] || ''
        };
      });
    } catch (error) {
      console.error('Fehler beim Laden der Dachtypen:', error);
      return [];
    }
  }

  // Helper for trackBy
  value: TrackByFunction<typeof this.dachtypOptions[number]> = (_, v) => v.value;

  // Method to get user-friendly display labels for baualtersklassen
  getBaualtersklasseLabel(value: string): string {
    if (value === '') {
      return 'Bitte auswählen';
    }
    return value;
  }

  // Method to get user-friendly display labels for building types
  // Changes UI labels only - data model remains unchanged
  getGebaeudetypLabel(value: string): string {
    const labelMap: { [key: string]: string } = {
      'Ein- oder Zweifamilienhaus': 'freistehend',
      'Reihenhaus': 'ein Reihenhaus oder Doppelhaushälfte',
      'Mehrfamilienhaus': 'ein Mehrfamilienhaus'
    };
    
    return labelMap[value] || value;
  }

  // Expose utility functions for template
  extractPopupText = extractPopupText;
  extractUntertext = extractUntertext;
  hasPopupText = hasPopupText;
  hasUntertext = hasUntertext;

  onSubmit(): void {
    // Get the construction year from the data grid
    const constructionYear = this.grid.getCell('IN_build', 'P5').toString();

    // For buildings after 2000, we would show the early feedback
    if (constructionYear === Daten['E27'] ||
        constructionYear === Daten['E28'] ||
        constructionYear === Daten['E29']) {
      this.router.navigate(['/gebaeude/feedback-early']);
    } else {
      // Otherwise continue to modernization questions
      this.router.navigate(['/gebaeude/modernisierung']);
    }
  }
}
