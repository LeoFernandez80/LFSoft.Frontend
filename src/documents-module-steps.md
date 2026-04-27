# Pasos para crear un módulo con Master-Detail de 3 niveles siguiendo el estándar de Invoice

Este documento describe el proceso completo para crear un módulo con estructura master-detail de 3 niveles (Documento → Items → Detalles), siguiendo los patrones establecidos en el módulo de invoices (facturas).

## Estructura de 3 Niveles

- **Nivel 1 (Master):** Documento principal
- **Nivel 2 (Detail):** Items del documento (colección anidada)
- **Nivel 3 (Sub-Detail):** Detalles de cada item (colección anidada dentro de items)

---

## FASE 1: ESTRUCTURA Y MODELOS

### 1. Crear estructura completa de carpetas

```
libs/sales/src/lib/invoice/
├── models/
│   ├── invoice.model.ts
│   ├── invoice-grid.model.ts
│   ├── invoice-filter.model.ts
│   ├── invoice-item.model.ts
│   ├── invoice-item-grid.model.ts
│   ├── invoice-item-detail.model.ts
│   └── invoice-item-detail-grid.model.ts
├── services/
│   ├── invoice.service.ts
│   └── invoice-pdf.service.ts (opcional)
├── invoices-container/
│   ├── invoice-grid/
│   │   ├── invoice-grid.component.ts
│   │   ├── invoice-grid.component.html
│   │   └── invoice-grid.component.scss
│   ├── invoice-grid-filter/
│   │   ├── invoice-grid-filter.component.ts
│   │   ├── invoice-grid-filter.component.html
│   │   └── invoice-grid-filter.component.scss
│   ├── invoices-container.component.ts
│   ├── invoices-container.component.html
│   └── invoices-container.component.scss
├── invoices-form-container/
│   ├── invoices-form-container.component.ts
│   ├── invoices-form-container.component.html
│   └── invoices-form-container.component.scss
├── invoice-form/
│   ├── invoice-item-grid/
│   │   ├── invoice-item-grid.component.ts
│   │   ├── invoice-item-grid.component.html
│   │   └── invoice-item-grid.component.scss
│   ├── invoice-item-form/
│   │   ├── invoice-item-detail-grid/
│   │   │   ├── invoice-item-detail-grid.component.ts
│   │   │   ├── invoice-item-detail-grid.component.html
│   │   │   └── invoice-item-detail-grid.component.scss
│   │   ├── invoice-item-detail-form/
│   │   │   ├── invoice-item-detail-form.component.ts
│   │   │   ├── invoice-item-detail-form.component.html
│   │   │   └── invoice-item-detail-form.component.scss
│   │   ├── invoice-item-form.component.ts
│   │   ├── invoice-item-form.component.html
│   │   └── invoice-item-form.component.scss
│   ├── invoice-form.component.ts
│   ├── invoice-form.component.html
│   └── invoice-form.component.scss
├── index.ts
├── invoices.module.ts
└── invoices-module-routing.module.ts
```

---

### 2. Crear modelos base (en `/models/`)

#### **invoice.model.ts** - Modelo principal con colección de items
```typescript
import { InvoiceItem } from './invoice-item.model';

export class Invoice {
  //grid, filter
  invoiceId: number = 0;
  //grid
  personName: string = '';
  personId: number = 0;
  personDocumentType: string = '';
  personDocumentNumber: string = '';
  //grid, filter
  invoiceDescription: string = '';
  //grid, filter
  invoiceCreationDate: Date = new Date();
  invoiceSentDate: Date = new Date();
  creationUserId: number = 0;
  
  // ✅ Colección de items anidados
  items: InvoiceItem[] = [];
}

// Re-export for convenience
export { InvoiceItem } from './invoice-item.model';
```

#### **invoice-grid.model.ts** - Modelo para vista de grilla
```typescript
export class InvoiceGrid {
  selected: boolean = false;  // ✅ Requerido para selección
  invoiceId: number = 0;
  personName: string = '';
  invoiceDescription: string = '';
  invoiceCreationDate: Date = new Date();
}
```

#### **invoice-filter.model.ts** - Modelo para filtros
```typescript
export class InvoiceFilter {
  invoiceId?: number = 0;
  personName: string = '';
  invoiceDescription: string = '';
  invoiceCreationDateFrom?: Date;
  invoiceCreationDateTo?: Date;
}
```

#### **invoice-item.model.ts** - Modelo de nivel 2 con colección de detalles
```typescript
import { InvoiceItemDetail } from './invoice-item-detail.model';

export class InvoiceItem {
  invoiceId: number = 0;
  //grid
  itemId: number = 0;
  //grid
  itemDescription: string = '';
  //grid
  itemQuantity: number = 0;
  //grid
  
  // ✅ Propiedades calculadas (getters)
  get itemUnitPrice(): number {
    return this.details.reduce((sum, detail) => sum + detail.detailQuantity * detail.detailUnitPrice, 0);
  }
  
  get itemTotalPrice(): number {
    return this.itemQuantity * this.itemUnitPrice;
  }
  
  // ✅ Colección de detalles anidados
  details: InvoiceItemDetail[] = [];
}

// Re-export for convenience
export { InvoiceItemDetail } from './invoice-item-detail.model';
```

#### **invoice-item-grid.model.ts** - Modelo de grilla para items
```typescript
export class InvoiceItemGrid {
  selected: boolean = false;
  invoiceId: number = 0;
  itemId: number = 0;
  itemDescription: string = '';
  itemQuantity: number = 0;
  itemUnitPrice: number = 0;
  itemTotalPrice: number = 0;
}
```

#### **invoice-item-detail.model.ts** - Modelo de nivel 3
```typescript
export class InvoiceItemDetail {
  invoiceId: number = 0;
  itemId: number = 0;
  //grid
  detailId: number = 0;
  //grid
  detailCode?: string = '';
  //grid
  detailDescription: string = '';
  //grid
  detailQuantity: number = 0;
  //grid
  detailUnitPrice: number = 0;

  // ✅ Propiedad calculada (getter)
  get detailTotalPrice(): number {
    return this.detailQuantity * this.detailUnitPrice;  
  }
}
```

#### **invoice-item-detail-grid.model.ts** - Modelo de grilla para detalles
```typescript
export class InvoiceItemDetailGrid {
  selected: boolean = false;
  invoiceId: number = 0;
  itemId: number = 0;
  detailId: number = 0;
  detailCode?: string = '';
  detailDescription: string = '';
  detailQuantity: number = 0;
  detailUnitPrice: number = 0;
  detailTotalPrice: number = 0;
}
```

---

### 3. Crear servicio (en `/services/`)

#### **invoice.service.ts** - Servicio con integración HTTP real

**Características clave:**
- ✅ Integración con API HTTP usando HttpClient
- ✅ Métodos CRUD: `getInvoices()`, `getInvoice()`, `addInvoice()`, `updateInvoice()`, `deleteInvoice()`
- ✅ Retorna `Observable<PaginatedList<T>>` para listas
- ✅ Implementa manejo de errores con `catchError`
- ✅ Headers con autenticación Bearer token
- ✅ Gestión completa de facturas con items y detalles anidados

```typescript
import { inject, Injectable } from '@angular/core';
import { catchError, Observable, throwError } from 'rxjs';
import { Invoice } from '../models/invoice.model';
import { InvoiceGrid } from '../models/invoice-grid.model';
import { PageFilter, PaginatedList } from '@lib/shared';
import { InvoiceFilter } from '../models/invoice-filter.model';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class InvoiceService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.apiUrl}/invoices`;

  // GET ALL (paginado y filtrado)
  getInvoices(pageFilter: PageFilter, invoiceParameters: InvoiceFilter): Observable<PaginatedList<InvoiceGrid>> {
    const pageParams = pageFilter.toString();    
    const invoiceParams = invoiceParameters.toString();
    const paramsString = invoiceParams ? `${pageParams}&${invoiceParams}` : pageParams;   
    
    return this.http.get<PaginatedList<InvoiceGrid>>(`${this.apiUrl}?${paramsString}`, {
      headers: this.getHeaders()
    });
  }

  // GET BY ID
  getInvoice(id: number): Observable<Invoice> {    
    return this.http.get<Invoice>(`${this.apiUrl}/${id}`, {
      headers: this.getHeaders()
    }).pipe(
      catchError(error => {
        console.error('Error fetching invoice:', error);
        return throwError(() => error);
      })
    );
  }

  // CREATE
  addInvoice(invoice: Invoice): Observable<Invoice> {    
    const { invoiceId, ...createData } = invoice;
    return this.http.post<Invoice>(this.apiUrl, createData, {
      headers: this.getHeaders()
    }).pipe(
      catchError(error => {
        console.error('Error creating invoice:', error);
        return throwError(() => error);
      })
    );
  }

  // UPDATE
  updateInvoice(invoice: Invoice): Observable<Invoice> {
    const { invoiceId, ...updateData } = invoice;
    return this.http.patch<Invoice>(`${this.apiUrl}/${invoiceId}`, updateData, {
      headers: this.getHeaders()
    }).pipe(
      catchError(error => {
        console.error('Error updating invoice:', error);
        return throwError(() => error);
      })
    );
  }
  
  // DELETE
  deleteInvoice(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`, {
      headers: this.getHeaders()
    }).pipe(
      catchError(error => {
        console.error('Error deleting invoice:', error);
        return throwError(() => error);
      })
    );
  }

  private getHeaders(): HttpHeaders {
    const token = localStorage.getItem('token');
    return new HttpHeaders({
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    });
  }
}
```

---

## FASE 2: COMPONENTES DE GRILLA Y FILTRO (NIVEL 1)

### 4. Crear componente invoice-grid-filter

**Ubicación:** `/invoices-container/invoice-grid-filter/`

**Características:**
- ✅ Componente standalone con imports propios
- ✅ Usa componentes de `@lib/shared`
- ✅ FormGroup reactivo con campos del filtro
- ✅ Evento `@Output() apply: EventEmitter<InvoiceFilter>`
- ✅ Acciones integradas con ActionService

**Template HTML:**
```html
<lfsoft-shared-form [title]="'TITLE.filter' | translate" [showActions]="false">
  <div data>
    <form [formGroup]="filterForm" class="filter">
      <div class="filter__group">
        <label for="invoiceId">{{ 'LABEL.invoiceId' | translate }}</label>
        <input id="invoiceId" type="number" formControlName="invoiceId" class="filter__control">
      </div>
      
      <div class="filter__group">
        <label for="personName">{{ 'LABEL.personName' | translate }}</label>
        <input id="personName" type="text" formControlName="personName" class="filter__control">
      </div>
      
      <div class="filter__group">
        <label for="invoiceDescription">{{ 'LABEL.description' | translate }}</label>
        <input id="invoiceDescription" type="text" formControlName="invoiceDescription" class="filter__control">
      </div>

      <div class="filter__group">
        <label for="dateFrom">{{ 'LABEL.dateFrom' | translate }}</label>
        <input id="dateFrom" type="date" formControlName="invoiceCreationDateFrom" class="filter__control">
      </div>

      <div class="filter__group">
        <label for="dateTo">{{ 'LABEL.dateTo' | translate }}</label>
        <input id="dateTo" type="date" formControlName="invoiceCreationDateTo" class="filter__control">
      </div>
    </form>
  </div>
  
  <div footerContent>
    <lfsoft-shared-actions (action)="onAction($event)"></lfsoft-shared-actions>
  </div>
</lfsoft-shared-form>
```

**Component TypeScript:**
```typescript
import { Component, EventEmitter, Output, OnInit, Input } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { InvoiceFilter } from '../../models/invoice-filter.model';
import { CommonModule } from '@angular/common';
import { GenericFormComponent, GenericActionsComponent, TranslatePipe, ActionService, EnumActionsType } from '@lib/shared';

@Component({
  selector: 'lfsoft-sales-invoice-grid-filter',
  templateUrl: './invoice-grid-filter.component.html',
  styleUrls: ['./invoice-grid-filter.component.scss'],
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, GenericFormComponent, GenericActionsComponent, TranslatePipe],
  providers: [ActionService]
})
export class InvoiceGridFilterComponent implements OnInit {
  @Input() filter: InvoiceFilter = new InvoiceFilter();
  @Output() apply = new EventEmitter<InvoiceFilter>();

  filterForm: FormGroup;

  constructor(
    private fb: FormBuilder,
    private _actionService: ActionService
  ) {
    this.filterForm = this.fb.group({
      invoiceId: [0],
      personName: [''],
      invoiceDescription: [''],
      invoiceCreationDateFrom: [null],
      invoiceCreationDateTo: [null]
    });
  }

  ngOnInit(): void {
    this._loadSecurityActions();
    this.filterForm.patchValue(this.filter);
  }

  onAction(action: EnumActionsType): void {
    if (action === EnumActionsType.actionFilter) {
      this._applyFilter();
    } else if (action === EnumActionsType.actionClear) {
      this._clearFilter();
    }
  }

  private _applyFilter(): void {
    const filterValue = this.filterForm.value as InvoiceFilter;
    this.apply.emit(filterValue);
  }

  private _clearFilter(): void {
    this.filterForm.reset({
      invoiceId: 0,
      personName: '',
      invoiceDescription: '',
      invoiceCreationDateFrom: null,
      invoiceCreationDateTo: null
    });
    this._applyFilter();
  }

  private _loadSecurityActions(): void {
    // Cargar acciones desde ActionService
  }
}
```

---

### 5. Crear componente invoice-grid

**Ubicación:** `/invoices-container/invoice-grid/`

**Características:**
- ✅ Componente standalone que usa `GridService`
- ✅ Integración con `lfsoft-shared-grid`
- ✅ Outputs: `edit`, `delete`, `open`, `changePage`
- ✅ Acciones de fila: Editar, Eliminar, Abrir en ventana nueva
- ✅ Suscripción a datos del GridService

**Component TypeScript:**
```typescript
import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { InvoiceGrid } from '../../models/invoice-grid.model';
import { CommonModule } from '@angular/common';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { GenericGridComponent, GridService, PageFilter, EnumActionsType, TranslatePipe } from '@lib/shared';

@Component({
  selector: 'lfsoft-sales-invoice-grid',
  templateUrl: './invoice-grid.component.html',
  styleUrls: ['./invoice-grid.component.scss'],
  standalone: true,
  imports: [CommonModule, GenericGridComponent, TranslatePipe]
})
export class InvoiceGridComponent implements OnInit {
  @Output() edit = new EventEmitter<InvoiceGrid>();
  @Output() delete = new EventEmitter<InvoiceGrid>();
  @Output() open = new EventEmitter<InvoiceGrid>();
  @Output() changePage = new EventEmitter<PageFilter>();

  invoices: InvoiceGrid[] = [];

  constructor(private _gridService: GridService<InvoiceGrid>) {}

  ngOnInit(): void {
    this._gridService.data$
      .pipe(takeUntilDestroyed(this._destroyRef))
      .subscribe(data => {
        this.invoices = data;
      });
  }

  onAction(action: EnumActionsType, invoice: InvoiceGrid): void {
    switch (action) {
      case EnumActionsType.actionEdit:
        this.edit.emit(invoice);
        break;
      case EnumActionsType.actionDelete:
        this.delete.emit(invoice);
        break;
      case EnumActionsType.actionOpen:
        this.open.emit(invoice);
        break;
    }
  }

  onPageChange(pageFilter: PageFilter): void {
    this.changePage.emit(pageFilter);
  }
}
```

**Template HTML:**
```html
<lfsoft-shared-grid
  [data]="invoices"
  (action)="onAction($event.action, $event.row)"
  (changePage)="onPageChange($event)">
</lfsoft-shared-grid>
```

---

## FASE 3: CONTENEDOR PRINCIPAL CON PESTAÑAS (NIVEL 1)

### 6. Crear componente invoices-container

**Ubicación:** `/invoices-container/`

**Responsabilidades:**
- ✅ Gestión de pestañas con patrón optimizado
- ✅ Integración de grid y filter  
- ✅ Acciones principales (Nuevo, Refrescar, Home, Logout)
- ✅ Comunicación entre componentes hijos
- ✅ Navegación y enrutamiento
- ✅ Integración con servicios de seguridad

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
