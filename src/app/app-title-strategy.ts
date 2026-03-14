import { Injectable } from '@angular/core';
import { Title } from '@angular/platform-browser';
import { RouterStateSnapshot, TitleStrategy } from '@angular/router';

@Injectable({ providedIn: 'root' })
export class AppTitleStrategy extends TitleStrategy {
  private readonly baseTitle: string;

  constructor(private readonly title: Title) {
    super();
    // Capture the initial window title when the app loads
    this.baseTitle = this.title.getTitle();
  }

  override updateTitle(routerState: RouterStateSnapshot) {
    const routeTitle = this.buildTitle(routerState);
    if (routeTitle) {
      this.title.setTitle(`${this.baseTitle} - ${routeTitle}`);
    } else {
      this.title.setTitle(this.baseTitle);
    }
  }
}
