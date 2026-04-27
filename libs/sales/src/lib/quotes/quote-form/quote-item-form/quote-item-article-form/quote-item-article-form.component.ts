import { Component, EventEmitter, Input, Output } from '@angular/core';
import { QuoteItemArticle } from '../../../models/quote.model';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormGroup, FormBuilder, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { RouterOutlet } from '@angular/router';
import { HttpErrorResponse } from '@angular/common/http';
import { ArticleService } from '@lib/articles';
import { GenericFormComponent, TranslatePipe, FormValidationsDirective, GenericActionsComponent, ActionService, MessagesService, EnumActionsType, EnumMessageType, Action } from '@lib/shared';
import { EnumActions } from 'libs/common/src/lib/enums/actions.enum';

@Component({
  selector: 'lfsoft-sales-quote-item-article-form',
  templateUrl: './quote-item-article-form.component.html',
  styleUrl: './quote-item-article-form.component.scss',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterOutlet, GenericFormComponent, MatButtonModule, TranslatePipe, FormValidationsDirective, GenericActionsComponent],
  providers: [ActionService]
})
export class QuoteItemArticleFormComponent {
  private _itemArticle: QuoteItemArticle= new QuoteItemArticle();
  @Input() set quoteItemArticle(value: QuoteItemArticle) {
    if (!value) return;
    this._itemArticle = value;
    this._updateForm(value);
  }
  get quoteItemArticle(): QuoteItemArticle {
    return this._itemArticle;
  }

  @Output() accept = new EventEmitter<QuoteItemArticle>();
  @Output() cancel = new EventEmitter<void>();

  form: FormGroup = new FormGroup({});  

  constructor(
    private fb: FormBuilder, 
    private _messagesService: MessagesService, 
    private _actionService: ActionService,
    private _articleService: ArticleService
  ) {    
    this._createForm();
  }

  ngOnDestroy(): void { }

  ngOnInit(): void {   
    this._loadSecurityActions();
  }

  isReadyToAccept(): boolean {
    return this.form.valid && this.form.dirty;
  }

  onAction(action: EnumActionsType | EnumActions): void {
    try {
      switch (action) {
        case EnumActionsType.actionAccept:
          this._acceptItemArticle();
          break;
        case EnumActionsType.actionCancel:
          this._cancelItemArticle();
          break;
      }
    } catch (error) {
      this._messagesService.addMessage(error as HttpErrorResponse, EnumMessageType.Error);
    }
  }

  onSearchArticle(): void {
    const code = this.form.get('itemArticleAssembly')?.value;
    if (!code) return;

    this._articleService.getArticleByAssy(code).subscribe({
      next: (article) => {
        this.form.patchValue({
          itemArticleDescription: article.description,
          itemArticleUnitPrice: article.listprice
        });
        this.form.get('itemArticleDescription')?.disable();
        this.form.get('itemArticleUnitPrice')?.disable();
        
        this._recalculatePrices();
      },
      error: (error: HttpErrorResponse) => {
        this.form.get('itemArticleDescription')?.enable();
        this.form.get('itemArticleUnitPrice')?.enable();
      }
    });
  }

  //#region Item Articles Private Methods
  private _acceptItemArticle(): void {
    if (this.form.valid) {
      const updatedQuoteItemArticle: QuoteItemArticle = this._mapFormToArticle();      
      this.accept.emit(updatedQuoteItemArticle);
    }
  }

  private _cancelItemArticle(): void {
    this.cancel.emit();
  } 
  //#endregion

  //#region Private Methods
  private _updateForm(quoteItemArticle: QuoteItemArticle) {
    this.form.patchValue({
      quoteId: quoteItemArticle.quoteId,
      itemId: quoteItemArticle.itemId,
      itemArticleId: quoteItemArticle.itemArticleId,
      itemArticleAssembly: quoteItemArticle.itemArticleAssembly,
      itemArticleDescription: quoteItemArticle.itemArticleDescription,
      itemArticleQuantity: quoteItemArticle.itemArticleQuantity,
      itemArticleUnitPrice: quoteItemArticle.itemArticleUnitPrice,
      itemArticleTotalPrice: quoteItemArticle.itemArticleTotalPrice
    });
  }
    
  private _createForm() {
    this.form = this.fb.group({
      quoteId: [],
      itemId: [],
      itemArticleId: [],
      itemArticleAssembly: [],
      itemArticleDescription: [null, Validators.required],
      itemArticleQuantity: [null, [Validators.required, Validators.min(0)]],
      itemArticleUnitPrice: [null, [Validators.required, Validators.min(0)]],
      itemArticleTotalPrice: [{ value: null, disabled: true }]
    });

    this.form.get('itemArticleQuantity')?.valueChanges.subscribe(() => this._recalculatePrices());
    this.form.get('itemArticleUnitPrice')?.valueChanges.subscribe(() => this._recalculatePrices());
  }

  private _recalculatePrices(): void {
    const quantity = this.form.get('itemArticleQuantity')?.value || 0;
    const unitPrice = this.form.get('itemArticleUnitPrice')?.value || 0;
    const totalPrice = quantity * unitPrice;
    this.form.get('itemArticleTotalPrice')?.setValue(totalPrice, { emitEvent: false });
  }

  //#endregion

  //#region Mapping Methods
  private _mapFormToArticle(): QuoteItemArticle { 
    const formData = this.form.getRawValue() as QuoteItemArticle;
    const article: QuoteItemArticle = new QuoteItemArticle();
    article.quoteId = formData.quoteId;
    article.itemId = formData.itemId;
    article.itemArticleId = formData.itemArticleId;
    article.itemArticleAssembly = formData.itemArticleAssembly;
    article.itemArticleDescription = formData.itemArticleDescription;
    article.itemArticleQuantity = formData.itemArticleQuantity;
    article.itemArticleUnitPrice = formData.itemArticleUnitPrice;
    return article;
  }
  //#endregion

  //#region Security Actions
  private _loadSecurityActions(): void {
    const actions: Action[] = [
        new Action('BUTTON.accept', EnumActionsType.actionAccept, 'check_small', false),
        new Action('BUTTON.cancel', EnumActionsType.actionCancel, 'cancel', false)
      ];
    this._actionService.setActions(actions);
  }
  //#endregion
}
