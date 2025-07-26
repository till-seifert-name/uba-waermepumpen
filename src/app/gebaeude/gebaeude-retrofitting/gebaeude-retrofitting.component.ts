import {Component, OnInit} from '@angular/core';
import {Router} from '@angular/router';
import {BerechnungService} from '../../berechnung.service';
import {DataGrid} from '../../data-grid';
import {extractPopupText, extractUntertext, hasPopupText, hasUntertext, getPopupTextOrFallback, hasPopupTextOrFallback} from '../../text-utils';

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

  // Getter for Modernisierungsjahr from the Daten sheet (E17-E29)
  get Modernisierungsjahr(): string[] {
    try {
      // Get the values from the Daten sheet (changed from B19-B25 to E17-E29)
      return this.grid.getCells('Daten', 'E17', 'E29').map(row => row[0].toString());
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
