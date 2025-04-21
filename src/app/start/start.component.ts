import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { BerechnungService } from '../berechnung.service';

/**
 * Start component that serves as the entry point to the application.
 * It displays a landing page with a call-to-action button to start the wizard.
 */

@Component({
  selector: 'app-start',
  templateUrl: './start.component.html',
  styleUrls: ['./start.component.scss'],
  standalone: false
})
export class StartComponent {
  constructor(
    private router: Router,
    private berechnungService: BerechnungService
  ) {}

  /**
   * Start the wizard by navigating to the first step
   */
  startWizard(): void {
    // Navigate to the first step of the wizard
    this.router.navigate(['/gebaeude']);
  }
}
