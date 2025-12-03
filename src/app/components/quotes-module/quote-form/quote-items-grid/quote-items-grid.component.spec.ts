import { ComponentFixture, TestBed } from '@angular/core/testing';

import { QuoteItemsGrid } from './quote-items-grid.component';

describe('QuoteItemsGrid', () => {
  let component: QuoteItemsGrid;
  let fixture: ComponentFixture<QuoteItemsGrid>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [QuoteItemsGrid]
    })
    .compileComponents();

    fixture = TestBed.createComponent(QuoteItemsGrid);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
