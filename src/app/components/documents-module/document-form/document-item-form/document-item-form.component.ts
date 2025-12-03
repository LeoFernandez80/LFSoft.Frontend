import { Component, DestroyRef, EventEmitter, inject, Input, Output } from '@angular/core';
import { DocumentItem,  DocumentItemDetail } from '../../models/document.model';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormGroup, FormBuilder } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { RouterOutlet } from '@angular/router';
import { GenericFormComponent } from '../../../../generic/generic-form/generic-form.component';
import { GridService } from '../../../../generic/generic-grid/services/grid.service';
import { TranslatePipe } from '../../../../generic/generic-translate/translate.pipe';
import { GenericActionsComponent } from '../../../../generic/generic-actions/generic-actions.component';
import { EnumActionsType } from '../../../../generic/generic-actions/enums/actions-type.enums';
import { HttpErrorResponse } from '@angular/common/http';
import { MessagesService } from '../../../../generic/generic-message/services/message.service';
import { EnumMessageType } from '../../../../generic/generic-message/enums/message-type.model';
import { ActionService } from '../../../../generic/generic-actions/services/actions.service';
import { Action } from '../../../../generic/generic-actions/models/actions.model';
import { ItemDetailGridComponent } from './item-detail-grid.component/item-detail-grid.component';
import { ItemDetailFormComponent } from './item-detail-form.component/item-detail-form.component';
import { FormValidationsDirective } from '../../../../generic/generic-form-validations/form-validations.directive';
import { DocumentItemDetailGrid } from '../../models/document-grid.model';
import { ModalService } from '../../../../generic/generic-modal/services/modal.service';
import { CONFIRM_DELETE } from '../../../../generic/generic-modal/models/modal-messages';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

@Component({
  selector: 'app-document-item-form',
  templateUrl: './document-item-form.component.html',
  styleUrl: './document-item-form.component.scss',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterOutlet, GenericFormComponent, 
    GenericActionsComponent, MatButtonModule, TranslatePipe, FormValidationsDirective, ItemDetailGridComponent, ItemDetailFormComponent],
  providers: [GridService, ActionService]
    
})
export class DocumentItemFormComponent {
 private _documentItem: DocumentItem = new DocumentItem();
  private _hasDetailsDirty: boolean= false;
  private readonly _destroyRef = inject(DestroyRef);

  @Input() set documentItem(value: DocumentItem | null) {
    if (!value) return;
    this._documentItem = value;
    this.updateForm(value);
  }

  get documentItem(): DocumentItem  {
    return this._documentItem;
  }

  @Output() accept = new EventEmitter<DocumentItem>();
  @Output() cancel = new EventEmitter<void>();
  
  itemDetailSelected: DocumentItemDetail = new DocumentItemDetail();
  resize: number = 3;

  showForm: boolean = false;

  form: FormGroup = new FormGroup({});  
  private _detailsTMP: DocumentItemDetail[] = [];

  private get detailsGrid(): DocumentItemDetailGrid[] {
    return this._mapToItemDetailGrid(this._detailsTMP);
  }

  constructor(private fb: FormBuilder, private _gridService: GridService<DocumentItemDetail>,
    private _messagesService: MessagesService, private _actionService: ActionService, private _modalService: ModalService ) {    
    this.createForm();
  }

  ngOnInit(): void {
    this._loadSecurityActions();
   }

  isReadyToAccept(): boolean {
    return  this.form.valid &&(this.form.dirty || this._hasDetailsDirty);
  }
  onAction(action: EnumActionsType): void {
    try {
      switch (action) {
        case EnumActionsType.actionAccept:
          this._accept();
          break;
        case EnumActionsType.actionCancel:
          this._cancel();
          break;
        case EnumActionsType.actionNew:
          this._addItemDetail();
          break;
      }
    }
    catch (error) {
      this._messagesService.addMessage(error as HttpErrorResponse, EnumMessageType.Error);
    }
  }
  private _accept(): void {
    if (!this.form.valid &&  !this._hasDetailsDirty) {
      return;
    } 
    const updatedDocumentItem: DocumentItem = this._mapFormToDocumentItem();
    this._hasDetailsDirty = false;
    this.form.markAsPristine();
    this.accept.emit(updatedDocumentItem);
  }

  private _cancel(): void {
    this.showForm = false;
    this.cancel.emit();
  } 

  private _addItemDetail(): void {
    const maxId = this._detailsTMP.length > 0 
      ? Math.max(...this._detailsTMP.map(x => x.detailId)) 
      : 0;
    
    this.itemDetailSelected = new DocumentItemDetail();
    this.itemDetailSelected.detailId = maxId + 1;
    this.itemDetailSelected.itemId = this.documentItem.itemId;
    this.itemDetailSelected.documentId = this.documentItem.documentId;
    this.showForm = true;
  }

  private _mapToItemDetailGrid(details: DocumentItemDetail[]): DocumentItemDetailGrid[] {
    return details.map(detail => ({
      selected: false,
      documentId: detail.documentId,
      itemId: detail.itemId,
      detailId: detail.detailId,
      detailDescription: detail.detailDescription
    }));
  }
  private _mapFormToDocumentItem(): DocumentItem {
    const formData = this.form.value as DocumentItem;  
    return {
      itemId: formData.itemId,
      documentId: formData.documentId,
      itemDescription: formData.itemDescription,
      details: this._detailsTMP
    };
  }

  onCancel(): void {
    this._cancel();
  }

  onEditItemDetail(itemDetail: DocumentItemDetailGrid) {
    // CORREGIR: buscar por detailId, no por itemId
    const detail: DocumentItemDetail | undefined = this._detailsTMP.find(x => x.detailId === itemDetail.detailId);
    if (!detail) {
      this._messagesService.addMessage('Detail not found.', EnumMessageType.Error);
      return;
    }
    this.itemDetailSelected = detail;
    this.showForm = true;
  }

  onDeleteItemDetail(itemDetailGrid: DocumentItemDetailGrid) {
    this._modalService.showModal(CONFIRM_DELETE)
      .pipe(takeUntilDestroyed(this._destroyRef))
      .subscribe(action => {          
        if (action === EnumActionsType.actionAccept) {
          this._detailsTMP = this._detailsTMP.filter(x => x.detailId !== itemDetailGrid.detailId);
          this._detailsTMP.forEach((item, index) => {
            item.detailId = index + 1;
          });
          this._hasDetailsDirty = true;
          this._gridService.setData(this.detailsGrid);
          this._enabledActions();          
        } else if (action === EnumActionsType.actionCancel) {
          // Usuario canceló                  
          
        }
      });   
  }


    onAcceptDocumentItemDetail(itemDetail: DocumentItemDetail) {    
      this.showForm = false;
      
      const index = this._detailsTMP.findIndex(x => x.detailId === itemDetail.detailId);
      
      if (index !== -1) {
        // Actualizar existente
        this._detailsTMP[index] = { ...itemDetail };
      } else {
        // Agregar nuevo
        this._detailsTMP.push({ ...itemDetail });
      }
      
      this._hasDetailsDirty = true;
      this._gridService.setData(this.detailsGrid);
      this._enabledActions();
    }

    onCancelDocumentItemDetail() {
      this.showForm = false;
    }

  private createForm() {
    this.form = this.fb.group({
      documentId: [0],
      itemId: [0],
      itemDescription: ['']
    });
  }

  private updateForm(documentItem: DocumentItem | undefined) {
    if (!documentItem) return;
    this.form.patchValue({
      documentId: documentItem.documentId,
      itemId: documentItem.itemId,
      itemDescription: documentItem.itemDescription
    });    
    this._detailsTMP = documentItem.details;
    this._gridService.setData(this.detailsGrid);
  }

  private _loadSecurityActions(): void {
    const actions: Action[] = [
        new Action('BUTTON.new', EnumActionsType.actionNew, 'new', false),
        new Action('BUTTON.accept', EnumActionsType.actionAccept, 'accept', false),
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
}
