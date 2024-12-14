import {Component, EventEmitter, Input, OnInit, Output} from '@angular/core';
import {FormControl} from "@angular/forms";
import {debounceTime, map, Observable, startWith} from "rxjs";
import {MatAutocompleteSelectedEvent} from "@angular/material/autocomplete";

export type SearchIndexItem<T> = {
  component: T;
  title: string;
  content: string;
};

@Component({
  selector: 'app-search',
  template: `
    <mat-form-field class="w-100" appearance="outline" color="accent">
      <input type="text" matInput [matAutocomplete]="auto" [formControl]="searchControl"
             placeholder="Suchbegriff hier eingeben">
      <button *ngIf="searchControl.value" matSuffix mat-icon-button aria-label="Clear"
              (click)="searchControl.setValue('')">
        <mat-icon fontSet="material-symbols-outlined" class="wght-300">close</mat-icon>
      </button>
      <button *ngIf="!searchControl.value" matSuffix mat-icon-button aria-label="Search">
        <mat-icon fontSet="material-symbols-outlined">search</mat-icon>
      </button>
      <mat-autocomplete #auto="matAutocomplete" (optionSelected)="onOptionSelected($event)">
        <mat-option *ngFor="let option of filteredOptions | async" [value]="option"
                    class="px-3 py-2 border-bottom"
        >
          <div class="mat-option-text">
            <div class="mat-body-2 mb-1 text-truncate w-100"
                 [innerHtml]="highlightMatch(option.title, searchControl.value)"></div>
            <div class="mat-caption text-muted text-nowrap text-truncate w-100"
                 [innerHtml]="highlightMatch(option.content, searchControl.value)"></div>
          </div>
        </mat-option>
      </mat-autocomplete>
    </mat-form-field>
  `,
  styles: [`:host {
    display: contents
  }`]
})
export class SearchComponent<T> implements OnInit {

  @Input() searchIndex: SearchIndexItem<T>[] = [];
  @Output() optionSelected = new EventEmitter<SearchIndexItem<T>>();

  searchControl = new FormControl();
  filteredOptions?: Observable<SearchIndexItem<T>[]>;

  ngOnInit() {
    this.filteredOptions = this.searchControl.valueChanges.pipe(
      startWith(''),
      debounceTime(250),
      map(value => this.filter(this.searchIndex, value))
    );
  }

  private filter(options: SearchIndexItem<T>[], searchTermOrSelection: string | SearchIndexItem<T>) {
    if (typeof searchTermOrSelection === 'string') {
      const searchTerm = normalizeUnicode(searchTermOrSelection).trim();

      return options
        .filter(option =>
          normalizeUnicode(option.title).includes(searchTerm) ||
          normalizeUnicode(option.content).includes(searchTerm)
        )
        .map(option => {
          let {content} = option;

          if (normalizeUnicode(content).includes(searchTerm)) {
            const sentences = segmentText(content, 'sentence');
            const matchedSentenceIndex = sentences.findIndex(sentence => normalizeUnicode(sentence).includes(searchTerm));
            let matchedSentence = sentences[matchedSentenceIndex];

            if (matchedSentence) {
              const searchTermStartIndex = normalizeUnicode(matchedSentence).indexOf(searchTerm);

              const desiredLength = 69;
              if (matchedSentence.length > desiredLength) {
                let start = Math.max(0, searchTermStartIndex - Math.floor(desiredLength / 2));
                let end = start + desiredLength;

                if (end > matchedSentence.length) {
                  start -= end - matchedSentence.length;
                  end = matchedSentence.length;
                }

                matchedSentence = (start === 0 ? '' : '…') + matchedSentence.substring(start, end) + '…';
              }

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
          return aTitleMatch && !bTitleMatch ? -1 : !aTitleMatch && bTitleMatch ? 1 : 0;
        });
    }
    return options.filter(option =>
      normalizeUnicode(option.title).includes(normalizeUnicode((searchTermOrSelection as SearchIndexItem<T>).title))
    );
  }

  /**
   * Highlights occurrences of a search term by wrapping matched words in `<strong>`.
   *
   * This method normalizes both the input text and the search term to ensure case-insensitive and accent-insensitive matching.
   * @example
   * highlightMatch("Café con leche", "caf"); // Returns: "<strong>Café</strong> con leche"
   */
  public highlightMatch(text: string, searchTerm: string): string {
    searchTerm = searchTerm?.trim();
    if (!searchTerm) return text;

    // Segment the text into words (and non-word segments)
    const segments = text.split(/\s/);
    // Segment the searchTerm into words
    const searchTermSegments = searchTerm.split(/\s/)
      .map(s => normalizeUnicode(s))
      .filter(s => /\p{L}|\p{N}/u.test(s));

    // Create a list of word segments from the text (with their indexes)
    // Only consider segments that contain at least one word character
    const wordIndices = segments
      .map((seg, i) => ({seg, i, normalized: normalizeUnicode(seg)}))
      .filter(obj => /\p{L}|\p{N}/u.test(obj.normalized));

    // Sliding window over wordIndices to find multi-word substring matches
    for (let start = 0; start <= wordIndices.length - searchTermSegments.length; start++) {
      const windowText = wordIndices
        .slice(start, start + searchTermSegments.length)
        .map(({normalized}) => normalized)
        .join('');

      // Highlight the matched segments
      if (windowText.includes(searchTermSegments.join(''))) {
        for (let k = 0; k < searchTermSegments.length; k++) {
          const idx = wordIndices[start + k].i;
          segments[idx] = `<strong>${segments[idx]}</strong>`;
        }
      }
    }

    // Join all segments back together to reconstruct the text with highlighting
    return segments.join(' ');
  }

  onOptionSelected(event: MatAutocompleteSelectedEvent) {
    const match = event.option.value as SearchIndexItem<T>;
    this.optionSelected.emit(match);
    this.searchControl.setValue(match.title);
  }
}

function normalizeUnicode(text: string): string {
  return text.normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/ß/g, "ss")
    .toLowerCase();
}

/**
 * Segments a given text into sentences or words using Intl.Segmenter.
 * Falls back to simple splitting if Intl.Segmenter is not available.
 *
 * @param text - The text to segment.
 * @param mode - The segmentation mode ('sentence' or 'word').
 * @returns An array of segments (sentences or words).
 */
function segmentText(text: string, mode: 'sentence' | 'word'): string[] {
  if ('Segmenter' in Intl) {
    const segmenter = new Intl.Segmenter('de', {granularity: mode});
    return Array.from(segmenter.segment(text), segment => segment.segment);
  }

  // Fallback: Simple splitting for sentences or words
  switch (mode) {
    case 'sentence':
      return text.split(/(?<=[.?!])\s+/);
    case 'word':
      return text.split(/\s+/);
    default:
      return [text];
  }
}
