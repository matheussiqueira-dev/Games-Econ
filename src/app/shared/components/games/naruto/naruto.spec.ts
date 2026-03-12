import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Naruto } from './naruto';

describe('Naruto', () => {
  let component: Naruto;
  let fixture: ComponentFixture<Naruto>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Naruto],
    }).compileComponents();

    fixture = TestBed.createComponent(Naruto);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
