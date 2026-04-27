import { CommonModule } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { ReactiveFormsModule, FormGroup, FormBuilder, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { RouterOutlet } from '@angular/router';
import { GenericFormComponent, TranslatePipe, FormValidationsDirective, GenericActionsComponent, ActionService, MessagesService, EnumActionsType, EnumMessageType, Action } from '@lib/shared';
import { Subject } from 'rxjs';
import { DocumentItemDetail } from '../../../../models/document.model';
import { EnumActions } from 'libs/common/src/lib/enums/actions.enum';

@Component({
  selector: 'app-item-detail-form',
  templateUrl: './item-detail-form.component.html',
  styleUrl: './item-detail-form.component.scss',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterOutlet, GenericFormComponent, MatButtonModule, TranslatePipe, FormValidationsDirective, GenericActionsComponent],
  providers: [ActionService]
})
export class ItemDetailFormComponent {
  @Input() set documentItemDetail(value: DocumentItemDetail) {
    if (!value) return;
    this._updateForm(value);
  }

  @Output() accept = new EventEmitter<DocumentItemDetail>();
  @Output() cancel = new EventEmitter<void>();

  form: FormGroup = new FormGroup({});  
  private unsubscribe$ = new Subject<void>();


  constructor(private fb: FormBuilder, 
      private _messagesService: MessagesService, private _actionService: ActionService ) {    
    this._createForm();
  }

  ngOnDestroy(): void {
    this.unsubscribe$.next();
    this.unsubscribe$.complete();
  }

  ngOnInit(): void {   
    this._loadSecurityActions();
  }

  isReadyToAccept(): boolean {
    return  this.form.valid && this.form.dirty;
  }

  onAction(action: EnumActionsType | EnumActions): void {
    try {
      switch (action) {
        case EnumActionsType.actionAccept:
          this._accept();
          break;
        case EnumActionsType.actionCancel:
          this._cancel();
          break;
      }
    }
    catch (error) {
      this._messagesService.addMessage(error as HttpErrorResponse, EnumMessageType.Error);
    }
  }

  private _accept(): void {
    if (this.form.valid) {
      const updatedDocumentItem: DocumentItemDetail = this._mapFormToDetail();      
      this.accept.emit(updatedDocumentItem);
    }
  }

  private _cancel(): void {
    this.cancel.emit();
  } 

  private _updateForm(documentItemDetail: DocumentItemDetail) {
    this.form.patchValue({
      documentId: documentItemDetail.documentId,
      itemId: documentItemDetail.itemId,
      detailId: documentItemDetail.detailId,
      detailDescription: documentItemDetail.detailDescription
    });
  }
    
  private _createForm() {
    this.form = this.fb.group({
      documentId: [],
      itemId: [],
      detailId: [],
      detailDescription: ['', Validators.required]
    });
  }

  private _mapFormToDetail(): DocumentItemDetail { 
    const formData = this.form.value as DocumentItemDetail;
    return {
      documentId: formData.documentId,
      itemId: formData.itemId,
      detailId: formData.detailId,
      detailDescription: formData.detailDescription
    };
  }

  private _loadSecurityActions(): void {
    const actions: Action[] = [
        new Action('BUTTON.accept', EnumActionsType.actionAccept, 'accept', false),
        new Action('BUTTON.cancel', EnumActionsType.actionCancel, 'cancel', false)
      ];
    this._actionService.setActions(actions);
  }
}
