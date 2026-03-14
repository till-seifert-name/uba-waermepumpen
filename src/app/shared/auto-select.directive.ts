import {Directive, HostListener} from '@angular/core';

/**
 * Automatically select text in number input fields when they receive focus after a direct click.
 * This allows users to immediately type a new value
 * without having to select or delete existing content.
 *
 * automatically applies to all number inputs
 */
@Directive({
  standalone: false,
  selector: 'input[type="number"]'
})
export class AutoSelectDirective {
  /** tracks whether the upcoming focus was initiated by a pointer press on this element */
  private pointerTriggeredFocus = false;
  /** safety window to avoid stale flags if focus doesn't occur */
  private resetTimer: any = null;

  @HostListener('pointerdown')
  onPointerDown(): void {
    this.pointerTriggeredFocus = true;

    // reset flag if focus doesn't happen shortly after
    clearTimeout(this.resetTimer);
    this.resetTimer = setTimeout(() => (this.pointerTriggeredFocus = false), 500);
  }

  @HostListener('focus', ['$event'])
  onFocus(event: FocusEvent): void {
    const target = event.target as HTMLInputElement | null;
    if (!target || target.type !== 'number') return;

    if (this.pointerTriggeredFocus) {
      // defer to ensure the element is fully focused before selecting
      setTimeout(() => {
        try {
          target.select();
        } finally {
          // clear flag so subsequent programmatic/keyboard focuses don't select
          this.pointerTriggeredFocus = false;
          clearTimeout(this.resetTimer);
        }
      }, 0);
    }
  }

  @HostListener('blur')
  onBlur(): void {
    // cleanup in case focus/blur cycles happen quickly
    this.pointerTriggeredFocus = false;
    clearTimeout(this.resetTimer);
  }
}
