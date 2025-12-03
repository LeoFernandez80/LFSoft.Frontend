import { ComponentFixture, TestBed } from '@angular/core/testing';
import { QuotesModuleComponent } from './quotes-module.component';


describe('QuotesModule', () => {
  let component: QuotesModuleComponent;
  let fixture: ComponentFixture<QuotesModuleComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [QuotesModuleComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(QuotesModuleComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
