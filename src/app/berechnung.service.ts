import {Injectable} from '@angular/core';
import {Waermepumpen_Eingabedaten, Waermepumpen_Empfehlungen, Waermepumpen_Hinweise} from "./data";
import {ABS, CellContent, DataGrid, ISTLEER, ODER, UND, WAHR, WENN, WENNS} from "./data-grid";
import {debounceTime, filter} from "rxjs";

const STORAGE_KEY = 'UBA-WAERMEPUMPEN-DATA';

@Injectable({
  providedIn: 'root'
})
export class BerechnungService {

  public grid: DataGrid = new DataGrid();

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
      localStorage.setItem(STORAGE_KEY, grid.serializeWhitelistedCells(this.cellsToSave));
    });

    // Restore cells from localStorage if available
    const serializedData = localStorage.getItem(STORAGE_KEY);
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
}
