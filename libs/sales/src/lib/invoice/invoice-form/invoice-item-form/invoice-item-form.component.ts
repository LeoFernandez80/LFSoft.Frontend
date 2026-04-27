import { Component, DestroyRef, EventEmitter, inject, Input, Output } from '@angular/core';
import { InvoiceItem, InvoiceItemDetail } from '../../models/invoice-item.model';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormGroup, FormBuilder } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { RouterOutlet } from '@angular/router';
import { HttpErrorResponse } from '@angular/common/http';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { MatIconModule } from '@angular/material/icon';
import { GenericFormComponent, GenericActionsComponent, TranslatePipe, FormValidationsDirective, GridService, ActionService, MessagesService, ModalService, EnumActionsType, EnumMessageType, CONFIRM_DELETE, Action } from '@lib/shared';
import { InvoiceItemDetailGrid } from '../../models/invoice-item-detail-grid.model';
import { InvoiceItemDetailFormComponent } from './invoice-item-detail-form/invoice-item-detail-form.component';
import { InvoiceItemDetailGridComponent } from './invoice-item-detail-grid/invoice-item-detail-grid.component';
import { EnumActions } from 'libs/common/src/lib/enums/actions.enum';

@Component({
  selector: 'lfsoft-sales-invoice-item-form',
  templateUrl: './invoice-item-form.component.html',
  styleUrl: './invoice-item-form.component.scss',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterOutlet, MatIconModule, GenericFormComponent, 
    GenericActionsComponent, MatButtonModule, TranslatePipe, FormValidationsDirective, 
    InvoiceItemDetailGridComponent, InvoiceItemDetailFormComponent],
  providers: [GridService, ActionService]
})
export class InvoiceItemFormComponent {
  private _invoiceItem: InvoiceItem = new InvoiceItem();
  private _hasDetailsDirty: boolean = false;
  private readonly _destroyRef = inject(DestroyRef);

  @Input() set invoiceItem(value: InvoiceItem | null) {
    if (!value) return;
    
    this._invoiceItem = value;
    this.updateForm(value);
  }

  get invoiceItem(): InvoiceItem {
    return this._invoiceItem;
  }

  @Output() accept = new EventEmitter<InvoiceItem>();
  @Output() cancel = new EventEmitter<void>();
  
  itemDetailSelected: InvoiceItemDetail = new InvoiceItemDetail();
  showForm: boolean = false;
  form: FormGroup = new FormGroup({});  
  
  private _detailsTMP: InvoiceItemDetail[] = [];

  private get detailsGrid(): InvoiceItemDetailGrid[] {
    return this._mapToItemDetailGrid(this._detailsTMP);
  }

  constructor(
    private fb: FormBuilder, 
    private _gridService: GridService<InvoiceItemDetail>,
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
    return this.form.valid && (this.form.dirty || this._hasDetailsDirty);
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

  onAddItemDetail(): void {
    this._addItemDetail();
  }

  //#region Items Private Methods
  private _acceptItem(): void {
    if (!this.form.valid && !this._hasDetailsDirty) {
      return;
    } 
    const updatedInvoiceItem: InvoiceItem = this._mapFormToInvoiceItem();
    this._hasDetailsDirty = false;
    this.form.markAsPristine();
    this.accept.emit(updatedInvoiceItem);
  }

  private _cancelItem(): void {
    this.showForm = false;
    this.cancel.emit();
  } 
  //#endregion

  //#region Mapping Methods
  private _mapToItemDetailGrid(details: InvoiceItemDetail[]): InvoiceItemDetailGrid[] {
    return details.map(detail => ({
      selected: false,
      invoiceId: detail.invoiceId,
      itemId: detail.itemId,
      detailId: detail.detailId,
      detailDescription: detail.detailDescription,
      detailQuantity: detail.detailQuantity,
      detailUnitPrice: detail.detailUnitPrice,
      detailTotalPrice: detail.detailTotalPrice
    }));
  }

  private _mapFormToInvoiceItem(): InvoiceItem {
    const formData = this.form.getRawValue() as InvoiceItem; 
     
    const item = new InvoiceItem();
    item.invoiceId = formData.invoiceId;
    item.itemId = formData.itemId;
    item.itemDescription = formData.itemDescription;
    item.itemQuantity = formData.itemQuantity; 
    item.details = this._detailsTMP;   
    return item;
  }
  //#endregion

  //#region Items Details Public Methods
  onEditItemDetail(itemDetail: InvoiceItemDetailGrid) {
    const detail: InvoiceItemDetail | undefined = this._detailsTMP.find(x => x.detailId === itemDetail.detailId);
    if (!detail) {
      this._messagesService.addMessage('ERROR.itemNotFound', EnumMessageType.Error);
      return;
    }
    this.itemDetailSelected = detail;
    this.showForm = true;
  }

  onDeleteItemDetail(itemDetailGrid: InvoiceItemDetailGrid) {
    console.log("delete", itemDetailGrid);
    
    this._modalService.showModal(CONFIRM_DELETE)
      .pipe(takeUntilDestroyed(this._destroyRef))
      .subscribe(action => {          
        if (action === EnumActionsType.actionAccept) {
          this._detailsTMP = this._detailsTMP.filter(x => x.detailId !== itemDetailGrid.detailId);
          this._detailsTMP.forEach((item, index) => {
            item.detailId = index + 1;
          });
          this._recalculatePrices();
          this._hasDetailsDirty = true;
          this._gridService.setData(this.detailsGrid);
          this._enabledActions();          
        }
      });   
  }

  onAcceptItemDetail(itemDetail: InvoiceItemDetail) {    
    this.showForm = false;
    
    const index = this._detailsTMP.findIndex(x => x.detailId === itemDetail.detailId);
    
    if (index !== -1) {
      this._detailsTMP[index] = { ...itemDetail, detailTotalPrice: itemDetail.detailTotalPrice };
    } else {
      this._detailsTMP.push({ ...itemDetail, detailTotalPrice: itemDetail.detailTotalPrice });
    }
    
    this._hasDetailsDirty = true;
    this._recalculatePrices();

    this._gridService.setData(this.detailsGrid);
    this._enabledActions();
  }

  onCancelItemDetail() {
    this.showForm = false;
  }

  //#endregion

  //#region Items Details Private Methods
  private _addItemDetail(): void {
    const maxId = this._detailsTMP.length > 0 
      ? Math.max(...this._detailsTMP.map(x => x.detailId)) 
      : 0;
    
    this.itemDetailSelected = new InvoiceItemDetail();
    this.itemDetailSelected.detailId = maxId + 1;
    this.itemDetailSelected.itemId = this.invoiceItem.itemId;
    this.itemDetailSelected.invoiceId = this.invoiceItem.invoiceId;
    this.showForm = true;
  }
  //#endregion
  
  //#region Private Methods
  private createForm() {
    this.form = this.fb.group({
      invoiceId: [0],
      itemId: [null],
      itemDescription: [''],
      itemQuantity: [0],
      itemUnitPrice: [{ value: 0, disabled: true }],
      itemTotalPrice: [{ value: 0, disabled: true },]
    });

    this.form.get('itemQuantity')?.valueChanges.subscribe(() => this._recalculatePrices());
  }

  private _recalculatePrices(): void {
    const quantity = this.form.get('itemQuantity')?.value || 0;
    const unitPrice = this._detailsTMP.reduce((sum, detail) => sum + detail.detailQuantity * detail.detailUnitPrice, 0);
    const totalPrice = quantity * unitPrice;
    this.form.get('itemUnitPrice')?.setValue(unitPrice, { emitEvent: false });
    this.form.get('itemTotalPrice')?.setValue(totalPrice, { emitEvent: false });    
  }

  private updateForm(invoiceItem: InvoiceItem | undefined) {
    if (!invoiceItem) return;
    this.form.patchValue({
      invoiceId: invoiceItem.invoiceId,
      itemId: invoiceItem.itemId,
      itemDescription: invoiceItem.itemDescription,
      itemQuantity: invoiceItem.itemQuantity,
      itemUnitPrice: invoiceItem.itemUnitPrice,
      itemTotalPrice: invoiceItem.itemTotalPrice
    });
        
    this._detailsTMP = invoiceItem.details;
    this._gridService.setData(this.detailsGrid);
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
