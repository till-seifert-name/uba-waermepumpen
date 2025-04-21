import { Component, Input, OnInit, OnDestroy } from '@angular/core';
import { Router, NavigationEnd } from '@angular/router';
import { filter } from 'rxjs/operators';
import { BerechnungService, Room } from '../../berechnung.service';
import { Subscription as RxSubscription } from 'rxjs';

interface TabConfig {
  id: string;
  title: string;
  route: string;
  pathMatch: string;
  disabled?: boolean;
  roomId?: string; // For room-specific tabs
  icon?: string;   // Bootstrap icon class name (without 'bi-' prefix)
}

@Component({
  selector: 'app-wizard-tabs',
  standalone: false,
  templateUrl: './wizard-tabs.component.html',
  styleUrl: './wizard-tabs.component.scss'
})
export class WizardTabsComponent implements OnInit, OnDestroy {
  @Input() progress: number = 0; // Progress for active tab (0-100)

  // Base tabs (always present)
  baseTabs: TabConfig[] = [
    { id: 'gebaeude', title: 'Gebäude', route: '/gebaeude', pathMatch: '/gebaeude', icon: 'house' },
    { id: 'raeume', title: 'Räume', route: '/raeume/liste-kriterien-1', pathMatch: '/raeume', icon: 'grid' },
    { id: 'ergebnis', title: 'Ergebnis', route: '/ergebnis', pathMatch: '/ergebnis', icon: 'check-circle' }
  ];

  // All tabs including dynamically generated room tabs
  tabs: TabConfig[] = [...this.baseTabs];

  activeTabId: string = 'gebaeude';
  roomTabs: TabConfig[] = [];
  rooms: Room[] = [];
  currentRoomId: string = '';
  private subscriptions: RxSubscription[] = [];

  constructor(
    private router: Router,
    private berechnungService: BerechnungService
  ) {}

  ngOnInit() {
    // Listen to route changes to update the active tab
    this.subscriptions.push(
      this.router.events.pipe(
        filter(event => event instanceof NavigationEnd)
      ).subscribe((event: any) => {
        this.updateActiveTab(event.url);
      })
    );

    // Subscribe to rooms list changes
    this.subscriptions.push(
      this.berechnungService.rooms$.subscribe(rooms => {
        this.rooms = rooms;
        this.updateRoomTabs();
      })
    );

    // Subscribe to selected room changes
    this.subscriptions.push(
      this.berechnungService.selectedRoom$.subscribe(roomId => {
        this.currentRoomId = roomId;
        // If we have room ID selected but active tab isn't a room tab,
        // update tabs but don't force navigation
        if (roomId && !this.activeTabId.startsWith('room_')) {
          this.updateRoomTabs();
        }
      })
    );

    // Initialize from current URL
    this.updateActiveTab(this.router.url);
  }

  ngOnDestroy() {
    // Clean up subscriptions
    this.subscriptions.forEach(sub => sub.unsubscribe());
  }

  /**
   * Updates the tabs list to include room-specific tabs
   */
  updateRoomTabs() {
    // Clear existing room tabs
    this.roomTabs = [];

    if (this.rooms.length > 0) {
      // Generate a tab for each room
      this.rooms.forEach((room, index) => {
        // Use numbered square icons (1-9) or regular square for numbers > 9
        let icon = 'square';
        if (index < 9) {
          icon = `${index + 1}-square`;
        }

        this.roomTabs.push({
          id: `room_${room.id}`,
          title: room.name,
          route: `/raeume/detail-basis/${room.id}`,
          pathMatch: `/raeume/detail`,
          roomId: room.id,
          icon: icon
        });
      });

      // Rebuild tabs list with room tabs inserted after the räume tab
      this.rebuildTabsList();
    } else {
      // No rooms, just use base tabs
      this.tabs = [...this.baseTabs];
    }
  }

  /**
   * Rebuilds the tabs list to include room tabs in the correct position
   */
  rebuildTabsList() {
    // Insert room tabs after the "Räume" tab but before the "Ergebnis" tab
    const raumeIndex = this.baseTabs.findIndex(tab => tab.id === 'raeume');

    if (raumeIndex !== -1) {
      this.tabs = [
        ...this.baseTabs.slice(0, raumeIndex + 1), // Up to and including Räume tab
        ...this.roomTabs,                         // Room tabs
        ...this.baseTabs.slice(raumeIndex + 1)    // Ergebnis tab and any others
      ];
    } else {
      // Fallback if räume tab not found (shouldn't happen)
      this.tabs = [...this.baseTabs, ...this.roomTabs];
    }
  }

  updateActiveTab(url: string): void {
    // First check for room detail pages to set the active room tab
    if (url.includes('/raeume/detail')) {
      // Extract room ID from URL
      const matches = url.match(/\/raeume\/detail[^\/]+\/([^\/]+)/);
      if (matches && matches[1]) {
        const roomId = matches[1];
        this.berechnungService.setSelectedRoom(roomId);
        this.activeTabId = `room_${roomId}`;

        // Make sure room tabs are updated
        this.updateRoomTabs();
        return;
      }
    }

    // Otherwise look for base tab matches
    for (const tab of this.tabs) {
      if (url.includes(tab.pathMatch)) {
        this.activeTabId = tab.id;

        // If we're on a room-related page, make sure room tabs are updated
        if (tab.id === 'raeume' || tab.id.startsWith('room_')) {
          this.updateRoomTabs();
        }

        break;
      }
    }
  }

  isTabActive(tabId: string): boolean {
    return this.activeTabId === tabId;
  }

  /**
   * Returns the currently selected room name, if any
   */
  getCurrentRoomName(): string {
    if (this.currentRoomId) {
      const room = this.rooms.find(r => r.id === this.currentRoomId);
      return room ? room.name : '';
    }
    return '';
  }

  /**
   * Determines if a tab should be disabled based on progression
   */
  isTabDisabled(index: number): boolean {
    // Only disable future tabs - allow users to go back
    if (index === 0) return false; // First tab always enabled

    const activeIndex = this.tabs.findIndex(tab => tab.id === this.activeTabId);

    // For room tabs, enable them if we've reached the Räume step
    if (this.tabs[index].id.startsWith('room_')) {
      const raumeIndex = this.tabs.findIndex(tab => tab.id === 'raeume');
      return activeIndex < raumeIndex; // Disable room tabs if we haven't reached Räume yet
    }

    return index > activeIndex + 1; // Allow current and next tab
  }
}
