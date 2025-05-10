import {Component, OnInit} from '@angular/core';
import {Router} from '@angular/router';
import {BerechnungService} from '../../berechnung.service';
import {DataGrid} from '../../data-grid';

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

  // Getter for Modernisierungsjahr from the Daten sheet (B19-B24)
  get Modernisierungsjahr(): string[] {
    try {
      // Get the values from the Daten sheet
      return this.grid.getCells('Daten', 'B19', 'B24').map(row => row[0].toString());
    } catch (error) {
      console.error('Error loading Modernisierungsjahr:', error);
      return [
      ];
    }
  }

  onSubmit(): void {
    // For the mockup, we'll just navigate to the next step
    this.router.navigate(['/gebaeude/heizung']);
  }

  checked(event: Event): boolean {
    return (event.target as HTMLInputElement)?.checked ?? false;
  }
}
