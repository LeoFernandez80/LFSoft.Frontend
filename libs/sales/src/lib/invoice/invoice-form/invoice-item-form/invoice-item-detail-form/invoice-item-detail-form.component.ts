import { Component, EventEmitter, Input, Output } from '@angular/core';
import { InvoiceItemDetail } from '../../../models/invoice-item-detail.model';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormGroup, FormBuilder, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { RouterOutlet } from '@angular/router';
import { HttpErrorResponse } from '@angular/common/http';
import { ArticleService } from '@lib/articles';
import { GenericFormComponent, TranslatePipe, FormValidationsDirective, GenericActionsComponent, ActionService, MessagesService, EnumActionsType, EnumMessageType, Action } from '@lib/shared';
import { EnumActions } from 'libs/common/src/lib/enums/actions.enum';

@Component({
  selector: 'lfsoft-sales-invoice-item-detail-form',
  templateUrl: './invoice-item-detail-form.component.html',
  styleUrl: './invoice-item-detail-form.component.scss',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterOutlet, GenericFormComponent, MatButtonModule, TranslatePipe, FormValidationsDirective, GenericActionsComponent],
  providers: [ActionService]
})
export class InvoiceItemDetailFormComponent {
  private _itemDetail: InvoiceItemDetail= new InvoiceItemDetail();
  @Input() set invoiceItemDetail(value: InvoiceItemDetail) {
    if (!value) return;
    this._itemDetail = value;
    this._updateForm(value);
  }
  get invoiceItemDetail(): InvoiceItemDetail {
    return this._itemDetail;
  }

  @Output() accept = new EventEmitter<InvoiceItemDetail>();
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
          this._acceptItemDetail();
          break;
        case EnumActionsType.actionCancel:
          this._cancelItemDetail();
          break;
      }
    } catch (error) {
      this._messagesService.addMessage(error as HttpErrorResponse, EnumMessageType.Error);
    }
  }

  onSearchArticle(): void {
    const code = this.form.get('detailCode')?.value;
    if (!code) return;

    this._articleService.getArticleByAssy(code).subscribe({
      next: (article) => {
        this.form.patchValue({
          detailDescription: article.description,
          detailUnitPrice: article.listprice
        });
        this.form.get('detailDescription')?.disable();
        this.form.get('detailUnitPrice')?.disable();
        
        this._recalculatePrices();
      },
      error: (error: HttpErrorResponse) => {
        this.form.get('detailDescription')?.enable();
        this.form.get('detailUnitPrice')?.enable();
      }
    });
  }

  //#region Item Details Private Methods
  private _acceptItemDetail(): void {
    if (this.form.valid) {
      const updatedInvoiceItemDetail: InvoiceItemDetail = this._mapFormToDetail();      
      this.accept.emit(updatedInvoiceItemDetail);
    }
  }

  private _cancelItemDetail(): void {
    this.cancel.emit();
  } 
  //#endregion

  //#region Private Methods
  private _updateForm(invoiceItemDetail: InvoiceItemDetail) {
    this.form.patchValue({
      invoiceId: invoiceItemDetail.invoiceId,
      itemId: invoiceItemDetail.itemId,
      detailId: invoiceItemDetail.detailId,
      detailCode: invoiceItemDetail.detailCode,
      detailDescription: invoiceItemDetail.detailDescription,
      detailQuantity: invoiceItemDetail.detailQuantity,
      detailUnitPrice: invoiceItemDetail.detailUnitPrice,
      detailTotalPrice: invoiceItemDetail.detailTotalPrice
    });
  }
    
  private _createForm() {
    this.form = this.fb.group({
      invoiceId: [],
      itemId: [],
      detailId: [],
      detailCode: [],
      detailDescription: [null, Validators.required],
      detailQuantity: [null, [Validators.required, Validators.min(0)]],
      detailUnitPrice: [null, [Validators.required, Validators.min(0)]],
      detailTotalPrice: [{ value: null, disabled: true }]
    });

    this.form.get('detailQuantity')?.valueChanges.subscribe(() => this._recalculatePrices());
    this.form.get('detailUnitPrice')?.valueChanges.subscribe(() => this._recalculatePrices());
  }

  private _recalculatePrices(): void {
    const quantity = this.form.get('detailQuantity')?.value || 0;
    const unitPrice = this.form.get('detailUnitPrice')?.value || 0;
    const totalPrice = quantity * unitPrice;
    this.form.get('detailTotalPrice')?.setValue(totalPrice, { emitEvent: false });
  }

  //#endregion

  //#region Mapping Methods
  private _mapFormToDetail(): InvoiceItemDetail { 
    const formData = this.form.getRawValue() as InvoiceItemDetail;
    const detail: InvoiceItemDetail = new InvoiceItemDetail () 
    detail.invoiceId = formData.invoiceId;
    detail.itemId = formData.itemId;
    detail.detailId = formData.detailId;
    detail.detailCode = formData.detailCode;
    detail.detailDescription = formData.detailDescription;
    detail.detailQuantity = formData.detailQuantity;
    detail.detailUnitPrice = formData.detailUnitPrice;
    return detail;  
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
