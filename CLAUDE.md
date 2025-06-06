# Claude Development Guide for UBA Wärmepumpen-Tool

This document provides guidance for Claude when working on this project.

## Project Overview

The UBA Wärmepumpen-Tool is an Angular-based web application that helps users assess the suitability of their buildings for heat pump installations. It follows a wizard-style interface with three main sections:

1. **Gebäude (Building)**: Collects general building information
2. **Räume (Rooms)**: Captures room-specific data with heat loss factors 
3. **Ergebnis (Results)**: Provides assessment and recommendations

## Key Technical Information

- **Framework**: Angular 19.2.7
- **UI Framework**: Bootstrap 5.3.3 with Bootstrap Icons 1.11.3
- **State Management**: Local storage persistence with DataGrid-based calculation model
- **Routing**: Angular Router with query parameter approach for room navigation

## Data Architecture

### Excel to Angular Integration
- **DataGrid Class**: Core calculation engine that mimics Excel functionality
  - Implements sheets, cells, and Excel formula evaluation
  - Supports cell references, numeric operations, and range expressions
  - Includes Excel-compatible functions (SUM, SUMIF, INDEX, etc.)
  - Provides serialization/deserialization for localStorage persistence

- **FormulaOverlays**: Translate Excel formulas to TypeScript
  - Each sheet has its own overlay implementation (e.g., ClcLoadOverlay, InRoomsOverlay)
  - Complex Excel formulas are converted to TypeScript function calls
  - Excel formula syntax must be followed as closely as possible
  - Overlay pattern ensures separation between data and calculation logic

- **Excel Data Sources**: 
  - Excel sheets exported to TypeScript files in `20250507_WP_Check_Vorlage_ts_export/`
  - Named ranges defined in `databaseRanges.ts`
  - Master imports consolidated in `master.ts`

### Implementation Guidelines for Excel Formula Translation
1. **Strict Adherence to Excel Logic**: When implementing formula overlays, the Excel formula logic must be preserved exactly
2. **Review DataGrid Methods First**: Before implementing formulas, check DataGrid.ts for existing Excel-equivalent methods
3. **Document Original Formulas**: Include the Excel formula in comments before implementation
4. **LET Functions Exception**: Excel LET functions need special handling in JavaScript/TypeScript
5. **Use g.WENN Instead of if Statements**: Maintain the declarative style of Excel by using DataGrid equivalents to Excel functions
6. **Match Excel Function Names**: German Excel function names should use German equivalents (WENN for IF, SUMMEWENN for SUMIF, etc.)
7. **Add Missing Functions as Needed**: If an Excel function doesn't have an equivalent, implement it in DataGrid.ts
8. **Maintain Original Cell References**: Preserve original cell references in comments for traceability

## Important Development Commands

- **Start development server**: `npm start` 
  - Available at: http://localhost:4200/uba-waermepumpen/
- **Build for production**: `npm run build`
  - Output: dist/uba-waermepumpen/
- **Full build with version info**: `./build.sh`
- **Create component**: `npm run ng generate component component-name --standalone=false --skip-tests`
  - Use the `--standalone=false` flag since the app uses NgModule-based architecture
  - Use the `--skip-tests` flag to skip generating test files when not needed
- **Run tests**: `npm test`

## Project Structure

See `README.md` for complete file documentation including:
- Core services (BerechnungService, DataGrid, LocalStorage)
- Formula overlay system (14 overlay classes)
- Component architecture (30+ Angular components)
- Auto-generated Excel data files (40+ TypeScript modules)
- Build tools and configuration

## UI Component Guidelines

1. **Wizard Navigation**:
   - Main navigation uses tabs with progress indicators
   - Room tabs are dynamically generated based on room entries
   - Use query parameters for room navigation (`?room=roomId`)

2. **Form Components**:
   - Use Bootstrap form controls consistently
   - Implement conditional form elements when appropriate
   - Follow the established validation patterns

3. **Progress Indicators**:
   - Each component should set its progress value between 0-100
   - Progress is displayed in the active tab

## Data Flow

1. User inputs are saved to localStorage via the `BerechnungService`
2. The `BerechnungService` uses a DataGrid for calculation logic
3. Components read from the service and localStorage for persistence between sessions

## Common Tasks

### Adding a New Room Field

1. Update interface definitions in the appropriate component
2. Add UI elements to the component template
3. Ensure data is saved to the BerechnungService
4. Update calculation functions if necessary

### Modifying the Navigation

1. Update the TabConfig interface in wizard-tabs component if needed
2. Ensure proper routing with query parameters
3. Maintain consistent progress indicators

## Best Practices

1. Use the established component structure and naming conventions
2. Ensure all user inputs are properly validated and stored
3. Update the wizard progress indicators appropriately
4. Maintain proper subscription management with OnDestroy lifecycle hooks
5. Use proper typings for all data structures
6. When using Bash commands like grep or find, avoid backslash characters (\) in patterns or parameters as they may not work correctly - choose patterns that don't require escaping

## Searching Excel Data in TypeScript Files

**Prefer ripgrep (rg) over grep** as it handles complex patterns better and is faster:
```bash
# Find cell ranges: I2-I9, I10-I19, specific cells
rg '"I[2-9]"' 20250507_WP_Check_Vorlage_ts_export/clc_load.ts
rg '"I1[0-9]"' 20250507_WP_Check_Vorlage_ts_export/clc_load.ts

# Search by content type
rg " formula " 20250507_WP_Check_Vorlage_ts_export/clc_load.ts

# Find specific cell contents (e.g., help texts in column H)
rg '"H\d+": +/\* unknown \*/ ".+"' 20250507_WP_Check_Vorlage_ts_export/IN_rooms.ts

# Show context around matches (2 lines before, 4 lines after)
rg -B2 -A4 '"H6": +/\* unknown \*/ ".+"' 20250507_WP_Check_Vorlage_ts_export/IN_rooms.ts
```

## Checking Formula Overlay Implementation Completeness

To verify if all Excel formulas have been implemented in the formula overlays:

```bash
# Compare source cells with overlay implementations (replace X with the column letter)
diff <(grep formula /path/to/source_file.ts | grep -o '"X[0-9][0-9]*"' | tr -d '"' | sort -V) \
     <(grep -o "Row [0-9][0-9]*" /path/to/overlay_file.ts | sed 's/Row /X/' | sort -V)
```

The command extracts all formula cell references from the source file and compares them with the implemented rows in the overlay. The output shows cells that exist in the source but not in the overlay (missing implementations) and vice versa.

## Formula Update Workflow

When Excel data files are updated:

### Progress Tracking
Create a tracking file: `formula-update-tracking.txt` to maintain systematic completion status.

### Git Diff Analysis
```bash
# Check each file for formula changes
git diff HEAD -- 20250507_WP_Check_Vorlage_ts_export/[filename].ts | grep formula

# Common patterns: Range extensions (F267→F297), criteria changes (""→0), text updates
```

### Update Process
1. Find corresponding overlay files with `Glob` tool
2. Update TypeScript implementations to match Excel changes exactly  
3. Update JSDoc comments with new Excel formulas
4. Use `!=` over `!==` for Excel-like dynamic casting
5. Update progress tracking after each file
