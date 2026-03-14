import {Component, ElementRef, HostListener, inject, Input, OnInit, Renderer2, ViewChild, ViewEncapsulation} from '@angular/core';
import {EventType, NavigationEnd, Router} from "@angular/router";
import {filter} from "rxjs";
import {BerechnungService} from './berechnung.service';
import {CustomLocalStorageService} from './custom-local-storage.service';


// Helper for Matomo
declare let _paq: any;

@Component({
    selector: 'uba-waermepumpen', // must match the custom element name
    templateUrl: './app.component.html',
    styleUrls: ['./app.component.scss'],
    standalone: false,
    encapsulation: ViewEncapsulation.ShadowDom
})
export class AppComponent implements OnInit {
  static basePath: string;

  @ViewChild('fileInput') fileInput!: ElementRef<HTMLInputElement>;

  /**
   * Scroll threshold in pixels from top after which the scrolled class is added
   */
  @Input() scrollThreshold: number = 100;

  /**
   * CSS class to add when scrolled past threshold
   */
  @Input() scrolledClassName: string = 'scrolled';

  private isScrolled = false;

  private berechnungService = inject(BerechnungService);
  private storageService = inject(CustomLocalStorageService);

  constructor(
    private router: Router,
    private elementRef: ElementRef,
    private renderer: Renderer2
  ) {
    // Store web component source path to reference ressources
    // For localhost development (ng serve), use relative paths from root
    const isLocalhost = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
    AppComponent.basePath = isLocalhost ? '' : new URL('.', import.meta.url).href;
  }

  get basePath() {
    return AppComponent.basePath;
  }

  ngOnInit() {
    // Track navigation with Matomo
    this.router.events.pipe(
      filter((event): event is NavigationEnd => 'type' in event && event.type === EventType.NavigationEnd)
    ).subscribe(event => {
      if (typeof (_paq) !== 'undefined') {
        _paq.push(['setCustomUrl', event.urlAfterRedirects]);
        _paq.push(['trackPageView']);
      }
    });

    // Load fonts for web component
    this.loadWebComponentFonts();
  }

  /**
   * Listen to scroll events on the host element
   */
  @HostListener('scroll', ['$event'])
  onScroll(event: Event): void {
    const target = event.target as HTMLElement;
    const scrollTop = target.scrollTop || 0;

    // Check if scrolled past threshold
    if (scrollTop >= this.scrollThreshold && !this.isScrolled) {
      this.isScrolled = true;
      this.renderer.addClass(this.elementRef.nativeElement, this.scrolledClassName);
    } else if (scrollTop < this.scrollThreshold && this.isScrolled) {
      this.isScrolled = false;
      this.renderer.removeClass(this.elementRef.nativeElement, this.scrolledClassName);
    }
  }

  /**
   * Load fonts programmatically for web component usage
   */
  private async loadWebComponentFonts() {
    // Check if we're running as a web component (Shadow DOM)
    if (!(this as any).shadowRoot && !document.querySelector('uba-waermepumpen')) {
      return; // Not a web component, fonts are loaded via CSS
    }

    const fontUrls = [
      // Open Sans Variable Font (supports weights 300-800)
      { url: `${AppComponent.basePath}media/OpenSans-Variable.woff2`, family: 'Open Sans', weight: '300 800' },

      // Bootstrap Icons
      { url: `${AppComponent.basePath}media/bootstrap-icons.woff2`, family: 'bootstrap-icons', weight: '400' },

      // Noto Emoji with unicode-range
      {
        url: `${AppComponent.basePath}media/NotoEmoji-Regular.ttf`,
        family: 'Noto Emoji',
        weight: '400',
        unicodeRange: 'U+1F1E6-1F1FF, U+1F300-1F5FF, U+1F600-1F64F, U+1F680-1F6FF, U+1F700-1F77F, U+1F780-1F7FF, U+1F800-1F8FF, U+1F900-1F9FF, U+1FA00-1FA6F, U+1FA70-1FAFF, U+2300-23FF, U+2600-26FF, U+2700-27BF, U+FE00-FE0F, U+200D'
      },
    ];

    // Load all fonts
    const fontPromises = fontUrls.map(font => this.loadWebComponentFont(font));
    await Promise.all(fontPromises);
  }

  /**
   * Load individual font for web component
   */
  private async loadWebComponentFont({url, family, weight = '400', unicodeRange = ''}: { url: string, family: string, weight?: string, unicodeRange?: string }) {
    try {
      const fontDescriptor: FontFaceDescriptors = {
        weight: weight,
        display: 'swap'
      };

      // Add unicode-range if specified
      if (unicodeRange) {
        fontDescriptor.unicodeRange = unicodeRange;
      }

      const font = new FontFace(
        family,
        `url(${url})`,
        fontDescriptor
      );

      // Add font to document fonts
      if (document.fonts && document.fonts.add) {
        document.fonts.add(font);
        await font.load();
        console.log(`Font "${family}" with weight ${weight} loaded successfully.`);
      }
    } catch (error) {
      console.warn(`Failed to load font "${family}" with weight ${weight}:`, error);
    }
  }

  exportData(): void {
    const blob = new Blob([this.berechnungService.serializeData(true)], { type: 'application/json' });
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
        alert(`Import erfolgreich: ${file.name}`);
      } catch (error) {
        console.error('Import error:', error);

        // Provide specific error messages based on error type
        let errorMessage = 'Import fehlgeschlagen: ';
        if (error instanceof SyntaxError) {
          errorMessage += `Die Datei "${file.name}" ist keine gültige JSON-Datei.`;
        } else if (error instanceof Error && error.message.includes('Invalid data format')) {
          errorMessage += `Die Datei "${file.name}" hat nicht das richtige Format für eine Projektdatei.`;
        } else {
          errorMessage += `Die Datei "${file.name}" konnte nicht geladen werden. Bitte stellen Sie sicher, dass es sich um eine gültige Projektdatei handelt.`;
        }

        alert(errorMessage);
      }
    };
    reader.readAsText(file);

    // Reset file input
    this.fileInput.nativeElement.value = '';
  }

  resetData(): void {
    if (confirm('Alle Eingaben werden zurückgesetzt und können nicht wiederhergestellt werden. Fortfahren?')) {
      this.berechnungService.resetInputs();
      this.storageService.clear();
      this.berechnungService.initializeRooms();
      this.router.navigate(['/']);
    }
  }

}

