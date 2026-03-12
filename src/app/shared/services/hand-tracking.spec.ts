import { TestBed } from '@angular/core/testing';

import { HandTrackingService } from './hand-tracking';

describe('HandTrackingService', () => {
  let service: HandTrackingService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(HandTrackingService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
