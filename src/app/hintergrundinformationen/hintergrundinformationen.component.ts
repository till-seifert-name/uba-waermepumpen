import {AfterViewInit, Component, QueryList, ViewChildren} from '@angular/core';
import {InfoCardComponent} from "./info-card/info-card.component";
import {SearchIndexItem} from "../search/search.component";


@Component({
  selector: 'app-hintergrundinformationen',
  templateUrl: './hintergrundinformationen.component.html',
  styleUrls: ['./hintergrundinformationen.component.scss']
})
export class HintergrundinformationenComponent implements AfterViewInit {

  /**
   * Reference to all child InfoCardComponent instances
   */
  @ViewChildren(InfoCardComponent) components?: QueryList<InfoCardComponent>;

  /**
   * Search index
   */
  searchIndex: SearchIndexItem<InfoCardComponent>[] = [];

  ngAfterViewInit() {
    // Generate search index from InfoCardComponents
    this.searchIndex = this.getSearchIndex();
  }

  /**
   * Extracts text content from InfoCardComponents with a reference to the component instance
   */
  getSearchIndex(): SearchIndexItem<InfoCardComponent>[] {
    return this.components?.map(component => {
      const element = component.elementRef.nativeElement;
      return {
        // Extract title from first heading in the element
        title: element.querySelector('h1, h2, h3, h4, h5')?.innerHTML?.trim() ?? '',
        // Extract content from all paragraphs and dialogs in the element
        content: Array.from(element.querySelectorAll('p, dialog :is(p, li, tr, dd, dt, h3, h4, h5, h6)'))
          .reduce((acc, el) => `${acc} ${el instanceof HTMLElement && el.innerText?.trim() ? el.innerText + '.' : ''}`, '').trim(),
        component: component
      };
    }) ?? [];
  }

  /**
   * Handles the selection of an autocomplete option.
   * Just open the dialog of the matched InfoCardComponent.
   */
  onOptionSelected(match: SearchIndexItem<InfoCardComponent>) {
    match.component.openDialog();
  }
}
