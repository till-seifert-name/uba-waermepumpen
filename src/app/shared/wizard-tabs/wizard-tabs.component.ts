import {Component, Input, OnDestroy, OnInit} from '@angular/core';
import {ActivatedRoute, NavigationEnd, Router} from '@angular/router';
import {distinctUntilChanged, filter, startWith} from 'rxjs/operators';
import {BerechnungService, Room} from '../../berechnung.service';
import {combineLatest, Subscription} from 'rxjs';

interface TabConfig {
  id: string;
  title: string;
  routePath: string;     // Base route path
  queryParams?: any;     // Optional query parameters
  pathMatch: string;
  disabled?: boolean;
  roomId?: string;       // For room-specific tabs
  icon?: string;         // Bootstrap icon class name (without the 'bi-' prefix)
}

@Component({
  selector: 'app-wizard-tabs',
  standalone: false,
  templateUrl: './wizard-tabs.component.html',
  styleUrl: './wizard-tabs.component.scss'
})
export class WizardTabsComponent implements OnInit, OnDestroy {
  @Input() progress: number = 0; // Progress for active tab (0-100)
  @Input() activeRoomSubTab: string = 'gebaeude'; // Active sub-tab for room details

  // Base tabs (always present)
  baseTabs: TabConfig[] = [
    {id: 'gebaeude', title: 'Gebäude', routePath: '/gebaeude', pathMatch: '/gebaeude', icon: 'house'},
    {id: 'raeume', title: 'Räume', routePath: '/raeume/liste-1', pathMatch: '/raeume', icon: 'grid'},
    {id: 'ergebnis', title: 'Ergebnis', routePath: '/ergebnis', pathMatch: '/ergebnis', icon: 'check-circle'}
  ];

  // All tabs including dynamically generated room tabs
  tabs: TabConfig[] = [...this.baseTabs];

  activeTabId: string = 'gebaeude';
  roomTabs: TabConfig[] = [];
  rooms: Room[] = [];
  currentRoomId: string = '';

  // Flag to show room sub-tabs when a room tab is active
  showRoomSubTabs: boolean = false;

  // Room sub-tabs configuration
  roomSubTabs = [
    {id: 'gebaeude', title: 'Gebäude', path: 'detail-basis', icon: 'house-door'},
    {id: 'verluste', title: 'Verluste', path: 'detail-wand', icon: 'thermometer-snow'},
    {id: 'heizflaechen', title: 'Heizflächen', path: 'detail-heizflaechen', icon: 'bookshelf'},
    {id: 'ergebnis', title: 'Ergebnis', path: 'detail-ergebnis', icon: 'check'}
  ];

  private subscriptions: Subscription[] = [];

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private berechnungService: BerechnungService
  ) {
  }

  ngOnInit() {
    const rooms$ = this.berechnungService.rooms$.pipe(distinctUntilChanged());
    const queryParams$ = this.route.queryParams.pipe(distinctUntilChanged());
    const navEnd$ = this.router.events.pipe(
      filter(event => event instanceof NavigationEnd),
      startWith(null) // emit once on init
    );
    const selectedRoom$ = this.berechnungService.selectedRoom$.pipe(distinctUntilChanged());

    this.subscriptions.push(
      combineLatest([
        rooms$,
        queryParams$,
        navEnd$,
        selectedRoom$
      ]).subscribe(([rooms, queryParams, _, selectedRoom]) => {
        this.rooms = rooms;
        this.currentRoomId = selectedRoom;
        this.updateRoomTabs();

        const roomId = queryParams['room'];
        if (roomId) {
          this.berechnungService.setSelectedRoom(roomId);
        }

        this.updateActiveTabFromUrl();
      })
    );
  }

  /**
   * Updates the active tab based on the current URL path
   */
  updateActiveTabFromUrl(): void {
    let foundActiveTab = false;

    // First check if we have a selected room
    if (this.currentRoomId) {
      for (const tab of this.tabs) {
        if (tab.roomId === this.currentRoomId && this.router.url.includes(tab.pathMatch)) {
          this.activeTabId = tab.id;
          this.showRoomSubTabs = true;
          this.updateActiveRoomSubTab();
          foundActiveTab = true;
          return;
        }
      }
    }

    // Look for base tab matches
    for (const tab of this.tabs) {
      if (this.router.url.includes(tab.pathMatch)) {
        this.activeTabId = tab.id;
        this.showRoomSubTabs = false;
        foundActiveTab = true;
        return;
      }
    }

    // If no tab was found as active, hide sub-tabs
    if (!foundActiveTab) {
      this.showRoomSubTabs = false;
    }
  }

  /**
   * Determines the active room sub-tab based on the current URL
   */
  updateActiveRoomSubTab(): void {
    for (const subTab of this.roomSubTabs) {
      if (this.router.url.includes(subTab.path)) {
        this.activeRoomSubTab = subTab.id;
        return;
      }
    }
    // Default to first tab if none matches
    this.activeRoomSubTab = this.roomSubTabs[0].id;
  }


  ngOnDestroy() {
    // Cleanup subscriptions
    this.subscriptions.forEach(sub => sub.unsubscribe());
  }

  /**
   * Updates the tab list to include room-specific tabs
   */
  updateRoomTabs() {
    // Clear existing room tabs
    this.roomTabs = [];

    // Generate a tab for each room
    this.rooms.forEach((room, index) => {
      // Use numbered square icons (1-9) or regular square for numbers > 9
      this.roomTabs.push({
        id: `room_${room.id}`,
        title: room.name,
        routePath: '/raeume/detail-basis',
        queryParams: {room: room.id},
        pathMatch: '/raeume/detail',
        roomId: room.id,
        icon: this.getRoomTabIcon(index)
      });
    });

    // Rebuild the tabs list with room tabs inserted after the räume tab
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

  private getRoomTabIcon(index: number): string {
    return index < 9 ? `${index + 1}-square` : 'square';
  }

  isTabActive(tabId: string): boolean {
    return this.activeTabId === tabId;
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
