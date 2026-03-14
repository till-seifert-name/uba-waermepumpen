import {Component, EventEmitter, Input, OnChanges, OnInit, Output, SimpleChanges} from '@angular/core';
import {BerechnungService, HeaterType} from '../../berechnung.service';
import {AppComponent} from '../../app.component';

@Component({
  selector: 'app-heater-form',
  standalone: false,
  templateUrl: './heater-form.component.html',
  styleUrls: ['./heater-form.component.scss']
})
export class HeaterFormComponent implements OnInit, OnChanges {
  @Input() roomId: number = 1;
  @Input() heaterNumber: number = 1;
  @Input() visible: boolean = false;
  @Output() remove = new EventEmitter<number>();

  get basePath() {
    return AppComponent.basePath;
  }

  // Heating type options - fetched dynamically from Daten sheet
  public heatingTypeOptions: HeaterType[] = [];

  // We'll get subtypes dynamically from the service

  // Dimension options for select dropdowns
  hoeheOptions: number[] = [];
  tiefeOptions: number[] = [];
  breiteOptions: number[] = [];

  constructor(public berechnungService: BerechnungService) { }

  ngOnInit(): void {
    // Load heater types from the data model
    this.heatingTypeOptions = this.berechnungService.getHeaterTypes();
    this.loadHeaterData();
    this.updateDimensionOptions();
  }

  // Update available options for dimensions based on current heater type and subtype
  updateDimensionOptions(): void {
    const currentSubtype = this.berechnungService.getHeatingSubType(this.roomId, this.heaterNumber);
    if(!currentSubtype) return;

    // Get height values using INDIREKT(subtype)
    this.hoeheOptions = this.berechnungService.getNamesExpressionValueList(currentSubtype).map(v => typeof v == 'number' ? v : parseInt(v));

    // Get depth values using INDIREKT(subtype&"_t")
    this.tiefeOptions = this.berechnungService.getNamesExpressionValueList(currentSubtype + "_t").map(v => typeof v == 'number' ? v : parseInt(v));

    // Get width values for Fensterbankradiator from Daten V41:V43 (todo item row 41)
    if (this.isFensterbankradiator()) {
      this.breiteOptions = [
        this.berechnungService.grid.n('Daten', 'V41'),
        this.berechnungService.grid.n('Daten', 'V42'),
        this.berechnungService.grid.n('Daten', 'V43')
      ];
    } else {
      this.breiteOptions = [];
    }

    // Handle transitions to ensure valid dropdown values are selected
    if (!this.isHandtuchradiator()) {
      // Handle height transitions - find nearest value if current value is not in options
      const currentHeight = this.berechnungService.getHeatingHeight(this.roomId, this.heaterNumber);
      if (currentHeight && this.hoeheOptions.length > 0 && !this.hoeheOptions.includes(currentHeight)) {
        this.berechnungService.setHeatingHeight(this.roomId,
          findNearestValue(currentHeight, this.hoeheOptions), this.heaterNumber);
      }
      
      // Handle depth transitions - find nearest value if current value is not in options
      const currentDepth = this.berechnungService.getHeatingDepth(this.roomId, this.heaterNumber);
      if (currentDepth && this.tiefeOptions.length > 0 && !this.tiefeOptions.includes(currentDepth)) {
        this.berechnungService.setHeatingDepth(this.roomId,
          findNearestValue(currentDepth, this.tiefeOptions), this.heaterNumber);
      }
    }

    // Handle width transitions for Fensterbankradiator - find nearest value if current value is not in options (todo item row 41)
    if (this.isFensterbankradiator()) {
      const currentWidth = this.berechnungService.getHeatingWidth(this.roomId, this.heaterNumber);
      if (currentWidth && this.breiteOptions.length > 0 && !this.breiteOptions.includes(currentWidth)) {
        this.berechnungService.setHeatingWidth(this.roomId,
          findNearestValue(currentWidth, this.breiteOptions), this.heaterNumber);
      }
    }
  }


  ngOnChanges(changes: SimpleChanges): void {
    if (changes['roomId'] || changes['heaterNumber']) {
      this.loadHeaterData();
    }
  }

  loadHeaterData(): void {
    const mainType = this.berechnungService.getHeatingMainType(this.roomId, this.heaterNumber);
    const subType = this.berechnungService.getHeatingSubType(this.roomId, this.heaterNumber);

    // If no subtype is set but main type exists, set the first available subtype
    if (mainType && !subType) {
      const firstSubtype = this.getFirstSubtypeForHeaterType(mainType);
      if (firstSubtype) {
        this.berechnungService.setHeatingSubType(this.roomId, firstSubtype, this.heaterNumber);
      }
    }
  }

  // Get display name for heater type (for user-friendly display)
  getHeaterTypeDisplayName(type: HeaterType): string {

    const displayNames: { [key in HeaterType]: string } = {
      'Flachheizkoerper_glatt': 'Flachheizkörper glatt',
      'Flachheizkoerper_senkrecht_profiliert': 'Flachheizkörper profiliert',
      'Gliederheizkörper': 'Gliederheizkörper',
      'Rohrradiator': 'Rohrradiator',
      'Konvektor': 'Konvektor'
    };
    return displayNames[type] || type;
  }

  // Handle heater type change
  onHeaterTypeChange(heaterType: HeaterType): void {
    // Set main type
    this.berechnungService.setHeatingMainType(this.roomId, heaterType, this.heaterNumber);

    // Set the first available subtype for the selected heater type
    const firstSubtype = this.getFirstSubtypeForHeaterType(heaterType);
    if (firstSubtype) {
      this.berechnungService.setHeatingSubType(this.roomId, firstSubtype, this.heaterNumber);
    }

    // Initialize defaults and update UI
    this.initializeHeaterDefaults();
    this.updateDimensionOptions();
    this.setDefaultDimensionsIfEmpty();
  }

  // Get subtypes for a given heater type
  getHeaterSubtypes(type: HeaterType): string[] {
    return this.berechnungService.getNamesExpressionValueList(type).map(v => v.toString());
  }

  // List of subtypes that have corresponding SVG files
  private subtypesWithSvg = ['Typ_10', 'Typ_11', 'Typ_20', 'Typ_21', 'Typ_22', 'Typ_30', 'Typ_33', 'Fensterbankradiator', 'Gussradiator', 'Handtuchradiator', 'Stahlradiator', 'Stahlrohrradiator', 'Stahlrohrradiator_v01'];

  // Check if a subtype has a corresponding SVG file
  hasSubtypeSvg(subtype: string): boolean {
    return this.subtypesWithSvg.includes(subtype);
  }

  // Check if current heater is Handtuchradiator (requires free input instead of dropdown)
  isHandtuchradiator(): boolean {
    return this.berechnungService.getHeatingMainType(this.roomId, this.heaterNumber) === 'Rohrradiator' &&
           this.berechnungService.getHeatingSubType(this.roomId, this.heaterNumber) === 'Handtuchradiator';
  }

  // Check if current heater is Stahlrohrradiator (needs "Anzahl Glieder" field)
  isStahlrohrradiator(): boolean {
    return this.berechnungService.getHeatingMainType(this.roomId, this.heaterNumber) === 'Rohrradiator' &&
           this.berechnungService.getHeatingSubType(this.roomId, this.heaterNumber) === 'Stahlrohrradiator';
  }

  // Check if current heater is Fensterbankradiator (requires dropdown for width, todo item row 41)
  isFensterbankradiator(): boolean {
    return this.berechnungService.getHeatingMainType(this.roomId, this.heaterNumber) === 'Rohrradiator' &&
           this.berechnungService.getHeatingSubType(this.roomId, this.heaterNumber) === 'Fensterbankradiator';
  }

  // Check if current heater is Gliederheizkörper (no width field needed)
  isGliederheizkoerper(): boolean {
    return this.berechnungService.getHeatingMainType(this.roomId, this.heaterNumber) === 'Gliederheizkörper';
  }

  // Handle subtype change
  onSubtypeChange(mainType: HeaterType, subtype: string): void {
    // Ensure main type is set first
    this.berechnungService.setHeatingMainType(this.roomId, mainType, this.heaterNumber);
    // Set the selected subtype
    this.berechnungService.setHeatingSubType(this.roomId, subtype, this.heaterNumber);
    
    // Initialize defaults and update UI
    this.initializeHeaterDefaults();
    this.updateDimensionOptions();
    this.setDefaultDimensionsIfEmpty();
  }

  // Helper method to get first available subtype for a heater type
  private getFirstSubtypeForHeaterType(heaterType: HeaterType): string | null {
    const subtypes = this.berechnungService.getNamesExpressionValueList(heaterType);
    return subtypes.length > 0 ? subtypes[0]?.toString() : null;
  }

  // Helper method to initialize heater-specific defaults (Glieder count, etc.)
  private initializeHeaterDefaults(): void {
    const mainType = this.berechnungService.getHeatingMainType(this.roomId, this.heaterNumber);
    
    // Initialize Glieder count for types that need it
    if (mainType === 'Gliederheizkörper' || this.isStahlrohrradiator()) {
      if (!this.berechnungService.getn_rad_col(this.roomId, this.heaterNumber)) {
        this.berechnungService.setn_rad_col(this.roomId, 10, this.heaterNumber); // Default to 10 elements
      }
    }
  }

  // Helper method to set default dimensions if they're empty
  private setDefaultDimensionsIfEmpty(): void {
    // Set default height if options are available and no height is set
    if (this.hoeheOptions.length > 0 && !this.berechnungService.getHeatingHeight(this.roomId, this.heaterNumber)) {
      this.berechnungService.setHeatingHeight(this.roomId, this.hoeheOptions[0], this.heaterNumber);
    }

    // Set default depth if options are available and no depth is set
    if (this.tiefeOptions.length > 0 && !this.berechnungService.getHeatingDepth(this.roomId, this.heaterNumber)) {
      this.berechnungService.setHeatingDepth(this.roomId, this.tiefeOptions[0], this.heaterNumber);
    }
  }

  // Handle remove button click
  onRemove(): void {
    this.remove.emit(this.heaterNumber);
  }
}

// Find the nearest value in an array of numbers
function findNearestValue(target: number, options: number[]): number {
  if (options.length === 0) return target;

  return options.reduce((prev, curr) => Math.abs(curr - target) < Math.abs(prev - target) ? curr : prev);
}
