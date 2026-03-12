import { ComponentFixture, TestBed } from '@angular/core/testing';

import { HybridField } from './hybrid-field';

describe('HybridField', () => {
  let component: HybridField;
  let fixture: ComponentFixture<HybridField>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [HybridField],
    }).compileComponents();

    fixture = TestBed.createComponent(HybridField);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
