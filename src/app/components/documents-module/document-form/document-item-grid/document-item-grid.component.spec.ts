import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DocumentItemGridComponent } from './document-item-grid.component';

describe('DocumentFormItemGridComponent', () => {
  let component: DocumentItemGridComponent;
  let fixture: ComponentFixture<DocumentItemGridComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DocumentItemGridComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DocumentItemGridComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
