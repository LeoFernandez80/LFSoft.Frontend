import { ComponentFixture, TestBed } from '@angular/core/testing';

import { QuoteHeaderActionsComponent } from './quote-header-actions.component';

describe('QuoteHeaderActionsComponent', () => {
  let component: QuoteHeaderActionsComponent;
  let fixture: ComponentFixture<QuoteHeaderActionsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [QuoteHeaderActionsComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(QuoteHeaderActionsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
