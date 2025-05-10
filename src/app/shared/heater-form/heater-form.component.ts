import { Component, EventEmitter, Input, OnChanges, OnInit, Output, SimpleChanges } from '@angular/core';
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
  heaterSubtype: string = '';

  // Dimension options for select dropdowns
  heightOptions: number[] = [];
  widthOptions: number[] = [];
  depthOptions: number[] = [];
  elementCountOptions: number[] = [];

  constructor(public berechnungService: BerechnungService) { }

  ngOnInit(): void {
    // Load heater types from the data model
    this.heatingTypeOptions = this.berechnungService.getHeaterTypes();
    this.loadHeaterData();
    this.updateDimensionOptions();
  }

  // Update available options for dimensions based on current heater type and subtype
  updateDimensionOptions(): void {
    const heaterType = this.berechnungService.getHeatingType(this.roomId, this.heaterNumber);

    if (!heaterType) return;

    // Get standard dimension values
    this.heightOptions = this.berechnungService.getHeaterDimensionOptions('Höhe', heaterType, this.heaterSubtype);
    this.widthOptions = this.berechnungService.getHeaterDimensionOptions('Breite', heaterType, this.heaterSubtype);
    this.depthOptions = this.berechnungService.getHeaterDimensionOptions('Tiefe', heaterType, this.heaterSubtype);

    // For Gliederheizkörper, get standard count values
    this.elementCountOptions = this.berechnungService.getHeaterDimensionOptions('Glieder', heaterType)
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['roomId'] || changes['heaterNumber']) {
      this.loadHeaterData();
    }
  }

  loadHeaterData(): void {
    const heaterType = this.berechnungService.getHeatingType(this.roomId, this.heaterNumber);
    // Set default subtype if needed
    if (heaterType) {
      const subtypes = this.berechnungService.getHeaterSubtypes(heaterType);
      if (subtypes.length > 0 && !this.heaterSubtype) {
        this.heaterSubtype = subtypes[0];
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
      'Rohrheizkörper': 'Rohrheizkörper',
      'Konvektor': 'Konvektor'
    };
    return displayNames[type] || type;
  }

  // Handle heater type change
  onHeaterTypeChange(heaterType: HeaterType): void {
    this.berechnungService.setHeatingType(this.roomId, heaterType, this.heaterNumber);
    const subtypes = this.berechnungService.getHeaterSubtypes(heaterType);
    this.heaterSubtype = subtypes.length > 0 ? subtypes[0] : '';

    // Initialize Glieder count if switching to Gliederheizkörper
    if (heaterType === 'Gliederheizkörper') {
      // Only set if not already set
      if (!this.berechnungService.getn_rad_col(this.roomId, this.heaterNumber)) {
        this.berechnungService.setn_rad_col(this.roomId, 10, this.heaterNumber); // Default to 10 elements
      }
    }

    // Update dimension options based on the new heater type
    this.updateDimensionOptions();
  }

  // Handle remove button click
  onRemove(): void {
    this.remove.emit(this.heaterNumber);
  }
}
