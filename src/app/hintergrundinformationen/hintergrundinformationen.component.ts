import {AfterViewInit, Component, QueryList, ViewChildren} from '@angular/core';
import {InfoCardComponent} from "./info-card/info-card.component";
import {FormControl} from "@angular/forms";
import {debounceTime, map, Observable, startWith} from "rxjs";
import {MatAutocompleteSelectedEvent} from "@angular/material/autocomplete";

type SearchIndexItem = {
  component: InfoCardComponent;
  title: string;
  content: string
};

@Component({
  selector: 'app-hintergrundinformationen',
  templateUrl: './hintergrundinformationen.component.html',
  styleUrls: ['./hintergrundinformationen.component.scss']
})
export class HintergrundinformationenComponent implements AfterViewInit {

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
  @ViewChildren(InfoCardComponent) components?: QueryList<InfoCardComponent>;

  ngAfterViewInit() {
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
      const element = component.elementRef.nativeElement;
      return {
        // Extract title from first heading in the element
        title: element.querySelector('h1, h2, h3, h4, h5')?.innerHTML ?? '',
        // Extract content from all paragraphs and dialogs in the element
        content: Array.from(element.querySelectorAll('p, dialog :is(p, li, tr, dd, dt, h3, h4, h5, h6)'))
          .reduce((acc, el) => `${acc} ${el instanceof HTMLElement ? (el.innerText + '.') : ''}`, '').trim(),
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
      const searchTerm = searchTermOrSelection.toLowerCase();
      // Filter, truncate content and sort the options
      return options
        .filter(option =>
          option.title.toLowerCase().includes(searchTerm) || option.content.toLowerCase().includes(searchTerm)
        )
        .map(option => {
          let {content} = option;
          if (content.toLowerCase().includes(searchTerm)) {
            const sentences = content.split('.').map(s => s.trim() + '.');
            const matchedSentenceIndex = sentences.findIndex(sentence => sentence.toLowerCase().includes(searchTerm));
            let matchedSentence = sentences[matchedSentenceIndex];

            if (matchedSentence) {
              const searchTermStartIndex = matchedSentence.toLowerCase().indexOf(searchTerm);

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
          const aTitleMatch = a.title.toLowerCase().includes(searchTerm);
          const bTitleMatch = b.title.toLowerCase().includes(searchTerm);
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
    const searchPattern = searchTerm.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
    const regEx = new RegExp(`\\w*${searchPattern}\\w*`, 'gi');
    return text.replace(regEx, match => `<strong>${match}</strong>`);
  }

  /**
   * Handles the selection of an autocomplete option.
   * Just open the dialog of the matched InfoCardComponent.
   */
  onOptionSelected(event: MatAutocompleteSelectedEvent) {
    const match = event.option.value as SearchIndexItem;
    match.component.openDialog();

    // Set the input to the title of the element, instead of the object
    this.searchControl.setValue(match.title);
  }
}
