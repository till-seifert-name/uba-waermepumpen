import {Component, TrackByFunction, OnInit, OnDestroy, AfterViewInit} from '@angular/core';
import {BerechnungService, Room} from '../../berechnung.service';
import {Router} from '@angular/router';
import {DataGrid} from '../../data-grid';
import {OUT_ROOMS_COLS} from "../../formula-overlays/base-overlay";


@Component({
  selector: 'app-ergebnis-assessment',
  standalone: false,
  templateUrl: './ergebnis-assessment.component.html',
  styleUrl: './ergebnis-assessment.component.scss'
})
export class ErgebnisAssessmentComponent implements OnInit{

  get grid(): DataGrid {
    return this.berechnungService.grid;
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
    private router: Router
  ) {
  }

  /**
   * Navigate to room detail page
   */
  navigateToRoom(roomId: number): void {
    this.router.navigate(['/raeume/detail-ergebnis'], {queryParams: {room: roomId}});
  }

  protected readonly location = location;

  roomId: TrackByFunction<Room> = (_, r) => r.id;


  ngOnInit(): void {
    this.rooms = this.berechnungService.getAllRooms();
  }
}
