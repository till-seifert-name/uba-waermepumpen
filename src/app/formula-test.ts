import { DataGrid } from './data-grid';
import { applyFormulaOverlays } from './formula-overlay';
import { databaseRanges, explicitNamedRanges, namedExpressions, sheetsData } from '../../20250507_WP_Check_Vorlage_ts_export/master';

/**
 * Test script to verify formula implementations
 * This file is used for testing only and is not included in the production build
 */

// Setup test DataGrid with sample data
function setupTestDataGrid(): DataGrid {
  const g = new DataGrid();

  // Add named ranges
  for (const [cell, content] of Object.entries(namedExpressions)) {
    g.setCell("Names", cell, content);
  }

  for (const [cell, content] of Object.entries(explicitNamedRanges)) {
    g.setCell("Names", cell, content);
  }

  for (const [cell, content] of Object.entries(databaseRanges)) {
    g.setCell("Names", cell, content);
  }

  // Add data from sheets
  for (const [sheet, sheetData] of Object.entries(sheetsData)) {
    for (const [cell, content] of Object.entries(sheetData)) {
      g.setCell(sheet, cell, content);
    }
  }

  // Apply test values
  g.setCell('IN_rooms', 'R10', '');  // Wall insulation thickness for room 1
  g.setCell('Daten', 'B19', 'Nicht angegeben');
  g.setCell('Daten', 'B20', 'Original');
  g.setCell('IN_build', 'Q7', 'Ja');  // Wall retrofitted
  g.setCell('IN_build', 'S7', 2005);  // Wall modernization year
  g.setCell('IN_build', 'P5', 1980);  // Building year

  // Setup a mockup UWert_Mod database if needed
  g.setCell('U_Werte_IWU', 'A1', 'Bauteil');
  g.setCell('U_Werte_IWU', 'B1', 'Modernisierungsjahr');
  g.setCell('U_Werte_IWU', 'C1', 'd_ins');
  g.setCell('U_Werte_IWU', 'A2', 'Außenwand');
  g.setCell('U_Werte_IWU', 'B2', 2005);
  g.setCell('U_Werte_IWU', 'C2', 12);
  
  // Setup named references for Daten sheet formulas
  g.setCell('Names', 'UWert_Mod', 'U_Werte_IWU!A1:C2');
  g.setCell('Names', 'PAR[lambda_ins_thick]', ['0.045']);
  
  // Setup test values for Daten sheet
  g.setCell('Daten', 'N63', 0.45);  // U-Wert for Daten!R63
  g.setCell('Daten', 'Q63', 2);     // U_no_ins for Daten!R63
  
  // Mock the DB_THIS_ROW function
  g.DB_THIS_ROW = (cell, db, column) => {
    if (db === "UWert_Mod") {
      if (column === "U-Wert" && cell === "R63") return 0.45;
      if (column === "U_no_ins" && cell === "R63") return 2;
    }
    return null;
  };

  // Apply formula overlays
  applyFormulaOverlays(g);

  return g;
}

// Test a specific formula
function testFormula(g: DataGrid, s: string, c: string): void {
  const result = g.getCell(s, c);
  console.log(`${s}!${c} = ${result}`);
}

// Run tests
function runTests(): void {
  console.log('Running formula tests...');
  const g = setupTestDataGrid();

  // Test IN_rooms formulas
  console.log('Testing IN_rooms formulas:');
  testFormula(g, 'IN_rooms', 'R73');  // Wall modernization year
  testFormula(g, 'IN_rooms', 'R74');  // Wall insulation thickness
  
  // Test Daten formulas
  console.log('\nTesting Daten formulas:');
  testFormula(g, 'Daten', 'R63');  // Insulation thickness calculation

  console.log('\nTests completed.');
}

// Run when loaded
runTests();
