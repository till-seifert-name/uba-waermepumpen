import {Component, OnDestroy, OnInit, ViewChild} from '@angular/core';
import {MatAccordion, MatExpansionPanel} from "@angular/material/expansion";

@Component({
  selector: 'app-start',
  templateUrl: './start.component.html',
  styleUrls: ['./start.component.scss']
})
export class StartComponent implements OnInit, OnDestroy {

  @ViewChild(MatAccordion) accordion?: MatAccordion;

  /**
   * Static field to hold the state of the accordoin
   */
  static accordionState: boolean[];

  ngOnInit(): void {
    if (StartComponent.accordionState) {
      this.applyAccordionState(StartComponent.accordionState);
    }
  }

  ngOnDestroy(): void {
    if (this.accordion) {
      StartComponent.accordionState = this.getAccordionState();
    }
  }

  private getAccordionState(): boolean[] {
    return this.accordion?._headers.map(header => header._isExpanded()) ?? [];
  }

  private applyAccordionState(state: boolean[]): void {
    setTimeout(() => {
      this.accordion?._headers.forEach((header, index) => {
        if (header._isExpanded() != state[index])
          header._toggle();
      });
    });
  }

  scrollTo(panel: MatExpansionPanel) {
    panel._body.nativeElement.scrollIntoView({behavior: "smooth"});
  }
}
