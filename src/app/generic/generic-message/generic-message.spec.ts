import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GenericMessage } from './generic-message';

describe('GenericMessage', () => {
  let component: GenericMessage;
  let fixture: ComponentFixture<GenericMessage>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [GenericMessage]
    })
    .compileComponents();

    fixture = TestBed.createComponent(GenericMessage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
