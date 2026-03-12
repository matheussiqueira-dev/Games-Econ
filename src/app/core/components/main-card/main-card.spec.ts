import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MainCard } from './main-card';

describe('MainCard', () => {
  let component: MainCard;
  let fixture: ComponentFixture<MainCard>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MainCard],
    }).compileComponents();

    fixture = TestBed.createComponent(MainCard);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
