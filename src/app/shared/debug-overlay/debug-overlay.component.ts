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
    // Meta (Windows key) + D
    if (event.metaKey && event.key === 'd') {
      event.preventDefault();
      this.toggleVisibility();
    }
  }

  toggleVisibility(): void {
    this.isVisible = !this.isVisible;
    sessionStorage.setItem('debugOverlayVisible', JSON.stringify(this.isVisible));
  }

  addCellRef(): void {
    this.cellReferences.push({ sheet: '', cell: '', value: null });
    this.saveToSessionStorage();
  }

  removeCellRef(index: number): void {
    this.cellReferences.splice(index, 1);
    this.saveToSessionStorage();
  }

  updateCellValues(): void {
    this.berechnungService.grid.clearResults();
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
