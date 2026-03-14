import { Component, OnInit } from '@angular/core';
import { BerechnungService } from '../../berechnung.service';
import { DataGrid } from '../../data-grid';
import { Router } from '@angular/router';
import { extractPopupText, extractUntertext, hasPopupText, hasUntertext } from '../../text-utils';

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

  // Expose utility functions for template
  extractPopupText = extractPopupText;
  extractUntertext = extractUntertext;
  hasPopupText = hasPopupText;
  hasUntertext = hasUntertext;
  
  onNext(): void {
    // Form validation will happen automatically thanks to ngNativeValidate
    // This method will only be called if the form is valid
    
    // Check if flow temperature is under 55°C
    const knowsFlowTemp = this.grid.getCell('IN_build', 'P16');
    const designTemp = this.grid.getCell('IN_build', 'P17');
    
    if (knowsFlowTemp === 'Ja' && designTemp && Number(designTemp) < 55) {
      this.router.navigate(['/gebaeude/feedback-flow-temp']);
      return;
    }
    
    this.router.navigate(['/gebaeude/final']);
  }
}
