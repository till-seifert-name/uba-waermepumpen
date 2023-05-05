import {Component, OnInit, ViewChild} from '@angular/core';
import {MatSidenav} from "@angular/material/sidenav";
import {Router} from "@angular/router";


@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
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
  }

}

