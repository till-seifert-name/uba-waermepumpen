# Claude Development Guide for UBA Wärmepumpen-Tool

This document provides guidance for Claude when working on this project.

## Project Overview

The UBA Wärmepumpen-Tool is an Angular-based web application that helps users assess the suitability of their buildings for heat pump installations. It follows a wizard-style interface with three main sections:

1. Gebäude (Building): Collects general building information
2. Räume (Rooms): Captures room-specific data with heat loss factors 
3. Ergebnis (Results): Provides assessment and recommendations

## Key Technical Information

- Framework: Angular 19.2.7
- UI Framework: Bootstrap 5.3.3 with Bootstrap Icons 1.11.3
- State Management: Local storage persistence with DataGrid-based calculation model
- Routing: Angular Router with query parameter approach for room navigation

## Data Architecture

### Excel to Angular Integration
- DataGrid Class: Core calculation engine that mimics Excel functionality
  - Implements sheets, cells, and Excel formula evaluation
  - Supports cell references, numeric operations, and range expressions
  - Includes Excel-compatible functions (SUM, SUMIF, INDEX, etc.)
  - Provides serialization/deserialization for localStorage persistence

- FormulaOverlays: Translate Excel formulas to TypeScript
  - Each sheet has its own overlay implementation (e.g., ClcLoadOverlay, InRoomsOverlay)
  - Complex Excel formulas are converted to TypeScript function calls
  - Excel formula syntax must be followed as closely as possible
  - Overlay pattern ensures separation between data and calculation logic

- Excel Data Sources: 
  - Excel sheets exported to TypeScript files in `WP_Check_Methode_v1_ts_export/`
  - Named ranges defined in `databaseRanges.ts`
  - Master imports consolidated in `master.ts`

### Implementation Guidelines for Excel Formula Translation
1. Strict Adherence to Excel Logic: When implementing formula overlays, the Excel formula logic must be preserved exactly
2. Review DataGrid Methods First: Before implementing formulas, check DataGrid.ts for existing Excel-equivalent methods
3. Document Original Formulas: Include the Excel formula in comments before implementation
4. LET Functions Exception: Excel LET functions need special handling in JavaScript/TypeScript
5. Use g.WENN Instead of if Statements: Maintain the declarative style of Excel by using DataGrid equivalents to Excel functions
6. Match Excel Function Names: German Excel function names should use German equivalents (WENN for IF, SUMMEWENN for SUMIF, etc.)
7. Add Missing Functions as Needed: If an Excel function doesn't have an equivalent, implement it in DataGrid.ts
8. Maintain Original Cell References: Preserve original cell references in comments for traceability

## Important Development Commands

- Start development server: `npm start` 
  - Available at: http://localhost:4200/uba-waermepumpen/
- Build for production: `npm run build`
  - Output: dist/uba-waermepumpen/
- Full build with version info: `./build.sh`
- Create component: `npm run ng generate component component-name --standalone=false --skip-tests`
  - Use the `--standalone=false` flag since the app uses NgModule-based architecture
  - Use the `--skip-tests` flag to skip generating test files when not needed
- Run tests: `npm test`

## Project Structure

See `README.md` for complete file documentation including:
- Core services (BerechnungService, DataGrid, LocalStorage)
- Formula overlay system (14 overlay classes)
- Component architecture (30+ Angular components)
- Auto-generated Excel data files (40+ TypeScript modules)
- Build tools and configuration

## UI Component Guidelines

1. Wizard Navigation:
   - Main navigation uses tabs with progress indicators
   - Room tabs are dynamically generated based on room entries
   - Use query parameters for room navigation (`?room=roomId`)

2. Form Components:
   - Use Bootstrap form controls consistently
   - Implement conditional form elements when appropriate
   - Follow the established validation patterns

3. Progress Indicators:
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

## Git Commit Message Guidelines

Follow these conventions for commit messages:

1. Format: Subject-only for simple changes (no body or footers)
2. Style: Start with imperative verbs (Update, Fix, Add, Show, Hide, Make, Enhance, Replace, etc.)
3. Length: Keep subject concise and descriptive (typically 50-80 characters)
4. Content: Focus on what changed, not why (unless complex)
5. No decorations: No emojis, no "Co-Authored-By" for simple commits
6. Examples from project:
   - "Show width field for Handtuchradiator"
   - "Update XLS and formulas to 2025-10-23"
   - "Fix default values for new heaters"
   - "Enhance Responsiveness"
   - "Text changes"

## Searching Excel Data in TypeScript Files

Prefer ripgrep (rg) over grep as it handles complex patterns better and is faster:
```bash
# Find cell ranges: I2-I9, I10-I19, specific cells
rg '"I[2-9]"' WP_Check_Methode_v1_ts_export/clc_load.ts
rg '"I1[0-9]"' WP_Check_Methode_v1_ts_export/clc_load.ts

# Search by content type
rg " formula " WP_Check_Methode_v1_ts_export/clc_load.ts

# Find specific cell contents (e.g., help texts in column H)
rg '"H\d+": +/\* unknown \*/ ".+"' WP_Check_Methode_v1_ts_export/IN_rooms.ts

# Show context around matches (2 lines before, 4 lines after)
rg -B2 -A4 '"H6": +/\* unknown \*/ ".+"' WP_Check_Methode_v1_ts_export/IN_rooms.ts
```

## Checking Formula Overlay Implementation Completeness

To verify if all Excel formulas have been implemented in the formula overlays:

```bash
# Compare source cells with overlay implementations (replace X with the column letter)
diff <(grep formula /path/to/source_file.ts | grep -o '"X[0-9][0-9]*"' | tr -d '"' | sort -V) \
     <(grep -o "Row [0-9][0-9]*" /path/to/overlay_file.ts | sed 's/Row /X/' | sort -V)
```

The command extracts all formula cell references from the source file and compares them with the implemented rows in the overlay. The output shows cells that exist in the source but not in the overlay (missing implementations) and vice versa.

## Excel File Update Workflow

Complete process for importing a new/updated Excel file:

### Step 1: Import New Excel File
```bash
# 1. Copy new Excel file to project, overwriting the existing .xlsx file
cp <source-path>/<new-file>.xlsx WP_Check_Methode_v1.xlsx

# 2. Convert Excel to TypeScript using the xlsx-to-json script
npm run xlsx-to-json -- --input WP_Check_Methode_v1.xlsx

# 3. The script creates a new export folder with the same name as the input file
# Copy generated files to the working directory (WP_Check_Methode_v1_ts_export/)
cp -r <generated-export-folder>/* WP_Check_Methode_v1_ts_export/
```

### Step 2: Analyze Changes
```bash
# Show overview of all changes
git diff --stat WP_Check_Methode_v1_ts_export/

# Check specific files for changes (common files to check):
git diff WP_Check_Methode_v1_ts_export/Data_radiator.ts | head -200
git diff WP_Check_Methode_v1_ts_export/OUT_rooms.ts | grep -E "^[+\-].*formula"
git diff WP_Check_Methode_v1_ts_export/IN_rooms.ts
git diff WP_Check_Methode_v1_ts_export/IN_build.ts

# Check the log file for changelog entries explaining the changes
git diff WP_Check_Methode_v1_ts_export/log.ts
```

### Step 3: Update Formula Overlays

When formulas change in the exported TypeScript files, update corresponding overlay files in `src/app/formula-overlays/`:

Common overlays:
- `out-rooms-overlay.ts` (for OUT_rooms sheet)
- `clc-load-overlay.ts` (for clc_load sheet)
- `clc-power-overlay.ts` (for clc_power sheet)
- `clc-build-overlay.ts` (for clc_build sheet)
- `in-rooms-overlay.ts` (for IN_rooms sheet)

Update Process:
1. Identify changed row numbers from git diff (e.g., Row 31, Row 54)
2. Find corresponding overlay implementation by row number
3. Update TypeScript implementation to match new Excel formula exactly
4. Update JSDoc comment with the complete Excel formula
5. Use `!=` over `!==` for Excel-like dynamic casting
6. Preserve Excel function names (WENN, SUMMEWENN, etc.)

### Step 4: Commit and Deploy (when verified with user that we are done)
```bash
# Stage the changes
git add WP_Check_Methode_v1_ts_export/ WP_Check_Methode_v1.xlsx src/

# Commit with date-based message
git commit -m "Update XLS and formulas to $(date +%Y-%m-%d)"

# Push to trigger GitHub Actions deployment
git push
```

### Progress Tracking (Optional)
For complex updates with many formula changes, create a tracking file: `formula-update-tracking.txt` to maintain systematic completion status.


