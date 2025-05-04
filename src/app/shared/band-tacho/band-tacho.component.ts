import { Component, Input, OnChanges, SimpleChanges, ElementRef, Renderer2 } from '@angular/core';

// Interface for zone configuration with integrated label
export interface ZoneConfig {
  value: number;         // Position value (unitless, based on minValue/maxValue scale)
  color?: string;        // Optional color for this zone (defaults to CSS var)
  label?: string;        // Optional label text to display at this position
}

// Interface for pin configuration
export interface PinConfig {
  value: number;         // Position value (unitless, based on minValue/maxValue scale)
  tooltip?: string;      // Optional tooltip text
  color?: string;        // Optional color override
}

@Component({
  selector: 'app-band-tacho',
  templateUrl: './band-tacho.component.html',
  standalone: false,
  styleUrl: './band-tacho.component.scss'
})
export class BandTachoComponent implements OnChanges {
  // Scale limits
  @Input() minValue: number = 0;        // Minimum scale value
  @Input() maxValue: number = 100;      // Maximum scale value

  // Color scheme inputs
  @Input() set zoneColors(colors: string[]) {
    if (colors && colors.length > 0) {
      colors.forEach((color, index) => {
        if (color) {
          this.elementRef.nativeElement.style.setProperty(`--band-tacho-zone${index+1}-color`, color);
        }
      });

      // We need to recalculate the gradient when colors change
      this.calculateGradient();
    }
  }

  @Input() set defaultPinColor(color: string) {
    if (color) {
      this.elementRef.nativeElement.style.setProperty('--band-tacho-pin-color', color);
    }
  }

  // Zones and labels configuration (combined)
  @Input() zones: ZoneConfig[] = [
    { value: 25, label: '50' },
    { value: 50, label: '70' },
    { value: 75, label: '90' }
  ];

  // Pins configuration (array-based)
  @Input() pins: PinConfig[] = [];

  // Backward compatibility for simple 2-pin setup
  @Input() set value1(value: number | null) {
    if (value !== null) {
      if (this.pins.length === 0) {
        this.pins.push({ value });
      } else {
        this.pins[0] = { ...this.pins[0], value };
      }
    }
  }

  @Input() set value2(value: number | null) {
    if (value !== null) {
      if (this.pins.length < 2) {
        this.pins[1] = { value };
      } else {
        this.pins[1] = { ...this.pins[1], value };
      }
    }
  }

  @Input() set pin1Tooltip(value: string) {
    if (this.pins.length === 0) {
      this.pins.push({ value: 0, tooltip: value });
    } else {
      this.pins[0] = { ...this.pins[0], tooltip: value };
    }
  }

  @Input() set pin2Tooltip(value: string) {
    if (this.pins.length < 2) {
      this.pins[1] = { value: 0, tooltip: value };
    } else {
      this.pins[1] = { ...this.pins[1], tooltip: value };
    }
  }

  @Input() set pin1ColorOverride(value: string | undefined) {
    if (value && this.pins.length > 0) {
      this.pins[0] = { ...this.pins[0], color: value };
    }
  }

  @Input() set pin2ColorOverride(value: string | undefined) {
    if (value && this.pins.length > 1) {
      this.pins[1] = { ...this.pins[1], color: value };
    }
  }

  // Backward compatibility for simple 3-zone setup
  @Input() set zone1Limit(value: number) {
    if (this.zones.length > 0) {
      this.zones[0].value = value;
    }
  }

  @Input() set zone2Limit(value: number) {
    if (this.zones.length > 1) {
      this.zones[1].value = value;
    }
  }


  // CSS gradient for gauge bar
  gaugeGradient: string = '';

  constructor(
    private elementRef: ElementRef,
  ) {}

  ngOnChanges(changes: SimpleChanges): void {
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
                      `var(--band-tacho-zone${(sortedZones.length, 3)}-color, currentColor)`;

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
    if (this.maxValue <= this.minValue) return 0;

    // Ensure the value is within bounds
    const clampedValue = Math.min(Math.max(value, this.minValue), this.maxValue);

    // Calculate position as percentage within range
    return ((clampedValue - this.minValue) / (this.maxValue - this.minValue)) * 100;
  }

  // Get pin's color (custom color or zone-based css variable)
  getPinColor(pin: PinConfig): string {
    // If pin has a specific color override, use it directly
    if (pin.color) return pin.color;

    // Otherwise get zone index for this value and use corresponding CSS var
    const zoneIndex = this.getZoneIndexForValue(pin.value);
    return `var(--band-tacho-zone${zoneIndex}-color, currentColor)`;
  }

  // Helper method to find the appropriate zone index for a value
  private getZoneIndexForValue(value: number): number {
    if (this.zones.length === 0) return 1; // Default to first zone

    // Sort zones by value
    const sortedZones = [...this.zones].sort((a, b) => a.value - b.value);

    // Find the zone index for this value (1-indexed for CSS vars)
    for (let i = 0; i < sortedZones.length; i++) {
      if (value <= sortedZones[i].value) {
        return i; // Limit to 3 zones for CSS vars
      }
    }

    // If value is above all zone limits, use the last zone's index
    return sortedZones.length; // Limit to 3 zones for CSS vars
  }
}
