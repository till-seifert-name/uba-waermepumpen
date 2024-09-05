import {AfterViewInit, Component, ElementRef, OnInit, ViewChild} from '@angular/core';
import {MatAccordion} from '@angular/material/expansion';
import {AccordionService} from '../accordion.service';
import {ActivatedRoute, Router} from "@angular/router"; // Adjust path accordingly

@Component({
  selector: 'app-faq',
  templateUrl: './faq.component.html',
  styleUrls: ['./faq.component.scss']
})
export class FaqComponent implements AfterViewInit {

  @ViewChild(MatAccordion) accordion?: MatAccordion;

  constructor(private accordionService: AccordionService, private route: ActivatedRoute, private el: ElementRef) {
  }

  ngAfterViewInit(): void {
    // Scroll to the first expanded panel after view initialization
    if (this.accordion) {
      this.accordionService.initializeAccordionState(this.route, this.accordion, this.el);
      this.accordionService.scrollToFirstExpandedPanel(this.accordion, this.el);
    }
  }

  /**
   * Called when the state of the accordion changes.
   * Updates the query params in the URL.
   */
  onPanelChange(): void {
    if (this.accordion) {
      this.accordionService.handlePanelChange(this.accordion, this.el);
    }
  }
}
