import { Component, OnInit } from '@angular/core';
import { BerechnungService } from '../../berechnung.service';
import { DataGrid } from '../../data-grid';
import { Router } from '@angular/router';

interface FlowTempData {
  knowsFlowTemp: boolean;
  designTemp: number | null;
  canMeasureTemp: boolean;
  currentFlowTemp: number | null;
  currentOutdoorTemp: number | null;
}

@Component({
  selector: 'app-gebaeude-flow-temp',
  standalone: false,
  templateUrl: './gebaeude-flow-temp.component.html',
  styleUrl: './gebaeude-flow-temp.component.scss'
})
export class GebaeudeFlowTempComponent implements OnInit {
  // Expose grid property for template binding
  public grid: DataGrid;

  flowTempData: FlowTempData = {
    knowsFlowTemp: false,
    designTemp: null,
    canMeasureTemp: true, // Default checked in mockup
    currentFlowTemp: null,
    currentOutdoorTemp: null
  };

  constructor(
    private router: Router,
    private berechnungService: BerechnungService
  ) {
    this.grid = berechnungService.grid;
  }

  ngOnInit(): void {
    // Here we would load existing data from the grid
    // For the mockup, we use hardcoded defaults
  }

  checked(event: Event): boolean {
    return (event.target as HTMLInputElement)?.checked ?? false;
  }
  
  onNext(): void {
    // Form validation will happen automatically thanks to ngNativeValidate
    // This method will only be called if the form is valid
    this.router.navigate(['/gebaeude/transition']);
  }
}
