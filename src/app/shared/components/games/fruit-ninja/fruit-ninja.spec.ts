import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FruitNinja } from './fruit-ninja';

describe('FruitNinja', () => {
  let component: FruitNinja;
  let fixture: ComponentFixture<FruitNinja>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FruitNinja],
    }).compileComponents();

    fixture = TestBed.createComponent(FruitNinja);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
