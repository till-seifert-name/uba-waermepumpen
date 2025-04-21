import {Component, OnInit, ViewChild} from '@angular/core';
import {MatSidenav} from "@angular/material/sidenav";
import {EventType, NavigationEnd, Router} from "@angular/router";
import {filter} from "rxjs";


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

}

