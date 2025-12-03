import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DocumentFormItemComponent } from './document-item-form.component';

describe('DocumentFormItemComponent', () => {
  let component: DocumentFormItemComponent;
  let fixture: ComponentFixture<DocumentFormItemComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DocumentFormItemComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DocumentFormItemComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
