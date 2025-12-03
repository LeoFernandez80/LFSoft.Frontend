import { TestBed } from '@angular/core/testing';
import { CustomDatePipe } from './custom-date.pipe';
import { DateConfigService } from '../services/date-config.service';

describe('CustomDatePipe', () => {
  let pipe: CustomDatePipe;
  let dateConfigService: DateConfigService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [DateConfigService]
    });
    dateConfigService = TestBed.inject(DateConfigService);
    pipe = new CustomDatePipe(dateConfigService);
  });

  it('should create an instance', () => {
    expect(pipe).toBeTruthy();
  });

  it('should format date with default format', () => {
    const date = new Date('2024-03-15T10:30:00Z');
    const result = pipe.transform(date);
    expect(result).toBeTruthy();
  });

  it('should return null for null input', () => {
    const result = pipe.transform(null);
    expect(result).toBeNull();
  });

  it('should return null for undefined input', () => {
    const result = pipe.transform(undefined);
    expect(result).toBeNull();
  });
});
