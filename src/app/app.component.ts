import {Component, ElementRef, inject, OnInit, ViewChild} from '@angular/core';
import {MatSidenav} from "@angular/material/sidenav";
import {EventType, NavigationEnd, Router} from "@angular/router";
import {filter} from "rxjs";
import {BerechnungService} from './berechnung.service';


// Helper for Matomo
declare let _paq: any;

@Component({
    selector: 'app-root',
    templateUrl: './app.component.html',
    styleUrls: ['./app.component.scss'],
    standalone: false
})
export class AppComponent implements OnInit {
  @ViewChild(MatSidenav) sidenav: MatSidenav | undefined;
  @ViewChild('fileInput') fileInput!: ElementRef<HTMLInputElement>;

  private berechnungService = inject(BerechnungService);

  constructor(
    private router: Router
  ) {
  }

  ngOnInit() {
    // auto-close side-nav when navigating
    this.router.events.subscribe(() => {
      if (this.sidenav?.opened) {
        this.sidenav.close();
      }
    });

    // Track navigation with Matomo
    this.router.events.pipe(
      filter((event): event is NavigationEnd => 'type' in event && event.type === EventType.NavigationEnd)
    ).subscribe(event => {
      if (typeof (_paq) !== 'undefined') {
        _paq.push(['setCustomUrl', event.urlAfterRedirects]);
        _paq.push(['trackPageView']);
      }
    });
  }

  exportData(): void {
    const blob = new Blob([this.berechnungService.serializeData()], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `uba-waermepumpen-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  }

  triggerImport(): void {
    this.fileInput.nativeElement.click();
  }

  importData(event: Event): void {
    const file = (event.target as HTMLInputElement).files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = e.target?.result as string;
        this.berechnungService.restoreData(data);
        this.berechnungService.initializeRooms();
        alert(`Import erfolgt: ${file.name}.`);
      } catch (error) {
        alert(`Import fehlgeschlagen: ${error}`);
      }
    };
    reader.readAsText(file);

    // Reset file input
    this.fileInput.nativeElement.value = '';
  }

}

