import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PlayGameDashboard } from './play-game-dashboard';

describe('PlayGameDashboard', () => {
  let component: PlayGameDashboard;
  let fixture: ComponentFixture<PlayGameDashboard>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PlayGameDashboard],
    }).compileComponents();

    fixture = TestBed.createComponent(PlayGameDashboard);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
