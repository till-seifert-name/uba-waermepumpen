import { Component, OnInit, OnDestroy, HostListener } from '@angular/core';
import { Subscription } from 'rxjs';
import { BerechnungService } from '../../berechnung.service';

interface CellReference {
  sheet: string;
  cell: string;
  value: any;
}

@Component({
  selector: 'app-debug-overlay',
  templateUrl: './debug-overlay.component.html',
  standalone: false,
  styleUrl: './debug-overlay.component.scss'
})
export class DebugOverlayComponent implements OnInit, OnDestroy {
  isVisible = false;
  cellReferences: CellReference[] = [];
  subscriptions: Subscription[] = [];
  downloadJsonHref: string = '';
  sheetNames: string[] = [];

  constructor(private berechnungService: BerechnungService) {}

  ngOnInit(): void {
    this.loadFromSessionStorage();

    // Apply saved visibility state
    const visibilityState = sessionStorage.getItem('debugOverlayVisible');
    if (visibilityState) {
      this.isVisible = JSON.parse(visibilityState);
    }

    // Subscribe to cell changes to auto-update values
    const sub = this.berechnungService.grid.onCellChanged().subscribe(() => {
      this.updateCellValues();
    });
    this.subscriptions.push(sub);
  }

  ngOnDestroy(): void {
    this.subscriptions.forEach(sub => sub.unsubscribe());
  }

  @HostListener('window:keydown', ['$event'])
  handleKeyboardEvent(event: KeyboardEvent): void {
    // Meta (Windows key) + D or Ctrl + Alt + D
    if ((event.metaKey && event.key === 'd') || (event.ctrlKey && event.altKey && event.key === 'd')) {
      event.preventDefault();
      this.toggleVisibility();
    }
  }

  toggleVisibility(): void {
    this.isVisible = !this.isVisible;
    sessionStorage.setItem('debugOverlayVisible', JSON.stringify(this.isVisible));
  }

  addCellRef(): void {
    // Get values from the last row if available
    const lastRef = this.cellReferences.length > 0 
      ? this.cellReferences[this.cellReferences.length - 1] 
      : null;
      
    this.cellReferences.push({
      sheet: lastRef?.sheet || '',
      cell: lastRef?.cell || '',
      value: null
    });
    
    this.saveToSessionStorage();
    
    // Update the value immediately if sheet and cell are provided
    if (lastRef?.sheet && lastRef?.cell) {
      this.updateCellValues();
    }
  }

  removeCellRef(index: number): void {
    this.cellReferences.splice(index, 1);
    this.saveToSessionStorage();
  }

  updateCellValues(): void {
    this.berechnungService.grid.clearResults();
    // Update the list of sheet names
    this.sheetNames = this.berechnungService.grid.getSheetNames().sort();
    
    for (const ref of this.cellReferences) {
      if (ref.sheet && ref.cell) {
        try {
          ref.value = this.berechnungService.grid.g(ref.sheet, ref.cell);
        } catch (error) {
          ref.value = 'Error: ' + error;
        }
      }
    }
  }
  
  downloadResults(): void {
    const resultsJson = this.berechnungService.grid.serializeResults(true);
    
    // Create a Blob with the JSON data
    const blob = new Blob([resultsJson], { type: 'application/json' });
    
    // Create a URL for the Blob
    const url = window.URL.createObjectURL(blob);
    
    // Create a temporary link element
    const a = document.createElement('a');
    a.href = url;
    a.download = `grid-results-${new Date().toISOString().slice(0, 19).replace(/:/g, '-')}.json`;
    
    // Append to the document, click, and cleanup
    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(url);
    document.body.removeChild(a);
  }

  onInputChange(): void {
    this.saveToSessionStorage();
    this.updateCellValues();
  }

  saveToSessionStorage(): void {
    const refsToSave = this.cellReferences.map(ref => ({
      sheet: ref.sheet,
      cell: ref.cell
    }));
    sessionStorage.setItem('debugOverlayCellRefs', JSON.stringify(refsToSave));
  }

  loadFromSessionStorage(): void {
    const savedCellRefs = sessionStorage.getItem('debugOverlayCellRefs');

    if (savedCellRefs) {
      const cellRefs = JSON.parse(savedCellRefs);

      this.cellReferences = cellRefs.map((ref: any) => ({
        sheet: ref.sheet,
        cell: ref.cell,
        value: null
      }));

      this.updateCellValues();
    } else {
      // Add an empty one by default
      this.addCellRef();
    }
  }
}
