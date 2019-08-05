import { TestBed } from '@angular/core/testing';

import { DataStatusService } from './data-status.service';

describe('DataStatusService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: DataStatusService = TestBed.get(DataStatusService);
    expect(service).toBeTruthy();
  });
});
