import {inject, Injectable} from '@angular/core';
import {DataGrid, parseCellReference} from "./data-grid";
import {BehaviorSubject, debounceTime, filter} from "rxjs";
import {CustomLocalStorageService} from "./custom-local-storage.service";
import {databaseRanges, explicitNamedRanges, namedExpressions, sheetsData} from '../../20250507_WP_Check_Vorlage_ts_export/master';
import {applyFormulaOverlays} from "./formula-overlays";

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
  id: string;     // Room ID is the 1-based index matching the room column (1-15)
  name: string;   // Room name from the IN_rooms sheet
  type: string;   // Room type: 'cold', 'exterior', 'ceiling', 'windows', 'other'
}

export type HeaterType =
  | typeof sheetsData.Daten['I4']
  | typeof sheetsData.Daten['I5']
  | typeof sheetsData.Daten['I6']
  | typeof sheetsData.Daten['I7']
  | typeof sheetsData.Daten['I8'];


const STORAGE_KEY = 'UBA-WAERMEPUMPEN-DATA';

@Injectable({
  providedIn: 'root'
})
export class BerechnungService {

  public grid: DataGrid = new DataGrid();

  private storage=inject(CustomLocalStorageService);

  // Room management
  private roomsSubject = new BehaviorSubject<Room[]>([]);

  // Observable for components to subscribe to
  public rooms$ = this.roomsSubject;

  // Currently selected room
  private selectedRoomSubject = new BehaviorSubject<string>('');
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
      debounceTime(1000)
    ).subscribe(cellChange => {
      console.log(`Cell changed: ${cellChange.sheet}!${cellChange.cell} = ${cellChange.value}`);
      // Parse all references and use DataGrid.serializeWhitelistedCells
      this.storage.set<string>(STORAGE_KEY, grid.serializeWhitelistedCells(
        this.cellsToSave.map(ref => parseCellReference(ref))
      ));
    });

    // Restore cells from localStorage if available
    const serializedData = this.storage.get<string>(STORAGE_KEY);
    if (serializedData) {
      // Only restore cells that are in the whitelist
      grid.restoreCells(serializedData, this.cellsToSave.map(ref => parseCellReference(ref)));
      console.log(`Input restored: ${serializedData}`);
    }

    // Initialize rooms from the DataGrid
    this.initializeRooms();
  }

  // Dynamically generate a list of cells to save for room data
  private generateRoomCellsToSave(): string[] {
    const cells: string[] = [];
    const columns = ['R', 'S', 'T', 'U', 'V', 'W', 'X', 'Y', 'Z', 'AA', 'AB', 'AC', 'AD', 'AE', 'AF'];

    // Basic room properties (rows 3-9)
    for (let row = 3; row <= 9; row++) {
      columns.forEach(col => cells.push(`IN_rooms!${col}${row}`));
    }

    // Wall insulation thickness (row 11)
    columns.forEach(col => cells.push(`IN_rooms!${col}11`));

    // Window properties for 3 window types (rows 13-26)
    // Type 1: rows 13-16
    // Type 2: rows 18-21
    // Type 3: rows 23-26
    for (let windowType = 0; windowType < 3; windowType++) {
      for (let i = 0; i < 4; i++) { // 4 properties per window type: width, height, year, count
        const row = 13 + (windowType * 5) + i; // 5 row spacing between types
        columns.forEach(col => cells.push(`IN_rooms!${col}${row}`));
      }
    }

    // Interior walls against unheated spaces (rows 25-27)
    // Row 25: Has interior walls (Ja/Nein)
    // Row 26: Interior wall length (m)
    // Row 27: Interior wall insulation thickness (cm)
    for (let row = 25; row <= 27; row++) {
      columns.forEach(col => cells.push(`IN_rooms!${col}${row}`));
    }

    // Roof-related properties (rows 28-35, 39, and 40)
    // Add specific rows for roof properties
    for (let row = 28; row <= 35; row++) {
      columns.forEach(col => cells.push(`IN_rooms!${col}${row}`));
    }
    // Row 39: Internal knee wall height
    columns.forEach(col => cells.push(`IN_rooms!${col}39`));
    // Row 40: Has dormer
    columns.forEach(col => cells.push(`IN_rooms!${col}40`));

    // Roof window properties (rows 41-48)
    // Type 1: rows 41-44
    // Type 2: rows 45-48
    for (let row = 41; row <= 48; row++) {
      columns.forEach(col => cells.push(`IN_rooms!${col}${row}`));
    }

    // Heating elements for 3 heating types (rows 50-67)
    // Type 1: rows 50-55 (Type_rad1, L_rad1_len, L_rad1_height, L_rad1_thick, n_rad1_col, n_rad1)
    // Type 2: rows 57-62 (Type_rad2, L_rad2_len, L_rad2_height, L_rad2_thick, n_rad2_col, n_rad2)
    // Type 3: rows 64-69 (Type_rad3, L_rad3_len, L_rad3_height, L_rad3_thick, n_rad3_col, n_rad3)
    for (let heatingType = 0; heatingType < 3; heatingType++) {
      for (let i = 0; i < 6; i++) { // 6 properties per heating type: type, length, height, depth, element count, count
        const row = 50 + (heatingType * 7) + i; // 7 row spacing between types
        columns.forEach(col => cells.push(`IN_rooms!${col}${row}`));
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

// Helper methods for room data access

  // Convert room ID (1-15) to a column letter (R-AF)
  private getRoomColumn(roomId: number | string): string {
    const id = typeof roomId === 'string' ? parseInt(roomId, 10) : roomId;
    if (id < 1 || id > 15) {
      throw new Error(`Room ID must be between 1 and 15, got ${id}`);
    }
    // Column R is for room 1, S for room 2, etc.
    const columnIndex = 'R'.charCodeAt(0) + (id - 1);
    return String.fromCharCode(columnIndex > 90 ? columnIndex - 26 + 64 : columnIndex);
  }

  // Get room name from DataGrid
  getRoomName(roomId: number | string): string {
    const column = this.getRoomColumn(roomId);
    return this.grid.getCell('IN_rooms', `${column}3`).toString();
  }

  // Set room name in DataGrid
  setRoomName(roomId: number | string, name: string): void {
    const column = this.getRoomColumn(roomId);
    this.grid.setCell('IN_rooms', `${column}3`, name);
  }

  // Get room area from DataGrid
  getRoomArea(roomId: number | string): number {
    const column = this.getRoomColumn(roomId);
    return this.grid.getCellNumeric('IN_rooms', `${column}4`);
  }

  // Set room area in DataGrid
  setRoomArea(roomId: number | string, area: number): void {
    const column = this.getRoomColumn(roomId);
    this.grid.setCell('IN_rooms', `${column}4`, area);
  }

  // Get room height from DataGrid
  getRoomHeight(roomId: number | string): number {
    const column = this.getRoomColumn(roomId);
    return this.grid.getCellNumeric('IN_rooms', `${column}5`);
  }

  // Set room height in DataGrid
  setRoomHeight(roomId: number | string, height: number): void {
    const column = this.getRoomColumn(roomId);
    this.grid.setCell('IN_rooms', `${column}5`, height);
  }

  // Get room temperature from DataGrid
  getRoomTemperature(roomId: number | string): number {
    const column = this.getRoomColumn(roomId);
    return this.grid.getCellNumeric('IN_rooms', `${column}6`);
  }

  // Set room temperature in DataGrid
  setRoomTemperature(roomId: number | string, temperature: number): void {
    const column = this.getRoomColumn(roomId);
    this.grid.setCell('IN_rooms', `${column}6`, temperature);
  }

  // Get ceiling type from DataGrid
  getRoomCeilingType(roomId: number | string): string {
    const column = this.getRoomColumn(roomId);
    return this.grid.getCell('IN_rooms', `${column}7`).toString();
  }

  // Set ceiling type in DataGrid
  setRoomCeilingType(roomId: number | string, ceilingType: string): void {
    const column = this.getRoomColumn(roomId);
    this.grid.setCell('IN_rooms', `${column}7`, ceilingType);
  }

  // Get floor type from DataGrid
  getRoomFloorType(roomId: number | string): string {
    const column = this.getRoomColumn(roomId);
    return this.grid.getCell('IN_rooms', `${column}8`).toString();
  }

  // Set floor type in DataGrid
  setRoomFloorType(roomId: number | string, floorType: string): void {
    const column = this.getRoomColumn(roomId);
    this.grid.setCell('IN_rooms', `${column}8`, floorType);
  }

  // Get wall length from DataGrid
  getRoomWallLength(roomId: number | string): number {
    const column = this.getRoomColumn(roomId);
    return this.grid.getCellNumeric('IN_rooms', `${column}9`);
  }

  // Set wall length in DataGrid
  setRoomWallLength(roomId: number | string, wallLength: number): void {
    const column = this.getRoomColumn(roomId);
    this.grid.setCell('IN_rooms', `${column}9`, wallLength);
  }

  // Get wall insulation thickness from DataGrid
  getRoomWallInsulationThickness(roomId: number | string): number | string {
    const column = this.getRoomColumn(roomId);
    return this.grid.getCellNumeric('IN_rooms', `${column}11`) || "";
  }

  // Set wall insulation thickness in DataGrid
  setRoomWallInsulationThickness(roomId: number | string, thickness: number | ""): void {
    const column = this.getRoomColumn(roomId);
    this.grid.setCell('IN_rooms', `${column}11`, thickness);
  }

  // Interior walls methods

  // Check if room has interior walls against unheated spaces
  hasInteriorWalls(roomId: number | string): boolean {
    const column = this.getRoomColumn(roomId);
    return this.grid.getCell('IN_rooms', `${column}25`) === 'Ja';
  }

  // Set if room has interior walls against unheated spaces
  setHasInteriorWalls(roomId: number | string, hasWalls: boolean): void {
    const column = this.getRoomColumn(roomId);
    this.grid.setCell('IN_rooms', `${column}25`, hasWalls ? 'Ja' : 'Nein');
  }

  // Get interior wall length against unheated spaces
  getInteriorWallLength(roomId: number | string): number {
    const column = this.getRoomColumn(roomId);
    return this.grid.getCellNumeric('IN_rooms', `${column}26`);
  }

  // Set interior wall length against unheated spaces
  setInteriorWallLength(roomId: number | string, length: number): void {
    const column = this.getRoomColumn(roomId);
    this.grid.setCell('IN_rooms', `${column}26`, length);
  }

  // Get interior wall insulation thickness
  getInteriorWallInsulationThickness(roomId: number | string): number {
    const column = this.getRoomColumn(roomId);
    return this.grid.getCellNumeric('IN_rooms', `${column}27`);
  }

  // Set interior wall insulation thickness
  setInteriorWallInsulationThickness(roomId: number | string, thickness: number | ""): void {
    const column = this.getRoomColumn(roomId);
    this.grid.setCell('IN_rooms', `${column}27`, thickness);
  }

  // Roof-related methods (row 28)

  // Check if room has roof slope (Dachschräge) - EXIST_roof
  getEXIST_roof(roomId: number | string): boolean {
    const column = this.getRoomColumn(roomId);
    return this.grid.getCell('IN_rooms', `${column}28`) === 'Ja';
  }

  // Set if room has roof slope - EXIST_roof
  setEXIST_roof(roomId: number | string, hasSlope: boolean): void {
    const column = this.getRoomColumn(roomId);
    this.grid.setCell('IN_rooms', `${column}28`, hasSlope ? 'Ja' : 'Nein');
  }

  // Check if room has multiple roof slopes - NO_roof_slop
  getNO_roof_slop(roomId: number | string): boolean {
    const column = this.getRoomColumn(roomId);
    return this.grid.getCell('IN_rooms', `${column}29`) === 'Ja';
  }

  // Set if room has multiple roof slopes - NO_roof_slop
  setNO_roof_slop(roomId: number | string, hasMultiple: boolean): void {
    const column = this.getRoomColumn(roomId);
    this.grid.setCell('IN_rooms', `${column}29`, hasMultiple ? 'Ja' : 'Nein');
  }

  // Get roof width - L_roof_wid
  getL_roof_wid(roomId: number | string): number {
    const column = this.getRoomColumn(roomId);
    return this.grid.getCellNumeric('IN_rooms', `${column}30`);
  }

  // Set roof width - L_roof_wid
  setL_roof_wid(roomId: number | string, width: number): void {
    const column = this.getRoomColumn(roomId);
    this.grid.setCell('IN_rooms', `${column}30`, width);
  }

  // Get roof height - L_roof_hei
  getL_roof_hei(roomId: number | string): number {
    const column = this.getRoomColumn(roomId);
    return this.grid.getCellNumeric('IN_rooms', `${column}31`);
  }

  // Set roof height - L_roof_hei
  setL_roof_hei(roomId: number | string, height: number): void {
    const column = this.getRoomColumn(roomId);
    this.grid.setCell('IN_rooms', `${column}31`, height);
  }

  // Get knee wall height (Drempelwand/Kniestock) - L_roof_jamb_hei
  getL_roof_jamb_hei(roomId: number | string): number {
    const column = this.getRoomColumn(roomId);
    return this.grid.getCellNumeric('IN_rooms', `${column}34`);
  }

  // Set knee wall height - L_roof_jamb_hei
  setL_roof_jamb_hei(roomId: number | string, height: number): void {
    const column = this.getRoomColumn(roomId);
    this.grid.setCell('IN_rooms', `${column}34`, height);
  }

  // Check if knee wall is hollow - TYP_jamb_hei
  getTYP_jamb_hei(roomId: number | string): boolean {
    const column = this.getRoomColumn(roomId);
    return this.grid.getCell('IN_rooms', `${column}35`) === 'Ja';
  }

  // Set if knee wall is hollow - TYP_jamb_hei
  setTYP_jamb_hei(roomId: number | string, isHollow: boolean): void {
    const column = this.getRoomColumn(roomId);
    this.grid.setCell('IN_rooms', `${column}35`, isHollow ? 'Ja' : 'Nein');
  }

  // Check if room has dormer - EXIST_dormer
  getEXIST_dormer(roomId: number | string): boolean {
    const column = this.getRoomColumn(roomId);
    return this.grid.getCell('IN_rooms', `${column}40`) === 'Ja';
  }

  // Set if room has dormer - EXIST_dormer
  setEXIST_dormer(roomId: number | string, hasDormer: boolean): void {
    const column = this.getRoomColumn(roomId);
    this.grid.setCell('IN_rooms', `${column}40`, hasDormer ? 'Ja' : 'Nein');
  }

  // Roof window methods - Type 1 (rows 41-44)

  // Get roof window width - L_roof_win1_wid
  getL_roof_win1_wid(roomId: number | string): number {
    const column = this.getRoomColumn(roomId);
    return this.grid.getCellNumeric('IN_rooms', `${column}41`);
  }

  // Set roof window width - L_roof_win1_wid
  setL_roof_win1_wid(roomId: number | string, width: number | ""): void {
    const column = this.getRoomColumn(roomId);
    this.grid.setCell('IN_rooms', `${column}41`, width);
  }

  // Get roof window height - L_roof_win1_hei
  getL_roof_win1_hei(roomId: number | string): number {
    const column = this.getRoomColumn(roomId);
    return this.grid.getCellNumeric('IN_rooms', `${column}42`);
  }

  // Set roof window height - L_roof_win1_hei
  setL_roof_win1_hei(roomId: number | string, height: number | ""): void {
    const column = this.getRoomColumn(roomId);
    this.grid.setCell('IN_rooms', `${column}42`, height);
  }

  // Get roof window year - YEAR_roof_win1
  getYEAR_roof_win1(roomId: number | string): string {
    const column = this.getRoomColumn(roomId);
    return this.grid.getCell('IN_rooms', `${column}43`).toString();
  }

  // Set roof window year - YEAR_roof_win1
  setYEAR_roof_win1(roomId: number | string, year: string): void {
    const column = this.getRoomColumn(roomId);
    this.grid.setCell('IN_rooms', `${column}43`, year);
  }

  // Get roof window count - NO_roof_win1
  getNO_roof_win1(roomId: number | string): number {
    const column = this.getRoomColumn(roomId);
    return this.grid.getCellNumeric('IN_rooms', `${column}44`);
  }

  // Set roof window count - NO_roof_win1
  setNO_roof_win1(roomId: number | string, count: number | ""): void {
    const column = this.getRoomColumn(roomId);
    this.grid.setCell('IN_rooms', `${column}44`, count);
  }

  // Roof window methods - Type 2 (rows 45-48)

  // Get roof window width - L_roof_win2_wid
  getL_roof_win2_wid(roomId: number | string): number {
    const column = this.getRoomColumn(roomId);
    return this.grid.getCellNumeric('IN_rooms', `${column}45`);
  }

  // Set roof window width - L_roof_win2_wid
  setL_roof_win2_wid(roomId: number | string, width: number | ""): void {
    const column = this.getRoomColumn(roomId);
    this.grid.setCell('IN_rooms', `${column}45`, width);
  }

  // Get roof window height - L_roof_win2_hei
  getL_roof_win2_hei(roomId: number | string): number {
    const column = this.getRoomColumn(roomId);
    return this.grid.getCellNumeric('IN_rooms', `${column}46`);
  }

  // Set roof window height - L_roof_win2_hei
  setL_roof_win2_hei(roomId: number | string, height: number | ""): void {
    const column = this.getRoomColumn(roomId);
    this.grid.setCell('IN_rooms', `${column}46`, height);
  }

  // Get roof window year - YEAR_roof_win2
  getYEAR_roof_win2(roomId: number | string): string {
    const column = this.getRoomColumn(roomId);
    return this.grid.getCell('IN_rooms', `${column}47`).toString();
  }

  // Set roof window year - YEAR_roof_win2
  setYEAR_roof_win2(roomId: number | string, year: string): void {
    const column = this.getRoomColumn(roomId);
    this.grid.setCell('IN_rooms', `${column}47`, year);
  }

  // Get roof window count - NO_roof_win2
  getNO_roof_win2(roomId: number | string): number {
    const column = this.getRoomColumn(roomId);
    return this.grid.getCellNumeric('IN_rooms', `${column}48`);
  }

  // Set roof window count - NO_roof_win2
  setNO_roof_win2(roomId: number | string, count: number | ""): void {
    const column = this.getRoomColumn(roomId);
    this.grid.setCell('IN_rooms', `${column}48`, count);
  }

  // Horizontal ceiling methods (topceil)

  // Get topceil width
  getL_topceil__wid(roomId: number | string): number {
    const column = this.getRoomColumn(roomId);
    return this.grid.getCellNumeric('IN_rooms', `${column}32`);
  }

  // Set topceil width
  setL_topceil__wid(roomId: number | string, width: number | ""): void {
    const column = this.getRoomColumn(roomId);
    this.grid.setCell('IN_rooms', `${column}32`, width);
  }

  // Get topceil length
  getL_topceil__len(roomId: number | string): number {
    const column = this.getRoomColumn(roomId);
    return this.grid.getCellNumeric('IN_rooms', `${column}33`);
  }

  // Set topceil length
  setL_topceil__len(roomId: number | string, length: number | ""): void {
    const column = this.getRoomColumn(roomId);
    this.grid.setCell('IN_rooms', `${column}33`, length);
  }



  // Window data access methods
  // Window type 1
  getWindowWidth(roomId: number | string, windowType: number = 1): number {
    const column = this.getRoomColumn(roomId);
    const row = 13 + (windowType - 1) * 5; // Types are positioned 5 rows apart starting at row 13
    return this.grid.getCellNumeric('IN_rooms', `${column}${row}`);
  }

  setWindowWidth(roomId: number | string, width: number, windowType: number = 1): void {
    const column = this.getRoomColumn(roomId);
    const row = 13 + (windowType - 1) * 5;
    this.grid.setCell('IN_rooms', `${column}${row}`, width);
  }

  getWindowHeight(roomId: number | string, windowType: number = 1): number {
    const column = this.getRoomColumn(roomId);
    const row = 14 + (windowType - 1) * 5;
    return this.grid.getCellNumeric('IN_rooms', `${column}${row}`);
  }

  setWindowHeight(roomId: number | string, height: number, windowType: number = 1): void {
    const column = this.getRoomColumn(roomId);
    const row = 14 + (windowType - 1) * 5;
    this.grid.setCell('IN_rooms', `${column}${row}`, height);
  }

  getWindowYear(roomId: number | string, windowType: number = 1): string {
    const column = this.getRoomColumn(roomId);
    const row = 15 + (windowType - 1) * 5;
    return this.grid.getCell('IN_rooms', `${column}${row}`).toString();
  }

  setWindowYear(roomId: number | string, year: string, windowType: number = 1): void {
    const column = this.getRoomColumn(roomId);
    const row = 15 + (windowType - 1) * 5;
    this.grid.setCell('IN_rooms', `${column}${row}`, year);
  }

  getWindowCount(roomId: number | string, windowType: number = 1): number {
    const column = this.getRoomColumn(roomId);
    const row = 16 + (windowType - 1) * 5;
    return this.grid.getCellNumeric('IN_rooms', `${column}${row}`);
  }

  setWindowCount(roomId: number | string, count: number, windowType: number = 1): void {
    const column = this.getRoomColumn(roomId);
    const row = 16 + (windowType - 1) * 5;
    this.grid.setCell('IN_rooms', `${column}${row}`, count);
  }

  // Heating element data access methods
  getHeatingType(roomId: number | string, heatingType: number = 1): HeaterType {
    const column = this.getRoomColumn(roomId);
    const row = 50 + (heatingType - 1) * 7; // Type_rad1 in row 50, Type_rad2 in row 57, Type_rad3 in row 64
    return this.grid.getCell('IN_rooms', `${column}${row}`).toString() as HeaterType;
  }

  setHeatingType(roomId: number | string, type: string, heatingType: number = 1): void {
    const column = this.getRoomColumn(roomId);
    const row = 50 + (heatingType - 1) * 7; // Type_rad1 in row 50, Type_rad2 in row 57, Type_rad3 in row 64
    this.grid.setCell('IN_rooms', `${column}${row}`, type);
  }

  getHeatingLength(roomId: number | string, heatingType: number = 1): number {
    const column = this.getRoomColumn(roomId);
    const row = 51 + (heatingType - 1) * 7; // L_rad1_len in row 51, L_rad2_len in row 58, L_rad3_len in row 65
    return this.grid.getCellNumeric('IN_rooms', `${column}${row}`);
  }

  setHeatingLength(roomId: number | string, length: number, heatingType: number = 1): void {
    const column = this.getRoomColumn(roomId);
    const row = 51 + (heatingType - 1) * 7; // L_rad1_len in row 51, L_rad2_len in row 58, L_rad3_len in row 65
    this.grid.setCell('IN_rooms', `${column}${row}`, length);
  }

  getHeatingHeight(roomId: number | string, heatingType: number = 1): number {
    const column = this.getRoomColumn(roomId);
    const row = 52 + (heatingType - 1) * 7; // L_rad1_height in row 52, L_rad2_height in row 59, L_rad3_height in row 66
    return this.grid.getCellNumeric('IN_rooms', `${column}${row}`);
  }

  setHeatingHeight(roomId: number | string, height: number | string, heatingType: number = 1): void {
    const column = this.getRoomColumn(roomId);
    const row = 52 + (heatingType - 1) * 7; // L_rad1_height in row 52, L_rad2_height in row 59, L_rad3_height in row 66
    this.grid.setCell('IN_rooms', `${column}${row}`, height);
  }

  getHeatingCount(roomId: number | string, heatingType: number = 1): number {
    const column = this.getRoomColumn(roomId);
    const row = 55 + (heatingType - 1) * 7; // Row for heater count (n_rad1 in row 55, n_rad2 in row 62, etc.)
    return this.grid.getCellNumeric('IN_rooms', `${column}${row}`);
  }

  setHeatingCount(roomId: number | string, count: number, heatingType: number = 1): void {
    const column = this.getRoomColumn(roomId);
    const row = 55 + (heatingType - 1) * 7; // Row for heater count (n_rad1 in row 55, n_rad2 in row 62, etc.)
    this.grid.setCell('IN_rooms', `${column}${row}`, count);
  }

  // Get number of radiator elements - n_rad(N)_col
  getn_rad_col(roomId: number | string, heatingType: number = 1): number {
    const column = this.getRoomColumn(roomId);
    const row = 54 + (heatingType - 1) * 7; // Position of n_rad1_col in row 54, n_rad2_col in row 61, etc.
    return this.grid.getCellNumeric('IN_rooms', `${column}${row}`);
  }

  // Set number of radiator elements - n_rad(N)_col
  setn_rad_col(roomId: number | string, count: number, heatingType: number = 1): void {
    const column = this.getRoomColumn(roomId);
    const row = 54 + (heatingType - 1) * 7; // Position of n_rad1_col in row 54, n_rad2_col in row 61, etc.
    this.grid.setCell('IN_rooms', `${column}${row}`, count);
  }

  // Get depth of heating element (L_rad(N)_thick in row 53, 60, 67)
  getHeatingDepth(roomId: number | string, heatingType: number = 1): number {
    const column = this.getRoomColumn(roomId);
    const row = 53 + (heatingType - 1) * 7; // L_rad1_thick in row 53, L_rad2_thick in row 60, L_rad3_thick in row 67
    return this.grid.getCellNumeric('IN_rooms', `${column}${row}`);
  }

  // Set depth of heating element (L_rad(N)_thick in row 53, 60, 67)
  setHeatingDepth(roomId: number | string, depth: number | string, heatingType: number = 1): void {
    const column = this.getRoomColumn(roomId);
    const row = 53 + (heatingType - 1) * 7; // L_rad1_thick in row 53, L_rad2_thick in row 60, L_rad3_thick in row 67
    this.grid.setCell('IN_rooms', `${column}${row}`, depth);
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
   * Gets all standardized values for a heater dimension (height, width, or depth)
   * Uses specific ranges in the Daten sheet based on the subtype and dimension
   *
   * @param dimensionType - The dimension type ('Höhe', 'Breite', 'Tiefe', 'Glieder')
   * @param heaterType - The type of heater
   * @param subtype - The subtype of heater (optional)
   * @returns Array of possible values or empty array if no standardized values exist
   */
  getHeizkoerperDimensionOptions(dimensionType: "Höhe" | "Breite" | "Tiefe" | "Glieder", heaterType: string, subtype?: string): number[] {

    // Define explicit ranges for each subtype/dimension combination
    let startCell = '';
    let endCell = '';

    // Big if-tree for all possible subtype and dimension combinations
    if (dimensionType === 'Höhe') {
      if (subtype === 'Typ_10') {
        startCell = 'K24';
        endCell = 'K27';  // Values: 350, 500, 600, 900
      } else if (subtype === 'Typ_11') {
        startCell = 'L24';
        endCell = 'L27';  // Values: 350, 500, 600, 900
      } else if (subtype === 'Typ_20') {
        startCell = 'M24';
        endCell = 'M27';  // Values: 350, 500, 600, 900
      } else if (subtype === 'Typ_21') {
        startCell = 'N24';
        endCell = 'N27';  // Values: 350, 500, 600, 900
      } else if (subtype === 'Typ_22') {
        startCell = 'O24';
        endCell = 'O27';  // Values: 350, 500, 600, 900
      } else if (subtype === 'Typ_30') {
        startCell = 'P24';
        endCell = 'P27';  // Values: 350, 500, 600, 900
      } else if (subtype === 'Typ_33') {
        startCell = 'Q24';
        endCell = 'Q27';  // Values: 350, 500, 600, 900
      } else if (subtype === 'Gussradiator') {
        startCell = 'S24';
        endCell = 'S28';  // Values: 280, 430, 580, 680, 980
      } else if (subtype === 'Stahlradiator') {
        startCell = 'T24';
        endCell = 'T27';  // Values: 300, 450, 600, 1000
      } else if (subtype === 'Stahlrohrradiator') {
        startCell = 'U24';
        endCell = 'U36';  // Values: 190, 260, 300, 400, 500, 600, 750, 900, 1000, 1200, 1500, 2000, 2500
      } else if (subtype === 'Fensterbankradiator') {
        startCell = 'V24';
        endCell = 'V27';  // Values: 180, 225, 270, 315
      } else if (subtype === 'Handtuchradiator') {
        startCell = 'W24';
        endCell = 'W38';  // Values: 400, 500, 600, 700, 800, 900, 1000, 1100, 1200, 1300, 1400, 1500, 1600, 1700, 1800
      } else if (subtype === 'Standardkonvektor') {
        startCell = 'AA24';
        endCell = 'AA27';  // Values: 70, 140, 210, 280
      }
    } else if (dimensionType === 'Tiefe') {
      if (subtype === 'Typ_10') {
        startCell = 'K15';
        endCell = 'K15';  // Value: 65
      } else if (subtype === 'Typ_11') {
        startCell = 'L15';
        endCell = 'L15';  // Value: 65
      } else if (subtype === 'Typ_20') {
        startCell = 'M15';
        endCell = 'M15';  // Value: 100
      } else if (subtype === 'Typ_21') {
        startCell = 'N15';
        endCell = 'N15';  // Value: 100
      } else if (subtype === 'Typ_22') {
        startCell = 'O15';
        endCell = 'O15';  // Value: 100
      } else if (subtype === 'Typ_30') {
        startCell = 'P15';
        endCell = 'P15';  // Value: 155
      } else if (subtype === 'Typ_33') {
        startCell = 'Q15';
        endCell = 'Q15';  // Value: 155
      } else if (subtype === 'Gussradiator') {
        startCell = 'S15';
        endCell = 'S19';  // Values: 70, 110, 160, 220, 250
      } else if (subtype === 'Stahlradiator') {
        startCell = 'T15';
        endCell = 'T19';  // Values: 70, 110, 160, 220, 250
      } else if (subtype === 'Stahlrohrradiator') {
        startCell = 'U15';
        endCell = 'U19';  // Values: 65, 105, 145, 185, 225
      } else if (subtype === 'Fensterbankradiator') {
        startCell = 'V15';
        endCell = 'V19';  // Values: 145, 185, 225, 265
      } else if (subtype === 'Standardkonvektor') {
        startCell = 'AA15';
        endCell = 'AA18';  // Values: 73, 134, 196, 257
      }
    } else if (dimensionType === 'Breite') {
      if (heaterType === 'Flachheizkoerper_senkrecht_profiliert') {
        startCell = 'K57';
        endCell = 'K60';  // Values: 300, 450, 550, 850 TODO: prüfen mit Jakob ob das stimmt
      } else if (['Flachheizkoerper_glatt', 'Rohrradiator', 'Rohrheizkörper'].includes(heaterType)) {
        startCell = 'R57';
        endCell = 'R60';  // Values: 300, 450, 550, 850
      }
      // Gliederheizkörper and Konvektor have no standard widths (keep startCell/endCell empty)
    }

    // If we found a range, get the values
    if (startCell && endCell) {
      return this.grid.getCells('Daten', startCell, endCell)
        .flatMap(row => [row[0]])
        .filter(value => typeof value === 'number')
        .filter(value => !isNaN(value) && value > 0);
    }

    // No range found, return empty array
    return [];
  }

  /**
   * INDIRECT lookup formula logic similar to Excel.
   *
   * @param name - The type of heater to get subtypes for
   * @returns Array of values for the named expression. if 2 dim, only first col is returned
   */
  getNamesExpressionValueList(name: string): string[] {
    // Try to get the range reference from the Names sheet
    const rangeRef = this.grid.getCell('Names', name);

    if (typeof rangeRef !== 'string') {
      return [];
    }

    // Parse the range reference (format: "Daten!K4:K10" or "Daten!P4")
    const [, sheet, startCell, endSheet, endCell] = rangeRef.match(/(?:(\w[\w\s]*)!)?([A-Za-z]+\d+)(?::(?:(\w[\w\s]*)!)?([A-Za-z]+\d+))?/) ?? [];

    // Get cells from the range
    // Determine if this is a database range (has header)
    // Skip the header row if it's a database range
    const startIndex = name in databaseRanges ? 1 : 0;

    // Extract the first column values using flatMap
    return this.grid.getCells(sheet, startCell, endCell ?? startCell)
      .slice(startIndex)  // Skip header if needed
      .flatMap(row => row[0].toString());
  }

  /**
   * Extracts a column from a named database-like range by header name.
   *
   * @param name - The name expression referring to a 2D range
   * @param column - The column name (from the header row) to extract
   * @returns The column values without the header row
   */
  getNamesExpressionColumn(name: string, column: string): string[] {
    // Resolve the named range reference like "Daten!A1:C10"
    const rangeRef = this.grid.getCell('Names', name);
    if (typeof rangeRef !== 'string') return [];

    const [, sheet, startCell, endSheet, endCell] =
    rangeRef.match(/(?:(\w[\w\s]*)!)?([A-Za-z]+\d+)(?::(?:(\w[\w\s]*)!)?([A-Za-z]+\d+))?/) ?? [];

    const matrix = this.grid.getCells(sheet, startCell, endCell ?? startCell);
    if (!matrix || matrix.length === 0) return [];

    // First row = headers
    const headers = matrix[0];
    const colIndex = headers.indexOf(column);
    if (colIndex === -1) return [];

    // Return all rows in that column excluding the header
    return matrix.slice(1).map(row => row[colIndex]?.toString?.() ?? '');
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
  setSelectedRoom(roomId: string): void {
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
          id: roomId.toString(),
          name: name,
          type: '?' // Default type TODO: type is not saved, Absicht?
        });
      }
    }

    return rooms;
  }

  // Add a new room to the DataGrid
  addRoom(name: string, type: string): string {
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

        // Set default values for new room
        this.setRoomArea(roomId, 20); // Default area: 20m²
        this.setRoomHeight(roomId, roomHeight); // Use height from the first room or default
        this.setRoomTemperature(roomId, 20); // Default temperature: 20°C
        this.setRoomCeilingType(roomId, 'unbeheizt'); // Default ceiling type
        this.setRoomFloorType(roomId, 'unbeheizt'); // Default floor type: unbeheizter Raum
        this.setRoomWallLength(roomId, 5); // Default wall length: 5m
        // Set insulation thickness to empty (will show building value as placeholder)
        this.setRoomWallInsulationThickness(roomId, "");

        // Set default values for interior walls
        this.setHasInteriorWalls(roomId, false); // Default: no interior walls
        this.setInteriorWallLength(roomId, 0);
        this.setInteriorWallInsulationThickness(roomId, "");

        // Set default values for roof
        // Default roof presence based on building roof type
        const hasRoofSlope = !this.hasFlatRoof();
        this.setEXIST_roof(roomId, hasRoofSlope);
        this.setNO_roof_slop(roomId, false); // Default: only one roof slope
        this.setL_roof_wid(roomId, 4); // Default width: 4m
        this.setL_roof_hei(roomId, 3); // Default height: 3m
        this.setL_roof_jamb_hei(roomId, 0); // Default knee wall height: 0m
        this.setTYP_jamb_hei(roomId, true); // Default: knee wall is hollow

        // Set default values for horizontal ceiling (topceil)
        this.setL_topceil__wid(roomId, ""); // Default: no horizontal ceiling
        this.setL_topceil__len(roomId, "");

        // Set default value for dormer
        this.setEXIST_dormer(roomId, false); // Default: no dormer

        // Set default values for roof windows
        // Default values for roof window type 1
        this.setL_roof_win1_wid(roomId, ""); // Default: no roof window
        this.setL_roof_win1_hei(roomId, "");
        this.setYEAR_roof_win1(roomId, "");
        this.setNO_roof_win1(roomId, "");

        // Default values for roof window type 2
        this.setL_roof_win2_wid(roomId, ""); // Default: no roof window
        this.setL_roof_win2_hei(roomId, "");
        this.setYEAR_roof_win2(roomId, "");
        this.setNO_roof_win2(roomId, "");

        // Update the roomsSubject
        const newRoomsList = this.getAllRooms();
        this.roomsSubject.next(newRoomsList);

        return roomId.toString();
      }
    }

    throw new Error('Maximum number of rooms (15) reached');
  }

  // Remove a room from the DataGrid
  removeRoom(roomId: string): void {
    const id = parseInt(roomId, 10);

    // Ensure we can only remove the last room in the list
    const rooms = this.getAllRooms();
    const isLastRoom = rooms.findIndex(room => room.id === roomId) === rooms.length - 1;

    if (!isLastRoom) {
      console.warn('Only the last room can be removed. Please remove rooms in reverse order.');
      return;
    }

    // Set name to empty to mark it as inactive/removed
    this.setRoomName(id, '');

    // Update the roomsSubject
    const updatedRooms = this.getAllRooms();
    this.roomsSubject.next(updatedRooms);

    // If the selected room was removed, select another one or none
    if (this.selectedRoomSubject.getValue() === roomId) {
      const newSelectedId = updatedRooms.length > 0 ? updatedRooms[0].id : '';
      this.setSelectedRoom(newSelectedId);
    }
  }

  // Initialize rooms from DataGrid
  initializeRooms(): void {
    const rooms = this.getAllRooms();
    this.roomsSubject.next(rooms);

    // Select the first room if available
    if (rooms.length > 0) {
      this.setSelectedRoom(rooms[0].id);
    }
  }
}
