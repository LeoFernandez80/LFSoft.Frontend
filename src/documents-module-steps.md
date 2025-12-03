# Pasos para crear un módulo con Master-Detail de 3 niveles siguiendo el estándar del módulo Documents

Este documento describe el proceso completo para crear un módulo con estructura master-detail de 3 niveles (Documento → Items → Detalles), siguiendo los patrones establecidos en el módulo persons y la implementación del módulo documents.

## Estructura de 3 Niveles

- **Nivel 1 (Master):** Documento principal
- **Nivel 2 (Detail):** Items del documento (colección anidada)
- **Nivel 3 (Sub-Detail):** Detalles de cada item (colección anidada dentro de items)

---

## FASE 1: ESTRUCTURA Y MODELOS

### 1. Crear estructura completa de carpetas

```
src/app/components/documents-module/
├── models/
│   ├── document.model.ts
│   ├── document-grid.model.ts
│   ├── document-filter.model.ts
│   ├── document-item.model.ts
│   ├── document-item-grid.model.ts
│   ├── document-item-detail.model.ts
│   └── document-item-detail-grid.model.ts
├── services/
│   └── document.service.ts
├── documents-container/
│   ├── document-grid/
│   │   ├── document-grid.component.ts
│   │   ├── document-grid.component.html
│   │   └── document-grid.component.scss
│   ├── document-grid-filter/
│   │   ├── document-grid-filter.component.ts
│   │   ├── document-grid-filter.component.html
│   │   └── document-grid-filter.component.scss
│   ├── documents-container.component.ts
│   ├── documents-container.component.html
│   └── documents-container.component.scss
├── documents-form-container/
│   ├── documents-form-container.component.ts
│   ├── documents-form-container.component.html
│   └── documents-form-container.component.scss
├── document-form/
│   ├── document-item-grid/
│   │   ├── document-item-grid.component.ts
│   │   ├── document-item-grid.component.html
│   │   └── document-item-grid.component.scss
│   ├── document-item-form/
│   │   ├── document-item-detail-grid/
│   │   │   ├── document-item-detail-grid.component.ts
│   │   │   ├── document-item-detail-grid.component.html
│   │   │   └── document-item-detail-grid.component.scss
│   │   ├── document-item-detail-form/
│   │   │   ├── document-item-detail-form.component.ts
│   │   │   ├── document-item-detail-form.component.html
│   │   │   └── document-item-detail-form.component.scss
│   │   ├── document-item-form.component.ts
│   │   ├── document-item-form.component.html
│   │   └── document-item-form.component.scss
│   ├── document-form.component.ts
│   ├── document-form.component.html
│   └── document-form.component.scss
├── document-drawer/
│   ├── document-drawer.component.ts
│   ├── document-drawer.component.html
│   └── document-drawer.component.scss
├── documents-module.module.ts
└── documents-module-routing.module.ts
```

---

### 2. Crear modelos base (en `/models/`)

#### **document.model.ts** - Modelo principal con colección de items
```typescript
import { DocumentItem } from './document-item.model';

export class Document {
  //grid, filter
  documentId: number = 0;
  //grid
  personName: string = '';
  personId: number = 0;
  personDocumentType: string = '';
  personDocumentNumber: string = '';
  //grid, filter
  documentDescription: string = '';
  //grid, filter
  documentCreationDate: Date = new Date();
  documentSentDate: Date = new Date();
  //grid
  documentStatus: EnumDocumentStatus = EnumDocumentStatus.inCreation;
  creationUserId: number = 0;
  
  // ✅ Colección de items anidados
  items: DocumentItem[] = [];
}

export enum EnumDocumentStatus {
  cancelled = 0,
  inCreation = 1,
  sent = 2,
  invoiced = 3,
  rejected = 4,
  partiallyInvoiced = 5,
  active = 6
}
```

#### **document-grid.model.ts** - Modelo para vista de grilla
```typescript
export class DocumentGrid {
  selected: boolean = false;  // ✅ Requerido para selección
  documentId: number = 0;
  personName: string = '';
  documentDescription: string = '';
  documentCreationDate: Date = new Date();
  documentStatus: EnumDocumentStatus = EnumDocumentStatus.inCreation;
}
```

#### **document-filter.model.ts** - Modelo para filtros
```typescript
export class DocumentFilter {
  documentId?: number = 0;
  personName: string = '';
  documentDescription: string = '';
  documentCreationDateFrom?: Date;
  documentCreationDateTo?: Date;
}
```

#### **document-item.model.ts** - Modelo de nivel 2 con colección de detalles
```typescript
import { DocumentItemDetail } from './document-item-detail.model';

export class DocumentItem {
  documentId: number = 0;
  //grid
  itemId: number = 0;
  //grid
  itemDescription: string = '';
  
  // ✅ Colección de detalles anidados
  details: DocumentItemDetail[] = [];
}
```

#### **document-item-grid.model.ts** - Modelo de grilla para items
```typescript
export class DocumentItemGrid {
  selected: boolean = false;
  documentId: number = 0;
  itemId: number = 0;
  itemDescription: string = '';
}
```

#### **document-item-detail.model.ts** - Modelo de nivel 3
```typescript
export class DocumentItemDetail {
  documentId: number = 0;
  itemId: number = 0;
  //grid
  detailId: number = 0;
  //grid
  detailDescription: string = '';
}
```

#### **document-item-detail-grid.model.ts** - Modelo de grilla para detalles
```typescript
export class DocumentItemDetailGrid {
  selected: boolean = false;
  documentId: number = 0;
  itemId: number = 0;
  detailId: number = 0;
  detailDescription: string = '';
}
```

---

### 3. Crear servicio (en `/services/`)

#### **document.service.ts** - Servicio con CRUD y datos mock

**Características clave:**
- ✅ Datos mock en array privado `_documents`
- ✅ Métodos CRUD: `getDocuments()`, `getDocument()`, `saveDocument()`, `deleteDocument()`
- ✅ Retorna `Observable<PaginatedList<T>>` para listas
- ✅ Implementa lógica de paginación y filtrado
- ✅ Genera IDs automáticamente
- ✅ Métodos para gestionar items y detalles anidados

```typescript
import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { delay } from 'rxjs/operators';
import { Document, DocumentGrid, DocumentFilter } from '../models/...';
import { PageFilter, PaginatedList } from '../../../generic/models/...';

@Injectable({
  providedIn: 'root'
})
export class DocumentService {
  private _documents: Document[] = [
    // Mock data con items y details anidados
  ];

  getDocuments(filter: DocumentFilter, pageFilter: PageFilter): Observable<PaginatedList<DocumentGrid>> {
    // Implementar lógica de filtrado y paginación
    // Mapear Document[] a DocumentGrid[]
    // Retornar { data: DocumentGrid[], total: number }
  }

  getDocument(id: number): Observable<Document> {
    // Buscar documento por ID
    // Retornar Observable con documento completo (incluye items y details)
  }

  saveDocument(document: Document): Observable<Document> {
    // Si documentId === 0, crear nuevo y asignar ID
    // Si documentId > 0, actualizar existente
    // Guardar items y details anidados
  }

  deleteDocument(id: number): Observable<boolean> {
    // Eliminar documento y sus items/details asociados
  }

  // ✅ Métodos específicos para master-detail
  getDocumentItems(documentId: number): Observable<DocumentItem[]> {
    // Retornar items del documento
  }

  saveDocumentItem(documentId: number, item: DocumentItem): Observable<DocumentItem> {
    // Guardar/actualizar item y sus detalles
  }

  deleteDocumentItem(documentId: number, itemId: number): Observable<boolean> {
    // Eliminar item y sus detalles
  }
}
```

---

## FASE 2: COMPONENTES DE GRILLA Y FILTRO (NIVEL 1)

### 4. Crear componente document-grid-filter

**Ubicación:** `/documents-container/document-grid-filter/`

**Características:**
- ✅ Usa `generic-form` para el formulario
- ✅ Usa `generic-actions` para botones
- ✅ FormGroup reactivo con campos del filtro
- ✅ Evento `@Output() filter: EventEmitter<DocumentFilter>`
- ✅ Acciones: Filtrar, Limpiar

**Template HTML:**
```html
<app-generic-form [showActions]="false">
  <div body class="filter">
    <mat-form-field>
      <mat-label>{{ 'LABEL.documentId' | translate }}</mat-label>
      <input matInput type="number" [formControl]="documentIdControl">
    </mat-form-field>
    
    <mat-form-field>
      <mat-label>{{ 'LABEL.personName' | translate }}</mat-label>
      <input matInput [formControl]="personNameControl">
    </mat-form-field>
    
    <!-- Más campos del filtro -->
  </div>
  
  <div footerContent>
    <app-generic-actions [actions]="filterActions" (actionClick)="onActionClick($event)">
    </app-generic-actions>
  </div>
</app-generic-form>
```

---

### 5. Crear componente document-grid

**Ubicación:** `/documents-container/document-grid/`

**Características:**
- ✅ Usa `generic-grid` con definición de columnas
- ✅ Input: `@Input() documents: DocumentGrid[]`
- ✅ Input: `@Input() totalDocuments: number`
- ✅ Outputs: `edit`, `delete`, `open`, `pageChange`, `sortChange`
- ✅ Acciones de fila: Editar, Eliminar, Abrir en ventana nueva

**Definición de columnas:**
```typescript
columns: GenericColumn[] = [
  { field: 'documentId', label: 'LABEL.documentId', sortable: true },
  { field: 'personName', label: 'LABEL.personName', sortable: true },
  { field: 'documentDescription', label: 'LABEL.documentDescription', sortable: true },
  { field: 'documentCreationDate', label: 'LABEL.documentCreationDate', type: 'date', sortable: true },
  { field: 'documentStatus', label: 'LABEL.documentStatus', type: 'enum', enum: EnumDocumentStatus }
];

rowActions: GenericAction[] = [
  { id: 'edit', label: 'ACTION.edit', icon: 'edit', type: EnumActionType.icon },
  { id: 'delete', label: 'ACTION.delete', icon: 'delete', type: EnumActionType.icon },
  { id: 'open', label: 'ACTION.open', icon: 'open_in_new', type: EnumActionType.icon }
];
```

---

## FASE 3: CONTENEDOR PRINCIPAL CON PESTAÑAS (NIVEL 1)

### 6. Crear componente documents-container

**Ubicación:** `/documents-container/`

**Responsabilidades:**
- ✅ Gestión de pestañas con patrón optimizado
- ✅ Integración de grid y filter
- ✅ Acciones principales (Nuevo, Refrescar)
- ✅ Comunicación entre componentes hijos
- ✅ Navegación y enrutamiento

#### **Patrón de Gestión de Pestañas Optimizado:**

```typescript
export class DocumentsContainerComponent implements OnInit {
  // ✅ Patrón optimizado de pestañas
  openedDocumentsId: number[] = [];          // IDs de documentos abiertos
  selectedDocumentId: number | null = null;  // ID del documento seleccionado
  private _openedDocuments: Document[] = []; // Documentos completos (privado)
  
  // Estado de la grilla
  documents: DocumentGrid[] = [];
  totalDocuments: number = 0;
  currentFilter: DocumentFilter = new DocumentFilter();
  currentPageFilter: PageFilter = new PageFilter();
  isLoading: boolean = false;
  
  // Acciones principales
  mainActions: GenericAction[] = [
    { id: 'new', label: 'ACTION.new', icon: 'add', type: EnumActionType.button },
    { id: 'refresh', label: 'ACTION.refresh', icon: 'refresh', type: EnumActionType.icon }
  ];

  constructor(
    private _documentService: DocumentService,
    private _messagesService: MessagesService,
    private _destroyRef: DestroyRef,
    private _router: Router
  ) {}

  ngOnInit(): void {
    this._loadDocuments();
  }

  // ✅ Método para crear nuevo documento
  onNew(): void {
    const newId = 0;
    if (this.openedDocumentsId.includes(newId)) {
      this.selectedDocumentId = newId;
      return;
    }
    
    const newDocument = this._createDocument();
    this.openedDocumentsId.push(newId);
    this._openedDocuments.push(newDocument);
    this.selectedDocumentId = newId;
  }

  // ✅ Método para editar documento existente - CONSULTA AL SERVICIO
  onEdit(document: DocumentGrid): void {
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
  }

  // ✅ Método auxiliar para obtener documento por ID (usado en template)
  getDocumentById(documentId: number): Document | undefined {
    const index = this.openedDocumentsId.indexOf(documentId);
    return index !== -1 ? this._openedDocuments[index] : undefined;
  }

  // ✅ Cerrar pestaña específica
  onCloseTab(documentId: number): void {
    const index = this.openedDocumentsId.indexOf(documentId);
    if (index !== -1) {
      this.openedDocumentsId.splice(index, 1);
      this._openedDocuments.splice(index, 1);
      
      if (this.selectedDocumentId === documentId) {
        this.selectedDocumentId = this.openedDocumentsId.length > 0 
          ? this.openedDocumentsId[this.openedDocumentsId.length - 1] 
          : null;
      }
    }
  }

  // ✅ Seleccionar pestaña
  onClickTab(documentId: number): void {
    this.selectedDocumentId = documentId;
  }

  // ✅ Guardar documento desde formulario hijo
  onSaveDocument(document: Document): void {
    this._documentService.saveDocument(document)
      .pipe(takeUntilDestroyed(this._destroyRef))
      .subscribe({
        next: (savedDocument) => {
          this._messagesService.addMessage("Documento guardado", EnumMessageType.Success);
          
          // Actualizar en arrays de pestañas
          const index = this.openedDocumentsId.indexOf(document.documentId);
          if (index !== -1) {
            this._openedDocuments[index] = savedDocument;
            if (document.documentId === 0) {
              this.openedDocumentsId[index] = savedDocument.documentId;
              this.selectedDocumentId = savedDocument.documentId;
            }
          }
          
          this._loadDocuments(); // Refrescar grilla
        },
        error: () => {
          this._messagesService.addMessage("Error al guardar", EnumMessageType.Error);
        }
      });
  }

  // ✅ Cancelar edición
  onCancelDocument(): void {
    if (this.selectedDocumentId !== null) {
      this.onCloseTab(this.selectedDocumentId);
    }
  }

  // ✅ Eliminar documento
  onDelete(document: DocumentGrid): void {
    // Implementar confirmación y eliminación
  }

  // ✅ Abrir en nueva ventana
  onOpen(document: DocumentGrid): void {
    this._router.navigate(['/documents-module/documents/open'], {
      queryParams: { id: document.documentId }
    });
  }

  // Métodos privados auxiliares
  private _createDocument(): Document {
    const doc = new Document();
    doc.documentId = 0;
    return doc;
  }

  private _loadDocuments(): void {
    this.isLoading = true;
    this._documentService.getDocuments(this.currentFilter, this.currentPageFilter)
      .pipe(takeUntilDestroyed(this._destroyRef))
      .subscribe({
        next: (result) => {
          this.documents = result.data;
          this.totalDocuments = result.total;
          this.isLoading = false;
        },
        error: () => {
          this.isLoading = false;
        }
      });
  }
}
```

#### **Template HTML del Container:**

```html
<app-generic-layout [title]="'TITLE.documents' | translate">
  <!-- Acciones principales -->
  <div headerActions>
    <app-generic-actions [actions]="mainActions" (actionClick)="onMainAction($event)">
    </app-generic-actions>
  </div>

  <!-- Filtros -->
  <div filterContent>
    <app-document-grid-filter (filter)="onFilter($event)">
    </app-document-grid-filter>
  </div>

  <!-- Grilla -->
  <div gridContent *ngIf="openedDocumentsId.length === 0">
    <app-document-grid
      [documents]="documents"
      [totalDocuments]="totalDocuments"
      [isLoading]="isLoading"
      (edit)="onEdit($event)"
      (delete)="onDelete($event)"
      (open)="onOpen($event)"
      (pageChange)="onPageChange($event)"
      (sortChange)="onSortChange($event)">
    </app-document-grid>
  </div>

  <!-- Pestañas con formularios -->
  <div formContent *ngIf="openedDocumentsId.length > 0">
    <mat-tab-group [(selectedIndex)]="selectedTabIndex">
      <mat-tab *ngFor="let documentId of openedDocumentsId">
        <ng-template mat-tab-label>
          <div class="container__tab" (click)="onClickTab(documentId)">
            <div class="container__tab-label">
              {{ getDocumentById(documentId)?.documentDescription || 'Nuevo Documento' }}
            </div>
            <button mat-icon-button (click)="onCloseTab(documentId); $event.stopPropagation()">
              <mat-icon>close</mat-icon>
            </button>
          </div>
        </ng-template>
        
        <app-document-form
          [documentId]="documentId"
          (save)="onSaveDocument($event)"
          (cancel)="onCancelDocument()">
        </app-document-form>
      </mat-tab>
    </mat-tab-group>
  </div>
</app-generic-layout>
```

---

## FASE 4: FORMULARIO PRINCIPAL CON ITEMS (NIVEL 1 → NIVEL 2)

### 7. Crear componente document-form

**Ubicación:** `/document-form/`

**Responsabilidades:**
- ✅ Formulario principal del documento
- ✅ Gestión de colección de items (CRUD)
- ✅ Toggle entre vista grid y formulario de item
- ✅ Arrays temporales para items (`_itemsTMP`)
- ✅ Tracking de cambios en items (`_hasItemsDirty`)
- ✅ Validaciones del formulario
- ✅ Comunicación con parent via `@Output()`

#### **Características clave:**

```typescript
export class DocumentFormComponent implements OnInit, OnChanges {
  @Input() documentId: number = 0;
  @Output() save = new EventEmitter<Document>();
  @Output() cancel = new EventEmitter<void>();

  form: FormGroup;
  document: Document = new Document();
  isLoading: boolean = false;
  
  // ✅ Gestión de items
  showItemForm: boolean = false;           // Toggle grid/form
  selectedItem: DocumentItem | null = null;
  private _itemsTMP: DocumentItem[] = [];  // Array temporal
  private _hasItemsDirty: boolean = false; // Flag de cambios
  
  // Acciones del formulario
  formActions: GenericAction[] = [
    { id: 'save', label: 'ACTION.save', type: EnumActionType.button },
    { id: 'cancel', label: 'ACTION.cancel', type: EnumActionType.button }
  ];

  constructor(
    private _fb: FormBuilder,
    private _documentService: DocumentService,
    private _actionsService: GenericActionsService
  ) {
    this._createForm();
  }

  ngOnInit(): void {
    this._setupActionsSubscription();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['documentId'] && this.documentId) {
      this._loadDocument();
    }
  }

  // ✅ Verificar si está listo para guardar
  isReadyToSave(): boolean {
    return this.form.valid && (this.form.dirty || this._hasItemsDirty);
  }

  // ✅ Guardar documento
  onSave(): void {
    if (!this.isReadyToSave()) return;
    
    const documentData = this._getFormData();
    documentData.items = [...this._itemsTMP]; // Usar array temporal
    this.save.emit(documentData);
  }

  // ✅ Cancelar edición
  onCancel(): void {
    this.cancel.emit();
  }

  // ✅ GESTIÓN DE ITEMS (Nivel 2)
  
  onNewItem(): void {
    this.selectedItem = new DocumentItem();
    this.selectedItem.documentId = this.document.documentId;
    this.selectedItem.itemId = 0;
    this.showItemForm = true;
  }

  onEditItem(item: DocumentItemGrid): void {
    // Buscar item completo en array temporal
    const fullItem = this._itemsTMP.find(i => i.itemId === item.itemId);
    if (fullItem) {
      this.selectedItem = { ...fullItem }; // Clonar
      this.showItemForm = true;
    }
  }

  onSaveItem(item: DocumentItem): void {
    const index = this._itemsTMP.findIndex(i => i.itemId === item.itemId);
    
    if (index !== -1) {
      // Actualizar existente
      this._itemsTMP[index] = item;
    } else {
      // Crear nuevo
      item.itemId = this._generateItemId();
      this._itemsTMP.push(item);
    }
    
    this._hasItemsDirty = true;
    this.showItemForm = false;
    this.selectedItem = null;
  }

  onCancelItem(): void {
    this.showItemForm = false;
    this.selectedItem = null;
  }

  onDeleteItem(item: DocumentItemGrid): void {
    const index = this._itemsTMP.findIndex(i => i.itemId === item.itemId);
    if (index !== -1) {
      this._itemsTMP.splice(index, 1);
      this._hasItemsDirty = true;
    }
  }

  // ✅ Mapear items para la grilla
  getItemsForGrid(): DocumentItemGrid[] {
    return this._itemsTMP.map(item => ({
      selected: false,
      documentId: item.documentId,
      itemId: item.itemId,
      itemDescription: item.itemDescription
    }));
  }

  // Métodos privados
  private _createForm(): void {
    this.form = this._fb.group({
      documentId: [0],
      personName: ['', [Validators.required]],
      documentDescription: ['', [Validators.required]],
      documentCreationDate: [new Date(), [Validators.required]],
      documentStatus: [EnumDocumentStatus.inCreation]
    });
  }

  private _loadDocument(): void {
    if (this.documentId === 0) {
      this.document = new Document();
      this._itemsTMP = [];
      this.form.reset(this.document);
      return;
    }

    this.isLoading = true;
    this._documentService.getDocument(this.documentId).subscribe({
      next: (doc) => {
        this.document = doc;
        this._itemsTMP = [...doc.items]; // Clonar items
        this.form.patchValue(doc);
        this.isLoading = false;
      }
    });
  }

  private _getFormData(): Document {
    const formValue = this.form.value;
    return {
      ...this.document,
      ...formValue
    };
  }

  private _generateItemId(): number {
    const maxId = Math.max(...this._itemsTMP.map(i => i.itemId), 0);
    return maxId + 1;
  }

  private _setupActionsSubscription(): void {
    this._actionsService.action$
      .pipe(takeUntilDestroyed(this._destroyRef))
      .subscribe(action => {
        if (action.id === 'save') this.onSave();
        if (action.id === 'cancel') this.onCancel();
      });
  }
}
```

#### **Template HTML del Form:**

```html
<app-generic-form [showActions]="!showItemForm">
  <div body class="form">
    <form [formGroup]="form">
      <!-- Campos del documento -->
      <mat-form-field>
        <mat-label>{{ 'LABEL.documentId' | translate }}</mat-label>
        <input matInput formControlName="documentId" readonly>
      </mat-form-field>

      <mat-form-field>
        <mat-label>{{ 'LABEL.personName' | translate }}</mat-label>
        <input matInput formControlName="personName">
      </mat-form-field>

      <mat-form-field>
        <mat-label>{{ 'LABEL.documentDescription' | translate }}</mat-label>
        <input matInput formControlName="documentDescription">
      </mat-form-field>

      <!-- Más campos... -->
    </form>

    <!-- ✅ Sección de Items (Grid o Form) -->
    <div class="form__items-section">
      <h3>{{ 'TITLE.items' | translate }}</h3>
      
      <!-- Grid de items -->
      <div *ngIf="!showItemForm">
        <app-document-item-grid
          [items]="getItemsForGrid()"
          (new)="onNewItem()"
          (edit)="onEditItem($event)"
          (delete)="onDeleteItem($event)">
        </app-document-item-grid>
      </div>

      <!-- Formulario de item -->
      <div *ngIf="showItemForm">
        <app-document-item-form
          [item]="selectedItem!"
          (save)="onSaveItem($event)"
          (cancel)="onCancelItem()">
        </app-document-item-form>
      </div>
    </div>
  </div>

  <!-- Acciones del formulario -->
  <div footerContent>
    <app-generic-actions 
      [actions]="formActions" 
      [disabledActions]="!isReadyToSave() ? ['save'] : []"
      (actionClick)="onFormAction($event)">
    </app-generic-actions>
  </div>
</app-generic-form>
```

---

### 8. Crear componente document-item-grid

**Ubicación:** `/document-form/document-item-grid/`

**Características:**
- ✅ Usa `generic-grid` para mostrar items
- ✅ Botón "Nuevo Item"
- ✅ Acciones de fila: Editar, Eliminar
- ✅ Columnas: itemId, itemDescription

```typescript
export class DocumentItemGridComponent {
  @Input() items: DocumentItemGrid[] = [];
  @Output() new = new EventEmitter<void>();
  @Output() edit = new EventEmitter<DocumentItemGrid>();
  @Output() delete = new EventEmitter<DocumentItemGrid>();

  columns: GenericColumn[] = [
    { field: 'itemId', label: 'LABEL.itemId', sortable: false },
    { field: 'itemDescription', label: 'LABEL.itemDescription', sortable: false }
  ];

  rowActions: GenericAction[] = [
    { id: 'edit', label: 'ACTION.edit', icon: 'edit', type: EnumActionType.icon },
    { id: 'delete', label: 'ACTION.delete', icon: 'delete', type: EnumActionType.icon }
  ];

  headerActions: GenericAction[] = [
    { id: 'new', label: 'ACTION.newItem', icon: 'add', type: EnumActionType.button }
  ];
}
```

---

## FASE 5: FORMULARIO DE ITEM CON DETALLES (NIVEL 2 → NIVEL 3)

### 9. Crear componente document-item-form

**Ubicación:** `/document-form/document-item-form/`

**Responsabilidades:**
- ✅ Formulario del item
- ✅ Gestión de colección de detalles (CRUD)
- ✅ Toggle entre vista grid y formulario de detalle
- ✅ Arrays temporales para detalles (`_detailsTMP`)
- ✅ Tracking de cambios en detalles (`_hasDetailsDirty`)

#### **Estructura similar a document-form:**

```typescript
export class DocumentItemFormComponent implements OnInit, OnChanges {
  @Input() item: DocumentItem = new DocumentItem();
  @Output() save = new EventEmitter<DocumentItem>();
  @Output() cancel = new EventEmitter<void>();

  form: FormGroup;
  
  // ✅ Gestión de detalles (Nivel 3)
  showDetailForm: boolean = false;
  selectedDetail: DocumentItemDetail | null = null;
  private _detailsTMP: DocumentItemDetail[] = [];
  private _hasDetailsDirty: boolean = false;

  formActions: GenericAction[] = [
    { id: 'save', label: 'ACTION.save', type: EnumActionType.button },
    { id: 'cancel', label: 'ACTION.cancel', type: EnumActionType.button }
  ];

  // ✅ Métodos similares a document-form pero para detalles
  onNewDetail(): void { /* ... */ }
  onEditDetail(detail: DocumentItemDetailGrid): void { /* ... */ }
  onSaveDetail(detail: DocumentItemDetail): void { /* ... */ }
  onCancelDetail(): void { /* ... */ }
  onDeleteDetail(detail: DocumentItemDetailGrid): void { /* ... */ }
  
  getDetailsForGrid(): DocumentItemDetailGrid[] { /* ... */ }
  
  isReadyToSave(): boolean {
    return this.form.valid && (this.form.dirty || this._hasDetailsDirty);
  }

  onSave(): void {
    const itemData = this._getFormData();
    itemData.details = [...this._detailsTMP];
    this.save.emit(itemData);
  }
}
```

#### **Template HTML:**

```html
<app-generic-form [showActions]="!showDetailForm">
  <div body class="form">
    <form [formGroup]="form">
      <mat-form-field>
        <mat-label>{{ 'LABEL.itemId' | translate }}</mat-label>
        <input matInput formControlName="itemId" readonly>
      </mat-form-field>

      <mat-form-field>
        <mat-label>{{ 'LABEL.itemDescription' | translate }}</mat-label>
        <input matInput formControlName="itemDescription">
      </mat-form-field>
    </form>

    <!-- ✅ Sección de Detalles -->
    <div class="form__details-section">
      <h3>{{ 'TITLE.details' | translate }}</h3>
      
      <div *ngIf="!showDetailForm">
        <app-document-item-detail-grid
          [details]="getDetailsForGrid()"
          (new)="onNewDetail()"
          (edit)="onEditDetail($event)"
          (delete)="onDeleteDetail($event)">
        </app-document-item-detail-grid>
      </div>

      <div *ngIf="showDetailForm">
        <app-document-item-detail-form
          [detail]="selectedDetail!"
          (save)="onSaveDetail($event)"
          (cancel)="onCancelDetail()">
        </app-document-item-detail-form>
      </div>
    </div>
  </div>

  <div footerContent>
    <app-generic-actions 
      [actions]="formActions"
      [disabledActions]="!isReadyToSave() ? ['save'] : []">
    </app-generic-actions>
  </div>
</app-generic-form>
```

---

### 10. Crear componente document-item-detail-grid

**Ubicación:** `/document-form/document-item-form/document-item-detail-grid/`

**Características similares a document-item-grid:**
- ✅ Usa `generic-grid`
- ✅ Columnas: detailId, detailDescription
- ✅ Acciones: Nuevo, Editar, Eliminar

---

### 11. Crear componente document-item-detail-form

**Ubicación:** `/document-form/document-item-form/document-item-detail-form/`

**Características:**
- ✅ Formulario más simple (nivel más profundo)
- ✅ Campos: detailId, detailDescription
- ✅ Validaciones
- ✅ Eventos save/cancel

```typescript
export class DocumentItemDetailFormComponent implements OnInit, OnChanges {
  @Input() detail: DocumentItemDetail = new DocumentItemDetail();
  @Output() save = new EventEmitter<DocumentItemDetail>();
  @Output() cancel = new EventEmitter<void>();

  form: FormGroup;

  formActions: GenericAction[] = [
    { id: 'save', label: 'ACTION.save', type: EnumActionType.button },
    { id: 'cancel', label: 'ACTION.cancel', type: EnumActionType.button }
  ];

  constructor(private _fb: FormBuilder) {
    this._createForm();
  }

  private _createForm(): void {
    this.form = this._fb.group({
      detailId: [0],
      detailDescription: ['', [Validators.required]]
    });
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['detail'] && this.detail) {
      this.form.patchValue(this.detail);
    }
  }

  onSave(): void {
    if (this.form.valid) {
      const detailData: DocumentItemDetail = {
        ...this.detail,
        ...this.form.value
      };
      this.save.emit(detailData);
    }
  }

  onCancel(): void {
    this.cancel.emit();
  }
}
```

---

## FASE 6: ROUTING Y MÓDULO

### 12. Crear documents-form-container

**Ubicación:** `/documents-form-container/`

**Propósito:**
- ✅ Contenedor para abrir documento en ventana separada
- ✅ Lee parámetro `id` de la URL
- ✅ Usa `document-form` internamente
- ✅ Maneja navegación y mensajes

```typescript
export class DocumentsFormContainerComponent implements OnInit {
  documentId: number = 0;

  constructor(
    private _route: ActivatedRoute,
    private _router: Router,
    private _messagesService: MessagesService
  ) {}

  ngOnInit(): void {
    this._route.queryParams.subscribe(params => {
      this.documentId = +params['id'] || 0;
    });
  }

  onSave(document: Document): void {
    // Guardar y mostrar mensaje
    this._messagesService.addMessage("Documento guardado", EnumMessageType.Success);
    this._router.navigate(['/documents-module/documents']);
  }

  onCancel(): void {
    this._router.navigate(['/documents-module/documents']);
  }
}
```

---

### 13. Crear routing del módulo

#### **documents-module-routing.module.ts**

```typescript
import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { DocumentsContainerComponent } from './documents-container/documents-container.component';
import { DocumentsFormContainerComponent } from './documents-form-container/documents-form-container.component';

const routes: Routes = [
  {
    path: 'documents/open',
    component: DocumentsFormContainerComponent,
    data: { operation: 'open' }
  },
  {
    path: 'documents',
    component: DocumentsContainerComponent
  },
  {
    path: '',
    redirectTo: 'documents',
    pathMatch: 'full'
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class DocumentsModuleRoutingModule { }
```

---

### 14. Crear módulo principal

#### **documents-module.module.ts**

```typescript
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { MaterialModule } from '../material.module'; // Ajustar según estructura
import { GenericModule } from '../../generic/generic.module'; // Ajustar según estructura

import { DocumentsModuleRoutingModule } from './documents-module-routing.module';

// Componentes
import { DocumentsContainerComponent } from './documents-container/documents-container.component';
import { DocumentsFormContainerComponent } from './documents-form-container/documents-form-container.component';
import { DocumentGridComponent } from './documents-container/document-grid/document-grid.component';
import { DocumentGridFilterComponent } from './documents-container/document-grid-filter/document-grid-filter.component';
import { DocumentFormComponent } from './document-form/document-form.component';
import { DocumentItemGridComponent } from './document-form/document-item-grid/document-item-grid.component';
import { DocumentItemFormComponent } from './document-form/document-item-form/document-item-form.component';
import { DocumentItemDetailGridComponent } from './document-form/document-item-form/document-item-detail-grid/document-item-detail-grid.component';
import { DocumentItemDetailFormComponent } from './document-form/document-item-form/document-item-detail-form/document-item-detail-form.component';

@NgModule({
  declarations: [
    DocumentsContainerComponent,
    DocumentsFormContainerComponent,
    DocumentGridComponent,
    DocumentGridFilterComponent,
    DocumentFormComponent,
    DocumentItemGridComponent,
    DocumentItemFormComponent,
    DocumentItemDetailGridComponent,
    DocumentItemDetailFormComponent
  ],
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MaterialModule,
    GenericModule,
    DocumentsModuleRoutingModule
  ]
})
export class DocumentsModule { }
```

---

## FASE 7: INTEGRACIÓN

### 15. Actualizar app.routes.ts

```typescript
{
  path: 'documents-module',
  loadChildren: () =>
    import('./components/documents-module/documents-module.module')
      .then(m => m.DocumentsModule)
}
```

---

### 16. Agregar botón en home (app.ts)

```typescript
// En el array de acciones
{
  id: 'documents',
  label: 'MENU.documents',
  icon: 'description',
  type: EnumActionType.fab
}

// En el handler
onActionClick(action: GenericAction): void {
  if (action.id === 'documents') {
    this._router.navigate(['/documents-module/documents']);
  }
}
```

---

## RESUMEN DE PATRONES CLAVE

### 1. **Patrón Master-Detail de 3 Niveles**

```
Document (Master)
├── items: DocumentItem[] (Detail)
│   └── details: DocumentItemDetail[] (Sub-Detail)
```

### 2. **Gestión de Arrays Temporales**

```typescript
// En cada nivel que gestiona una colección:
private _collectionTMP: Entity[] = [];
private _hasCollectionDirty: boolean = false;

// Al guardar, usar el array temporal:
entityData.collection = [...this._collectionTMP];
```

### 3. **Toggle Grid/Form**

```typescript
showChildForm: boolean = false; // Alternar entre grid y form

// En template:
<div *ngIf="!showChildForm">
  <app-child-grid></app-child-grid>
</div>
<div *ngIf="showChildForm">
  <app-child-form></app-child-form>
</div>
```

### 4. **Validación y Estado "Ready to Save"**

```typescript
isReadyToSave(): boolean {
  return this.form.valid && (this.form.dirty || this._hasChildrenDirty);
}

// Deshabilitar botón Save si no está listo:
[disabledActions]="!isReadyToSave() ? ['save'] : []"
```

### 5. **Mapeo Grid Models**

```typescript
// Siempre mapear entidades completas a modelos de grilla:
private _mapToGrid(entities: Entity[]): EntityGrid[] {
  return entities.map(entity => ({
    selected: false,
    id: entity.id,
    // Solo campos necesarios para la grilla
  }));
}
```

### 6. **IDs Temporales**

```typescript
// Para nuevas entidades antes de guardar:
private _generateId(): number {
  const maxId = Math.max(...this._collectionTMP.map(e => e.id), 0);
  return maxId + 1;
}

// Al crear:
if (entity.id === 0) {
  entity.id = this._generateId();
}
```

---

## CONSIDERACIONES FINALES

### **Performance y Optimización**

1. **Virtual Scrolling:** Para grillas con muchos registros, considerar implementar `<cdk-virtual-scroll-viewport>`

2. **Paginación en Detalles:** Si los items/detalles pueden ser numerosos, implementar paginación local

3. **Lazy Loading de Detalles:** Cargar detalles solo cuando se expande/edita el item

### **Validaciones Avanzadas**

1. **Validación Cross-Level:** Implementar validadores que revisen datos entre niveles

2. **Resumen de Errores:** Componente que muestre errores de todos los niveles

### **UX/UI**

1. **Indicadores de Cambios:** Mostrar badge con número de items modificados

2. **Confirmaciones:** Modal de confirmación antes de eliminar items/detalles

3. **Loading States:** Mostrar skeletons mientras se cargan datos

### **Testing**

1. **Unit Tests:** Para cada componente y servicio

2. **Integration Tests:** Para flujos completos de CRUD

3. **E2E Tests:** Para casos de uso principales

---

## CHECKLIST DE IMPLEMENTACIÓN

- [ ] Estructura de carpetas completa
- [ ] Todos los modelos (7 archivos)
- [ ] Servicio con CRUD completo
- [ ] Componentes de filtro y grilla principal
- [ ] Container con gestión de pestañas
- [ ] Formulario principal (nivel 1)
- [ ] Grilla de items (nivel 2)
- [ ] Formulario de items (nivel 2)
- [ ] Grilla de detalles (nivel 3)
- [ ] Formulario de detalles (nivel 3)
- [ ] Form container para ventana separada
- [ ] Routing configurado
- [ ] Módulo declarado
- [ ] Integración en app.routes.ts
- [ ] Botón en home
- [ ] Traducciones agregadas
- [ ] Estilos SCSS
- [ ] Tests unitarios
- [ ] Documentación

---

**Detenerse en cada paso para esperar confirmación antes de continuar.**

Cada paso replica exactamente la arquitectura, nomenclatura y uso de componentes genéricos del módulo persons y documents, asegurando consistencia y mantenibilidad en la aplicación con soporte completo para estructuras master-detail multinivel.
