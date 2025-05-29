import {Component, EventEmitter, Input, OnChanges, OnInit, Output, SimpleChanges} from '@angular/core';
import {BerechnungService, HeaterType} from '../../berechnung.service';

@Component({
  selector: 'app-heater-form',
  standalone: false,
  templateUrl: './heater-form.component.html',
  styleUrls: ['./heater-form.component.scss']
})
export class HeaterFormComponent implements OnInit, OnChanges {
  @Input() roomId: string = '';
  @Input() heaterNumber: number = 1;
  @Input() visible: boolean = false;
  @Output() remove = new EventEmitter<number>();

  // Heating type options - fetched dynamically from Daten sheet
  public heatingTypeOptions: HeaterType[] = [];

  // We'll get subtypes dynamically from the service

  // Selected heater subtype
  heizfleacheSubtype: string = '';

  // Dimension options for select dropdowns
  hoeheOptions: number[] = [];
  tiefeOptions: number[] = [];

  constructor(public berechnungService: BerechnungService) { }

  ngOnInit(): void {
    // Load heater types from the data model
    this.heatingTypeOptions = this.berechnungService.getHeaterTypes();
    this.loadHeaterData();
    this.updateDimensionOptions();
  }

  // Update available options for dimensions based on current heater type and subtype
  updateDimensionOptions(): void {
    if(!this.heizfleacheSubtype) return;

    // Save the subtype to the data model
    this.berechnungService.setHeatingSubType(this.roomId, this.heizfleacheSubtype, this.heaterNumber);

    // Get height values using INDIREKT(subtype)
    this.hoeheOptions = this.berechnungService.getNamesExpressionValueList(this.heizfleacheSubtype).map(v => typeof v == 'number' ? v : parseInt(v));

    // Get depth values using INDIREKT(subtype&"_t")
    this.tiefeOptions = this.berechnungService.getNamesExpressionValueList(this.heizfleacheSubtype + "_t").map(v => typeof v == 'number' ? v : parseInt(v));

    // Handle transition from free input to dropdown (when switching away from Handtuchradiator)
    if (!this.isHandtuchradiator()) {
      const currentHeight = this.berechnungService.getHeatingHeight(this.roomId, this.heaterNumber);
      if (currentHeight && this.hoeheOptions.length > 0 && !this.hoeheOptions.includes(currentHeight)) {
        // Find nearest matching option value for height
        this.berechnungService.setHeatingHeight(this.roomId,
          findNearestValue(currentHeight, this.hoeheOptions), this.heaterNumber);
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

    // Try to get subtype from the data model first
    if (subType) {
      this.heizfleacheSubtype = subType.toString();
    }
    // Fall back to main type and first available subtype
    else if (mainType) {
      const subtypes = this.berechnungService.getNamesExpressionValueList(mainType);
      if (subtypes.length > 0 && !this.heizfleacheSubtype) {
        this.heizfleacheSubtype = subtypes[0]?.toString();
        // Save the subtype to the data model
        this.berechnungService.setHeatingSubType(this.roomId, this.heizfleacheSubtype, this.heaterNumber);
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

    // Set sub type with same value initially (will be updated properly in updateDimensionOptions)
    this.berechnungService.setHeatingSubType(this.roomId, heaterType, this.heaterNumber);

    // Get subtypes for the selected heater type
    const subtypes = this.berechnungService.getNamesExpressionValueList(heaterType);
    this.heizfleacheSubtype = subtypes.length > 0 ? subtypes[0]?.toString() : '';

    // Set default values based on heater type
    if (heaterType === 'Gliederheizkörper') {
      // Initialize Glieder count if not already set
      if (!this.berechnungService.getn_rad_col(this.roomId, this.heaterNumber)) {
        this.berechnungService.setn_rad_col(this.roomId, 10, this.heaterNumber); // Default to 10 elements
      }
    }

    // Update dimension options based on the new heater type and selected subtype
    this.updateDimensionOptions();

    // Set default height and depth if options are available
    if (this.hoeheOptions.length > 0 && !this.berechnungService.getHeatingHeight(this.roomId, this.heaterNumber)) {
      this.berechnungService.setHeatingHeight(this.roomId, this.hoeheOptions[0], this.heaterNumber);
    }

    if (this.tiefeOptions.length > 0 && !this.berechnungService.getHeatingDepth(this.roomId, this.heaterNumber)) {
      this.berechnungService.setHeatingDepth(this.roomId, this.tiefeOptions[0], this.heaterNumber);
    }
  }

  // Check if current heater is Handtuchradiator (requires free input instead of dropdown)
  isHandtuchradiator(): boolean {
    return this.berechnungService.getHeatingMainType(this.roomId, this.heaterNumber) === 'Rohrradiator' &&
           this.heizfleacheSubtype === 'Handtuchradiator';
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
