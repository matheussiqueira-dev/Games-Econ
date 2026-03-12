import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ClickableLink } from './clickable-link';

describe('ClickableLink', () => {
  let component: ClickableLink;
  let fixture: ComponentFixture<ClickableLink>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ClickableLink],
    }).compileComponents();

    fixture = TestBed.createComponent(ClickableLink);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
