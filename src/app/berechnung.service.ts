import {inject, Injectable} from '@angular/core';
import {Waermepumpen_Eingabedaten, Waermepumpen_Empfehlungen, Waermepumpen_Hinweise} from "./data";
import {DataGrid, WAHR, WENNS} from "./data-grid";
import {BehaviorSubject, debounceTime, filter} from "rxjs";
import {CustomLocalStorageService} from "./custom-local-storage.service";

// Shared Room interface for consistent use across components
export interface Room {
  id: string;
  name: string;
  type: string; // 'cold', 'exterior', 'ceiling', 'windows', 'other'
  data?: any; // For storing room-specific data
}

const STORAGE_KEY = 'UBA-WAERMEPUMPEN-DATA';

@Injectable({
  providedIn: 'root'
})
export class BerechnungService {

  public grid: DataGrid = new DataGrid();

  private storage=inject(CustomLocalStorageService);

  // Room management
  private roomsSubject = new BehaviorSubject<Room[]>([
    // Default sample rooms for development
    {id: '1', name: 'Wohnzimmer', type: 'exterior'},
    {id: '2', name: 'Kinderzimmer', type: 'cold'},
    {id: '3', name: 'Schlafzimmer', type: 'exterior'}
  ]);

  // Observable for components to subscribe to
  public rooms$ = this.roomsSubject;

  // Currently selected room
  private selectedRoomSubject = new BehaviorSubject<string>('');
  public selectedRoom$ = this.selectedRoomSubject;

  constructor() {
    const grid = this.grid;

    for (const [cell, content] of Object.entries(Waermepumpen_Eingabedaten)) {
      grid.setCell("Names", cell, content);
    }

    for (const [cell, content] of Object.entries(Waermepumpen_Empfehlungen)) {
      grid.setCell("Names", cell, content);
    }

    for (const [cell, content] of Object.entries(Waermepumpen_Hinweise)) {
      grid.setCell("Names", cell, content);
    }

    /**
     * Wärmepumpen-Berechnungslogik
     * -----------------------------
     * Placeholder for Wärmepumpen calculation functions.
     * These will be implemented in detail as the project progresses.
     */

    // Basic Wärmepumpentyp-Empfehlung (placeholder)
    grid.setCell("Names", "E_WP0", (sheet, cell, grid) => {
      const {
        A_JN1,
        A_JN2,
        A_GB1,
        A_HK1,
        A_HK2,
        E_WP1,
        F_GB1,
        F_BJ1,
        F_HK1
      } = grid.cells["Names"];

      // Simple placeholder logic
      return WENNS(
        // Basic recommendation based on building type
        F_GB1 === A_GB1,
        E_WP1,

        // Default case
        WAHR(),
        ""
      );
    });

    // Basic Energieeffizienz-Empfehlung (placeholder)
    grid.setCell("Names", "E_EF0", (sheet, cell, grid) => {
      const {
        E_EF1,
        F_BJ1
      } = grid.cells["Names"];

      // Simple placeholder logic
      return WENNS(
        // Basic recommendation for buildings
        F_BJ1 !== "",
        E_EF1,

        // Default case
        WAHR(),
        ""
      );
    });


    // load saved state

    // Subscribe to (some) cell changes save to localStorage
    grid.onCellChanged().pipe(
      filter(cellChange => this.cellsToSave.includes(cellChange.cell)),
      debounceTime(1000)
    ).subscribe(cellChange => {
      console.log(`Cell changed: ${cellChange.sheet}!${cellChange.cell} = ${cellChange.value}`);
      this.storage.set<string>(STORAGE_KEY, grid.serializeWhitelistedCells(this.cellsToSave));
    });

    // Restore cells from localStorage if available
    const serializedData = this.storage.get<string>(STORAGE_KEY);
    if (serializedData) {
      grid.restoreCells(serializedData);
      console.log(`Input restored: ${serializedData}`);
    }
  }

  /**
   * Cells to load/save for the Wärmepumpen tool
   */
  private cellsToSave: string[] = [
    // Basic building properties
    'F_GB1', // Gebäudetyp
    'F_BJ1', // Baujahr
    'F_WF1', // Wohnfläche
    'F_HK1', // Heizungsart

    // These will be expanded as the tool is developed
  ];

  resetInputs() {
    this.grid.clearListed(this.cellsToSave);
  }

// Room management methods
  setSelectedRoom(roomId: string): void {
    this.selectedRoomSubject.next(roomId);
  }

  addRoom(name: string, type: string): string {
    const rooms = this.roomsSubject.getValue();
    const newId = Date.now().toString();

    const newRoom: Room = {
      id: newId,
      name: name.trim(),
      type: type
    };

    this.roomsSubject.next([...rooms, newRoom]);
    return newId;
  }

  removeRoom(roomId: string): void {
    const rooms = this.roomsSubject.getValue().filter(room => room.id !== roomId);
    this.roomsSubject.next(rooms);

    // If the selected room was removed, select another one or none
    if (this.selectedRoomSubject.getValue() === roomId) {
      const newSelectedId = rooms.length > 0 ? rooms[0].id : '';
      this.setSelectedRoom(newSelectedId);
    }
  }

  updateRoomData(roomId: string, data: any): void {
    const rooms = this.roomsSubject.getValue();
    const updatedRooms = rooms.map(room => {
      if (room.id === roomId) {
        return {...room, data: {...room.data, ...data}};
      }
      return room;
    });

    this.roomsSubject.next(updatedRooms);
  }
}
