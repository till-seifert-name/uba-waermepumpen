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

## Core Components and Structure

### Main Sections
- `src/app/gebaeude/`: Building-related components
- `src/app/raeume/`: Room-related components
- `src/app/ergebnis/`: Results components

### Shared Components
- `src/app/shared/wizard-tabs/`: Navigation tabs with progress indicators

### Services
- `src/app/berechnung.service.ts`: Primary service for data management and calculations
  - Manages rooms collection and active room selection
  - Handles DataGrid-based calculation model

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