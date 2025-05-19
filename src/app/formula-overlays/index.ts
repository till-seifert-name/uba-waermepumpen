import { DataGrid } from '../data-grid';
import { FormulaOverlay } from './base-overlay';
import { InRoomsOverlay } from './in-rooms-overlay';
import { DatenOverlay } from './daten-overlay';
import { InBuildOverlay } from './in-build-overlay';
import { OutRoomsOverlay } from './out-rooms-overlay';
import { ClcBuildOverlay } from './clc-build-overlay';
import { ClcFlatOverlay } from './clc-flat-overlay';
import { ClcLoadOverlay } from './clc-load-overlay';
import { ClcPowerOverlay } from './clc-power-overlay';
import { ClcColOverlay } from './clc-col-overlay';
import { ClcTubeOverlay } from './clc-tube-overlay';
import { ResColOverlay } from './res-col-overlay';
import { ResTubeOverlay } from './res-tube-overlay';
import { ResFlatOverlay } from './res-flat-overlay';
import { Normaussentemperatur12831Overlay } from './normaussentemperatur-12831-overlay';

// Create overlay instances
const overlays: FormulaOverlay[] = [
  new InRoomsOverlay(),
  new DatenOverlay(),
  new InBuildOverlay(),
  new OutRoomsOverlay(),
  new ClcBuildOverlay(),
  new ClcFlatOverlay(),
  new ClcLoadOverlay(),
  new ClcPowerOverlay(),
  new ClcColOverlay(),
  new ClcTubeOverlay(),
  new ResColOverlay(),
  new ResTubeOverlay(),
  new ResFlatOverlay(),
  new Normaussentemperatur12831Overlay()
];

/**
 * Apply all formula overlays to the data grid
 * @param grid DataGrid instance to apply formulas to
 */
export function applyFormulaOverlays(grid: DataGrid): void {
  // Apply each overlay's formulas
  overlays.forEach(overlay => overlay.applyFormulas(grid));
}