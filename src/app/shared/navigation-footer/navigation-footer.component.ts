import {Component} from '@angular/core';
import {BerechnungService} from '../../berechnung.service';
import {OUT_ROOMS_COLS} from '../../formula-overlays/base-overlay';

@Component({
  selector: 'app-navigation-footer',
  templateUrl: './navigation-footer.component.html',
  styleUrl: './navigation-footer.component.scss',
  standalone: false,
  host: {
    'class': 'navigation-footer'
  }
})
export class NavigationFooterComponent {

  constructor(private berechnungService: BerechnungService) {
  }

  /* Rows that can have wanring messages for UI */
  private readonly outRoomsWarningRows = [51, 53, 55, 57, 59, 61, 63, 65];

  get warningsText(): string {
    // Collect all messages
    const allMessages: string[] = [];
    for (const room of this.berechnungService.getAllRooms()) {
      const col = OUT_ROOMS_COLS[room.id - 1];
      for (const row of this.outRoomsWarningRows) {
        const warning = this.berechnungService.grid.getCell('OUT_rooms', `${col}${row}`);
        if (warning && warning.toString().trim()) {
          allMessages.push(warning.toString().trim());
        }
      }
    }

    // Group messages by generic text using RegExp
    const messageMap = new Map<string, { type: string, rooms: string[] }>();

    allMessages.forEach(fullMsg => {
      // Extract: "Warnung Raum Wohnzimmer: Die Außenwandlänge..."
      const match = fullMsg.match(/^(Warnung|Hinweis) Raum (.+?): (.+)$/);
      if (!match) {
        // If pattern doesn't match, show message as-is
        messageMap.set(fullMsg, { type: '', rooms: [] });
        return;
      }

      const [, typeStr, roomName, genericMsg] = match;
      const key = `${typeStr}:${genericMsg}`;

      if (messageMap.has(key)) {
        messageMap.get(key)!.rooms.push(roomName);
      } else {
        messageMap.set(key, { type: typeStr, rooms: [roomName] });
      }
    });

    // Convert to formatted strings
    const grouped: string[] = [];
    messageMap.forEach((data, key) => {
      if (data.rooms.length === 0) {
        // Message that didn't match pattern - show as-is
        grouped.push(key);
      } else if (data.rooms.length === 1) {
        // Single room - show original format
        grouped.push(`${data.type} Raum ${data.rooms[0]}: ${key.substring(key.indexOf(':') + 1)}`);
      } else {
        // Multiple rooms - show grouped format
        const genericMsg = key.substring(key.indexOf(':') + 1);
        grouped.push(`${data.type} Räume ${data.rooms.join(', ')}: ${genericMsg}`);
      }
    });

    return grouped.join("\n");
  }
}
