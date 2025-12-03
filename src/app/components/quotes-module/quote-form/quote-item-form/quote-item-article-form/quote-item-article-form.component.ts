import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, OnDestroy, OnInit, Output } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { RouterOutlet, ActivatedRoute, Router } from '@angular/router';
import { Subject } from 'rxjs';
import { GenericFormComponent } from '../../../../../generic/generic-form/generic-form.component';
import { QuoteItem, QuoteItemArticle } from '../../../models/quote.model';
import { QuotesService } from '../../../services/quotes.service';
import { QuoteItemArticlesGridComponent } from '../quote-items-article-grid/quote-item-articles-grid.component';
import { GridService } from '../../../../../generic/generic-grid/services/grid.service';


@Component({
  selector: 'app-quote-item-article-form',
  templateUrl: './quote-item-article-form.component.html',
  styleUrls: ['./quote-item-article-form.component.scss'],
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterOutlet, GenericFormComponent, MatButtonModule, QuoteItemArticlesGridComponent]
})
export class QuoteItemArticleFormComponent implements OnInit, OnDestroy {
  @Input() set quoteItemArticle(value: QuoteItemArticle) {
    if (!value) return;
    this._updateForm(value);
  }

  @Output() accept = new EventEmitter<QuoteItemArticle>();
  @Output() cancel = new EventEmitter<void>();

  form: FormGroup = new FormGroup({});  
  private unsubscribe$ = new Subject<void>();


  constructor(private fb: FormBuilder) {    
    this._createForm();
  }

  private _createForm() {
    this.form = this.fb.group({
      id: ['', Validators.required],
      itemId: ['', Validators.required],
      quoteId: ['', Validators.required],
      quantity: ['', Validators.required],
      assembly: ['', Validators.required],
      description: ['', Validators.required],
      price: ['', Validators.required]
    });
  }

  ngOnInit(): void {   }

  private _updateForm(quoteItemArticle: QuoteItemArticle) {
    this.form.patchValue({
      id: quoteItemArticle.id,
      itemId: quoteItemArticle.itemId,
      quoteId: quoteItemArticle.quoteId,
      quantity: quoteItemArticle.quantity,
      assembly: quoteItemArticle.assembly,
      description: quoteItemArticle.description,
      price: quoteItemArticle.price
    });
  }

  ngOnDestroy(): void {
    this.unsubscribe$.next();
    this.unsubscribe$.complete();
  }

  isReadyToAccept(): boolean {
    return  this.form.valid;
  }

  onAccept(): void {
    if (this.form.valid) {
      const formData = this.form.value;
      const updatedQuoteItem = this._mapToArticle()
      this.accept.emit(updatedQuoteItem);
    }
  }

  private _mapToArticle(): QuoteItemArticle {
    const formData = this.form.value as QuoteItemArticle;
    return {
      id: formData.id,
      itemId: formData.itemId,
      quoteId: formData.quoteId,
      quantity: formData.quantity,
      assembly: formData.assembly,
      description: formData.description,
      price: formData.price
    };
  }

  onCancel(): void {
    this.cancel.emit();
  }

}
