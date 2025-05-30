import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-raum-detail-heizkoerper-info',
  standalone: false,
  templateUrl: './raum-detail-heizkoerper-info.component.html',
  styleUrl: './raum-detail-heizkoerper-info.component.scss'
})
export class RaumDetailHeizkoerperInfoComponent implements OnInit {
  roomId: number = 1;

  constructor(private route: ActivatedRoute) {}

  ngOnInit(): void {
    this.route.queryParams.subscribe(params => {
      this.roomId = parseInt(params['room']) ?? 1;
    });
  }
}
