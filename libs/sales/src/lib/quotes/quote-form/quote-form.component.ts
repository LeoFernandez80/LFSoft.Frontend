import { Component, EventEmitter, Input, OnInit, Output, OnDestroy, DestroyRef, inject, HostListener } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Quote, QuoteItem } from '../models/quote.model';
import { ActivatedRoute, Router, RouterOutlet } from '@angular/router';
import { map, Observable, of } from 'rxjs';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { MatButtonModule } from '@angular/material/button';
import { HttpErrorResponse } from '@angular/common/http';
import { MatIconModule } from '@angular/material/icon';
import { UrlSecurityService } from '@lib/security';
import { GenericFormComponent, GenericActionsComponent, FormValidationsDirective, TranslatePipe, SkeletonDirective, ActionService, GridService, MessagesService, ModalService, EnumMessageType, EnumActionsType, CONFIRM_DELETE, CONFIRM_CANCEL, Action } from '@lib/shared';
import { QuoteItemGrid } from '../models/quote-item-grid.model';
import { QuoteService } from '../services/quote.service';
import { QuoteItemFormComponent } from './quote-item-form/quote-item-form.component';
import { QuoteItemGridComponent } from './quote-item-grid/quote-item-grid.component';
import { EnumActions } from 'libs/common/src/lib/enums/actions.enum';

@Component({
  selector: 'lfsoft-sales-quote-form',
  templateUrl: './quote-form.component.html',
  styleUrls: ['./quote-form.component.scss'],
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterOutlet,MatIconModule, GenericFormComponent, 
    GenericActionsComponent, FormValidationsDirective, TranslatePipe, 
    SkeletonDirective, MatButtonModule, QuoteItemGridComponent, QuoteItemFormComponent],
  providers: [ActionService, GridService]
})
export class QuoteFormComponent implements OnInit, OnDestroy {
  @Input() quoteId: number = 0;
  @Output() save = new EventEmitter<Quote>();
  @Output() cancel = new EventEmitter<void>();

  showForm = false;
  isLoading: boolean = true;
  quoteForm: FormGroup = new FormGroup({});
  quote: Quote = new Quote();
  quoteItemSelected: QuoteItem = new QuoteItem();

  private _itemsTMP: QuoteItem[] = [];
  private readonly _destroyRef = inject(DestroyRef);
  private _operation: any;
  private _hasItemsDirty: boolean = false;

  private get itemsGrid(): QuoteItemGrid[] {
    return this._mapToQuoteItemGrid(this._itemsTMP);
  }

  constructor(
    private fb: FormBuilder, 
    private _quoteService: QuoteService, 
    private _route: ActivatedRoute, 
    private _actionService: ActionService,  
    private _messagesService: MessagesService, 
    private _modalService: ModalService, 
    private _urlSecurityService: UrlSecurityService,
    private _gridService: GridService<QuoteItemGrid>
  ) {    
    this._createForm();
  }
  
  ngOnInit(): void {  
    try {     
      this._loadSecurityActions();
      this._loadData();   
    } catch (error) {
      this._messagesService.addMessage('Error loading quote data.', EnumMessageType.Error);
    }
  }

  ngOnDestroy(): void {  }

  @HostListener('window:keydown', ['$event'])
  handleKeyboardEvent(event: KeyboardEvent): void {
    if (event.key === 'F4') {
      event.preventDefault();
      this.onAddQuoteItem();
    }
  }

  isReadyToSave(): boolean {
    return this.quoteForm.valid && (this.quoteForm.dirty || this._hasItemsDirty);
  }

  onAction(action: EnumActionsType | EnumActions): void {
    try {
      switch (action) {
        case EnumActionsType.actionSave:
          this._saveQuote();
          break;
        case EnumActionsType.actionCancel:
          this._cancelQuote();          
          break;
      }
    } catch (error) {
      this._messagesService.addMessage(error as HttpErrorResponse, EnumMessageType.Error);
    }
  }  
   
  //#region Items Public Methods
  onAddQuoteItem(): void {
    this._addQuoteItem();
  }

  onDeleteQuoteItem(quoteItemGrid: QuoteItemGrid): void {
    this._modalService.showModal(CONFIRM_DELETE)
      .pipe(takeUntilDestroyed(this._destroyRef))
      .subscribe(action => {          
        if (action === EnumActionsType.actionAccept) {
          this._itemsTMP = this._itemsTMP.filter(x => x.itemId !== quoteItemGrid.itemId);
          this._itemsTMP.forEach((item, index) => {
            item.itemId = index + 1;
            item.articles.forEach((article: any) => {
              article.itemId = item.itemId;             
            });
          });
          this._hasItemsDirty = true;
          this._recalculatePrices();

          this._gridService.setData(this.itemsGrid);
          this._enabledActions();
        }
      });

  }

  onEditQuoteItem(quoteItemGrid: QuoteItemGrid): void {
    const quoteItem: QuoteItem | undefined = this._itemsTMP.find(x => x.itemId === quoteItemGrid.itemId);
    if (!quoteItem) {
      this._messagesService.addMessage('Item not found.', EnumMessageType.Error);
      return;
    }
    this.quoteItemSelected = quoteItem;
    this.showForm = true; 
  }

  onAcceptQuoteItem(quoteItem: QuoteItem): void {   
    this.showForm = false;
    const index = this._itemsTMP.findIndex(x => x.itemId === quoteItem.itemId);
    
    if (index !== -1) {
      this._itemsTMP[index] = { ...quoteItem, unitPrice: quoteItem.unitPrice, totalPrice: quoteItem.totalPrice };
    } else {
      this._itemsTMP.push({ ...quoteItem, unitPrice: quoteItem.unitPrice, totalPrice: quoteItem.totalPrice });
    }
    
    this._hasItemsDirty = true;
    this._recalculatePrices();
    this._gridService.setData(this.itemsGrid);
    this._enabledActions();
  }

  onCancelQuoteItem(): void {
    this.showForm = false;    
  }

  //#endregion
  
  //#region Mapping Methods
  private _mapFormToQuote(): Quote {
    const formData = this.quoteForm.getRawValue() as Quote;
    const quote: Quote = new Quote();
    quote.customerName = formData.customerName;
    quote.customerId = formData.customerId;
    quote.customerDocumentType = formData.customerDocumentType;
    quote.customerDocumentNumber = formData.customerDocumentNumber;
    quote.quoteDescription = formData.quoteDescription;
    quote.quoteCreationDate = formData.quoteCreationDate;
    quote.quoteStateId = formData.quoteStateId;
    quote.creationUserId = formData.creationUserId;
    quote.quoteId = this.quote.quoteId;
    quote.items = this._itemsTMP;    
    return quote;
  }

  private _mapToQuoteItemGrid(quoteItems: QuoteItem[]): QuoteItemGrid[] {    
    return quoteItems.map(item => ({
      quoteId: item.quoteId,
      itemId: item.itemId,
      itemDescription: item.itemDescription,
      itemQuantity: item.itemQuantity,
      unitPrice: item.unitPrice,
      totalPrice: item.totalPrice
    }));
  }
  //#endregion

  //#region Quote Private Methods
  private _editQuote(quoteId: number): Observable<Quote> {
    return this._quoteService.getQuote(quoteId);
  }
  
  private _cancelQuote(): void {    
    if (!this.quoteForm.dirty) {
      this.cancel.emit();    
      return;
    }
      
    this._modalService.showModal(CONFIRM_CANCEL)
      .pipe(takeUntilDestroyed(this._destroyRef))
      .subscribe(action => {          
        if (action === EnumActionsType.actionAccept) {
          this.cancel.emit();         
        }
      });   
  }

  private _saveQuote(): void {
    try {
      if (!this.quoteForm.dirty && !this._hasItemsDirty) {
        return;
      }

      const formData = this._mapFormToQuote();
      const updatedQuote: Quote = {
        ...this.quote,
        ...formData
      };
    
      const saveOperation = !updatedQuote.quoteId
        ? this._quoteService.addQuote(updatedQuote)
        : this._quoteService.updateQuote(updatedQuote);
      
      saveOperation
        .pipe(takeUntilDestroyed(this._destroyRef))
        .subscribe({
          next: () => {
            this._hasItemsDirty = false;
            this.quoteForm.markAsPristine();
            this._enabledActions();
            this.save.emit(updatedQuote);
          },
          error: (error) => {
            this._messagesService.addMessage(error, EnumMessageType.Error);
          }
        });
    } catch (error) {
      throw error;
    }
  }
  //#endregion

  //#region Items Private Methods
  private _addQuoteItem(): void {
    const maxId = this._itemsTMP.length > 0 
      ? Math.max(...this._itemsTMP.map(x => x.itemId)) 
      : 0;
    
    this.quoteItemSelected = new QuoteItem();
    this.quoteItemSelected.itemId = maxId + 1;
    this.quoteItemSelected.quoteId = this.quote.quoteId;
    this.showForm = true;
  }
  //#endregion

  //#region Private Methods
  private _createForm() {
    this.quoteForm = this.fb.group({
      customerName: [''],
      customerId: [0],
      customerDocumentType: [''],
      customerDocumentNumber: [''],
      quoteDescription: ['', [Validators.required, Validators.minLength(3)]],
      quoteCreationDate: [''],
      quoteStateId: [1],
      creationUserId: [0],
      quoteId: [0],
      quoteTotalPrice: [{ value: 0, disabled: true }]
    });
    this.quoteForm.statusChanges
      .pipe(takeUntilDestroyed(this._destroyRef))
      .subscribe(() => {        
        this._enabledActions();
      });
  }

  private _updateForm(quote: Quote): void {
    this.quote = quote;    
    this.quoteForm.patchValue(this.quote, { emitEvent: false });
    this._itemsTMP = this.quote.items;
    this._recalculatePrices();

    this._gridService.setData(this.itemsGrid);
  }

  private _loadData() {
    this.isLoading = false;
    this._loadParams().subscribe(() => {                  
      switch (this._operation) {
        case 'open':          
          this._editQuote(this.quoteId).subscribe(quote => {
            this._updateForm(quote);
            this._enabledActions();
          });
          break;
        default: 
          this._editQuote(this.quoteId).subscribe(quote => {                   
            this._updateForm(quote);
            this._enabledActions();
          });          
      }
    });
  }

  private _loadParams(): Observable<void> {    
    this._operation = this._route.snapshot.data['operation'];
    
    if (this._operation === 'open') {
      return this._route.queryParamMap.pipe(
        takeUntilDestroyed(this._destroyRef),
        map(params => {
          const idParam = params.get('id');
          
          if (!idParam || !this._urlSecurityService.isValidRouteId(idParam)) {
            console.warn('Security: Invalid quote ID detected:', idParam);
            this._messagesService.addMessage('ID de cotización inválido', EnumMessageType.Error);
            throw new Error('Invalid quote ID');
          }
          
          this.quoteId = Number(idParam);          
          return;
        })
      );
    } else {
      return of(void 0);
    }
  }

  private _recalculatePrices(): void {
    const totalPrice = this._itemsTMP.reduce((sum, item) => sum + item.totalPrice, 0);
    this.quoteForm.get('quoteTotalPrice')?.setValue(totalPrice, { emitEvent: false });    
  }
  //#endregion

  //#region Security Actions
  private _loadSecurityActions(): void {
    const actions: Action[] = [
        new Action('BUTTON.save', EnumActionsType.actionSave, 'save', false),
        new Action('BUTTON.cancel', EnumActionsType.actionCancel, 'cancel', false)
      ];
    this._actionService.setActions(actions);
  }
  
  private _enabledActions() {    
    if (this.isReadyToSave()) {
      this._actionService.enable(EnumActionsType.actionSave);
    } else {
      this._actionService.disable(EnumActionsType.actionSave);
    }
  }
  //#endregion
}
