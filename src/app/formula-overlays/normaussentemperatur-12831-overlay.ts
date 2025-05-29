import {DataGrid} from '../data-grid';
import {FormulaOverlay} from './base-overlay';

/**
 * Normaußentemperatur_12831 sheet formula overlay
 * Contains formula implementations for the Normaußentemperatur_12831 sheet
 */
export class Normaussentemperatur12831Overlay implements FormulaOverlay {
  /**
   * Apply Normaußentemperatur_12831 formulas to the data grid
   * @param grid The DataGrid instance to apply formulas to
   */
  applyFormulas(grid: DataGrid): void {
    /**
     * Cell B3: PLZ from building data
     * Gets the postal code from building data
     * Excel: "IN_build!$P$2"
     */
    grid.setCell('Normaußentemperatur_12831', 'B3', (s, c, g) =>
      g.g('IN_build', 'P2'));

    /**
     * Cell B5: Find closest PLZ in Tabelle4
     * Finds the postal code in the database that's closest to the input PLZ
     * Uses an INDEX/MATCH with ABS difference to find the nearest match
     * Excel: "INDEX(Tabelle4[Plz],MATCH(MIN(ABS(Tabelle4[Plz]-$B$3)),ABS(Tabelle4[Plz]-$B$3),0))"
     */
    grid.setCell('Normaußentemperatur_12831', 'B5', (s, c, g) => {
      // Get PLZ from cell B3
      const plzInput = g.n('Normaußentemperatur_12831', 'B3');

      // Get the Tabelle4 range reference and extract PLZ data
      const plzRange = g.getCells('Normaußentemperatur_12831', 'E3', 'E521');
      if (!plzRange || !plzRange.length) return null;

      // Calculate the absolute differences
      const plzValues = plzRange.flat().map(val => Number(val));
      const absDifferences = plzValues.map(plz => Math.abs(plz - plzInput));

      // Find the index of the minimum difference
      const minDiff = Math.min(...absDifferences);
      const minIndex = absDifferences.indexOf(minDiff);

      // Return the PLZ at that index
      return plzValues[minIndex];
    });

    /**
     * Cell B6: Look up temperature based on found PLZ
     * Uses XLOOKUP to find the corresponding temperature for the matched postal code
     * This is the design temperature (Außentemperatur) from DIN 12831 standard
     * Excel: "_xlfn.XLOOKUP(B5,Tabelle4[Plz],Tabelle4[Außentemperatur °C])"
     */
    grid.setCell('Normaußentemperatur_12831', 'B6', (s, c, g) => {
      // Get the PLZ to look up
      const plzToFind = g.n('Normaußentemperatur_12831', 'B5');

      // Get the PLZ and temperature data
      const plzRange = g.getCells('Normaußentemperatur_12831', 'E3', 'E521');
      const tempRange = g.getCells('Normaußentemperatur_12831', 'F3', 'F521');

      if (!plzRange || !plzRange.length || !tempRange || !tempRange.length) return null;

      // Convert to flat arrays
      const plzValues = plzRange.flat().map(val => Number(val));
      const tempValues = tempRange.flat().map(val => Number(val));

      // Find the index of the matching PLZ
      const index = plzValues.findIndex(plz => plz === plzToFind);

      // Return the temperature at that index, or null if not found
      return index >= 0 ? tempValues[index] : null;
    });
  }
}
