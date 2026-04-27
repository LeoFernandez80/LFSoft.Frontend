import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ItemDetailGridComponent } from './item-detail-grid.component';

describe('ItemDetailGridComponent', () => {
  let component: ItemDetailGridComponent;
  let fixture: ComponentFixture<ItemDetailGridComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ItemDetailGridComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ItemDetailGridComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
