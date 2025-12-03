import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { GenericFormComponent } from '../../../generic/generic-form/generic-form.component';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterOutlet } from '@angular/router';
import { takeUntil } from 'rxjs/operators';
import { Subject } from 'rxjs';
import { MatButtonModule } from '@angular/material/button';
import { Quote, QuoteItem } from '../models/quote.model';
import { QuotesService } from '../services/quotes.service';
import { QuoteItemsGridComponent } from './quote-items-grid/quote-items-grid.component';
import { QuoteItemFormComponent } from './quote-item-form/quote-item-form.component';
import { GridService } from '../../../generic/generic-grid/services/grid.service';

@Component({
  selector: 'app-quote-form',
  templateUrl: './quote-form.component.html',
  styleUrls: ['./quote-form.component.scss'],
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule,RouterOutlet,GenericFormComponent, MatButtonModule, QuoteItemsGridComponent, QuoteItemFormComponent],
  providers: [GridService]
})
export class QuoteFormComponent implements OnInit {
  @Input() quoteId: number = 0;
  
  @Output() save = new EventEmitter<Quote>();
  @Output() cancel = new EventEmitter<void>();

  showForm = false;
  form: FormGroup= new FormGroup({});
  quoteItemSelected: QuoteItem = new QuoteItem();
  quote: Quote = new Quote();

  private unsubscribe$ = new Subject<void>();
  private _itemsTMP: QuoteItem[] = [];

  constructor(private fb: FormBuilder, private _quotesService: QuotesService, private _route: ActivatedRoute, 
    private _router: Router, private _gridService: GridService<QuoteItem>) {    
    this._createForm();

    this._route.queryParamMap
      .pipe(takeUntil(this.unsubscribe$))
      .subscribe(params => {
        this.quoteId = Number(params.get('id'));
      });

  }

  private _createForm() {
    this.form = this.fb.group({
      id: ['', Validators.required],
      customerId: ['', Validators.required],
      bussinesName: [''],
      creation: [''],
      state: [''],
      description: ['', Validators.required]
    });
  }

  ngOnInit(): void {    
      this._quotesService.getQuote(this.quoteId).subscribe(quote => {       
        this.quote=quote;
        this._itemsTMP = [...quote.items];
        this.form.patchValue(quote);
        this._gridService.setData(this._itemsTMP);
      }
    );   
  }

  isReadyToSave(): boolean {
    return   this.form.valid;
  }
  onSave(): void {
    this.quote = {...this.form.value};
    this.quote.items = [...this._itemsTMP];
    this.save.emit(this.quote);
  }

  onCancel(): void {
    this.cancel.emit();
  }

  onDeleteQuoteItem( quoteItem: QuoteItem): void {
    //eliminar quoteItem de la lista de items del quote    
  }

   onEditQuoteItem( quoteItem: QuoteItem): void {
    this.quoteItemSelected = quoteItem;   
    this.showForm = true; 
  }

  onAcceptQuoteItem(quoteItem: QuoteItem): void {   
    this.showForm = false;
    const index = this._itemsTMP.indexOf(this.quoteItemSelected);
    
    if (index !== -1) {
      this._itemsTMP.splice(index, 1, quoteItem);
    }
    this._gridService.setData(this._itemsTMP);
  }

  onCancelQuoteItem(): void {
    this.showForm = false;
  }
}
