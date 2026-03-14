import {Injectable} from '@angular/core';
import {BehaviorSubject, filter, fromEvent} from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class CustomLocalStorageService {
  private readonly PREFIX = 'uba_wp_' as const;
  private readonly isBrowser = typeof window !== 'undefined' && !!window.localStorage;

  // Map of BehaviorSubjects for each storage key
  private storedValues = new Map<string, BehaviorSubject<any>>();

  constructor() {
    if (this.isBrowser) {
      this.initStorageListener();
    }
  }

  private formatKey(key: string) {
    return `${this.PREFIX}${key}`;
  }

  private stripPrefix(key: string) {
    return key.substring(this.PREFIX.length);
  }

  private initStorageListener(): void {

    fromEvent<StorageEvent>(window, 'storage').pipe(
      filter(event => (event.key ?? '').startsWith(this.PREFIX)),
      filter(event => event.newValue !== null),
    ).subscribe(event => {
      try {
        const key = this.stripPrefix(event.key ?? '');
        const newData = event.newValue ? JSON.parse(event.newValue) : null;

        console.log(`received storage event for key: ${key}`);

        // Get Subject for this key
        const subject = this.getObservable(key);
        // Update Subject if new data is different
        if (JSON.stringify(newData) != JSON.stringify(subject.value)) {
          subject.next(newData);
        }

      } catch (e) {
        console.error(`error parsing storage event data:`, e);
      }
    });
  }

  getObservable<T>(key: string): BehaviorSubject<T | null> {
    if (!this.storedValues.has(key)) {
      // Initialize with current localStorage value
      this.storedValues.set(key, new BehaviorSubject(this.get<T>(key)));
    }
    return this.storedValues.get(key)!;
  }

  set<T>(key: string, value: T): void {
    if (!this.isBrowser) return;
    try {
      const serializedValue = JSON.stringify(value);
      if (localStorage.getItem(this.formatKey(key)) === serializedValue) {
        return;
      }
      localStorage.setItem(this.formatKey(key), serializedValue);
    } catch (e) {
      console.error('Error saving to localStorage', e);
    }
  }

  get<T>(key: string): T | null {
    if (!this.isBrowser) return null;
    try {
      const item = localStorage.getItem(this.formatKey(key));
      return item ? JSON.parse(item) : null;
    } catch (e) {
      console.error('Error reading from localStorage', e);
      return null;
    }
  }

  remove(key: string): void {
    if (!this.isBrowser) return;
    localStorage.removeItem(this.formatKey(key));
  }

  clear(): void {
    if (!this.isBrowser) return;
    Object.keys(localStorage).forEach((key) => {
      if (key.startsWith(this.PREFIX)) {
        localStorage.removeItem(key);
      }
    });
  }
}
