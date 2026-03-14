import {AfterViewInit, Component, ElementRef, OnDestroy, OnInit, TrackByFunction} from '@angular/core';
import {BerechnungService, Room} from '../../berechnung.service';
import {ActivatedRoute, NavigationEnd, Router} from '@angular/router';
import {DataGrid} from '../../data-grid';
import {OUT_ROOMS_COLS} from "../../formula-overlays/base-overlay";
import {filter, Subscription} from "rxjs";
import {startWith} from "rxjs/operators";
import {AppComponent} from '../../app.component';


@Component({
  selector: 'app-ergebnis-assessment',
  standalone: false,
  templateUrl: './ergebnis-assessment.component.html',
  styleUrl: './ergebnis-assessment.component.scss'
})
export class ErgebnisAssessmentComponent implements OnInit, AfterViewInit, OnDestroy {

  private sub?: Subscription;

  get grid(): DataGrid {
    return this.berechnungService.grid;
  }

  get basePath() {
    return AppComponent.basePath;
  }

  /**
   * Helper method to get the room column in OUT_rooms sheet
   */
  getRoomOutColumn(roomId: number) {
    return OUT_ROOMS_COLS[roomId - 1]
  }

  public rooms: Room[] = [];

  constructor(
    public berechnungService: BerechnungService,
    private router: Router,
    private route: ActivatedRoute,
    private host: ElementRef<HTMLElement>
  ) {
  }

  ngAfterViewInit() {
    // react to fragment changes
    this.sub = this.router.events
      .pipe(filter(ev => ev instanceof NavigationEnd), startWith())
      .subscribe(() => this.scrollToSection(this.route.snapshot.fragment));
  }

  ngOnDestroy() {
    this.sub?.unsubscribe();
  }

  /**
   * Navigate to room detail page
   */
  navigateToRoom(roomId: number): void {
    this.router.navigate(['/gebaeude/raeume/detail-ergebnis'], {queryParams: {room: roomId}});
  }

  /**
   * Scroll to section using Angular router
   */
  scrollToSection(fragmentId: string | null, event?: Event): void {
    if (event) {
      event.preventDefault(); // Prevent default anchor behavior
    }

    // Scroll to fragment
    if (fragmentId) {
      // scroll to top (or first section) when no fragment
      (this.host.nativeElement.querySelector(`#${fragmentId}`) ?? this.host.nativeElement.querySelector(`[id]`))
        ?.scrollIntoView({behavior: 'smooth', block: 'start'});
    }
  }

  roomId: TrackByFunction<Room> = (_, r) => r.id;


  ngOnInit(): void {
    this.rooms = this.berechnungService.getAllRooms();
  }

  /**
   * Open browser print dialog
   */
  print(): void {
    window.print();
  }
}
