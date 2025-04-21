import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GebaeudeIntroComponent } from './gebaeude-intro.component';

describe('GebaeudeIntroComponent', () => {
  let component: GebaeudeIntroComponent;
  let fixture: ComponentFixture<GebaeudeIntroComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [GebaeudeIntroComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(GebaeudeIntroComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
