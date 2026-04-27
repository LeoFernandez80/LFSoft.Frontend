import { NgFor, AsyncPipe } from "@angular/common";
import { Component, OnInit, OnDestroy, inject, DestroyRef } from "@angular/core";
import { takeUntilDestroyed } from "@angular/core/rxjs-interop";
import { MatIconModule } from "@angular/material/icon";
import { MatTabsModule } from "@angular/material/tabs";
import { Router, ActivatedRoute } from "@angular/router";
import { AuthService, UrlSecurityService } from "@lib/security";
import { TranslatePipe, GenericLayoutComponent, GenericMessageComponent, GenericActionsComponent, MessagesService, GridService, PageFilter, ActionService, ModalService, EnumMessageType, EnumActionsType, CONFIRM_DELETE, Action, EnumActionsViewType, EnumActionsStyle } from "@lib/shared";
import { DocumentFilter } from "../../models/document-filter.model";
import { DocumentGrid } from "../../models/document-grid.model";
import { Document } from "../../models/document.model";
import { DocumentService } from "../../services/document.service";
import { DocumentGridFilterComponent } from "./document-grid-filter/document-grid-filter.component";
import { DocumentGridComponent } from "./document-grid/document-grid.component";
import { DocumentFormComponent } from "../document-form/document-form.component";
import { EnumActions } from "libs/common/src/lib/enums/actions.enum";


@Component({
  selector: 'lfsoft-documents-documents-container',
  templateUrl: './documents-container.component.html',
  styleUrls: ['./documents-container.component.scss'],
  standalone: true,
  imports: [
    NgFor,
    AsyncPipe,
    MatTabsModule,
    MatIconModule,
    TranslatePipe,
    GenericLayoutComponent,
    GenericMessageComponent,
    GenericActionsComponent,
    DocumentGridFilterComponent,
    DocumentGridComponent,
    DocumentFormComponent,
    
  ],
  providers: [Router, MessagesService, GridService]
})
export class DocumentsContainerComponent implements OnInit, OnDestroy {
  openedDocumentsId: number[] = [];
  selectedDocumentId: number | null = null;
  filterParameters: DocumentFilter = new DocumentFilter();  
  
  private _dataLoaded: DocumentGrid[] = [];  
  private _openedDocuments: Document[] = [];
  private _pageFilter: PageFilter = new PageFilter();
  private readonly _destroyRef = inject(DestroyRef);

  constructor(private _router: Router, private _route: ActivatedRoute, 
    private _documentService: DocumentService, private _gridService: GridService<DocumentGrid>, 
    private _messagesService: MessagesService, private _actionService: ActionService,
    private _modalService: ModalService, private _authService: AuthService,
        private _urlSecurityService: UrlSecurityService
) {
    this._createPageFilter();
    this._createFilterParameters();
  }

  ngOnInit(): void {
    try {
      this._loadSecurityActions();
      this.loadDocuments(this._pageFilter, this.filterParameters);
    } catch (error) {
      this._messagesService.addMessage("Error al cargar la pagina", EnumMessageType.Error);
    }
  }

  ngOnDestroy(): void {
    // El DestroyRef se encarga automáticamente de cancelar todas las suscripciones
    // que usen takeUntilDestroyed()
  }


  onSortChange(pageFilter: PageFilter): void {
    try {      
      this._pageFilter.sortDirection=pageFilter.sortDirection;
      this._pageFilter.sortField=pageFilter.sortField;
      this.loadDocuments(this._pageFilter, this.filterParameters);
    } catch (error) {
      this._messagesService.addMessage("ERROR.", EnumMessageType.Error);
    }
  }

  onLoadNextPage(): void {
    try {
      this._pageFilter.page += 1;
      this.loadDocuments(this._pageFilter, this.filterParameters);
    } catch (error) {
      this._messagesService.addMessage("Error al cargar la siguiente página", EnumMessageType.Error);
    }
  }

  onFilterApplied(filter: DocumentFilter): void {
    try {
      this._dataLoaded = [];   
      this._pageFilter.page = 1;            
      this.filterParameters = filter;
      this.loadDocuments(this._pageFilter, this.filterParameters);
    } catch (error) {
      this._messagesService.addMessage("Error al aplicar filtro", EnumMessageType.Error);
    }
  }

  onAction(action: EnumActionsType | EnumActions): void {
    switch (action) {
      case EnumActionsType.actionNew:
        this._createDocument();
        break;            
      case EnumActionsType.openHome:        
        this._openHome();       
        break;      
      case EnumActionsType.actionLogout:
        this._actionLogout();
        break;
    }
  }

  
  onEdit(document: DocumentGrid): void {
    try {
      if (this.openedDocumentsId.includes(document.documentId)) {
        this.selectedDocumentId = document.documentId;
        return;
      }
      
      this._documentService.getDocument(document.documentId)
        .pipe(takeUntilDestroyed(this._destroyRef))
        .subscribe({
          next: (fullDocument) => {
            this.openedDocumentsId.push(document.documentId);
            this._openedDocuments.push(fullDocument);
            this.selectedDocumentId = document.documentId;
          },
          error: () => {
            this._messagesService.addMessage("Error al cargar documento", EnumMessageType.Error);
          }
        });
    } catch (error) {
      this._messagesService.addMessage("Error al editar documento", EnumMessageType.Error);
    }
  }

  onDeleteDocument(document: DocumentGrid): void {
    try { 
      this._modalService.showModal(CONFIRM_DELETE)
        .pipe(takeUntilDestroyed(this._destroyRef))
        .subscribe(action => {          
          if (action === EnumActionsType.actionAccept) {
            this._deleteDocument(document);
          } 
        });      
    } catch (error) {
      this._messagesService.addMessage("Error al editar documento", EnumMessageType.Error);
    }
  }
  
  onOpenDocument(document: DocumentGrid): void {
    try {      
      this._openDocument(document);
    } catch (error) {
      this._messagesService.addMessage("Error al abrir documento en nueva pestaña", EnumMessageType.Error);
    }
  }  
  
  private _actionLogout(): void {
    try {
      // Crear URL de forma segura
      const urlTree = this._router.createUrlTree(['login']);
      const url = this._router.serializeUrl(urlTree);
      
      // Validar URL antes de abrir
      if (!this._urlSecurityService.isSecureUrl(url)) {
        this._messagesService.addMessage("URL no segura detectada", EnumMessageType.Error);
        return;
      }
      
      // Abrir en nueva ventana
      const windowRef = window.open(url, '_self', 'noopener,noreferrer');
      if (!windowRef) {
        this._messagesService.addMessage("No se pudo abrir la ventana. Verifica la configuración del navegador.", EnumMessageType.Warning);
      }
      this._authService.logout();
    } catch (error) {
      console.error('Error opening homes:', error);
      this._messagesService.addMessage("Error al abrir citas en nueva pestaña", EnumMessageType.Error);
    }

  }

  private _createDocument(): void {
    try {      
      const newDocument = new Document();
      newDocument.documentId = 0;
      newDocument.documentDescription = 'Nuevo Documento';
      newDocument.personName = 'Nueva Persona';
      
      this.openedDocumentsId.push(0);
      this._openedDocuments.push(newDocument);
      this.selectedDocumentId = 0;
    } catch (error) {
      throw error;
    }
  }

  
  private _openHome(): void {
    try {
      // Crear URL de forma segura
      const urlTree = this._router.createUrlTree(['home']);
      const url = this._router.serializeUrl(urlTree);
      
      // Validar URL antes de abrir
      if (!this._urlSecurityService.isSecureUrl(url)) {
        this._messagesService.addMessage("URL no segura detectada", EnumMessageType.Error);
        return;
      }
      
      // Abrir en nueva ventana
      const windowRef = window.open(url, '_self', 'noopener,noreferrer');
      if (!windowRef) {
        this._messagesService.addMessage("No se pudo abrir la ventana. Verifica la configuración del navegador.", EnumMessageType.Warning);
      }
    } catch (error) {
      console.error('Error opening homes:', error);
      this._messagesService.addMessage("Error al abrir citas en nueva pestaña", EnumMessageType.Error);
    }
  }

  private _openDocument(document: DocumentGrid): void {
    try {
      const url = this._router.serializeUrl(
        this._router.createUrlTree(['documents-module', 'documents','open'], { queryParams: { id: document.documentId } })
      );
      window.open(url, '_blank');
    } catch (error) {
      this._messagesService.addMessage("Error al abrir documento en nueva pestaña", EnumMessageType.Error);
    }
  }

  onSaveDocument(document: Document): void {
    const index = this.openedDocumentsId.indexOf(document.documentId);
    if (index !== -1) {
      this._openedDocuments[index] = document;
    }
    const indexData = this._dataLoaded.findIndex(e => e.documentId === document.documentId);
      if (indexData !== -1) {
        this._dataLoaded[indexData] = this._mapDocumentToGrid(document);
      }
    this._messagesService.addMessage( 'MESSAGE.successSave', EnumMessageType.Info);
    this.loadDocuments(this._pageFilter, this.filterParameters);
  }

  private _mapDocumentToGrid(document: Document): DocumentGrid {
    const documentGrid = new DocumentGrid();
    documentGrid.documentId = document.documentId;
    documentGrid.documentDescription = document.documentDescription;
    documentGrid.personName = document.personName;
    documentGrid.documentCreationDate = document.documentCreationDate;
    return documentGrid;
  }

  onCancelDocument(): void {
    try {      
      if (this.selectedDocumentId !== null) {
        this._closeDocument(this.selectedDocumentId);
      }
    } catch (error) {
      this._messagesService.addMessage("Error al cerrar pestaña de documento", EnumMessageType.Error);
    }
  }
  onCloseTab(documentId: number): void {
    try {
      this._closeDocument(documentId);
    } catch (error) {
      this._messagesService.addMessage("Error al cerrar pestaña de documento", EnumMessageType.Error);
    }
  }
  
  onClickTab(documentId: number): void {    
    this.selectedDocumentId = documentId;
  }
  
  private _closeDocument(documentId: number): void {
    const index = this.openedDocumentsId.indexOf(documentId);
    if (index !== -1) {
      this.openedDocumentsId.splice(index, 1);
      this._openedDocuments.splice(index, 1);
      
      if (this.openedDocumentsId.length > 0) {
        this.selectedDocumentId = this.openedDocumentsId[Math.max(index - 1, 0)];
      } else {
        this.selectedDocumentId = null;
      }
    }
  }


  getDocumentById(documentId: number): Document | undefined {
    const index = this.openedDocumentsId.indexOf(documentId);
    return index !== -1 ? this._openedDocuments[index] : undefined;
  }

  private _deleteDocument(document: DocumentGrid): void {
    try {
      this._documentService.deleteDocument(document.documentId!)
        .pipe(takeUntilDestroyed(this._destroyRef))
        .subscribe(() => {
          this._messagesService.addMessage("MESSAGE.successDelete", EnumMessageType.Info);
        });
    } catch (error) {
      throw error;
    }
  }


  private _loadSecurityActions(): void {
    const actions: Action[] = [
      new Action('BUTTON.home', EnumActionsType.openHome, 'home', false,EnumActionsViewType.view16x16),
      new Action('BUTTON.new', EnumActionsType.actionNew, 'add', false,EnumActionsViewType.view16x16, EnumActionsStyle.primary),
      new Action('BUTTON.logout', EnumActionsType.actionLogout, 'exit_to_app', false,EnumActionsViewType.view16x16, EnumActionsStyle.primary),
    ];
    this._actionService.setActions(actions);
  }

  private loadDocuments(pageFilter: PageFilter, filterParameters: DocumentFilter) {
    this._documentService.getDocuments(pageFilter, filterParameters)
      .pipe(takeUntilDestroyed(this._destroyRef))
      .subscribe(response => {
          this._dataLoaded = this._dataLoaded.concat(response.data);          
          this._gridService.setData(this._dataLoaded);
      });
  }

  private _createPageFilter() {
    this._pageFilter.page = 1;
    this._pageFilter.pageSize = 15;
    this._pageFilter.sortField = "documentId";
    this._pageFilter.sortDirection = "asc";
  }

  private _createFilterParameters() {
    this.filterParameters.documentId = undefined
  }
}
