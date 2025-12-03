import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { GenericFormComponent } from '../../../../generic/generic-form/generic-form.component';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterOutlet } from '@angular/router';
import { takeUntil } from 'rxjs/operators';
import { MatButtonModule } from '@angular/material/button';
import { Quote, QuoteItem, QuoteItemArticle } from '../../models/quote.model';
import { QuotesService } from '../../services/quotes.service';
import { QuoteItemArticlesGridComponent } from './quote-items-article-grid/quote-item-articles-grid.component';
import { QuoteItemArticleFormComponent } from './quote-item-article-form/quote-item-article-form.component';
import { GridService } from '../../../../generic/generic-grid/services/grid.service';

@Component({
  selector: 'app-quote-item-form',
  templateUrl: './quote-item-form.component.html',
  styleUrls: ['./quote-item-form.component.scss'],
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule,       RouterOutlet,GenericFormComponent, MatButtonModule, QuoteItemArticlesGridComponent, QuoteItemArticleFormComponent],
  providers: [GridService]
})
export class QuoteItemFormComponent implements OnInit {
  private _quoteItem: QuoteItem = new QuoteItem();

  @Input() set quoteItem(value: QuoteItem | null) {
    if (!value) return;
    this._quoteItem = value;
    this.updateForm(value);
    this._articlesTMP = [...value.articles] ;
    this._gridService.setData(this._articlesTMP);
  }

  get quoteItem(): QuoteItem  {
    return this._quoteItem;
  }

  @Output() accept = new EventEmitter<QuoteItem>();
  @Output() cancel = new EventEmitter<void>();
  // @Output() maximise = new EventEmitter<void>();
  // @Output() restore = new EventEmitter<void>();
  // @Output() minimise = new EventEmitter<void>();
  
  quoteItemArticleSelected: QuoteItemArticle = new QuoteItemArticle();
  resize: number = 2;

  showForm: boolean = false;

  form: FormGroup = new FormGroup({});  
  private _articlesTMP: QuoteItemArticle[] = [];

  constructor(private fb: FormBuilder, private _gridService: GridService<QuoteItemArticle>) {    
    this.createForm();
  }

  ngOnInit(): void { }

  isReadyToAccept(): boolean {
    return  this.form.valid;
  }
  onAccept(): void {
    if (this.form.valid) {
      const updatedQuoteItem: QuoteItem = this.mapToQuoteItem();      
      this.accept.emit(updatedQuoteItem);
    }
  }
  private mapToQuoteItem(): QuoteItem {
    const formData = this.form.value as QuoteItem;
    return {
      quoteId: formData.quoteId,
      id: formData.id,
      quantity: formData.quantity,
      description: formData.description,
      price: formData.price,
      articles: this._articlesTMP
    };
  }

  onCancel(): void {
    this.showForm = false;
    this.cancel.emit();
  }

  onEdit(quoteItemArticle: QuoteItemArticle) {
    this.quoteItemArticleSelected = quoteItemArticle;
    this.showForm = true;
  }

  onRezise(value: number) {
    this.resize = value;
  }

  onAcceptQuoteItemArticle(quoteItemArticle: QuoteItemArticle) {
    this.showForm = false;
    const index = this._articlesTMP.indexOf(this.quoteItemArticleSelected);
    
    if (index !== -1) {
      this._articlesTMP.splice(index, 1, quoteItemArticle);
    }
    this._gridService.setData(this._articlesTMP);
  }

  onCancelQuoteItemArticle() {
    this.showForm = false;
  }

  private createForm() {
    this.form = this.fb.group({
      quoteId: ['', Validators.required],
      id: ['', Validators.required],
      quantity: ['', Validators.required],
      description: ['', Validators.required],
      price: ['', Validators.required]
    });
  }

  private updateForm(quoteItem: QuoteItem | undefined) {
    if (!quoteItem) return;
    this.form.patchValue({
      quoteId: quoteItem.quoteId,
      id: quoteItem.id,
      quantity: quoteItem.quantity,
      description: quoteItem.description,
      price: quoteItem.price,
    });    
  }
}
