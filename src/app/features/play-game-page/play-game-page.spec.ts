import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PlayGamePage } from './play-game-page';

describe('PlayGamePage', () => {
  let component: PlayGamePage;
  let fixture: ComponentFixture<PlayGamePage>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PlayGamePage],
    }).compileComponents();

    fixture = TestBed.createComponent(PlayGamePage);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
