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
    // R7 formula: IF(S7="",_xlfn.IFS(AND(RIGHT($P$5,4)<="1978",$Q$7="Ja"),Daten!$M$65,AND(RIGHT($P$5,4)>"1978",$Q$7="Ja"),Daten!$M$66,$Q$7="Nein",$P$5),S7)
    grid.setCell('IN_build', 'R7', (s, c, g) =>
      g.WENN(
        g.g(s, 'S7') === "",
        g.WENNS(
          g.UND(g.RECHTS(g.g(s, 'P5'), 4) <= "1978", g.g(s, 'Q7') === "Ja"),
          g.g('Daten', 'M65'),
          g.UND(g.RECHTS(g.g(s, 'P5'), 4) > "1978", g.g(s, 'Q7') === "Ja"),
          g.g('Daten', 'M66'),
          g.g(s, 'Q7') === "Nein",
          g.g(s, 'P5')
        ),
        g.g(s, 'S7')
      )
    );

    // R8 formula: IF($Q$8="Ja",_xlfn.IFS(S8<>"",S8,RIGHT($P$5,4)<="1978",Daten!$M$66,RIGHT($P$5,4)>"1978",U_Werte_IWU!$D$78),$P$5)
    grid.setCell('IN_build', 'R8', (s, c, g) =>
      g.WENN(
        g.g(s, 'Q8') === "Ja",
        g.WENNS(
          g.g(s, 'S8') != "",
          g.g(s, 'S8'),
          g.RECHTS(g.g(s, 'P5'), 4) <= "1978",
          g.g('Daten', 'M66'),
          g.RECHTS(g.g(s, 'P5'), 4) > "1978",
          g.g('U_Werte_IWU', 'D78')
        ),
        g.g(s, 'P5')
      )
    );

    // R9 formula: IF(S9="",_xlfn.IFS(AND(RIGHT($P$5,4)<="1978",$Q$9="Ja"),Daten!$M$65,AND(RIGHT($P$5,4)>"1978",$Q$9="Ja"),Daten!$M$66,$Q$9="Nein",$P$5),S9)
    grid.setCell('IN_build', 'R9', (s, c, g) =>
      g.WENN(
        g.g(s, 'S9') === "",
        g.WENNS(
          g.UND(g.RECHTS(g.g(s, 'P5'), 4) <= "1978", g.g(s, 'Q9') === "Ja"),
          g.g('Daten', 'M65'),
          g.UND(g.RECHTS(g.g(s, 'P5'), 4) > "1978", g.g(s, 'Q9') === "Ja"),
          g.g('Daten', 'M66'),
          g.g(s, 'Q9') === "Nein",
          g.g(s, 'P5')
        ),
        g.g(s, 'S9')
      )
    );

    // R10 formula: IF(S10="",_xlfn.IFS(AND(RIGHT($P$5,4)<="1978",$Q$10="Ja"),Daten!$M$77,AND(RIGHT($P$5,4)>"1978",$Q$10="Ja"),Daten!$M$78,$Q$10="Nein",$P$5),S10)
    grid.setCell('IN_build', 'R10', (s, c, g) =>
      g.WENN(
        g.g(s, 'S10') === "",
        g.WENNS(
          g.UND(g.RECHTS(g.g(s, 'P5'), 4) <= "1978", g.g(s, 'Q10') === "Ja"),
          g.g('Daten', 'M77'),
          g.UND(g.RECHTS(g.g(s, 'P5'), 4) > "1978", g.g(s, 'Q10') === "Ja"),
          g.g('Daten', 'M78'),
          g.g(s, 'Q10') === "Nein",
          g.g(s, 'P5')
        ),
        g.g(s, 'S10')
      )
    );

    // R11 formula: IF(S11="",_xlfn.IFS(AND(RIGHT($P$5,4)<="1978",$Q$11="Ja"),Daten!$M$65,AND(RIGHT($P$5,4)>"1978",$Q$11="Ja"),Daten!$M$66,$Q$11="Nein",$P$5),S11)
    grid.setCell('IN_build', 'R11', (s, c, g) =>
      g.WENN(
        g.g(s, 'S11') === "",
        g.WENNS(
          g.UND(g.RECHTS(g.g(s, 'P5'), 4) <= "1978", g.g(s, 'Q11') === "Ja"),
          g.g('Daten', 'M65'),
          g.UND(g.RECHTS(g.g(s, 'P5'), 4) > "1978", g.g(s, 'Q11') === "Ja"),
          g.g('Daten', 'M66'),
          g.g(s, 'Q11') === "Nein",
          g.g(s, 'P5')
        ),
        g.g(s, 'S11')
      )
    );

    // Implementation of column T formulas (insulation thickness)
    // T7 formula: IF(Q7="Ja",IF(U7="",_xlfn.XLOOKUP(1, (UWert_Mod[Bauteil]=E7)*(UWert_Mod[Modernisierungsjahr]=R7), UWert_Mod[d_ins]),U7),0)
    grid.setCell('IN_build', 'T7', (s, c, g) =>
      g.WENN(
        g.g(s, 'Q7') === 'Ja',
        g.WENN(
          g.g(s, 'U7') === '',
          g.XVERWEIS(
            1,
            g.MULT(
              g.GLEICH(g.INDIREKT_DB_REF("UWert_Mod", "Bauteil"), g.g(s, 'E7')),
              g.GLEICH(g.INDIREKT_DB_REF("UWert_Mod", "Modernisierungsjahr"), g.g(s, 'R7'))
            ),
            g.INDIREKT_DB_REF("UWert_Mod", "d_ins")
          ),
          g.g(s, 'U7')
        ),
        0
      )
    );

    // T9 formula: IF(Q9="Ja",IF(U9="",_xlfn.XLOOKUP(1, (UWert_Mod[Bauteil]=E9)*(UWert_Mod[Modernisierungsjahr]=R9), UWert_Mod[d_ins]),U9),0)
    grid.setCell('IN_build', 'T9', (s, c, g) =>
      g.WENN(
        g.g(s, 'Q9') === 'Ja',
        g.WENN(
          g.g(s, 'U9') === '',
          g.XVERWEIS(
            1,
            g.MULT(
              g.GLEICH(g.INDIREKT_DB_REF("UWert_Mod", "Bauteil"), g.g(s, 'E9')),
              g.GLEICH(g.INDIREKT_DB_REF("UWert_Mod", "Modernisierungsjahr"), g.g(s, 'R9'))
            ),
            g.INDIREKT_DB_REF("UWert_Mod", "d_ins")
          ),
          g.g(s, 'U9')
        ),
        0
      )
    );

    // T10 formula: IF(Q10="Ja",IF(U10="",_xlfn.XLOOKUP(1, (UWert_Mod[Bauteil]=E10)*(UWert_Mod[Modernisierungsjahr]=R10), UWert_Mod[d_ins]),U10),0)
    grid.setCell('IN_build', 'T10', (s, c, g) =>
      g.WENN(
        g.g(s, 'Q10') === 'Ja',
        g.WENN(
          g.g(s, 'U10') === '',
          g.XVERWEIS(
            1,
            g.MULT(
              g.GLEICH(g.INDIREKT_DB_REF("UWert_Mod", "Bauteil"), g.g(s, 'E10')),
              g.GLEICH(g.INDIREKT_DB_REF("UWert_Mod", "Modernisierungsjahr"), g.g(s, 'R10'))
            ),
            g.INDIREKT_DB_REF("UWert_Mod", "d_ins")
          ),
          g.g(s, 'U10')
        ),
        0
      )
    );

    // T11 formula: IF(Q11="Ja",IF(U11="",_xlfn.XLOOKUP(1, (UWert_Mod[Bauteil]=E11)*(UWert_Mod[Modernisierungsjahr]=R11), UWert_Mod[d_ins]),U11),0)
    grid.setCell('IN_build', 'T11', (s, c, g) =>
      g.WENN(
        g.g(s, 'Q11') === 'Ja',
        g.WENN(
          g.g(s, 'U11') === '',
          g.XVERWEIS(
            1,
            g.MULT(
              g.GLEICH(g.INDIREKT_DB_REF("UWert_Mod", "Bauteil"), g.g(s, 'E11')),
              g.GLEICH(g.INDIREKT_DB_REF("UWert_Mod", "Modernisierungsjahr"), g.g(s, 'R11'))
            ),
            g.INDIREKT_DB_REF("UWert_Mod", "d_ins")
          ),
          g.g(s, 'U11')
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
