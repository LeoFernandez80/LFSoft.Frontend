import { Component, EventEmitter, Input, OnInit, Output, OnDestroy, DestroyRef, inject, HostListener } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Invoice, InvoiceItem } from '../models/invoice.model';
import { ActivatedRoute, Router, RouterOutlet } from '@angular/router';
import { Observable, of } from 'rxjs';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { MatButtonModule } from '@angular/material/button';
import { EnumActionsType } from '../../../generic/generic-actions/enums/actions-type.enums';
import { GenericActionsComponent } from '../../../generic/generic-actions/generic-actions.component';
import { ActionService } from '../../../generic/generic-actions/services/actions.service';
import { GenericFormComponent } from '../../../generic/generic-form/generic-form.component';
import { Action } from '../../../generic/generic-actions/models/actions.model';
import { InvoiceService } from '../services/invoice.service';
import { MessagesService } from '../../../generic/generic-message/services/message.service';
import { EnumMessageType } from '../../../generic/generic-message/enums/message-type.model';
import { TranslatePipe } from '../../../generic/generic-translate/translate.pipe';
import { SkeletonDirective } from '../../../generic/generic-skeleton/skeleton.directive';
import { FormValidationsDirective } from '../../../generic/generic-form-validations/form-validations.directive';
import { HttpErrorResponse } from '@angular/common/http';
import { ModalService } from '../../../generic/generic-modal/services/modal.service';
import { CONFIRM_CANCEL, CONFIRM_DELETE } from '../../../generic/generic-modal/models/modal-messages';
import { UrlSecurityService } from '../../../core/security/services/url-security.service';
import { InvoiceItemGridComponent } from './invoice-item-grid/invoice-item-grid.component';
import { InvoiceItemFormComponent } from './invoice-item-form/invoice-item-form.component';
import { GridService } from '../../../generic/generic-grid/services/grid.service';
import { InvoiceItemGrid } from '../models/invoice-item-grid.model';
import { map } from 'rxjs/operators';
import { MatIconModule } from '@angular/material/icon';
import { InvoicePdfService } from '../services/invoice-pdf.service';

@Component({
  selector: 'app-invoice-form',
  templateUrl: './invoice-form.component.html',
  styleUrls: ['./invoice-form.component.scss'],
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterOutlet,MatIconModule, GenericFormComponent, 
    GenericActionsComponent, FormValidationsDirective, TranslatePipe, 
    SkeletonDirective, MatButtonModule, InvoiceItemGridComponent, InvoiceItemFormComponent],
  providers: [ActionService, GridService]
})
export class InvoiceFormComponent implements OnInit, OnDestroy {
  @Input() invoiceId: number = 0;
  @Output() save = new EventEmitter<Invoice>();
  @Output() cancel = new EventEmitter<void>();

  showForm = false;
  isLoading: boolean = true;
  invoiceForm: FormGroup = new FormGroup({});
  invoice: Invoice = new Invoice();
  invoiceItemSelected: InvoiceItem = new InvoiceItem();

  private _itemsTMP: InvoiceItem[] = [];
  private readonly _destroyRef = inject(DestroyRef);
  private _operation: any;
  private _hasItemsDirty: boolean = false;

  private get itemsGrid(): InvoiceItemGrid[] {
    return this._mapToInvoiceItemGrid(this._itemsTMP);
  }

  constructor(
    private fb: FormBuilder, 
    private _invoiceService: InvoiceService, 
    private _route: ActivatedRoute, 
    private _actionService: ActionService,  
    private _messagesService: MessagesService, 
    private _modalService: ModalService, 
    private _urlSecurityService: UrlSecurityService,
    private _gridService: GridService<InvoiceItemGrid>,
    private _invoicePdfService: InvoicePdfService
  ) {    
    this._createForm();
  }
  
  ngOnInit(): void {  
    try {     
      this._loadSecurityActions();
      this._loadData();   
    } catch (error) {
      this._messagesService.addMessage('Error loading invoice data.', EnumMessageType.Error);
    }
  }

  ngOnDestroy(): void {  }

  @HostListener('window:keydown', ['$event'])
  handleKeyboardEvent(event: KeyboardEvent): void {
    if (event.key === 'F4') {
      event.preventDefault();
      this.onAddInvoiceItem();
    }
  }

  isReadyToSave(): boolean {
    return this.invoiceForm.valid && (this.invoiceForm.dirty || this._hasItemsDirty);
  }

  onAction(action: EnumActionsType): void {
    try {
      switch (action) {
        case EnumActionsType.actionSave:
          this._saveInvoice();
          break;
        case EnumActionsType.actionCancel:
          this._cancelInvoice();          
          break;
      }
    } catch (error) {
      this._messagesService.addMessage(error as HttpErrorResponse, EnumMessageType.Error);
    }
  }  
   
  //#region Items Public Methods
  onExportPDF(): void {
    this._exportPDF();
  }
  private _exportPDF() {
  
    const invoiceToExport = this._mapFormToInvoice();
    this._invoicePdfService.generateInvoicePDF(invoiceToExport);
  }

  onAddInvoiceItem(): void {
    this._addInvoiceItem();
  }

  onDeleteInvoiceItem(invoiceItemGrid: InvoiceItemGrid): void {
    this._modalService.showModal(CONFIRM_DELETE)
      .pipe(takeUntilDestroyed(this._destroyRef))
      .subscribe(action => {          
        if (action === EnumActionsType.actionAccept) {
          this._itemsTMP = this._itemsTMP.filter(x => x.itemId !== invoiceItemGrid.itemId);
          this._itemsTMP.forEach((item, index) => {
            item.itemId = index + 1;
            item.details.forEach((detail: any) => {
              detail.itemId = item.itemId;             
            });
          });
          this._hasItemsDirty = true;
          this._recalculatePrices();

          this._gridService.setData(this.itemsGrid);
          this._enabledActions();
        }
      });

  }

  onEditInvoiceItem(invoiceItemGrid: InvoiceItemGrid): void {
    const invoiceItem: InvoiceItem | undefined = this._itemsTMP.find(x => x.itemId === invoiceItemGrid.itemId);
    if (!invoiceItem) {
      this._messagesService.addMessage('Item not found.', EnumMessageType.Error);
      return;
    }
    this.invoiceItemSelected = invoiceItem;
    this.showForm = true; 
  }

  onAcceptInvoiceItem(invoiceItem: InvoiceItem): void {   
    this.showForm = false;
    const index = this._itemsTMP.findIndex(x => x.itemId === invoiceItem.itemId);
    
    if (index !== -1) {
      this._itemsTMP[index] = { ...invoiceItem, itemUnitPrice: invoiceItem.itemUnitPrice, itemTotalPrice: invoiceItem.itemTotalPrice };
    } else {
      this._itemsTMP.push({ ...invoiceItem, itemUnitPrice: invoiceItem.itemUnitPrice, itemTotalPrice: invoiceItem.itemTotalPrice });
    }
    
    this._hasItemsDirty = true;
    this._recalculatePrices();
    this._gridService.setData(this.itemsGrid);
    this._enabledActions();
  }

  onCancelInvoiceItem(): void {
    this.showForm = false;    
  }

  //#endregion
  
  //#region Mapping Methods
  private _mapFormToInvoice(): Invoice {
    const formData = this.invoiceForm.getRawValue() as Invoice;
    const invoice: Invoice = new Invoice();
    invoice.personName = formData.personName;
    invoice.personId = formData.personId;
    invoice.personDocumentType = formData.personDocumentType;
    invoice.personDocumentNumber = formData.personDocumentNumber;
    invoice.invoiceDescription = formData.invoiceDescription;
    invoice.invoiceCreationDate = formData.invoiceCreationDate;
    invoice.invoiceSentDate = formData.invoiceSentDate;
    invoice.creationUserId = formData.creationUserId;
    invoice.invoiceId = this.invoice.invoiceId;
    invoice.items = this._itemsTMP;    
    return invoice;
  }

  private _mapToInvoiceItemGrid(invoiceItems: InvoiceItem[]): InvoiceItemGrid[] {    
    return invoiceItems.map(item => ({
      selected: false,
      invoiceId: item.invoiceId,
      itemId: item.itemId,
      itemDescription: item.itemDescription,
      itemQuantity: item.itemQuantity,
      itemUnitPrice: item.itemUnitPrice,
      itemTotalPrice: item.itemQuantity * item.itemUnitPrice
    }));
  }
  //#endregion

  //#region Invoice Private Methods
  private _editInvoice(invoiceId: number): Observable<Invoice> {
    return this._invoiceService.getInvoice(invoiceId);
  }
  
  private _cancelInvoice(): void {    
    if (!this.invoiceForm.dirty) {
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

  private _saveInvoice(): void {
    try {
      if (!this.invoiceForm.dirty && !this._hasItemsDirty) {
        return;
      }

      const formData = this._mapFormToInvoice();
      const updatedInvoice: Invoice = {
        ...this.invoice,
        ...formData
      };
    
      const saveOperation = !updatedInvoice.invoiceId
        ? this._invoiceService.addInvoice(updatedInvoice)
        : this._invoiceService.updateInvoice(updatedInvoice);
      
      saveOperation
        .pipe(takeUntilDestroyed(this._destroyRef))
        .subscribe({
          next: () => {
            this._hasItemsDirty = false;
            this.invoiceForm.markAsPristine();
            this._enabledActions();
            this.save.emit(updatedInvoice);
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
  private _addInvoiceItem(): void {
    const maxId = this._itemsTMP.length > 0 
      ? Math.max(...this._itemsTMP.map(x => x.itemId)) 
      : 0;
    
    this.invoiceItemSelected = new InvoiceItem();
    this.invoiceItemSelected.itemId = maxId + 1;
    this.invoiceItemSelected.invoiceId = this.invoice.invoiceId;
    this.showForm = true;
  }
  //#endregion

  //#region Private Methods
  private _createForm() {
    this.invoiceForm = this.fb.group({
      personName: [''],
      personId: [0],
      personDocumentType: [''],
      personDocumentNumber: [''],
      invoiceDescription: ['', [Validators.required, Validators.minLength(3)]],
      invoiceCreationDate: [''],
      invoiceSentDate: [''],
      creationUserId: [0],
      invoiceId: [0],
      invoiceTotalPrice: [{ value: 0, disabled: true }]
    });
    this.invoiceForm.statusChanges
      .pipe(takeUntilDestroyed(this._destroyRef))
      .subscribe(() => {        
        this._enabledActions();
      });
  }

  private _updateForm(invoice: Invoice): void {
    this.invoice = invoice;    
    this.invoiceForm.patchValue(this.invoice, { emitEvent: false });
    this._itemsTMP = this.invoice.items;
    this._recalculatePrices();

    this._gridService.setData(this.itemsGrid);
  }

  private _loadData() {
    this.isLoading = false;
    this._loadParams().subscribe(() => {                  
      switch (this._operation) {
        case 'open':          
          this._editInvoice(this.invoiceId).subscribe(invoice => {
            this._updateForm(invoice);
            this._enabledActions();
          });
          break;
        default: 
          this._editInvoice(this.invoiceId).subscribe(invoice => {                   
            this._updateForm(invoice);
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
            console.warn('Security: Invalid invoice ID detected:', idParam);
            this._messagesService.addMessage('ID de factura inválido', EnumMessageType.Error);
            throw new Error('Invalid invoice ID');
          }
          
          this.invoiceId = Number(idParam);          
          return;
        })
      );
    } else {
      return of(void 0);
    }
  }

  private _recalculatePrices(): void {
    const totalPrice = this._itemsTMP.reduce((sum, item) => sum + item.itemQuantity * item.itemUnitPrice, 0);
    this.invoiceForm.get('invoiceTotalPrice')?.setValue(totalPrice, { emitEvent: false });    
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
