import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GenericMessageItem } from './generic-message-item';

describe('GenericMessageItem', () => {
  let component: GenericMessageItem;
  let fixture: ComponentFixture<GenericMessageItem>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [GenericMessageItem]
    })
    .compileComponents();

    fixture = TestBed.createComponent(GenericMessageItem);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
