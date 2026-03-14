import {inject, Injectable} from '@angular/core';
import {DataGrid, parseCellReference} from "./data-grid";
import {BehaviorSubject, debounceTime, filter, tap} from "rxjs";
import {CustomLocalStorageService} from "./custom-local-storage.service";
import {databaseRanges, explicitNamedRanges, namedExpressions, sheetsData} from '../../WP_Check_Methode_v1_ts_export/master';
import {applyFormulaOverlays} from "./formula-overlays";
import {IN_ROOM_COLS} from "./formula-overlays/base-overlay";

/**
 * UBA Wärmepumpen Berechnungsservice - Data Model Documentation
 * ==========================================================
 *
 * This service provides the central data management and calculation functionality for the UBA Wärmepumpen application.
 * It's designed around an Excel-like DataGrid that serves as the single source of truth for all application data.
 *
 * ## Data Model Structure
 *
 * The data is organized in an Excel-like grid with sheets and cells:
 *
 * ### Main Sheets:
 * - IN_build: Contains general building properties
 * - IN_rooms: Contains room-specific properties
 * - Names: Contains named ranges and expressions
 * - Daten: Contains UI metadata, options, and reference values
 *
 * ### Daten Sheet Structure (UI Definition):
 * - Column F: Parameter name/ID
 * - Column G: UI label (displayed text)
 * - Column H: UI help text
 * - Column I: Data type
 * - Column J: Condition to show UI control
 * - Column K: Unit (°C, m², etc.)
 * - Column L: Technical data type
 * - Column M: Required flag
 * - Column N: Decimal places
 * - Column O: Minimum value
 * - Column P: Maximum value
 * - Columns R onwards: User input for rooms
 *
 * ### Building Data (IN_build sheet):
 * - Basic building information: columns P-U, rows 2-5
 * - Retrofitting properties: columns P-U, rows 7-11
 * - Heating properties: columns P-U, rows 12-21
 *
 * ### Room Data (IN_rooms sheet):
 * - Each room is assigned a column from R to AF (up to 15 rooms)
 * - Column R = Room 1, S = Room 2, etc.
 * - Basic properties: rows 3-9
 *   - Row 3: Room names
 *   - Row 4: Room areas (m²) - a value > 0 indicates an active room
 *   - Row 5: Room heights (m)
 *   - Row 6: Room temperatures (°C)
 *   - Row 7: Ceiling types
 *   - Row 8: Floor types
 *   - Row 9: Wall lengths (m)
 *
 * - Wall properties:
 *   - Row 11: Insulation thickness (cm)
 *
 * - Window properties (up to 3 window types per room):
 *   - Window type 1: rows 13-16
 *   - Window type 2: rows 18-21
 *   - Window type 3: rows 23-26
 *   - For each type: width (cm), height (cm), year, count
 *
 * - Interior walls against unheated spaces:
 *   - Row 25: Has interior walls (Ja/Nein) - EXIST_innerwall
 *   - Row 26: Interior wall length (m) - L_innerwall_tot
 *   - Row 27: Interior wall insulation thickness (cm) - L_innerwall_ins
 *
 * - Roof-related properties:
 *   - Row 28: Has roof slope (Ja/Nein) - EXIST_roof
 *   - Row 29: Has multiple roof slopes (Ja/Nein) - NO_roof_slop
 *   - Row 30: Roof width/length (m) - L_roof_wid
 *   - Row 31: Roof height (m) - L_roof_hei
 *   - Row 32: Horizontal ceiling width (m) - topceil width
 *   - Row 33: Horizontal ceiling length (m) - topceil length
 *   - Row 34: Knee wall height (m) - L_roof_jamb_hei
 *   - Row 35: Is knee wall hollow (Ja/Nein) - TYP_jamb_hei
 *   - Row 39: Internal knee wall height (m) - internal height
 *   - Row 40: Has dormer (Ja/Nein) - EXIST_dormer
 *
 * - Roof window properties (up to 2 window types per room):
 *   - Roof window type 1: rows 41-44
 *     - Row 41: Width (cm) - L_roof_win1_wid
 *     - Row 42: Height (cm) - L_roof_win1_hei
 *     - Row 43: Year - YEAR_roof_win1
 *     - Row 44: Count - NO_roof_win1
 *   - Roof window type 2: rows 45-48
 *     - Row 45: Width (cm) - L_roof_win2_wid
 *     - Row 46: Height (cm) - L_roof_win2_hei
 *     - Row 47: Year - YEAR_roof_win2
 *     - Row 48: Count - NO_roof_win2
 *
 * ### UI Parameter Metadata (IN_rooms sheet)
 * The sheet contains detailed metadata for each parameter shown in the UI:
 *
 * Example parameters:
 *
 * | Row | Variable    | UI Label                | Type      | Unit | Description                                        |
 * |-----|-------------|-------------------------|-----------|------|----------------------------------------------------|
 * | 6   | T_air_set   | Gewünschte Raumtemperatur | Freitext | °C   | Default temperature for rooms (20°C for living spaces, 24°C for bathrooms) |
 * | 7   | TYP_V_above | Decke grenzt an         | Dropdown  |      | Type of ceiling boundary (heated/unheated/outside) |
 * | 9   | L_wall_tot  | Gesamtlänge der Außenwände | Freitext | m   | Total length of exterior walls                    |
 * | 11  | D_wall_ins  | Abweichende Dämmstärke  | Freitext  | cm   | Wall insulation thickness (if different from building) |
 * | 25  | TYP_V_int_flag | Innenwände gegen unbeheizt vorhanden? | Toggle |  | Whether interior walls against unheated spaces exist |
 * | 26  | L_int_wall  | Gesamtlänge der Innenwände | Freitext | m   | Total length of interior walls against unheated spaces |
 * | 27  | D_int_wall_ins | Dämmung vorhanden?   | Freitext  | cm   | Interior wall insulation thickness                |
 *
 * - Heating elements (up to 2 heating elements per room):
 *   - Heating type 1: rows 30-33
 *   - Heating type 2: rows 35-38
 *   - For each type: heating type, length (cm), height (cm), count
 *
 * ## Data Access Guidelines
 *
 * ### Preferred Way to Access Data:
 * 1. Use the provided getter/setter methods in this service rather than direct grid access
 * 2. Access the DataGrid directly in component templates using the getter methods
 *    Example: [ngModel]="berechnungService.getRoomName(roomId)"
 *                    (ngModelChange)="berechnungService.setRoomName(roomId, $event)"
 * 3. Don't create intermediate view models or state variables in components
 * 4. Subscribe to rooms$ observable to react to room list changes
 *
 * ### Room Management:
 * - Rooms are considered active when they have a non-empty name
 * - Inactive rooms (empty name) are not displayed in room lists
 * - Only the last room in the list can be removed (to maintain contiguous IDs)
 * - New rooms are added in the first available slot (column)
 *
 * ### Window and Heating Element Management:
 * - Elements with width/length = 0 are considered inactive
 * - Set width/length to 0 to "remove" an element rather than deleting the data
 * - Use the type parameter in getter/setter methods to access different elements
 *   Example: getWindowWidth(roomId, 2) for the second window type
 */

// Shared Room interface for consistent use across components
export interface Room {
  id: number;     // Room ID is the 1-based index matching the room column (1-15)
  name: string;   // Room name from the IN_rooms sheet
  type?: string;   // Room type: 'cold', 'exterior', 'ceiling', 'windows', 'other'
}

export type HeaterType =
  | typeof sheetsData.Daten['I4']
  | typeof sheetsData.Daten['I5']
  | typeof sheetsData.Daten['I6']
  | typeof sheetsData.Daten['I7']
  | typeof sheetsData.Daten['I8'];

export type RoofSurfaceType =
  | typeof sheetsData.Daten['B29']  // "Keine"
  | typeof sheetsData.Daten['B30']  // "Eine"
  | typeof sheetsData.Daten['B31']  // "Zwei (symmetrisch)"
  | typeof sheetsData.Daten['B32']  // "Komplex"
  | typeof sheetsData.Daten['B33']; // "Flachdach"

const STORAGE_KEY = 'UBA-WAERMEPUMPEN-DATA';

@Injectable({
  providedIn: 'root'
})
export class BerechnungService {

  public grid: DataGrid = new DataGrid();

  private storage=inject(CustomLocalStorageService);

  // Room management
  public rooms$ = new BehaviorSubject<Room[]>([]);

  // Currently selected room
  private selectedRoomSubject = new BehaviorSubject<number>(1);
  public selectedRoom$ = this.selectedRoomSubject;



  constructor() {
    const grid = this.grid;

    // Benannte Bereiche aus Workbook
    for (const [cell, content] of Object.entries(namedExpressions)) {
      grid.setCell("Names", cell, content);
    }

    for (const [cell, content] of Object.entries(explicitNamedRanges)) {
      grid.setCell("Names", cell, content);
    }

    for (const [cell, content] of Object.entries(databaseRanges)) {
      grid.setCell("Names", cell, content);
    }

    for (const [sheet, sheetData] of Object.entries(sheetsData)) {
      for (const [cell, content] of Object.entries(sheetData)) {
        grid.setCell(sheet, cell, content);
      }
    }

    /**
     * Berechnungslogik
     * -----------------------------
     * Apply formula overlays to implement excel-like calculations
     */
    applyFormulaOverlays(grid);

    // load saved state

    // Subscribe to (some) cell changes save to localStorage
    grid.onCellChanged().pipe(
      filter(cellChange => this.cellsToSave.some(ref => {
        const [refSheet, refCell] = parseCellReference(ref);
        return refSheet === cellChange.sheet && refCell === cellChange.cell;
      })),
      tap(cellChange => {
        console.log(`[BerechnungService] Cell changed: ${cellChange.sheet}!${cellChange.cell} = ${cellChange.value}`);
      }),
      debounceTime(1000)
    ).subscribe(_cellChange => {
      console.log(`[BerechnungService] Saving data to localStorage`);
      this.storage.set<string>(STORAGE_KEY, this.serializeData());
    });

    // Subscribe to localStorage updates
    this.storage.getObservable<string>(STORAGE_KEY).subscribe(data => {
      if (data !== null) {
        console.log(`[BerechnungService] Importing data...`);
        this.restoreData(data);
        console.log(`[BerechnungService] Data import completed`);
      }
      this.initializeRooms(); // Refresh rooms after importing data
    });
  }

  // Dynamically generate a list of cells to save for room data
  private generateRoomCellsToSave(): string[] {
    const cells: string[] = [];
    // Basic room properties (rows 3-9)
    for (let row = 3; row <= 9; row++) {
      IN_ROOM_COLS.forEach(col => cells.push(`IN_rooms!${col}${row}`));
    }

    // Wall modernization year (row 10)
    IN_ROOM_COLS.forEach(col => cells.push(`IN_rooms!${col}10`));

    // Wall insulation thickness (row 11)
    IN_ROOM_COLS.forEach(col => cells.push(`IN_rooms!${col}11`));

    // Window properties for 3 window types (rows 13-26)
    // Type 1: rows 13-16
    // Type 2: rows 18-21
    // Type 3: rows 23-26
    for (let windowType = 0; windowType < 3; windowType++) {
      for (let i = 0; i < 4; i++) { // 4 properties per window type: width, height, year, count
        const row = 13 + (windowType * 5) + i; // 5 row spacing between types
        IN_ROOM_COLS.forEach(col => cells.push(`IN_rooms!${col}${row}`));
      }
    }

    // Interior walls against unheated spaces (rows 25-27)
    // Row 25: Has interior walls (Ja/Nein)
    // Row 26: Interior wall length (m)
    // Row 27: Interior wall insulation thickness (cm)
    for (let row = 25; row <= 27; row++) {
      IN_ROOM_COLS.forEach(col => cells.push(`IN_rooms!${col}${row}`));
    }

    // Roof-related properties (rows 28-35, 39, and 40)
    // Add specific rows for roof properties
    for (let row = 28; row <= 35; row++) {
      IN_ROOM_COLS.forEach(col => cells.push(`IN_rooms!${col}${row}`));
    }

    // Roof window properties (rows 41-48)
    // Type 1: rows 41-44
    // Type 2: rows 45-48
    for (let row = 41; row <= 48; row++) {
      IN_ROOM_COLS.forEach(col => cells.push(`IN_rooms!${col}${row}`));
    }

    // Heating elements for 3 heating types (rows 49-69)
    // Type 1: rows 49-55 (TYP_1_rad1, TYP_2_rad1, L_rad1_hei, L_rad1_wid, L_rad1_thick, n_rad1_col, n_rad1)
    // Type 2: rows 56-62 (TYP_1_rad2, TYP_2_rad2, L_rad2_hei, L_rad2_wid, L_rad2_thick, n_rad2_col, n_rad2)
    // Type 3: rows 63-69 (TYP_1_rad3, TYP_2_rad3, L_rad3_hei, L_rad3_wid, L_rad3_thick, n_rad3_col, n_rad3)
    for (let heatingType = 0; heatingType < 3; heatingType++) {
      for (let i = 0; i < 7; i++) { // 7 properties per heating type: main type, subtype, height, width, depth, element count, count
        const row = 49 + (heatingType * 7) + i; // 7 row spacing between types
        IN_ROOM_COLS.forEach(col => cells.push(`IN_rooms!${col}${row}`));
      }
    }

    return cells;
  }

  /**
   * Cells to load/save for the Wärmepumpen tool (in Sheet!Cell format)
   */
  private cellsToSave: string[] = [
    // Basic building properties
    'IN_build!P2', // PLZ/Standort des Gebäudes
    'IN_build!P3', // Gebäudetyp (Ein- oder Zweifamilienhaus, Reihenhaus, Mehrfamilienhaus)
    'IN_build!P4', // Dachform (Flach bzw. Flachdach, geneigt, steil, sehr steil)
    'IN_build!P5', // Baujahr

    // Retrofitting properties
    // Wall
    'IN_build!Q7',  // Außenwand upgraded (Ja/Nein)
    'IN_build!S7',  // Außenwand modernization year
    'IN_build!U7',  // Außenwand insulation thickness

    // Windows
    'IN_build!Q8',  // Fenster upgraded (Ja/Nein)
    'IN_build!S8',  // Fenster modernization year

    // Roof
    'IN_build!Q9',  // Dach upgraded (Ja/Nein)
    'IN_build!S9',  // Dach modernization year
    'IN_build!U9',  // Dach insulation thickness

    // Basement/Floor
    'IN_build!Q10', // Kellerdecke/Fußboden upgraded (Ja/Nein)
    'IN_build!S10', // Kellerdecke/Fußboden modernization year
    'IN_build!U10', // Kellerdecke/Fußboden insulation thickness

    // Top Floor Ceiling
    'IN_build!Q11', // Oberste Geschossdecke upgraded (Ja/Nein)
    'IN_build!S11', // Oberste Geschossdecke modernization year
    'IN_build!U11', // Oberste Geschossdecke insulation thickness

    // Heating properties
    'IN_build!P12', // Effizienzklasse bekannt
    'IN_build!P13', // Denkmalschutz (Ja/Nein)
    'IN_build!P14', // Heizungsart (Heizkörper, Fußbodenheizung, etc.)
    'IN_build!P15', // Wärmeverteilung (Zweirohrheizung, Einrohrheizung)

    // Flow temperature properties
    'IN_build!P16', // Vorlauftemperatur bekannt (Ja/Nein)
    'IN_build!P17', // Vorlauftemperatur am Auslegungspunkt
    'IN_build!P18', // Kann Vorlauftemperatur messen (Ja/Nein)
    'IN_build!P19', // Aktuelle Vorlauftemperatur
   // 'IN_build!P20', // Aktuelle Außentemperatur
   // 'IN_build!P21', // Gibt es Räume, die nicht ausreichend warm werden (Ja/Nein)

    // Room properties
    // For each of the 15 possible rooms (R through AF), we save the basic properties.
    // These cells include data about room dimensions, wall types, windows, and heating elements
    ...this.generateRoomCellsToSave(),

    // These will be expanded as the tool is developed
  ];


  resetInputs() {
    // Extract just the cell names for clearListed
    this.cellsToSave.forEach(ref => {
      const [sheet, cell] = parseCellReference(ref);
      this.grid.setCell(sheet, cell, '')
    });
  }

  serializeData(indent = false): string {
    return this.grid.serializeWhitelistedCells(
      this.cellsToSave.map(ref => parseCellReference(ref)),
      indent
    );
  }

  restoreData(json: string): void {
    this.grid.restoreCells(
      json,
      this.cellsToSave.map(ref => parseCellReference(ref))
    );
  }

// Helper methods for room data access

  // Convert room ID (1-15) to a column letter (R-AF)
  getRoomColumn(roomId: number) {
    return IN_ROOM_COLS[roomId - 1];
  }

  /**
   * Gets room name from IN_rooms row 3 (TXT_room_name)
   */
  getRoomName(roomId: number): string {
    const column = this.getRoomColumn(roomId);
    return this.grid.getCell('IN_rooms', `${column}3`).toString();
  }

  /**
   * Sets room name in IN_rooms row 3 (TXT_room_name)
   */
  setRoomName(roomId: number, name: string): void {
    const column = this.getRoomColumn(roomId);
    this.grid.setCell('IN_rooms', `${column}3`, name);
    // Update the rooms$
    this.rooms$.next(this.getAllRooms());
  }

  /**
   * Gets room area from IN_rooms row 4 (A_floor) in m²
   */
  getRoomArea(roomId: number): number {
    const column = this.getRoomColumn(roomId);
    return this.grid.getCellNumeric('IN_rooms', `${column}4`);
  }

  /**
   * Sets room area in IN_rooms row 4 (A_floor) in m²
   */
  setRoomArea(roomId: number, area: number): void {
    const column = this.getRoomColumn(roomId);
    this.grid.setCell('IN_rooms', `${column}4`, area);
  }

  /**
   * Gets room height from IN_rooms row 5 (L_hei) in m
   */
  getRoomHeight(roomId: number): number {
    const column = this.getRoomColumn(roomId);
    return this.grid.getCellNumeric('IN_rooms', `${column}5`);
  }

  /**
   * Sets room height in IN_rooms row 5 (L_hei) in m
   */
  setRoomHeight(roomId: number, height: number): void {
    const column = this.getRoomColumn(roomId);
    this.grid.setCell('IN_rooms', `${column}5`, height);
  }

  /**
   * Gets room temperature from IN_rooms row 6 (T_air_set) in °C
   */
  getRoomTemperature(roomId: number): number {
    const column = this.getRoomColumn(roomId);
    return this.grid.getCellNumeric('IN_rooms', `${column}6`);
  }

  /**
   * Sets room temperature in IN_rooms row 6 (T_air_set) in °C
   */
  setRoomTemperature(roomId: number, temperature: number): void {
    const column = this.getRoomColumn(roomId);
    this.grid.setCell('IN_rooms', `${column}6`, temperature);
  }

  /**
   * Gets ceiling type from IN_rooms row 7 (TYP_V_above)
   */
  getRoomCeilingType(roomId: number): string {
    const column = this.getRoomColumn(roomId);
    return this.grid.getCell('IN_rooms', `${column}7`).toString();
  }

  /**
   * Sets ceiling type in IN_rooms row 7 (TYP_V_above)
   */
  setRoomCeilingType(roomId: number, ceilingType: string): void {
    const column = this.getRoomColumn(roomId);
    this.grid.setCell('IN_rooms', `${column}7`, ceilingType);
  }

  /**
   * Gets floor type from IN_rooms row 8 (TYP_V_below)
   */
  getRoomFloorType(roomId: number): string {
    const column = this.getRoomColumn(roomId);
    return this.grid.getCell('IN_rooms', `${column}8`).toString();
  }

  /**
   * Sets floor type in IN_rooms row 8 (TYP_V_below)
   */
  setRoomFloorType(roomId: number, floorType: string): void {
    const column = this.getRoomColumn(roomId);
    this.grid.setCell('IN_rooms', `${column}8`, floorType);
  }

  /**
   * Gets wall length from IN_rooms row 9 (L_wall_tot) in m
   */
  getRoomWallLength(roomId: number): number {
    const column = this.getRoomColumn(roomId);
    return this.grid.getCellNumeric('IN_rooms', `${column}9`);
  }

  /**
   * Sets wall length in IN_rooms row 9 (L_wall_tot) in m
   */
  setRoomWallLength(roomId: number, wallLength: number): void {
    const column = this.getRoomColumn(roomId);
    this.grid.setCell('IN_rooms', `${column}9`, wallLength);
  }

  /**
   * Gets wall insulation thickness from IN_rooms row 11 (UI_L_wall_ins) in cm
   */
  getRoomWallInsulationThickness(roomId: number): number | string {
    const column = this.getRoomColumn(roomId);
    return this.grid.getCellNumeric('IN_rooms', `${column}11`) || "";
  }

  /**
   * Sets wall insulation thickness in IN_rooms row 11 (UI_L_wall_ins) in cm
   */
  setRoomWallInsulationThickness(roomId: number, thickness: number | ""): void {
    const column = this.getRoomColumn(roomId);
    this.grid.setCell('IN_rooms', `${column}11`, thickness);
  }

  // Interior walls methods

  /**
   * Checks if room has interior walls against unheated spaces (IN_rooms row 25/EXIST_innerwall)
   */
  hasInteriorWalls(roomId: number): boolean {
    const column = this.getRoomColumn(roomId);
    return this.grid.getCell('IN_rooms', `${column}25`) === 'Ja';
  }

  /**
   * Sets if room has interior walls against unheated spaces (IN_rooms row 25/EXIST_innerwall)
   */
  setHasInteriorWalls(roomId: number, hasWalls: boolean): void {
    const column = this.getRoomColumn(roomId);
    this.grid.setCell('IN_rooms', `${column}25`, hasWalls ? 'Ja' : 'Nein');
  }

  /**
   * Gets interior wall length against unheated spaces (IN_rooms row 26/L_innerwall_tot) in m
   */
  getInteriorWallLength(roomId: number): number {
    const column = this.getRoomColumn(roomId);
    return this.grid.getCellNumeric('IN_rooms', `${column}26`);
  }

  /**
   * Sets interior wall length against unheated spaces (IN_rooms row 26/L_innerwall_tot) in m
   */
  setInteriorWallLength(roomId: number, length: number): void {
    const column = this.getRoomColumn(roomId);
    this.grid.setCell('IN_rooms', `${column}26`, length);
  }

  /**
   * Gets interior wall insulation thickness (IN_rooms row 27/L_innerwall_ins) in cm
   */
  getInteriorWallInsulationThickness(roomId: number): number {
    const column = this.getRoomColumn(roomId);
    return this.grid.getCellNumeric('IN_rooms', `${column}27`);
  }

  /**
   * Sets interior wall insulation thickness (IN_rooms row 27/L_innerwall_ins) in cm
   */
  setInteriorWallInsulationThickness(roomId: number, thickness: number | ""): void {
    const column = this.getRoomColumn(roomId);
    this.grid.setCell('IN_rooms', `${column}27`, thickness);
  }

  // Roof-related methods

  /**
   * Gets roof surface type (IN_rooms row 28/EXIST_roof)
   * Returns one of the roof surface types from Daten B29:B33
   */
  getEXIST_roof(roomId: number): RoofSurfaceType {
    const column = this.getRoomColumn(roomId);
    return this.grid.getCell('IN_rooms', `${column}28`).toString() as RoofSurfaceType;
  }

  /**
   * Sets roof surface type (IN_rooms row 28/EXIST_roof)
   * Accepts one of the roof surface types from Daten B29:B33
   */
  setEXIST_roof(roomId: number, roofType: RoofSurfaceType): void {
    const column = this.getRoomColumn(roomId);
    this.grid.setCell('IN_rooms', `${column}28`, roofType);
  }

  /**
   * Checks if room has multiple roof slopes (IN_rooms row 29/NO_roof_slop)
   */
  getNO_roof_slop(roomId: number): boolean {
    const column = this.getRoomColumn(roomId);
    return this.grid.getCell('IN_rooms', `${column}29`) === 'Ja';
  }

  /**
   * Sets if room has multiple roof slopes (IN_rooms row 29/NO_roof_slop)
   */
  setNO_roof_slop(roomId: number, hasMultiple: boolean): void {
    const column = this.getRoomColumn(roomId);
    this.grid.setCell('IN_rooms', `${column}29`, hasMultiple ? 'Ja' : 'Nein');
  }

  /**
   * Gets roof width (IN_rooms row 30/L_roof_wid) in m
   */
  getL_roof_wid(roomId: number): number {
    const column = this.getRoomColumn(roomId);
    return this.grid.getCellNumeric('IN_rooms', `${column}30`);
  }

  /**
   * Sets roof width (IN_rooms row 30/L_roof_wid) in m
   */
  setL_roof_wid(roomId: number, width: number): void {
    const column = this.getRoomColumn(roomId);
    this.grid.setCell('IN_rooms', `${column}30`, width);
  }

  /**
   * Gets roof height (IN_rooms row 31/L_roof_hei) in m
   */
  getL_roof_hei(roomId: number): number {
    const column = this.getRoomColumn(roomId);
    return this.grid.getCellNumeric('IN_rooms', `${column}31`);
  }

  /**
   * Sets roof height (IN_rooms row 31/L_roof_hei) in m
   */
  setL_roof_hei(roomId: number, height: number): void {
    const column = this.getRoomColumn(roomId);
    this.grid.setCell('IN_rooms', `${column}31`, height);
  }

  /**
   * Gets knee wall/Drempelwand/Kniestock height (IN_rooms row 34/L_roof_jamb_hei) in m
   */
  getL_roof_jamb_hei(roomId: number): number {
    const column = this.getRoomColumn(roomId);
    return this.grid.getCellNumeric('IN_rooms', `${column}34`);
  }

  /**
   * Sets knee wall/Drempelwand/Kniestock height (IN_rooms row 34/L_roof_jamb_hei) in m
   */
  setL_roof_jamb_hei(roomId: number, height: number): void {
    const column = this.getRoomColumn(roomId);
    this.grid.setCell('IN_rooms', `${column}34`, height);
  }

  /**
   * Checks if knee wall is hollow (IN_rooms row 35/TYP_jamb_hei)
   */
  getTYP_jamb_hei(roomId: number): boolean {
    const column = this.getRoomColumn(roomId);
    return this.grid.getCell('IN_rooms', `${column}35`) === 'Ja';
  }

  /**
   * Sets if knee wall is hollow (IN_rooms row 35/TYP_jamb_hei)
   */
  setTYP_jamb_hei(roomId: number, isHollow: boolean): void {
    const column = this.getRoomColumn(roomId);
    this.grid.setCell('IN_rooms', `${column}35`, isHollow ? 'Ja' : 'Nein');
  }

  /**
   * Checks if room has dormer/Gaube (IN_rooms row 40/EXIST_dormer)
   */
  getEXIST_dormer(roomId: number): boolean {
    const column = this.getRoomColumn(roomId);
    return this.grid.getCell('IN_rooms', `${column}40`) === 'Ja';
  }

  /**
   * Sets if room has dormer/Gaube (IN_rooms row 40/EXIST_dormer)
   */
  setEXIST_dormer(roomId: number, hasDormer: boolean): void {
    const column = this.getRoomColumn(roomId);
    this.grid.setCell('IN_rooms', `${column}40`, hasDormer ? 'Ja' : 'Nein');
  }

  // Roof window methods - Type 1 (rows 41-44)

  /**
   * Gets roof window width (IN_rooms row 41/L_roof_win1_wid) in m
   */
  getL_roof_win1_wid(roomId: number): number {
    const column = this.getRoomColumn(roomId);
    return this.grid.getCellNumeric('IN_rooms', `${column}41`);
  }

  /**
   * Sets roof window width (IN_rooms row 41/L_roof_win1_wid) in m
   */
  setL_roof_win1_wid(roomId: number, width: number | ""): void {
    const column = this.getRoomColumn(roomId);
    this.grid.setCell('IN_rooms', `${column}41`, width);
  }

  /**
   * Gets roof window height (IN_rooms row 42/L_roof_win1_hei) in m
   */
  getL_roof_win1_hei(roomId: number): number {
    const column = this.getRoomColumn(roomId);
    return this.grid.getCellNumeric('IN_rooms', `${column}42`);
  }

  /**
   * Sets roof window height (IN_rooms row 42/L_roof_win1_hei) in m
   */
  setL_roof_win1_hei(roomId: number, height: number | ""): void {
    const column = this.getRoomColumn(roomId);
    this.grid.setCell('IN_rooms', `${column}42`, height);
  }

  /**
   * Gets roof window year (IN_rooms row 43/YEAR_roof_win1) as string
   */
  getYEAR_roof_win1(roomId: number): string {
    const column = this.getRoomColumn(roomId);
    return this.grid.getCell('IN_rooms', `${column}43`).toString();
  }

  /**
   * Sets roof window year (IN_rooms row 43/YEAR_roof_win1)
   */
  setYEAR_roof_win1(roomId: number, year: string): void {
    const column = this.getRoomColumn(roomId);
    this.grid.setCell('IN_rooms', `${column}43`, year);
  }

  /**
   * Gets roof window count (IN_rooms row 44/NO_roof_win1)
   */
  getNO_roof_win1(roomId: number): number {
    const column = this.getRoomColumn(roomId);
    return this.grid.getCellNumeric('IN_rooms', `${column}44`);
  }

  /**
   * Sets roof window count (IN_rooms row 44/NO_roof_win1)
   */
  setNO_roof_win1(roomId: number, count: number | ""): void {
    const column = this.getRoomColumn(roomId);
    this.grid.setCell('IN_rooms', `${column}44`, count);
  }

  // Roof window methods - Type 2 (rows 45-48)

  /**
   * Gets second roof window width (IN_rooms row 45/L_roof_win2_wid) in m
   */
  getL_roof_win2_wid(roomId: number): number {
    const column = this.getRoomColumn(roomId);
    return this.grid.getCellNumeric('IN_rooms', `${column}45`);
  }

  /**
   * Sets second roof window width (IN_rooms row 45/L_roof_win2_wid) in m
   */
  setL_roof_win2_wid(roomId: number, width: number | ""): void {
    const column = this.getRoomColumn(roomId);
    this.grid.setCell('IN_rooms', `${column}45`, width);
  }

  /**
   * Gets second roof window height (IN_rooms row 46/L_roof_win2_hei) in m
   */
  getL_roof_win2_hei(roomId: number): number {
    const column = this.getRoomColumn(roomId);
    return this.grid.getCellNumeric('IN_rooms', `${column}46`);
  }

  /**
   * Sets second roof window height (IN_rooms row 46/L_roof_win2_hei) in m
   */
  setL_roof_win2_hei(roomId: number, height: number | ""): void {
    const column = this.getRoomColumn(roomId);
    this.grid.setCell('IN_rooms', `${column}46`, height);
  }

  /**
   * Gets second roof window year (IN_rooms row 47/YEAR_roof_win2)
   */
  getYEAR_roof_win2(roomId: number): string {
    const column = this.getRoomColumn(roomId);
    return this.grid.getCell('IN_rooms', `${column}47`).toString();
  }

  /**
   * Sets second roof window year (IN_rooms row 47/YEAR_roof_win2)
   */
  setYEAR_roof_win2(roomId: number, year: string): void {
    const column = this.getRoomColumn(roomId);
    this.grid.setCell('IN_rooms', `${column}47`, year);
  }

  /**
   * Gets second roof window count (IN_rooms row 48/NO_roof_win2)
   */
  getNO_roof_win2(roomId: number): number {
    const column = this.getRoomColumn(roomId);
    return this.grid.getCellNumeric('IN_rooms', `${column}48`);
  }

  /**
   * Sets second roof window count (IN_rooms row 48/NO_roof_win2)
   */
  setNO_roof_win2(roomId: number, count: number | ""): void {
    const column = this.getRoomColumn(roomId);
    this.grid.setCell('IN_rooms', `${column}48`, count);
  }

  // Horizontal ceiling methods (topceil)

  /**
   * Gets horizontal ceiling width (IN_rooms row 32/L_topceil_int_wid) in m
   */
  getL_topceil__wid(roomId: number): number {
    const column = this.getRoomColumn(roomId);
    return this.grid.getCellNumeric('IN_rooms', `${column}32`);
  }

  /**
   * Sets horizontal ceiling width (IN_rooms row 32/L_topceil_int_wid) in m
   */
  setL_topceil__wid(roomId: number, width: number | ""): void {
    const column = this.getRoomColumn(roomId);
    this.grid.setCell('IN_rooms', `${column}32`, width);
  }

  /**
   * Gets horizontal ceiling length (IN_rooms row 33/L_topceil_int_len) in m
   */
  getL_topceil__len(roomId: number): number {
    const column = this.getRoomColumn(roomId);
    return this.grid.getCellNumeric('IN_rooms', `${column}33`);
  }

  /**
   * Sets horizontal ceiling length (IN_rooms row 33/L_topceil_int_len) in m
   */
  setL_topceil__len(roomId: number, length: number | ""): void {
    const column = this.getRoomColumn(roomId);
    this.grid.setCell('IN_rooms', `${column}33`, length);
  }

  // Complex roof surface methods (rows 84-85)

  /**
   * Gets total roof area for complex roofs (IN_rooms row 84/A_roof_total) in m²
   */
  getA_roof_total(roomId: number): number {
    const column = this.getRoomColumn(roomId);
    return this.grid.getCellNumeric('IN_rooms', `${column}84`);
  }

  /**
   * Sets total roof area for complex roofs (IN_rooms row 84/A_roof_total) in m²
   */
  setA_roof_total(roomId: number, area: number | ""): void {
    const column = this.getRoomColumn(roomId);
    this.grid.setCell('IN_rooms', `${column}84`, area);
  }

  /**
   * Gets total ceiling area for complex roofs (IN_rooms row 85/A_ceil_total) in m²
   */
  getA_ceil_total(roomId: number): number {
    const column = this.getRoomColumn(roomId);
    return this.grid.getCellNumeric('IN_rooms', `${column}85`);
  }

  /**
   * Sets total ceiling area for complex roofs (IN_rooms row 85/A_ceil_total) in m²
   */
  setA_ceil_total(roomId: number, area: number | ""): void {
    const column = this.getRoomColumn(roomId);
    this.grid.setCell('IN_rooms', `${column}85`, area);
  }



  /**
   * Window access methods - all window types
   */

  /**
   * Gets window width (IN_rooms rows 13,17,21/L_win*_ext_wid) in m
   * @param windowType 1-3 corresponds to rows 13+4*(type-1)
   */
  getWindowWidth(roomId: number, windowType: number = 1): number {
    const column = this.getRoomColumn(roomId);
    const row = 13 + (windowType - 1) * 4; // Types are positioned 4 rows apart starting at row 13
    return this.grid.getCellNumeric('IN_rooms', `${column}${row}`);
  }

  /**
   * Sets window width (IN_rooms rows 13,17,21/L_win*_ext_wid) in m
   * @param windowType 1-3 corresponds to rows 13+4*(type-1)
   */
  setWindowWidth(roomId: number, width: number, windowType: number = 1): void {
    const column = this.getRoomColumn(roomId);
    const row = 13 + (windowType - 1) * 4;
    this.grid.setCell('IN_rooms', `${column}${row}`, width);
  }

  /**
   * Gets window height (IN_rooms rows 14,18,22/L_win*_ext_hei) in m
   * @param windowType 1-3 corresponds to rows 14+4*(type-1)
   */
  getWindowHeight(roomId: number, windowType: number = 1): number {
    const column = this.getRoomColumn(roomId);
    const row = 14 + (windowType - 1) * 4;
    return this.grid.getCellNumeric('IN_rooms', `${column}${row}`);
  }

  /**
   * Sets window height (IN_rooms rows 14,18,22/L_win*_ext_hei) in m
   * @param windowType 1-3 corresponds to rows 14+4*(type-1)
   */
  setWindowHeight(roomId: number, height: number, windowType: number = 1): void {
    const column = this.getRoomColumn(roomId);
    const row = 14 + (windowType - 1) * 4;
    this.grid.setCell('IN_rooms', `${column}${row}`, height);
  }

  /**
   * Gets window installation year (IN_rooms rows 15,19,23/YEAR_win*_ext)
   * @param windowType 1-3 corresponds to rows 15+4*(type-1)
   */
  getWindowYear(roomId: number, windowType: number = 1): string {
    const column = this.getRoomColumn(roomId);
    const row = 15 + (windowType - 1) * 4;
    return this.grid.getCell('IN_rooms', `${column}${row}`).toString();
  }

  /**
   * Sets window installation year (IN_rooms rows 15,19,23/YEAR_win*_ext)
   * @param windowType 1-3 corresponds to rows 15+4*(type-1)
   */
  setWindowYear(roomId: number, year: string, windowType: number = 1): void {
    const column = this.getRoomColumn(roomId);
    const row = 15 + (windowType - 1) * 4;
    this.grid.setCell('IN_rooms', `${column}${row}`, year);
  }

  /**
   * Gets window count (IN_rooms rows 16,20,24/NO_win*_ext)
   * @param windowType 1-3 corresponds to rows 16+4*(type-1)
   */
  getWindowCount(roomId: number, windowType: number = 1): number {
    const column = this.getRoomColumn(roomId);
    const row = 16 + (windowType - 1) * 4;
    return this.grid.getCellNumeric('IN_rooms', `${column}${row}`);
  }

  /**
   * Sets window count (IN_rooms rows 16,20,24/NO_win*_ext)
   * @param windowType 1-3 corresponds to rows 16+4*(type-1)
   */
  setWindowCount(roomId: number, count: number, windowType: number = 1): void {
    const column = this.getRoomColumn(roomId);
    const row = 16 + (windowType - 1) * 4;
    this.grid.setCell('IN_rooms', `${column}${row}`, count);
  }

  /**
   * Heating element access methods - for all heater types
   */

  /**
   * Gets heater main type (IN_rooms rows 49,56,63/TYP_1_rad*)
   * @param heaterNum 1-3 corresponds to rows 49+7*(heaterNum-1)
   */
  getHeatingMainType(roomId: number, heaterNum: number = 1) {
    const column = this.getRoomColumn(roomId);
    const row = 49 + (heaterNum - 1) * 7; // TYP_1_rad1 in row 49, TYP_1_rad2 in row 56, TYP_1_rad3 in row 63
    return this.grid.getCell('IN_rooms', `${column}${row}`).toString() as HeaterType;
  }

  /**
   * Sets heater main type (IN_rooms rows 49,56,63/TYP_1_rad*)
   * @param heaterNum 1-3 corresponds to rows 49+7*(heaterNum-1)
   */
  setHeatingMainType(roomId: number, type: HeaterType, heaterNum: number = 1): void {
    const column = this.getRoomColumn(roomId);
    const row = 49 + (heaterNum - 1) * 7;
    this.grid.setCell('IN_rooms', `${column}${row}`, type);
  }

  /**
   * Gets heater subtype (IN_rooms rows 50,57,64/TYP_2_rad*)
   * @param heaterNum 1-3 corresponds to rows 50+7*(heaterNum-1)
   */
  getHeatingSubType(roomId: number, heaterNum: number = 1) {
    const column = this.getRoomColumn(roomId);
    const row = 50 + (heaterNum - 1) * 7;
    return this.grid.getCell('IN_rooms', `${column}${row}`).toString();
  }

  /**
   * Sets heater subtype (IN_rooms rows 50,57,64/TYP_2_rad*)
   * @param heaterNum 1-3 corresponds to rows 50+7*(heaterNum-1)
   */
  setHeatingSubType(roomId: number, type: string, heaterNum: number = 1): void {
    const column = this.getRoomColumn(roomId);
    const row = 50 + (heaterNum - 1) * 7;
    this.grid.setCell('IN_rooms', `${column}${row}`, type);
  }

  /**
   * Gets heater height (IN_rooms rows 51,58,65/L_rad*_hei) in cm
   * @param heaterNum 1-3 corresponds to rows 51+7*(heaterNum-1)
   */
  getHeatingHeight(roomId: number, heaterNum: number = 1): number {
    const column = this.getRoomColumn(roomId);
    const row = 51 + (heaterNum - 1) * 7;
    return this.grid.getCellNumeric('IN_rooms', `${column}${row}`);
  }

  /**
   * Sets heater height (IN_rooms rows 51,58,65/L_rad*_hei) in cm
   * @param heaterNum 1-3 corresponds to rows 51+7*(heaterNum-1)
   */
  setHeatingHeight(roomId: number, height: number, heaterNum: number = 1): void {
    const column = this.getRoomColumn(roomId);
    const row = 51 + (heaterNum - 1) * 7;
    this.grid.setCell('IN_rooms', `${column}${row}`, height);
  }

  /**
   * Gets heater width (IN_rooms rows 52,59,66/L_rad*_wid) in cm
   * @param heaterNum 1-3 corresponds to rows 52+7*(heaterNum-1)
   */
  getHeatingWidth(roomId: number, heaterNum: number = 1): number {
    const column = this.getRoomColumn(roomId);
    const row = 52 + (heaterNum - 1) * 7;
    return this.grid.getCellNumeric('IN_rooms', `${column}${row}`);
  }

  /**
   * Sets heater width (IN_rooms rows 52,59,66/L_rad*_wid) in cm
   * @param heaterNum 1-3 corresponds to rows 52+7*(heaterNum-1)
   */
  setHeatingWidth(roomId: number, width: string | number, heaterNum: number = 1): void {
    const column = this.getRoomColumn(roomId);
    const row = 52 + (heaterNum - 1) * 7;
    this.grid.setCell('IN_rooms', `${column}${row}`, typeof width == 'number' ? width : parseInt(width));
  }

  /**
   * Gets heater count (IN_rooms rows 55,62,69/n_rad*)
   * @param heaterNum 1-3 corresponds to rows 55+7*(heaterNum-1)
   */
  getHeatingCount(roomId: number, heaterNum: number = 1): number {
    const column = this.getRoomColumn(roomId);
    const row = 55 + (heaterNum - 1) * 7;
    return this.grid.getCellNumeric('IN_rooms', `${column}${row}`);
  }

  /**
   * Sets heater count (IN_rooms rows 55,62,69/n_rad*)
   * @param heaterNum 1-3 corresponds to rows 55+7*(heaterNum-1)
   */
  setHeatingCount(roomId: number, count: number, heaterNum: number = 1): void {
    const column = this.getRoomColumn(roomId);
    const row = 55 + (heaterNum - 1) * 7;
    this.grid.setCell('IN_rooms', `${column}${row}`, count);
  }

  /**
   * Gets radiator element count (IN_rooms rows 54,61,68/n_rad*_col)
   * @param heaterNum 1-3 corresponds to rows 54+7*(heaterNum-1)
   */
  getn_rad_col(roomId: number, heaterNum: number = 1): number {
    const column = this.getRoomColumn(roomId);
    const row = 54 + (heaterNum - 1) * 7;
    return this.grid.getCellNumeric('IN_rooms', `${column}${row}`);
  }

  /**
   * Sets radiator element count (IN_rooms rows 54,61,68/n_rad*_col)
   * @param heaterNum 1-3 corresponds to rows 54+7*(heaterNum-1)
   */
  setn_rad_col(roomId: number, count: number, heaterNum: number = 1): void {
    const column = this.getRoomColumn(roomId);
    const row = 54 + (heaterNum - 1) * 7;
    this.grid.setCell('IN_rooms', `${column}${row}`, count);
  }

  /**
   * Gets heater depth (IN_rooms rows 53,60,67/L_rad*_thick) in cm
   * @param heaterNum 1-3 corresponds to rows 53+7*(heaterNum-1)
   */
  getHeatingDepth(roomId: number, heaterNum: number = 1): number {
    const column = this.getRoomColumn(roomId);
    const row = 53 + (heaterNum - 1) * 7;
    return this.grid.getCellNumeric('IN_rooms', `${column}${row}`);
  }

  /**
   * Sets heater depth (IN_rooms rows 53,60,67/L_rad*_thick) in cm
   * @param heaterNum 1-3 corresponds to rows 53+7*(heaterNum-1)
   */
  setHeatingDepth(roomId: number, depth: string | number, heaterNum: number = 1): void {
    const column = this.getRoomColumn(roomId);
    const row = 53 + (heaterNum - 1) * 7;
    this.grid.setCell('IN_rooms', `${column}${row}`, typeof depth == 'number' ? depth : parseInt(depth));
  }

  /**
   * Gets all available heater types from the Daten sheet (cells I4:I8)
   *
   * @returns Array of heater types
   */
  getHeaterTypes(): HeaterType[] {
    const types: HeaterType[] = [];

    // TODO: Rohrheizkörper is missing in Daten sheet?
    // Cells I4:I8 contain the heater types
    for (let row = 4; row <= 8; row++) {
      const cellValue = this.grid.getCell('Daten', `I${row}`);
      if (cellValue && cellValue.toString().trim() !== '') {
        types.push(cellValue.toString() as HeaterType);
      }
    }

    return types;
  }

  /**
   * INDIRECT lookup formula logic similar to Excel.
   *
   * @param name - The type of heater to get subtypes for
   * @returns Array of values for the named expression. if 2 dim, only first col is returned
   */
  getNamesExpressionValueList(name: string): (string | number)[] {
    // Try to get the range reference from the Names sheet
    const rangeRef = this.grid.getCell('Names', name);

    if (typeof rangeRef !== 'string') {
      return [];
    }

    // Parse the range reference (format: "Daten!K4:K10" or "Daten!P4")
    const [, sheet, startCell, endSheet, endCell] = rangeRef.match(/(?:(\w[\w\s]*)!)?([A-Za-z]+\d+)(?::(?:(\w[\w\s]*)!)?([A-Za-z]+\d+))?/) ?? [];
    if (!startCell) {
      return [];
    }
    // Get cells from the range
    // Determine if this is a database range (has header)
    // Skip the header row if it's a database range
    const startIndex = name in databaseRanges ? 1 : 0;

    // Extract the first column values using flatMap
    return this.grid.getCells(sheet, startCell, endCell ?? startCell)
      .slice(startIndex)  // Skip header if needed
      .flatMap(row => row[0]);
  }

// Check if building has a flat roof
  hasFlatRoof(): boolean {
    return this.grid.getCell('IN_build', 'P4') === 'Flach bzw. Flachdach';
  }

  getBuildingWallInsulationThickness(): number {
    // Check if wall was retrofitted
    const wasRetrofitted = this.grid.getCell('IN_build', 'Q7') === 'Ja';

    if (wasRetrofitted) {
      // Get the insulation thickness value
      return this.grid.getCellNumeric('IN_build', 'U7');
    }

    return 0; // Return 0 if not retrofitted
  }

  // Room management methods
  setSelectedRoom(roomId: number): void {
    this.selectedRoomSubject.next(roomId);
  }

  // Get all rooms from DataGrid
  public getAllRooms(): Room[] {
    const rooms: Room[] = [];

    // Check each possible room column (R to AF, corresponding to roomIds 1-15)
    for (let roomId = 1; roomId <= 15; roomId++) {
      const column = this.getRoomColumn(roomId);
      const name = this.grid.getCell('IN_rooms', `${column}3`).toString();

      // If the room has a non-empty name, consider it as an active room
      if (name && name.trim() !== '') {
        rooms.push({
          id: roomId,
          name: name,
          type: '?' // Default type TODO: type is not saved, Absicht?
        });
      }
    }

    return rooms;
  }

  // Add a new room to the DataGrid
  addRoom(name: string): string {
    // Find the first available room slot (column)
    for (let roomId = 1; roomId <= 15; roomId++) {
      const column = this.getRoomColumn(roomId);
      const existingName = this.grid.getCell('IN_rooms', `${column}3`).toString();

      // If the room name is empty or blank, this slot is available
      if (!existingName || existingName.trim() === '') {
        // Found an empty slot, add the room
        this.setRoomName(roomId, name.trim());

        // Get height from the first room if available
        let roomHeight = 2.5; // Default height: 2.5m if no rooms exist
        const existingRooms = this.getAllRooms();
        if (existingRooms.length > 0) {
          // Copy height from the first room
          const firstRoomId = existingRooms[0].id;
          roomHeight = this.getRoomHeight(firstRoomId) || 2.5;
        }

        // Set default values for new room - use Excel IN_rooms col Q defaults, skip if Excel is empty
        const setIfQ = (row: number, setter: (value: number | string) => void) => {
          const value = this.grid.getCell('IN_rooms', `Q${row}`);
          if (value !== null && value !== undefined && value !== '') {
            setter(value);
          }
        };
        const setIfQNum = (row: number, setter: (value: number) => void) => {
          const value = this.grid.getCell('IN_rooms', `Q${row}`);
          if (value !== null && value !== undefined && value !== '' && !isNaN(Number(value))) {
            setter(Number(value));
          }
        };
        const setIfQBool = (row: number, setter: (value: boolean) => void) => {
          const value = this.grid.getCell('IN_rooms', `Q${row}`);
          if (value !== null && value !== undefined && value !== '') {
            setter(value === 'Ja');
          }
        };

        setIfQNum(4, v => this.setRoomArea(roomId, v));
        setIfQNum(5, v => this.setRoomHeight(roomId, v));
        if (!this.grid.getCell('IN_rooms', 'Q5')) this.setRoomHeight(roomId, roomHeight); // Special case: use copied height if Q5 is empty
        setIfQNum(6, v => this.setRoomTemperature(roomId, v));
        setIfQ(7, v => this.setRoomCeilingType(roomId, v.toString()));
        setIfQ(8, v => this.setRoomFloorType(roomId, v.toString()));
        setIfQNum(9, v => this.setRoomWallLength(roomId, v));
        // Set insulation thickness to empty (will show building value as placeholder)
        this.setRoomWallInsulationThickness(roomId, "");

        // Set default values for interior walls - use Excel defaults
        setIfQBool(25, v => this.setHasInteriorWalls(roomId, v));
        setIfQNum(26, v => this.setInteriorWallLength(roomId, v));
        setIfQNum(27, v => this.setInteriorWallInsulationThickness(roomId, v));

        // Set default values for roof - use Excel defaults
        setIfQ(28, v => this.setEXIST_roof(roomId, v as RoofSurfaceType));
        if (!this.grid.getCell('IN_rooms', 'Q28')) this.setEXIST_roof(roomId, this.grid.g('Daten', 'B29').toString() as RoofSurfaceType); // Fallback to "Keine"
        setIfQBool(29, v => this.setNO_roof_slop(roomId, v));
        setIfQNum(30, v => this.setL_roof_wid(roomId, v));
        setIfQNum(31, v => this.setL_roof_hei(roomId, v));
        setIfQNum(34, v => this.setL_roof_jamb_hei(roomId, v));
        setIfQBool(35, v => this.setTYP_jamb_hei(roomId, v));

        // Set default values for horizontal ceiling (topceil) - use Excel defaults
        setIfQNum(36, v => this.setL_topceil__wid(roomId, v));
        setIfQNum(37, v => this.setL_topceil__len(roomId, v));

        // Set default value for dormer - use Excel defaults
        setIfQBool(42, v => this.setEXIST_dormer(roomId, v));

        // Roof windows are not set by default - user must explicitly add them via "Dachfenster hinzufügen" button
        // This keeps the UI clean and prevents pre-filled roof windows when adding a roof surface

        // Set default values for regular windows - use Excel defaults
        for (let windowType = 1; windowType <= 3; windowType++) {
          const baseRow = 13 + (windowType - 1) * 4; // Q16/Q20/Q24 for window counts
          setIfQNum(baseRow - 3, v => this.setWindowWidth(roomId, v, windowType)); // Q13/Q17/Q21
          setIfQNum(baseRow - 2, v => this.setWindowHeight(roomId, v, windowType)); // Q14/Q18/Q22
          setIfQ(baseRow - 1, v => this.setWindowYear(roomId, v.toString(), windowType)); // Q15/Q19/Q23
          setIfQNum(baseRow, v => this.setWindowCount(roomId, v, windowType)); // Q16/Q20/Q24
        }

        // Set default heater type for non-water heating systems
        this.setDefaultHeaterTypeForNonWaterSystems(roomId);

        // Update the rooms$
        this.rooms$.next(this.getAllRooms());

        return roomId.toString();
      }
    }

    throw new Error('Maximum number of rooms (15) reached');
  }

  // Remove a room from the DataGrid
  removeRoom(roomId: number): void {
    // Ensure we can only remove the last room in the list
    const rooms = this.getAllRooms();
    const isLastRoom = rooms.findIndex(room => room.id === roomId) === rooms.length - 1;

    if (!isLastRoom) {
      console.warn('Only the last room can be removed. Please remove rooms in reverse order.');
      return;
    }

    // Set name to empty to mark it as inactive/removed
    this.setRoomName(roomId, '');

    // Update the rooms$
    const updatedRooms = this.getAllRooms();
    this.rooms$.next(updatedRooms);

    // If the selected room was removed, select another one or none
    if (this.selectedRoomSubject.getValue() === roomId) {
      const newSelectedId = updatedRooms.length > 0 ? updatedRooms[0].id : 1;
      this.setSelectedRoom(newSelectedId);
    }
  }

  // Initialize rooms from DataGrid
  initializeRooms(): void {
    const rooms = this.getAllRooms();
    this.rooms$.next(rooms);

    // Select the first room if available
    if (rooms.length > 0) {
      this.setSelectedRoom(rooms[0].id);
    }
  }

  /**
   * Checks if the current heating system is a non-water system
   * (Nachtspeicherheizung or Andere)
   */
  isNonWaterHeatingSystem(): boolean {
    const heatingSystem = this.grid.getCell('IN_build', 'P14')?.toString() || '';
    return heatingSystem.startsWith('Nachtspeicherheizung') || heatingSystem === 'Andere';
  }

  /**
   * Gets the default heater type based on the current heating system
   */
  getDefaultHeaterType(): { mainType: HeaterType; subType?: string } {
    if (this.isNonWaterHeatingSystem()) {
      return {
        mainType: 'Flachheizkoerper_senkrecht_profiliert',
        subType: 'Typ_33',
      };
    } else {
      const subtypes = this.getNamesExpressionValueList('Flachheizkoerper_glatt');
      return {
        mainType: 'Flachheizkoerper_glatt',
        subType: subtypes?.[0]?.toString(),
      };
    }
  }

  /**
   * Set default heater type for 1st heater in a room
   */
  private setDefaultHeaterTypeForNonWaterSystems(roomId: number): void {
    if (this.isNonWaterHeatingSystem()) {
      const defaultType = this.getDefaultHeaterType();
      this.setHeatingMainType(roomId, defaultType.mainType, 1);
      if (defaultType.subType) {
        this.setHeatingSubType(roomId, defaultType.subType, 1);
      }
    }
  }
}
