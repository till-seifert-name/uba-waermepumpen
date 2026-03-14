/// <reference types="@angular/localize" />

import {AppModule} from './app/app.module';
import {platformBrowser} from "@angular/platform-browser";

platformBrowser().bootstrapModule(AppModule, {
  ngZoneEventCoalescing: true,
})
  .catch(err => console.error(err));

// block native tooltip on abbr[title], as it has a css tooltip
// for both regular document and shadow DOM in web components
{
  const seen = new WeakSet<Element>();

  const handlePointerOver = (ev: Event) => {
    const target = ev.target as Element | null;
    if (!target) return;
    // go to parent with [title] if needed
    const el = target.closest?.('abbr[title]');

    if (!el) return;
    if (seen.has(el)) return;

    // block click when the abbr is inside a label or so
    el.addEventListener('click', ev => ev.preventDefault());

    const t = el.getAttribute('title');
    if (!t) return;

    el.setAttribute('data-title', t);
    // remove title but keep attr for styling
    el.setAttribute('title', '');
    seen.add(el);
  };

  // Listen on document for regular pages
  document.addEventListener('pointerover', handlePointerOver, true);

  // Also listen on all web component shadow roots when they're created
  const originalAttachShadow = Element.prototype.attachShadow;
  Element.prototype.attachShadow = function(options: ShadowRootInit) {
    const shadowRoot = originalAttachShadow.call(this, options);
    document.removeEventListener('pointerover', handlePointerOver);
    shadowRoot.addEventListener('pointerover', handlePointerOver, true);
    return shadowRoot;
  };
}

