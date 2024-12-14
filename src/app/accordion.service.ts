import {Injectable, ElementRef} from '@angular/core';
import {MatAccordion} from '@angular/material/expansion';
import {ActivatedRoute, Router} from '@angular/router';

@Injectable({
  providedIn: 'root',
})
export class AccordionService {

  constructor(private router: Router, private route: ActivatedRoute) {
  }

  /**
   * Initialize the accordion state by reading from query params and applying it.
   */
  initializeAccordionState(route: ActivatedRoute, accordion: MatAccordion, el: ElementRef): void {
    route.queryParams.subscribe(params => {
      if (params['tab']) {
        const openPanelIds = params['tab'].split(',');
        this.applyAccordionState(accordion, openPanelIds, el);
      }
    });
  }

  /**
   * Apply the accordion state by expanding the relevant panels.
   */
  private applyAccordionState(accordion: MatAccordion, openPanelIds: string[], el: ElementRef): void {
    setTimeout(() => {
      accordion._headers.forEach(header => {
        const panelId = this.getPanelIdFromHeader(header._getPanelId(), el);
        const isExpanded = header._isExpanded();
        const shouldBeOpen = openPanelIds.includes(panelId);
        if (isExpanded !== shouldBeOpen) {
          header._toggle();
        }
      });
    });
  }

  /**
   * Get the list of open panel IDs by checking which panels are expanded.
   */
  getOpenPanelIds(accordion: MatAccordion, el: ElementRef): string[] {
    return accordion._headers
      .filter(header => header._isExpanded())
      .map(header => this.getPanelIdFromHeader(header._getPanelId(), el)) ?? [];
  }

  /**
   * Scroll to the first expanded panel after view initialization.
   */
  scrollToFirstExpandedPanel(accordion: MatAccordion, el: ElementRef): void {
    setTimeout(() => {
      const openPanelIds = this.getOpenPanelIds(accordion, el);
      if (openPanelIds.length > 0) {
        el.nativeElement.querySelector(`#${openPanelIds[0]}`)?.scrollIntoView({behavior: 'smooth', block: "center"});
      }
    }, 0); // Ensure it runs after the view has been fully initialized
  }

  /**
   * Handle panel changes and update the query params in the URL.
   */
  handlePanelChange(accordions: MatAccordion[], el: ElementRef): void {
    const openPanels = accordions
      .map(accordion => this.getOpenPanelIds(accordion, el))
      .flatMap(ids => ids);

    this.router.navigate([], {
      relativeTo: this.route,
      replaceUrl: true,
      queryParams: {tab: openPanels.length ? openPanels.join(',') : undefined},
      queryParamsHandling: 'merge', // Preserve other query parameters
    });
  }

  /**
   * Find the real `mat-expansion-panel` element using the panel ID of the header.
   */
  private getPanelIdFromHeader(panelId: string, el: ElementRef): string {
    const panelElement = el.nativeElement.querySelector(`#${panelId}`);
    if (panelElement) {
      const expansionPanel = panelElement.closest('mat-expansion-panel');
      if (expansionPanel) {
        return expansionPanel.getAttribute('id') || '';
      }
    }
    return panelId; // fallback to generated ID if no `id` is set
  }
}
