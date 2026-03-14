import { Component } from '@angular/core';
import {AppComponent} from '../app.component';

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
  get basePath() {
    return AppComponent.basePath;
  }
}
