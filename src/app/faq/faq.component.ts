import {AfterViewInit, Component, ElementRef, QueryList, ViewChildren} from '@angular/core';
import {MatAccordion, MatExpansionPanel} from '@angular/material/expansion';
import {AccordionService} from '../accordion.service';
import {ActivatedRoute} from "@angular/router";
import {debounceTime, map, Observable, startWith, Subject} from "rxjs";
import {FormControl} from "@angular/forms";
import {MatAutocompleteSelectedEvent} from "@angular/material/autocomplete";

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

    this.initSearchIndex();
  }

  /**
   * Triggered when the panel state changes.
   * Emits the event to the debounced handler.
   * Debounced to avoid multiple rapid invocations.
   */
  onPanelChange(): void {
    this.panelChangeSubject.next();
  }


  /**
   * Form control for the search input
   */
  searchControl = new FormControl();
  /**
   * Observable of matched content
   */
  filteredOptions?: Observable<SearchIndexItem[]>;
  /**
   * Reference to all child InfoCardComponent instances
   */
  @ViewChildren(MatExpansionPanel) components?: QueryList<MatExpansionPanel>;

  initSearchIndex() {
    // Generate search index from InfoCardComponents
    const searchIndex = this.getSearchIndex();
    // Filter the search results based on user input
    this.filteredOptions = this.searchControl.valueChanges.pipe(
      startWith(''),
      debounceTime(250),
      map(value => this.filter(searchIndex, value))
    );
  }

  /**
   * Extracts text content from InfoCardComponents and stores it with a reference to the component instance
   * @returns Array of SearchIndexItem objects
   */
  getSearchIndex(): SearchIndexItem[] {
    return this.components?.map(component => {
      const element = component._body.nativeElement;
      return {
        // Extract title from first heading in the element
        title: [component._body.nativeElement.previousElementSibling].reduce((acc, el) => `${acc} ${el instanceof HTMLElement && el.innerText?.trim() ? el.innerText + '.' : ''}`, '').trim(),

        // Extract content from all paragraphs and dialogs in the element
        content: Array.from(component._body.nativeElement.querySelectorAll(':is(p, li, tr, dd, dt, h3, h4, h5, h6)'))
          .reduce((acc, el) => `${acc} ${el instanceof HTMLElement && el.innerText?.trim() ? el.innerText + '.' : ''}`, '').trim(),

        component: component
      };
    }) ?? [];
  }

  /**
   * Filters an array of SearchIndexItem objects based on a search term or selected item
   *
   * @param options - The array of SearchIndexItem objects to filter
   * @param searchTermOrSelection - The search term or selected item to filter by
   * @returns The filtered array of SearchIndexItem objects
   */
  private filter(options: SearchIndexItem[], searchTermOrSelection: string | SearchIndexItem) {
    // If the search term is user input…
    if (typeof searchTermOrSelection === 'string') {
      const searchTerm = normalizeUnicode(searchTermOrSelection);

      // Filter, truncate content and sort the options
      return options
        .filter(option =>
          normalizeUnicode(option.title).includes(searchTerm) ||
          normalizeUnicode(option.content).includes(searchTerm)
        )
        .map(option => {
          let {content} = option;

          if (normalizeUnicode(content).includes(searchTerm)) {
            const sentences = content.split('.').map(s => s.trim() + '.');
            const matchedSentenceIndex = sentences.findIndex(sentence => normalizeUnicode(sentence).includes(searchTerm));
            let matchedSentence = sentences[matchedSentenceIndex];

            if (matchedSentence) {
              const searchTermStartIndex = normalizeUnicode(matchedSentence).indexOf(searchTerm);

              const desiredLength = 69;
              if (matchedSentence.length > desiredLength) {
                let start = Math.max(0, searchTermStartIndex - Math.floor(desiredLength / 2));
                let end = start + desiredLength;

                // If the calculated end index is beyond the string length, shift the start index back
                if (end > matchedSentence.length) {
                  start -= end - matchedSentence.length;
                  end = matchedSentence.length;
                }

                matchedSentence = (start === 0 ? '' : '…') + matchedSentence.substring(start, end) + '…';
              }

              // If the matched sentence is still shorter than 30 characters, try to add characters from the next sentence
              if (matchedSentence.length < desiredLength && sentences[matchedSentenceIndex + 1]) {
                const remainingChars = desiredLength - matchedSentence.length;
                const nextSentenceStart = sentences[matchedSentenceIndex + 1].substring(0, remainingChars);
                matchedSentence += ' ' + nextSentenceStart + '…';
              }

              content = matchedSentence;
            }
          }
          return {...option, content};
        })
        .sort((a, b) => {
          const aTitleMatch = normalizeUnicode(a.title).includes(searchTerm);
          const bTitleMatch = normalizeUnicode(b.title).includes(searchTerm);
          if (aTitleMatch && !bTitleMatch) {
            return -1;
          } else if (!aTitleMatch && bTitleMatch) {
            return 1;
          }
          return 0;
        });
    }
    // If the search term is not a string (i.e., it's a selected item)...
    return options.filter(option =>
      option.title.toLowerCase().includes(searchTermOrSelection.title)
    );
  }

  /**
   * Wraps the matching search term in HTML strong tags for highlighting
   *
   * @param text - The text to search for matches in
   * @param searchTerm - The search term to highlight
   * @returns The text with matches highlighted with <strong>
   */
  highlightMatch(text: string, searchTerm: string): string {
    if (!searchTerm) return text;
    const searchTermNormalized = normalizeUnicode(searchTerm).replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const textNormalized = normalizeUnicode(text);
    const regEx = new RegExp(`\\w*${searchTermNormalized}\\w*`, 'gi');

    Array.from(textNormalized.matchAll(regEx)).reverse().forEach(match => {
      const [start, end] = [match.index!, match.index! + match[0].length];
      text = `${text.slice(0, start)}<strong>${text.slice(start, end)}</strong>${text.slice(end)}`;
    });

    return text;
  }

  /**
   * Handles the selection of an autocomplete option.
   * Just open the dialog of the matched InfoCardComponent.
   */
  onOptionSelected(event: MatAutocompleteSelectedEvent) {
    const match = event.option.value as SearchIndexItem;
    match.component.open();
    this.scrollTo(match.component);

    // Set the input to the title of the element, instead of the object
    this.searchControl.setValue(match.title);
  }

  scrollTo(panel: MatExpansionPanel) {
    panel._body.nativeElement.scrollIntoView({behavior: "smooth"});
  }
}

type SearchIndexItem = {
  component: MatExpansionPanel;
  title: string;
  content: string
};


/**
 * @method normalizeUnicode
 * @description Normalizes unicode characters in a string, replacing accented letters with their non-accented equivalents
 * @param text - The text to normalize
 * @returns The normalized text
 */
function normalizeUnicode(text: string): string {
  return text.normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/ß/g, "ss")
    .toLowerCase();
}
