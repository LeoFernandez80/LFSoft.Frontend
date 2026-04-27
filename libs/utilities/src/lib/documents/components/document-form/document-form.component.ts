import { CommonModule } from "@angular/common";
import { HttpErrorResponse } from "@angular/common/http";
import { Component, OnInit, OnDestroy, Input, Output, EventEmitter, inject, DestroyRef } from "@angular/core";
import { takeUntilDestroyed } from "@angular/core/rxjs-interop";
import { ReactiveFormsModule, FormGroup, FormBuilder, Validators } from "@angular/forms";
import { MatButtonModule } from "@angular/material/button";
import { RouterOutlet, ActivatedRoute } from "@angular/router";
import { UrlSecurityService } from "@lib/security";
import { GenericFormComponent, GenericActionsComponent, FormValidationsDirective, TranslatePipe, SkeletonDirective, ActionService, GridService, MessagesService, ModalService, EnumMessageType, EnumActionsType, CONFIRM_DELETE, CONFIRM_CANCEL, Action } from "@lib/shared";
import { Observable, map, of } from "rxjs";
import { DocumentItemGrid } from "../../models/document-grid.model";
import { DocumentItem } from "../../models/document.model";
import { DocumentService } from "../../services/document.service";
import { DocumentItemFormComponent } from "./document-item-form/document-item-form.component";
import { DocumentItemGridComponent } from "./document-item-grid/document-item-grid.component";
import { Document } from "../../models/document.model";
import { EnumActions } from "libs/common/src/lib/enums/actions.enum";


@Component({
  selector: 'app-document-form',
  templateUrl: './document-form.component.html',
  styleUrls: ['./document-form.component.scss'],
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterOutlet,GenericFormComponent, 
    GenericActionsComponent, FormValidationsDirective, TranslatePipe, 
    SkeletonDirective, MatButtonModule, DocumentItemGridComponent, DocumentItemFormComponent ],
  providers: [ActionService, GridService]
})
export class DocumentFormComponent implements OnInit, OnDestroy {
  @Input() documentId: number = 0;
  @Output() save = new EventEmitter<Document>();
  @Output() cancel = new EventEmitter<void>();

  showForm = false;
  isLoading: boolean = true;
  documentForm: FormGroup = new FormGroup({});
  document: Document = new Document();
  documentItemSelected: DocumentItem = new DocumentItem();

  private _itemsTMP: DocumentItem[] = [];
  private readonly _destroyRef = inject(DestroyRef);
  private _operation: any;
  private _hasItemsDirty: boolean = false;

  private get itemsGrid(): DocumentItemGrid[] {
    return this._mapToDocumentItemGrid(this._itemsTMP);
  }

  constructor(private fb: FormBuilder, private _documentService: DocumentService, private _route: ActivatedRoute, 
              private _actionService: ActionService,  private _messagesService: MessagesService, 
              private _modalService: ModalService, private _urlSecurityService: UrlSecurityService,
             private _gridService: GridService<DocumentItemGrid> ) {    
    this._createForm();
  }
  
  ngOnInit(): void {  
    try {     
      this._loadSecurityActions();
      this._loadData();   
    }
    catch (error) {
      this._messagesService.addMessage( 'Error loading document data.', EnumMessageType.Error);
    }
  }

  ngOnDestroy(): void {
    // El DestroyRef se encarga automáticamente de cancelar todas las suscripciones
    // que usen takeUntilDestroyed()
  }

  isReadyToSave(): boolean {    
    return this.documentForm.valid && (this.documentForm.dirty || this._hasItemsDirty);
  }

  onAction(action: EnumActionsType | EnumActions): void {
    try {
      switch (action) {
        case EnumActionsType.actionSave:
          this._save();
          break;
        case EnumActionsType.actionCancel:
          this._cancel();          
          break;
        case EnumActionsType.actionNew:
          this._addDocumentItem();
          break;
        }
    }
    catch (error) {
      this._messagesService.addMessage( error as HttpErrorResponse, EnumMessageType.Error);
    }
  }  
   
  onDeleteDocumentItem(documentItemGrid: DocumentItemGrid): void {
    this._modalService.showModal(CONFIRM_DELETE)
      .pipe(takeUntilDestroyed(this._destroyRef))
      .subscribe(action => {          
        if (action === EnumActionsType.actionAccept) {
          this._itemsTMP = this._itemsTMP.filter(x => x.itemId !== documentItemGrid.itemId);
          this._itemsTMP.forEach((item, index) => {
            item.itemId = index + 1;
            item.details.forEach((detail) => {
              detail.itemId = item.itemId;             
            });
          });
          this._hasItemsDirty = true;
          this._gridService.setData(this.itemsGrid);
          this._enabledActions();          
        } else if (action === EnumActionsType.actionCancel) {
          // Usuario canceló                  
          
        }
      });   
  }

  onEditDocumentItem( documentItemGrid: DocumentItemGrid): void {
    const documentItem: DocumentItem | undefined = this._itemsTMP.find(x => x.itemId === documentItemGrid.itemId);
    if (!documentItem) {
      this._messagesService.addMessage('Item not found.', EnumMessageType.Error);
      return;
    }
    this.documentItemSelected = documentItem;
    this.showForm = true; 
  }

  onAcceptDocumentItem(documentItem: DocumentItem): void {   
    this.showForm = false;
    
    const index = this._itemsTMP.findIndex(x => x.itemId === documentItem.itemId);
    
    if (index !== -1) {
      // Actualizar existente
      this._itemsTMP[index] = { ...documentItem };
    } else {
      // Agregar nuevo
      this._itemsTMP.push({ ...documentItem });
    }
    
    this._hasItemsDirty = true;
    this._gridService.setData(this.itemsGrid);
    this._enabledActions();
  }

  onCancelDocumentItem(): void {
    this.showForm = false;    
  }
  
  private _mapFormToDocument(): Document {
    const formData = this.documentForm.value as Document;
      
    return {
      personName: formData.personName,
      personId: formData.personId,
      personDocumentType: formData.personDocumentType,
      personDocumentNumber: formData.personDocumentNumber,
      documentDescription: formData.documentDescription,
      documentCreationDate: formData.documentCreationDate,
      documentStatus: formData.documentStatus,
      creationUserId: formData.creationUserId,
      documentId: this.document.documentId,
      items: this._itemsTMP      
    };
  }

  private _mapToDocumentItemGrid(documentItems: DocumentItem[]): DocumentItemGrid[] {    
    return documentItems.map(item => ({
      selected: false,
      documentId: item.documentId,
      itemId: item.itemId,
      itemDescription: item.itemDescription,
    }));
  }

  private _createForm() {
    this.documentForm = this.fb.group({
      personName: [''],
      personId: [0],
      personDocumentType: [''],
      personDocumentNumber: [''],
      documentDescription: ['', [Validators.required, Validators.minLength(3)]],
      documentCreationDate: [''],
      documentSentDate: [''],
      documentStatus: [1],
      creationUserId: [0]
    });
    this.documentForm.statusChanges
      .pipe(takeUntilDestroyed(this._destroyRef))
      .subscribe(() => {        
        this._enabledActions();
      });
  }

  private _loadData() {
    this.isLoading = false;
    this._loadParams().subscribe(() => {                  
      switch (this._operation) {
        case 'open':          
          this._editDocument(this.documentId).subscribe(document => {;
            this._updateDocument(document);
            this._enabledActions();
          });
          break;
        default: 
          this._editDocument(this.documentId).subscribe(document => {                   
            this._updateDocument(document);
            this._enabledActions();
          });          
      }
    });
  }

  private _editDocument(documentId: number): Observable<Document> {
    return this._documentService.getDocument(documentId);
  }

  private _updateDocument(document: Document): void {
    this.document = document;    
    this.documentForm.patchValue(this.document, { emitEvent: false });
    this._itemsTMP = this.document.items;
    this._gridService.setData(this.itemsGrid);
  }

  private _loadParams(): Observable<void> {    
    this._operation = this._route.snapshot.data['operation'];
    
    if (this._operation === 'open') {
      return this._route.queryParamMap.pipe(
        takeUntilDestroyed(this._destroyRef),
        map(params => {
          const idParam = params.get('id');
          
          // Validar que el ID sea seguro
          if (!idParam || !this._urlSecurityService.isValidRouteId(idParam)) {
            console.warn('Security: Invalid document ID detected:', idParam);
            this._messagesService.addMessage('ID de documento inválido', EnumMessageType.Error);
            throw new Error('Invalid document ID');
          }
          
          this.documentId = Number(idParam);          
          return;
        })
      );
    } else {
      return of(void 0);
    }
  }
  
  private _cancel(): void {    
    if (!this.documentForm.dirty) {
      this.cancel.emit();    
      return;
    }
      
    this._modalService.showModal(CONFIRM_CANCEL)
      .pipe(takeUntilDestroyed(this._destroyRef))
      .subscribe(action => {          
        if (action === EnumActionsType.actionAccept) {
          this.cancel.emit();         
        } else if (action === EnumActionsType.actionCancel) {
          // Usuario canceló                  
          
        }
      });   
  }

  private _addDocumentItem(): void {
    // Generar ID único (máximo + 1)
    const maxId = this._itemsTMP.length > 0 
      ? Math.max(...this._itemsTMP.map(x => x.itemId)) 
      : 0;
    
    this.documentItemSelected = new DocumentItem();
    this.documentItemSelected.itemId = maxId + 1;
    this.documentItemSelected.documentId = this.document.documentId;
    this.showForm = true;
  }

  private _save(): void {
    try {
      if (!this.documentForm.dirty && !this._hasItemsDirty) {
        return;
      }

      const formData = this._mapFormToDocument();
      const updatedDocument: Document = {
        ...this.document,
        ...formData
      };
    
      const saveOperation = !updatedDocument.documentId
        ? this._documentService.addDocument(updatedDocument)
        : this._documentService.updateDocument(updatedDocument);
      
      saveOperation
        .pipe(takeUntilDestroyed(this._destroyRef))
        .subscribe({
          next: () => {
            this._hasItemsDirty = false;
            this.documentForm.markAsPristine();
            this._enabledActions();
            this.save.emit(updatedDocument);
          },
          error: (error) => {
            // NO resetear _hasItemsDirty en caso de error
            this._messagesService.addMessage(error, EnumMessageType.Error);
          }
        });
    } catch (error) {
      throw error;
    }
  }

  //#region Security
  private _loadSecurityActions(): void {
    const actions: Action[] = [
        new Action('BUTTON.new', EnumActionsType.actionNew, 'add', false),  
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
