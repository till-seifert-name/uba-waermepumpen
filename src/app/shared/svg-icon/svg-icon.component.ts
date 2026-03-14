import {ChangeDetectionStrategy, Component, effect, ElementRef, inject, input, KeyValueChanges, KeyValueDiffer, KeyValueDiffers, OnDestroy, Renderer2, signal} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {Observable, Subscription, of} from 'rxjs';
import {catchError, map, shareReplay} from 'rxjs/operators';
import {DOCUMENT} from '@angular/common';

class SvgIconHelper {
  svg!: SVGElement;
  icnSub!: Subscription;
  differ?: KeyValueDiffer<string, string|number>;
  loaded = false;
}

@Component({
  standalone: true,
  selector: 'svg-icon',
  template: '<ng-content></ng-content>',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class SvgIconComponent implements OnDestroy {
  private element = inject(ElementRef);
  private differs = inject(KeyValueDiffers);
  private renderer = inject(Renderer2);
  private http = inject(HttpClient);
  private document = inject(DOCUMENT);

  // Inputs matching the original library (simplified)
  src = input<string>();
  svgStyle = input<{[klass: string]: any }|null>();
  svg = signal(0);

  private helper = new SvgIconHelper();

  // Cache for loaded SVGs
  private static iconsLoadingByUrl = new Map<string, Observable<SVGElement>>();

  constructor() {
    // Initialize differ right away
    this.helper.differ = this.differs.find({}).create();
    // Watch for src changes
    effect(() => {
      if (this.src()) {
        this.destroy();
        this.init(this.src());
      }
    });

    // Watch for style changes
    effect(() => {
      const values = this.svgStyle() || {};
      if (!this.svg()) return;
      const changes = this.helper.differ!.diff(values);
      if (changes) {
        this.applyChanges(changes);
      }
    });
  }

  ngOnDestroy() {
    this.destroy();
  }

  get elemSvg() {
    return this.element.nativeElement.firstChild;
  }

  private init(src?: string) {
    if (src) {
      const svgObs = this.loadSvg(src);
      if (svgObs) {
        this.helper.icnSub = svgObs.subscribe(svg => this.initSvg(svg));
      }
    } else {
      this.element.nativeElement.innerHTML = '';
      this.svg.set(0);
    }
  }

  private initSvg(svg: SVGElement|undefined): void {
    if (!this.helper.loaded && svg) {
      this.setSvg(svg);
    }
  }

  private destroy() {
    this.helper.icnSub?.unsubscribe();
    this.helper = new SvgIconHelper();
    // initialize differ with empty object
    this.helper.differ = this.differs.find({}).create();
  }

  private loadSvg(url: string): Observable<SVGElement|undefined> | undefined {
    if (SvgIconComponent.iconsLoadingByUrl.has(url)) {
      return SvgIconComponent.iconsLoadingByUrl.get(url);
    }

    const o = this.http.get(url, { responseType: 'text' }).pipe(
      map(svgText => {
        const div = this.document.createElement('DIV');
        div.innerHTML = svgText;
        const svg = div.querySelector('svg') as SVGElement;

        if (svg) {
          // Scope CSS styles to prevent conflicts
          this.scopeSvgStyles(svg, url);
        }

        return svg;
      }),
      catchError(err => {
        console.warn(`Failed to load SVG: ${url}`, err);
        // Return a fallback error icon SVG
        return this.createErrorSvg();
      }),
      shareReplay()
    ) as Observable<SVGElement>;

    SvgIconComponent.iconsLoadingByUrl.set(url, o);
    return o;
  }

  private setSvg(svg: SVGElement) {
    if (!this.helper.loaded && svg) {
      this.helper.svg = svg;
      let icon = svg.cloneNode(true) as SVGElement;
      const elem = this.element.nativeElement;

      elem.innerHTML = '';
      this.renderer.appendChild(elem, icon);
      this.helper.loaded = true;
      this.copyNgContentAttribute(elem, icon);
      this.svg.update(x => x + 1);
    }
  }

  private copyNgContentAttribute(hostElem: any, icon: SVGElement) {
    const attributes = hostElem.attributes as NamedNodeMap;
    const len = attributes.length;
    for (let i = 0; i < len; i += 1) {
      const attribute = attributes.item(i);
      if (attribute && attribute.name.startsWith('_ngcontent')) {
        this.setNgContentAttribute(icon, attribute.name);
        break;
      }
    }
  }

  private setNgContentAttribute(parent: Node, attributeName: string) {
    this.renderer.setAttribute(parent, attributeName, '');
    const len = parent.childNodes.length;
    for (let i = 0; i < len; i += 1) {
      const child = parent.childNodes[i];
      if (child instanceof Element) {
        this.setNgContentAttribute(child, attributeName);
      }
    }
  }

  private applyChanges(changes: KeyValueChanges<string, string|number>) {
    if (!changes) return;

    changes.forEachRemovedItem((record) => this.setStyle(record.key, null));
    changes.forEachAddedItem((record) => this.setStyle(record.key, record.currentValue));
    changes.forEachChangedItem((record) => this.setStyle(record.key, record.currentValue));
  }

  private setStyle(nameAndUnit: string, value: string|number|null|undefined) {
    const [name, unit] = nameAndUnit.split('.');
    value = value !== null && unit ? `${value}${unit}` : value;
    const svg = this.elemSvg;

    if (!svg) return;

    if (value !== null) {
      this.renderer.setStyle(svg, name, value as string);
    } else {
      this.renderer.removeStyle(svg, name);
    }
  }

  private scopeSvgStyles(svgElement: SVGElement, url: string) {
    // Generate unique scope ID from URL
    const scopeId = 'svg-' + this.generateScopeId(url);

    // Add unique data attribute to SVG root
    svgElement.setAttribute('data-svg-scope', scopeId);

    // Find all <style> elements and scope their CSS
    const styleElements = svgElement.querySelectorAll('style');
    styleElements.forEach(styleEl => {
      if (styleEl.textContent) {
        styleEl.textContent = this.scopeCssRules(styleEl.textContent, `svg[data-svg-scope="${scopeId}"]`);
      }
    });
  }

  private generateScopeId(url: string): string {
    // Create a simple hash from the URL
    let hash = 0;
    for (let i = 0; i < url.length; i++) {
      const char = url.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32-bit integer
    }
    return Math.abs(hash).toString(36);
  }

  private scopeCssRules(css: string, scope: string): string {
    // CSS nesting to scope all styles
    return `${scope} {${css}}`;
  }

  private createErrorSvg(): Observable<SVGElement> {
    // Create a simple error icon SVG inline
    const errorSvgText = `
      <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <circle cx="12" cy="12" r="10" fill="#f8d7da" stroke="#721c24" stroke-width="2"/>
        <path d="M12 8v4m0 4h.01" stroke="#721c24" stroke-width="2" stroke-linecap="round"/>
      </svg>
    `;

    const div = this.document.createElement('DIV');
    div.innerHTML = errorSvgText.trim();
    const svg = div.querySelector('svg') as SVGElement;

    return of(svg);
  }
}
