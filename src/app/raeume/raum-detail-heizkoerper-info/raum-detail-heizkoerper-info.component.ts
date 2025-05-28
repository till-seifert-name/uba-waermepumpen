import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-raum-detail-heizkoerper-info',
  standalone: false,
  templateUrl: './raum-detail-heizkoerper-info.component.html',
  styleUrl: './raum-detail-heizkoerper-info.component.scss'
})
export class RaumDetailHeizkoerperInfoComponent implements OnInit {
  roomId: string | null = null;

  constructor(private route: ActivatedRoute) {}

  ngOnInit(): void {
    this.route.queryParams.subscribe(params => {
      this.roomId = params['room'] || null;
    });
  }
}
