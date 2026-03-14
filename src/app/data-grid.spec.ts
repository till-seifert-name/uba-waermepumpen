import {CellFunc, DataGrid} from './data-grid';

describe('DataGrid', () => {
  let grid: DataGrid;

  beforeEach(() => {
    grid = new DataGrid();
  });

  it('should set and get a cell value', () => {
    grid.setCell('Sheet1', 'A1', 42);
    expect(grid.getCell('Sheet1', 'A1')).toBe(42);
  });

  it('should set and get a range of cell values', () => {
    grid.setCells('Sheet1', 'A1', 'B2', [[1, 2], [3, 4]]);
    expect(grid.getCell('Sheet1', 'A1')).toBe(1);
    expect(grid.getCell('Sheet1', 'B1')).toBe(2);
    expect(grid.getCell('Sheet1', 'A2')).toBe(3);
    expect(grid.getCell('Sheet1', 'B2')).toBe(4);
  });

  it('should set a range of cell values to a single value', () => {
    grid.setCells('Sheet1', 'A1', 'B2', 42);
    expect(grid.getCell('Sheet1', 'A1')).toBe(42);
    expect(grid.getCell('Sheet1', 'B1')).toBe(42);
    expect(grid.getCell('Sheet1', 'A2')).toBe(42);
    expect(grid.getCell('Sheet1', 'B2')).toBe(42);
  });

  it('should calculate the sum of cells', () => {
    grid.setCells('Sheet1', 'A1', 'A3', [[1], [2], [3]]);
    expect(grid.SUM('Sheet1', ['A1', 'A2', 'A3'])).toBe(6);
  });


  it('should clear results cache', () => {
    grid.setCell('Sheet1', 'A1', 42);
    expect(grid.getCell('Sheet1', 'A1')).toBe(42);

    grid.results['Sheet1']['A1'] = 24;
    grid.clearResults();

    expect(grid.getCell('Sheet1', 'A1')).toBe(42);
  });

  it('should get correct column and row numbers', () => {
    expect(grid.COLUMN('A1')).toBe(1);
    expect(grid.ROW('A1')).toBe(1);
    expect(grid.COLUMN('Z1')).toBe(26);
    expect(grid.ROW('Z100')).toBe(100);
  });

  it('should return correct cell name with INDEX function', () => {
    grid.setCells('Sheet1', 'A1', 'B2', [[1, 2], [3, 4]]);
    expect(grid.INDEX('Sheet1', 'A1', 'B2', 1, 1)).toBe(1);
    expect(grid.INDEX('Sheet1', 'A1', 'B2', 1, 2)).toBe(2);
    expect(grid.INDEX('Sheet1', 'A1', 'B2', 2, 1)).toBe(3);
    expect(grid.INDEX('Sheet1', 'A1', 'B2', 2, 2)).toBe(4);
  });
  it('should set and get a cell value with a CellFunc', () => {
    const cellFunc: CellFunc = (sheet, cell, grid) => {
      return grid.getCellNumeric(sheet, 'A1') * 2;
    };
    grid.setCell('Sheet1', 'A1', 21);
    grid.setCell('Sheet1', 'B1', cellFunc);

    expect(grid.getCell('Sheet1', 'B1')).toBe(42);
  });

  it('should update CellFunc result when a referenced cell changes', () => {
    const cellFunc: CellFunc = (sheet, cell, grid) => {
      return grid.getCellNumeric(sheet, 'A1') * 2;
    };
    grid.setCell('Sheet1', 'A1', 21);
    grid.setCell('Sheet1', 'B1', cellFunc);

    expect(grid.getCell('Sheet1', 'B1')).toBe(42);

    grid.setCell('Sheet1', 'A1', 10);
    grid.clearResults(); // Clear the results cache to force reevaluation

    expect(grid.getCell('Sheet1', 'B1')).toBe(20);
  });

  it('should handle nested CellFunc calls', () => {
    const cellFuncA: CellFunc = (sheet, cell, grid) => {
      return grid.getCellNumeric(sheet, 'A1') * 2;
    };

    const cellFuncB: CellFunc = (sheet, cell, grid) => {
      return grid.getCellNumeric(sheet, 'B1') * 3;
    };

    grid.setCell('Sheet1', 'A1', 7);
    grid.setCell('Sheet1', 'B1', cellFuncA);
    grid.setCell('Sheet1', 'C1', cellFuncB);

    expect(grid.getCell('Sheet1', 'C1')).toBe(42);
  });


  it('should handle complex dependencies between cells', () => {
    grid.setCell('Sheet1', 'A1', 2);
    grid.setCell('Sheet1', 'A2', 3);
    grid.setCell('Sheet1', 'A3', (sheet, cell, g) => g.getCellNumeric(sheet, 'A1') + g.getCellNumeric(sheet, 'A2'));
    grid.setCell('Sheet1', 'A4', (sheet, cell, g) => g.getCellNumeric(sheet, 'A3') * 2);
    grid.setCell('Sheet1', 'A5', (sheet, cell, g) => g.getCellNumeric(sheet, 'A4') - 1);

    expect(grid.getCell('Sheet1', 'A1')).toBe(2);
    expect(grid.getCell('Sheet1', 'A2')).toBe(3);
    expect(grid.getCell('Sheet1', 'A3')).toBe(5);
    expect(grid.getCell('Sheet1', 'A4')).toBe(10);
    expect(grid.getCell('Sheet1', 'A5')).toBe(9);
  });

  it('should handle circular dependencies', () => {
    grid.setCell('Sheet1', 'A1', (sheet, cell, g) => g.getCellNumeric(sheet, 'A2') + 1);
    grid.setCell('Sheet1', 'A2', (sheet, cell, g) => g.getCellNumeric(sheet, 'A1') + 2);

    expect(() => grid.getCell('Sheet1', 'A1')).toThrow();
    expect(() => grid.getCell('Sheet1', 'A2')).toThrow();
  });

  it('should sum numbers, BigInts, and functions returning numeric values', () => {
    grid.setCell('Sheet1', 'A1', 1);
    grid.setCell('Sheet1', 'A2', 2);
    grid.setCell('Sheet1', 'A3', 3);
    grid.setCell('Sheet1', 'A4', (sheet, cell, g) => g.getCellNumeric(sheet, 'A2') * 2);
    grid.setCell('Sheet1', 'A5', 'not a number');

    expect(grid.SUM('Sheet1', ['A1', 'A2', 'A3', 'A4'])).toBe(10);
    expect(grid.SUM('Sheet1', ['A1', 'A2', 'A3', 'A4', 'A5'])).toBeNaN();
  });
});
