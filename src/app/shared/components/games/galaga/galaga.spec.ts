import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Galaga } from './galaga';

describe('Galaga', () => {
  let component: Galaga;
  let fixture: ComponentFixture<Galaga>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Galaga],
    }).compileComponents();

    fixture = TestBed.createComponent(Galaga);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
