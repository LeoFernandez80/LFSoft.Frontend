import { Component, DestroyRef, EventEmitter, inject, Input, Output } from '@angular/core';
import { QuoteItem, QuoteItemArticle } from '../../models/quote.model';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormGroup, FormBuilder } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { RouterOutlet } from '@angular/router';
import { HttpErrorResponse } from '@angular/common/http';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { MatIconModule } from '@angular/material/icon';
import { GenericFormComponent, GenericActionsComponent, TranslatePipe, FormValidationsDirective, GridService, ActionService, MessagesService, ModalService, EnumActionsType, EnumMessageType, CONFIRM_DELETE, Action } from '@lib/shared';
import { QuoteItemArticleGrid } from '../../models/quote-item-article-grid.model';
import { QuoteItemArticleFormComponent } from './quote-item-article-form/quote-item-article-form.component';
import { QuoteItemArticleGridComponent } from './quote-item-article-grid/quote-item-article-grid.component';
import { EnumActions } from 'libs/common/src/lib/enums/actions.enum';

@Component({
  selector: 'lfsoft-sales-quote-item-form',
  templateUrl: './quote-item-form.component.html',
  styleUrl: './quote-item-form.component.scss',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterOutlet, MatIconModule, GenericFormComponent, 
    GenericActionsComponent, MatButtonModule, TranslatePipe, FormValidationsDirective, 
    QuoteItemArticleGridComponent, QuoteItemArticleFormComponent],
  providers: [GridService, ActionService]
})
export class QuoteItemFormComponent {
  private _quoteItem: QuoteItem = new QuoteItem();
  private _hasArticlesDirty: boolean = false;
  private readonly _destroyRef = inject(DestroyRef);

  @Input() set quoteItem(value: QuoteItem | null) {
    if (!value) return;
    
    this._quoteItem = value;
    this.updateForm(value);
  }

  get quoteItem(): QuoteItem {
    return this._quoteItem;
  }

  @Output() accept = new EventEmitter<QuoteItem>();
  @Output() cancel = new EventEmitter<void>();
  
  itemArticleSelected: QuoteItemArticle = new QuoteItemArticle();
  showForm: boolean = false;
  form: FormGroup = new FormGroup({});  
  
  private _articlesTMP: QuoteItemArticle[] = [];

  private get articlesGrid(): QuoteItemArticleGrid[] {
    return this._mapToItemArticleGrid(this._articlesTMP);
  }

  constructor(
    private fb: FormBuilder, 
    private _gridService: GridService<QuoteItemArticle>,
    private _messagesService: MessagesService, 
    private _actionService: ActionService, 
    private _modalService: ModalService
  ) {    
    this.createForm();
  }

  ngOnInit(): void {
    this._loadSecurityActions();
  }

  isReadyToAccept(): boolean {
    return this.form.valid && (this.form.dirty || this._hasArticlesDirty);
  }

  onAction(action: EnumActionsType | EnumActions): void {
    try {
      switch (action) {
        case EnumActionsType.actionAccept:
          this._acceptItem();
          break;
        case EnumActionsType.actionCancel:
          this._cancelItem();
          break;
      }
    } catch (error) {
      this._messagesService.addMessage(error as HttpErrorResponse, EnumMessageType.Error);
    }
  }

  onAddItemArticle(): void {
    this._addItemArticle();
  }

  //#region Items Private Methods
  private _acceptItem(): void {
    if (!this.form.valid && !this._hasArticlesDirty) {
      return;
    } 
    const updatedQuoteItem: QuoteItem = this._mapFormToQuoteItem();
    this._hasArticlesDirty = false;
    this.form.markAsPristine();
    this.accept.emit(updatedQuoteItem);
  }

  private _cancelItem(): void {
    this.showForm = false;
    this.cancel.emit();
  } 
  //#endregion

  //#region Mapping Methods
  private _mapToItemArticleGrid(articles: QuoteItemArticle[]): QuoteItemArticleGrid[] {
    return articles.map(article => ({
      quoteId: article.quoteId,
      itemId: article.itemId,
      itemArticleId: article.itemArticleId,
      itemArticleQuantity: article.itemArticleQuantity,
      itemArticleAssembly: article.itemArticleAssembly,
      itemArticleDescription: article.itemArticleDescription,
      itemArticleUnitPrice: article.itemArticleUnitPrice,
      itemArticleTotalPrice: article.itemArticleTotalPrice
    }));
  }

  private _mapFormToQuoteItem(): QuoteItem {
    const formData = this.form.getRawValue() as QuoteItem; 
     
    const item = new QuoteItem();
    item.quoteId = formData.quoteId;
    item.itemId = formData.itemId;
    item.itemDescription = formData.itemDescription;
    item.itemQuantity = formData.itemQuantity; 
    item.articles = this._articlesTMP;   
    return item;
  }
  //#endregion

  //#region Items Articles Public Methods
  onEditItemArticle(itemArticle: QuoteItemArticleGrid) {
    const article: QuoteItemArticle | undefined = this._articlesTMP.find(x => x.itemArticleId === itemArticle.itemArticleId);
    if (!article) {
      this._messagesService.addMessage('ERROR.itemNotFound', EnumMessageType.Error);
      return;
    }
    this.itemArticleSelected = article;
    this.showForm = true;
  }

  onDeleteItemArticle(itemArticleGrid: QuoteItemArticleGrid) {
    this._modalService.showModal(CONFIRM_DELETE)
      .pipe(takeUntilDestroyed(this._destroyRef))
      .subscribe(action => {          
        if (action === EnumActionsType.actionAccept) {
          this._articlesTMP = this._articlesTMP.filter(x => x.itemArticleId !== itemArticleGrid.itemArticleId);
          this._articlesTMP.forEach((item, index) => {
            item.itemArticleId = index + 1;
          });
          this._recalculatePrices();
          this._hasArticlesDirty = true;
          this._gridService.setData(this.articlesGrid);
          this._enabledActions();          
        }
      });   
  }

  onAcceptItemArticle(itemArticle: QuoteItemArticle) {    
    this.showForm = false;
    
    const index = this._articlesTMP.findIndex(x => x.itemArticleId === itemArticle.itemArticleId);
    
    if (index !== -1) {
      this._articlesTMP[index] = itemArticle;
    } else {
      this._articlesTMP.push(itemArticle);
    }
    
    this._hasArticlesDirty = true;
    this._recalculatePrices();

    this._gridService.setData(this.articlesGrid);
    this._enabledActions();
  }

  onCancelItemArticle() {
    this.showForm = false;
  }

  //#endregion

  //#region Items Articles Private Methods
  private _addItemArticle(): void {
    const maxId = this._articlesTMP.length > 0 
      ? Math.max(...this._articlesTMP.map(x => x.itemArticleId)) 
      : 0;
    
    this.itemArticleSelected = new QuoteItemArticle();
    this.itemArticleSelected.itemArticleId = maxId + 1;
    this.itemArticleSelected.itemId = this.quoteItem.itemId;
    this.itemArticleSelected.quoteId = this.quoteItem.quoteId;
    this.showForm = true;
  }
  //#endregion
  
  //#region Private Methods
  private createForm() {
    this.form = this.fb.group({
      quoteId: [0],
      itemId: [null],
      itemDescription: [''],
      itemQuantity: [0],
      unitPrice: [{ value: 0, disabled: true }],
      totalPrice: [{ value: 0, disabled: true },]
    });

    this.form.get('itemQuantity')?.valueChanges.subscribe(() => this._recalculatePrices());
  }

  private _recalculatePrices(): void {
    const quantity = this.form.get('itemQuantity')?.value || 0;
    const unitPrice = this._articlesTMP.reduce((sum, article) => 
      sum + article.itemArticleQuantity * article.itemArticleUnitPrice, 0);
    const totalPrice = quantity * unitPrice;
    this.form.get('unitPrice')?.setValue(unitPrice, { emitEvent: false });
    this.form.get('totalPrice')?.setValue(totalPrice, { emitEvent: false });    
  }

  private updateForm(quoteItem: QuoteItem | undefined) {
    if (!quoteItem) return;
    this.form.patchValue({
      quoteId: quoteItem.quoteId,
      itemId: quoteItem.itemId,
      itemDescription: quoteItem.itemDescription,
      itemQuantity: quoteItem.itemQuantity,
      unitPrice: quoteItem.unitPrice,
      totalPrice: quoteItem.totalPrice
    });
        
    this._articlesTMP = quoteItem.articles;
    this._gridService.setData(this.articlesGrid);
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

  private _enabledActions() {    
    if (this.isReadyToAccept()) {
      this._actionService.enable(EnumActionsType.actionAccept);
    } else {
      this._actionService.disable(EnumActionsType.actionAccept);
    }
  }
  //#endregion
}
