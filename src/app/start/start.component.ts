import {Component} from '@angular/core';
import {BerechnungService} from '../berechnung.service';

/**
 * NOTE: This is a simple UI implementation.
 * 
 * In the full implementation:
 * - All data should be stored and retrieved from the DataGrid in the BerechnungService
 * - The UI should directly bind to values in the grid where possible
 * - Minimal getters should be used to transform grid data for templates
 * - No complex models should be created - the grid is the single source of truth
 */

@Component({
    selector: 'app-start',
    templateUrl: './start.component.html',
    styleUrls: ['./start.component.scss'],
    standalone: false
})
export class StartComponent {
  // Simple active tab tracking for the wizard
  activeTab = 'building'; // Options: 'building', 'rooms', 'results'
  
  constructor(private berechnungService: BerechnungService) {}
  
  // Tab navigation
  setActiveTab(tab: string): void {
    this.activeTab = tab;
  }
  
  // Simple placeholder methods to demonstrate functionality
  addRoom(): void {
    console.log('Add room clicked');
    // In real implementation: Add room data to grid
  }
  
  calculateResults(): void {
    console.log('Calculate results');
    // In real implementation: Run calculations on grid data
    this.setActiveTab('results');
  }
}
