import { DataGrid } from '../data-grid';
import { FormulaOverlay } from './base-overlay';

/**
 * IN_build sheet formula overlay
 * Contains formula implementations for the IN_build sheet
 */
export class InBuildOverlay implements FormulaOverlay {
  /**
   * Apply IN_build formulas to the data grid
   * @param grid The DataGrid instance to apply formulas to
   */
  applyFormulas(grid: DataGrid): void {
    // Implementation of column R formulas (modernization year)
    // R7 formula: _xlfn.IFS(AND(RIGHT($P$5,4)<="1978",$Q$7="Ja"),Daten!$M$65,AND(RIGHT($P$5,4)>"1978",$Q$7="Ja"),Daten!$M$66,$Q$7="Nein",$P$5)
    grid.setCell('IN_build', 'R7', (s, c, g) =>
      g.WENNS(
        g.UND(g.RECHTS(g.g(s, 'P5'), 4) <= "1978", g.g(s, 'Q7') === "Ja"),
        g.g('Daten', 'M65'),
        g.UND(g.RECHTS(g.g(s, 'P5'), 4) > "1978", g.g(s, 'Q7') === "Ja"),
        g.g('Daten', 'M66'),
        g.g(s, 'Q7') === "Nein",
        g.g(s, 'P5')
      )
    );

    // R8 formula: _xlfn.IFS(AND(RIGHT($P$5,4)<="1978",$Q$8="Ja"),Daten!$M$66,AND(RIGHT($P$5,4)>"1978",$Q$8="Ja"),U_Werte_IWU!$D$78,$Q$8="Nein",$P$5)
    grid.setCell('IN_build', 'R8', (s, c, g) =>
      g.WENNS(
        g.UND(g.RECHTS(g.g(s, 'P5'), 4) <= "1978", g.g(s, 'Q8') === "Ja"),
        g.g('Daten', 'M66'),
        g.UND(g.RECHTS(g.g(s, 'P5'), 4) > "1978", g.g(s, 'Q8') === "Ja"),
        g.g('U_Werte_IWU', 'D78'),
        g.g(s, 'Q8') === "Nein",
        g.g(s, 'P5')
      )
    );

    // R9 formula: _xlfn.IFS(AND(RIGHT($P$5,4)<="1978",$Q$9="Ja"),Daten!$M$65,AND(RIGHT($P$5,4)>"1978",$Q$9="Ja"),Daten!$M$66,$Q$9="Nein",$P$5)
    grid.setCell('IN_build', 'R9', (s, c, g) =>
      g.WENNS(
        g.UND(g.RECHTS(g.g(s, 'P5'), 4) <= "1978", g.g(s, 'Q9') === "Ja"),
        g.g('Daten', 'M65'),
        g.UND(g.RECHTS(g.g(s, 'P5'), 4) > "1978", g.g(s, 'Q9') === "Ja"),
        g.g('Daten', 'M66'),
        g.g(s, 'Q9') === "Nein",
        g.g(s, 'P5')
      )
    );

    // R10 formula: _xlfn.IFS(AND(RIGHT($P$5,4)<="1978",$Q$10="Ja"),Daten!$M$77,AND(RIGHT($P$5,4)>"1978",$Q$10="Ja"),Daten!$M$78,$Q$10="Nein",$P$5)
    grid.setCell('IN_build', 'R10', (s, c, g) =>
      g.WENNS(
        g.UND(g.RECHTS(g.g(s, 'P5'), 4) <= "1978", g.g(s, 'Q10') === "Ja"),
        g.g('Daten', 'M77'),
        g.UND(g.RECHTS(g.g(s, 'P5'), 4) > "1978", g.g(s, 'Q10') === "Ja"),
        g.g('Daten', 'M78'),
        g.g(s, 'Q10') === "Nein",
        g.g(s, 'P5')
      )
    );

    // R11 formula: _xlfn.IFS(AND(RIGHT($P$5,4)<="1978",$Q$11="Ja"),Daten!$M$65,AND(RIGHT($P$5,4)>"1978",$Q$11="Ja"),Daten!$M$66,$Q$11="Nein",$P$5)
    grid.setCell('IN_build', 'R11', (s, c, g) =>
      g.WENNS(
        g.UND(g.RECHTS(g.g(s, 'P5'), 4) <= "1978", g.g(s, 'Q11') === "Ja"),
        g.g('Daten', 'M65'),
        g.UND(g.RECHTS(g.g(s, 'P5'), 4) > "1978", g.g(s, 'Q11') === "Ja"),
        g.g('Daten', 'M66'),
        g.g(s, 'Q11') === "Nein",
        g.g(s, 'P5')
      )
    );

    // Implementation of column T formulas (insulation thickness)
    // T7 formula: IF(Q7="Ja",_xlfn.XLOOKUP(1, (UWert_Mod[Bauteil]=E7)*(UWert_Mod[Modernisierungsjahr]=S7), UWert_Mod[d_ins]),0)
    grid.setCell('IN_build', 'T7', (s, c, g) =>
      g.WENN(
        g.g(s, 'Q7') === 'Ja',
        g.XVERWEIS(
          1,
          g.MULT(
            g.GLEICH(g.INDIREKT_DB_REF("UWert_Mod", "Bauteil"), g.g(s, 'E7')),
            g.GLEICH(g.INDIREKT_DB_REF("UWert_Mod", "Modernisierungsjahr"), g.g(s, 'S7'))
          ),
          g.INDIREKT_DB_REF("UWert_Mod", "d_ins")
        ),
        0
      )
    );

    // T9 formula: IF(Q9="Ja",_xlfn.XLOOKUP(1, (UWert_Mod[Bauteil]=E9)*(UWert_Mod[Modernisierungsjahr]=S9), UWert_Mod[d_ins]),0)
    grid.setCell('IN_build', 'T9', (s, c, g) =>
      g.WENN(
        g.g(s, 'Q9') === 'Ja',
        g.XVERWEIS(
          1,
          g.MULT(
            g.GLEICH(g.INDIREKT_DB_REF("UWert_Mod", "Bauteil"), g.g(s, 'E9')),
            g.GLEICH(g.INDIREKT_DB_REF("UWert_Mod", "Modernisierungsjahr"), g.g(s, 'S9'))
          ),
          g.INDIREKT_DB_REF("UWert_Mod", "d_ins")
        ),
        0
      )
    );

    // T10 formula: IF(Q10="Ja",_xlfn.XLOOKUP(1, (UWert_Mod[Bauteil]=E10)*(UWert_Mod[Modernisierungsjahr]=S10), UWert_Mod[d_ins]),0)
    grid.setCell('IN_build', 'T10', (s, c, g) =>
      g.WENN(
        g.g(s, 'Q10') === 'Ja',
        g.XVERWEIS(
          1,
          g.MULT(
            g.GLEICH(g.INDIREKT_DB_REF("UWert_Mod", "Bauteil"), g.g(s, 'E10')),
            g.GLEICH(g.INDIREKT_DB_REF("UWert_Mod", "Modernisierungsjahr"), g.g(s, 'S10'))
          ),
          g.INDIREKT_DB_REF("UWert_Mod", "d_ins")
        ),
        0
      )
    );

    // T11 formula: IF(Q11="Ja",_xlfn.XLOOKUP(1, (UWert_Mod[Bauteil]=E11)*(UWert_Mod[Modernisierungsjahr]=S11), UWert_Mod[d_ins]),0)
    grid.setCell('IN_build', 'T11', (s, c, g) =>
      g.WENN(
        g.g(s, 'Q11') === 'Ja',
        g.XVERWEIS(
          1,
          g.MULT(
            g.GLEICH(g.INDIREKT_DB_REF("UWert_Mod", "Bauteil"), g.g(s, 'E11')),
            g.GLEICH(g.INDIREKT_DB_REF("UWert_Mod", "Modernisierungsjahr"), g.g(s, 'S11'))
          ),
          g.INDIREKT_DB_REF("UWert_Mod", "d_ins")
        ),
        0
      )
    );

    // P21 formula: P20*-1.8257+43.457+P20
    // Calculating flow temperature based on outside temperature
    grid.setCell('IN_build', 'P21', (s, c, g) =>
      g.n(s, 'P20') * -1.8257 + 43.457 + g.n(s, 'P20')
    );

    // P22 formula: IF(P16="Ja",P17<=55,IF(P18="Ja",P19<P21,FALSE))
    // Checking if the system is suitable for low temperature heating
    grid.setCell('IN_build', 'P22', (s, c, g) =>
      g.WENN(
        g.g(s, 'P16') === "Ja",
        g.n(s, 'P17') <= 55,
        g.WENN(
          g.g(s, 'P18') === "Ja",
          g.g(s, 'P19') < g.g(s, 'P21'),
          g.FALSCH()
        )
      )
    );
  }
}
