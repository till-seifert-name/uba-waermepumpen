import {Injectable} from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class CustomLocalStorageService {
  private readonly PREFIX = 'uba_wp_';
  private readonly isBrowser = typeof window !== 'undefined' && !!window.localStorage;

  private formatKey(key: string): string {
    return `${this.PREFIX}${key}`;
  }

  set<T>(key: string, value: T): void {
    if (!this.isBrowser) return;
    try {
      const serializedValue = JSON.stringify(value);
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
