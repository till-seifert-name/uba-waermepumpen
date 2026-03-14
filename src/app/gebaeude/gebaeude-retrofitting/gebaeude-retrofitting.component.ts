import {Component, OnInit} from '@angular/core';
import {Router} from '@angular/router';
import {BerechnungService} from '../../berechnung.service';
import {DataGrid} from '../../data-grid';
import {extractPopupText, extractUntertext, extractYear, getPopupTextOrFallback, hasPopupText, hasPopupTextOrFallback, hasUntertext} from '../../text-utils';

@Component({
  selector: 'app-gebaeude-retrofitting',
  standalone: false,
  templateUrl: './gebaeude-retrofitting.component.html',
  styleUrl: './gebaeude-retrofitting.component.scss'
})
export class GebaeudeRetrofittingComponent implements OnInit {
  // Expose grid property for template binding
  public grid: DataGrid;

  constructor(
    private router: Router,
    private berechnungService: BerechnungService
  ) {
    this.grid = berechnungService.grid;
  }

  ngOnInit(): void {
    // Nothing to initialize specifically
  }


  // Getter for Modernisierungsjahr from the Daten sheet (filtered by building year)
  get Modernisierungsjahr(): string[] {
    try {
      const allYears = this.grid.getCells('Daten', 'E17', 'E29').map(row => row[0].toString());
      const buildingYear = this.grid.getCell('IN_build', 'P5').toString();
      const buildingYearNum = extractYear(buildingYear);

      return allYears.filter(year => {
        // Always include empty option
        if (year === '') return true;

        // If no building year set, include all
        if (!buildingYearNum) return true;

        // Include years that are same or newer than building year
        const yearNum = extractYear(year);
        if (yearNum && yearNum >= buildingYearNum) return true;

        // Include currently selected values even if filtered out
        // TODO: What happens when a selected option disappears? Keep it visible for UX.
        const currentSelections = [
          this.grid.getCell('IN_build', 'S7').toString(),  // modjahr_aw
          this.grid.getCell('IN_build', 'S8').toString(),  // modjahr_fenster
          this.grid.getCell('IN_build', 'S9').toString(),  // modjahr_dach
          this.grid.getCell('IN_build', 'S10').toString(), // modjahr_keller
          this.grid.getCell('IN_build', 'S11').toString()  // modjahr_ogd
        ];

        return currentSelections.includes(year);
      });
    } catch (error) {
      console.error('Error loading Modernisierungsjahr:', error);
      return [];
    }
  }

  // Method to get user-friendly display labels for modernisierungsjahr values
  getModernisierungsjahrLabel(value: string): string {
    if (value === '') {
      return 'unbekannt';
    }
    return value;
  }

  onSubmit(): void {
    // For the mockup, we'll just navigate to the next step
    this.router.navigate(['/gebaeude/heizung']);
  }

  checked(event: Event): boolean {
    return (event.target as HTMLInputElement)?.checked ?? false;
  }

  // Expose utility functions for template
  extractPopupText = extractPopupText;
  extractUntertext = extractUntertext;
  hasPopupText = hasPopupText;
  hasUntertext = hasUntertext;
  getPopupTextOrFallback = getPopupTextOrFallback;
  hasPopupTextOrFallback = hasPopupTextOrFallback;
}
