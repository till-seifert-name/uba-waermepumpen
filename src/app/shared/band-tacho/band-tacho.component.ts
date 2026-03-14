// band-tacho.component.ts (nur relevante Diff-Erweiterungen)
import {Component, Input, OnChanges, SimpleChanges} from '@angular/core';

export interface ZoneConfig {
  value: number;
  color?: string;
  label?: string; // wird für Side-Labels (erste/letzte Zone) genutzt
}

export interface PinConfig {
  value: number;
  variant: string;
  title: string;
  line1?: string;
  line2?: string;
  color?: string;
}

@Component({
  selector: 'app-band-tacho',
  templateUrl: './band-tacho.component.html',
  standalone: false,
  styleUrl: './band-tacho.component.scss'
})
export class BandTachoComponent implements OnChanges {
  @Input() minValue = 0;
  @Input() maxValue = 1;
  @Input() zones: ZoneConfig[] = [
    {value: 0.25, label: 'Optimierte\nEffizienz'},
    {value: 0.60},
    {value: 0.80},
    {value: 1.00, label: 'Geringe\nEffizienz'}
  ];
  @Input() pins: PinConfig[] = [];
  @Input() customAriaLabel?: string; // Optional custom aria-label from parent

  gaugeGradient = '';


  ngOnChanges(_: SimpleChanges): void {
    this.calculateGradient();
  }

  // Generate CSS linear gradient with sharp transitions between zones
  calculateGradient(): void {
    if (this.maxValue <= this.minValue) return;

    // We need to create zones that cover the full range from minValue to maxValue
    // with appropriate transitions between colors

    // 1. Sort zones by value
    const sortedZones = [...this.zones].sort((a, b) => a.value - b.value);

    // 2. Add minValue and maxValue zones if they don't exist
    // This ensures we have proper color coverage for the entire range
    if (sortedZones.length === 0) {
      // Default to a single zone if none provided
      sortedZones.push({
        value: this.maxValue,
        color: 'var(--band-tacho-zone1-color)'
      });
    }

    // Make sure we start at minValue
    if (sortedZones[0].value > this.minValue) {
      sortedZones.unshift({
        value: this.minValue,
        color: sortedZones[0].color
      });
    }

    // Make sure we end at maxValue
    if (sortedZones[sortedZones.length - 1].value < this.maxValue) {
      const lastColor = sortedZones[sortedZones.length - 1].color ||
                        `var(--band-tacho-zone${(sortedZones.length)}-color, currentColor)`;

      sortedZones.push({
        value: this.maxValue,
        color: lastColor
      });
    }

    // 3. Now create gradient stops with a flatter structure using flatMap
    const gradientParts = sortedZones.flatMap((zone, index) => {
      // Skip the first zone's start (it will be 0%)
      if (index === 0) return [];

      const prevZone = sortedZones[index - 1];

      // Get colors for each zone, defaulting to CSS variables if not specified
      const prevColor = prevZone.color ||
                        `var(--band-tacho-zone${(index)}-color, currentColor)`;
      const currentColor = zone.color ||
                           `var(--band-tacho-zone${(index + 1)}-color, currentColor)`;

      // Calculate the position as percentage
      const position = this.calculatePositionPercent(zone.value);

      // Return two gradient stops for the sharp transition
      return [
        `${prevColor} ${position}%`,     // Previous color up to this position
        `${currentColor} ${position}%`   // New color starting at this position
      ];
    });

    // 4. Add the starting and ending points
    const firstColor = sortedZones[0].color || 'var(--band-tacho-zone1-color, currentColor)';
    const lastColor = sortedZones[sortedZones.length - 1].color ||
                      `var(--band-tacho-zone${sortedZones.length}-color, currentColor)`;

    gradientParts.unshift(`${firstColor} 0%`);

    // Only add 100% stop if it's different from the last zone's position
    const lastPosition = this.calculatePositionPercent(sortedZones[sortedZones.length - 1].value);
    if (lastPosition < 100) {
      gradientParts.push(`${lastColor} 100%`);
    }

    // 5. Create the linear-gradient CSS
    this.gaugeGradient = `linear-gradient(to right, ${gradientParts.join(', ')})`;
  }

  // Calculate position as percentage for display
  calculatePositionPercent(value: number): number {
    const v = Math.min(Math.max(value, this.minValue), this.maxValue);
    return ((v - this.minValue) / (this.maxValue - this.minValue)) * 100;
  }

  // Get the color for a specific value based on zones
  getColorForValue(value: number): string {
    if (this.zones.length === 0) {
      return 'var(--band-tacho-zone1-color, currentColor)';
    }

    // Calculate the percentage position of the value in the gradient
    const positionPercent = this.calculatePositionPercent(value);
    
    // Determine which gradient segment this position falls into
    // Gradient segments are evenly distributed
    const segmentSize = 100 / this.zones.length;
    let zoneIndex = Math.floor(positionPercent / segmentSize);
    
    // Ensure we don't exceed the zone count
    if (zoneIndex >= this.zones.length) {
      zoneIndex = this.zones.length - 1;
    }

    // Get the zone color or default to CSS variable
    const zone = this.zones[zoneIndex];
    if (zone?.color) {
      return zone.color;
    }

    // Default to CSS variable with zone index (1-based)
    return `var(--band-tacho-zone${zoneIndex + 1}-color, currentColor)`;
  }

  // side labels: take exactly first/last zone.label as given (no sorting)
  get leftSideLabel(): string {
    return  this.zones?.[0]?.label?.trim() ?? '';
  }

  get rightSideLabel(): string {
    return this.zones?.[this.zones.length - 1]?.label?.trim() ?? '';
  }

  // Accessibility: Generate descriptive aria-label for screen readers
  // Combines custom label from Excel data with auto-generated gauge description
  getAriaLabel(): string {
    const parts: string[] = [];

    // If custom aria-label is provided, use it first
    if (this.customAriaLabel && this.customAriaLabel.trim().length > 0) {
      parts.push(this.customAriaLabel.trim());
    }

    // Add auto-generated gauge description
    const leftLabel = this.leftSideLabel ? this.leftSideLabel.replace(/\n/g, ' ') : '';
    const rightLabel = this.rightSideLabel ? this.rightSideLabel.replace(/\n/g, ' ') : '';

    if (leftLabel && rightLabel) {
      parts.push(`Die Grafik hier zeigt eine Bewertungsskala von ‚${leftLabel}‘ am Anfang bis ‚${rightLabel}‘ am Ende.`);
    } else {
      parts.push(`Die Grafik hier zeigt eine Skala mit Werten von ${this.minValue} bis ${this.maxValue}.`);
    }

    // Describe the pins/markers
    if (this.pins && this.pins.length > 0) {
      const activePins = this.pins.filter(p => p.title || p.line1 || p.line2 || p.variant);

      if (activePins.length === 1) {
        const pin = activePins[0];
        const variantText = pin.variant ? `‚${pin.variant}‘` : 'Eine Markierung';
        const details: string[] = [];

        if (pin.title) details.push(pin.title);
        if (pin.line1) details.push(pin.line1);
        if (pin.line2) details.push(pin.line2);

        const position = this.describePosition(pin.value);

        if (details.length > 0) {
          parts.push(`${variantText} ist beschriftet mit ‚${details.join(', ')}‘ und zeigt auf ${position}.`);
        } else {
          parts.push(`${variantText} zeigt auf ${position}.`);
        }
      } else if (activePins.length > 1) {
        parts.push(`Es sind ${activePins.length} Markierungen vorhanden:`);

        activePins.forEach((pin) => {
          const variantText = pin.variant ? `‚${pin.variant}‘` : 'Eine Markierung';
          const details: string[] = [];

          if (pin.title) details.push(pin.title);
          if (pin.line1) details.push(pin.line1);
          if (pin.line2) details.push(pin.line2);

          const position = this.describePosition(pin.value);

          if (details.length > 0) {
            parts.push(`${variantText} ist beschriftet mit ‚${details.join(', ')}‘ und zeigt auf ${position}.`);
          } else {
            parts.push(`${variantText} zeigt auf ${position}.`);
          }
        });
      }
    }

    return parts.join(' ');
  }

  // Helper: Describe position on scale in natural language
  private describePosition(value: number): string {
    const percent = this.calculatePositionPercent(value);

    if (percent <= 5) return 'den Anfang der Skala';
    if (percent <= 15) return 'ca. das erste Zehntel';
    if (percent <= 30) return 'ca. das erste Viertel';
    if (percent <= 45) return 'ca. das erste Drittel';
    if (percent <= 55) return 'ca. die Mitte';
    if (percent <= 70) return 'ca. das letzte Drittel';
    if (percent <= 85) return 'ca. das letzte Viertel';
    if (percent <= 95) return 'ca. das letzte Zehntel';
    return 'das Ende der Skala';
  }
}
