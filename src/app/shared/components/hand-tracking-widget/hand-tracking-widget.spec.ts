import { ComponentFixture, TestBed } from '@angular/core/testing';

import { HandTrackingWidget } from './hand-tracking-widget';

describe('HandTrackingWidget', () => {
  let component: HandTrackingWidget;
  let fixture: ComponentFixture<HandTrackingWidget>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [HandTrackingWidget],
    }).compileComponents();

    fixture = TestBed.createComponent(HandTrackingWidget);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
