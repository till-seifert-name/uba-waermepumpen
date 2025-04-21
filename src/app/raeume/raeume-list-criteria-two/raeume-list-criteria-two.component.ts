import { Component, OnInit } from '@angular/core';
import { BerechnungService } from '../../berechnung.service';

// Reusing same Room interface as in the first criteria component
// In a real application, this would be in a shared model
interface Room {
  id: string;
  name: string;
  type: string; // 'cold', 'exterior', 'boundary', 'windows', 'other'
}

@Component({
  selector: 'app-raeume-list-criteria-two',
  standalone: false,
  templateUrl: './raeume-list-criteria-two.component.html',
  styleUrl: './raeume-list-criteria-two.component.scss'
})
export class RaeumeListCriteriaTwoComponent implements OnInit {
  newBoundaryRoomName: string = '';
  newWindowRoomName: string = '';
  newOtherRoomName: string = '';
  
  // In a real application, this would be shared with the other room list component
  // via a shared service or state management
  roomList: Room[] = [
    { id: '1', name: 'Wohnzimmer', type: 'exterior' },
    { id: '2', name: 'Kinderzimmer', type: 'cold' },
    { id: '3', name: 'Schlafzimmer', type: 'exterior' }
  ];

  constructor(private berechnungService: BerechnungService) {}

  ngOnInit(): void {
    // Here we would load room data from the service or grid
    // For the mockup, we use the hardcoded default list
  }

  addBoundaryRoom(): void {
    if (!this.newBoundaryRoomName.trim()) return;
    
    const newRoomId = Date.now().toString();
    this.roomList.push({
      id: newRoomId,
      name: this.newBoundaryRoomName,
      type: 'boundary'
    });
    
    this.newBoundaryRoomName = '';
  }

  addWindowRoom(): void {
    if (!this.newWindowRoomName.trim()) return;
    
    const newRoomId = Date.now().toString();
    this.roomList.push({
      id: newRoomId,
      name: this.newWindowRoomName,
      type: 'windows'
    });
    
    this.newWindowRoomName = '';
  }

  addOtherRoom(): void {
    if (!this.newOtherRoomName.trim()) return;
    
    const newRoomId = Date.now().toString();
    this.roomList.push({
      id: newRoomId,
      name: this.newOtherRoomName,
      type: 'other'
    });
    
    this.newOtherRoomName = '';
  }

  removeRoom(roomId: string): void {
    this.roomList = this.roomList.filter(room => room.id !== roomId);
  }
}
