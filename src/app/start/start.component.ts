import { Component } from '@angular/core';
import {MatExpansionPanel} from "@angular/material/expansion";

@Component({
  selector: 'app-start',
  templateUrl: './start.component.html',
  styleUrls: ['./start.component.scss']
})
export class StartComponent {

  scrollTo(panel: MatExpansionPanel) {
    panel._body.nativeElement.scrollIntoView({behavior: "smooth"});
  }
}
