import {AfterViewInit, Component, ElementRef, QueryList, ViewChildren} from '@angular/core';
import {MatAccordion} from '@angular/material/expansion';
import {AccordionService} from '../accordion.service';
import {ActivatedRoute} from "@angular/router";
import {debounceTime, Subject} from "rxjs";

@Component({
  selector: 'app-faq',
  templateUrl: './faq.component.html',
  styleUrls: ['./faq.component.scss']
})
export class FaqComponent implements AfterViewInit {

  /**
   * List of MatAccordion components in the view.
   */
  @ViewChildren(MatAccordion) matAccordions!: QueryList<MatAccordion>;

  /**
   * Subject used to debounce the panel change events.
   */
  private panelChangeSubject: Subject<void> = new Subject<void>();

  /**
   * Constructor to initialize necessary services.
   * @param accordionService Service to manage accordion state.
   * @param route ActivatedRoute to access route information.
   * @param el ElementRef to interact with the DOM element.
   */
  constructor(private accordionService: AccordionService, private route: ActivatedRoute, private el: ElementRef) {
    // Set up the debounced panel change subscription
    this.panelChangeSubject.pipe(
      debounceTime(300)
    ).subscribe(() => {
      if (this.matAccordions) {
        // Called after debounce to handle the actual logic.
        // Updates the query params in the URL.
        this.accordionService.handlePanelChange(this.matAccordions.toArray(), this.el);
      }
    });
  }

  /**
   * Lifecycle hook after the view is initialized.
   * Initializes accordion state and scrolls to the first expanded panel.
   */
  ngAfterViewInit(): void {
    // Scroll to the first expanded panel after view initialization
    this.matAccordions.forEach((accordion, i) => {
      this.accordionService.initializeAccordionState(this.route, accordion, this.el);

      if (i === 0) {
        setTimeout(() => {
          this.accordionService.scrollToFirstExpandedPanel(accordion, this.el);
        }, 100);
      }
    });
  }

  /**
   * Triggered when the panel state changes.
   * Emits the event to the debounced handler.
   * Debounced to avoid multiple rapid invocations.
   */
  onPanelChange(): void {
    this.panelChangeSubject.next();
  }
}
