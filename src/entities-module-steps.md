# Plan de Instrucciones para Crear un Módulo de Entidades

> **Nota:** Este documento define el estándar para crear módulos CRUD en Angular siguiendo los patrones establecidos en el proyecto.

---

## Índice
1. [Estructura de Carpetas](#1-estructura-de-carpetas)
2. [Modelos](#2-modelos)
3. [Servicio](#3-servicio)
4. [Componente Grid Filter](#4-componente-grid-filter)
5. [Componente Grid](#5-componente-grid)
6. [Componente Drawer](#6-componente-drawer)
7. [Componente Form](#7-componente-form)
8. [Componente Container](#8-componente-container)
9. [Componente Form Container](#9-componente-form-container)
10. [Módulo y Routing](#10-módulo-y-routing)
11. [Actualizar App Routes](#11-actualizar-app-routes)
12. [Agregar Navegación en Home](#12-agregar-navegación-en-home)
13. [Configuraciones Dinámicas](#13-configuraciones-dinámicas)
14. [Security y Permisos](#14-security-y-permisos)
15. [Grid Configuration Service](#15-grid-configuration-service)
16. [Directivas y Utilidades](#16-directivas-y-utilidades)

---

## 1. Estructura de Carpetas

Crear la siguiente estructura de directorios:

```
src/app/components/[nombre]-module/
├── models/
│   ├── [nombre].model.ts
│   ├── [nombre]-grid.model.ts
│   └── [nombre]-filter.model.ts
├── services/
│   └── [nombre].service.ts
├── [nombre]-container/
│   ├── [nombre]-container.component.ts
│   ├── [nombre]-container.component.html
│   ├── [nombre]-container.component.scss
│   ├── [nombre]-grid/
│   │   ├── [nombre]-grid.component.ts
│   │   ├── [nombre]-grid.component.html
│   │   └── [nombre]-grid.component.scss
│   └── [nombre]-grid-filter/
│       ├── [nombre]-grid-filter.component.ts
│       ├── [nombre]-grid-filter.component.html
│       └── [nombre]-grid-filter.component.scss
├── [nombre]-form/
│   ├── [nombre]-form.component.ts
│   ├── [nombre]-form.component.html
│   └── [nombre]-form.component.scss
├── [nombre]-form-container/
│   ├── [nombre]-form-container.component.ts
│   ├── [nombre]-form-container.component.html
│   └── [nombre]-form-container.component.scss
├── [nombre]-drawer/
│   ├── [nombre]-drawer.component.ts
│   ├── [nombre]-drawer.component.html
│   └── [nombre]-drawer.component.scss
├── [nombre]-module.module.ts
└── [nombre]-module-routing.module.ts
```

---

## 2. Modelos

### 2.1 Modelo Base (`[nombre].model.ts`)
Contiene todos los campos de la entidad:

```typescript
export class Entity {
  id: number = 0;
  description: string = '';
  // Agregar todos los campos necesarios
}
```

### 2.2 Modelo Grid (`[nombre]-grid.model.ts`)
Campos visibles en la grilla (solo los necesarios para mostrar):

```typescript
export class EntityGrid {
  selected: boolean = false;  // SIEMPRE incluir para selección
  id: number = 0;
  description: string = '';
  // Solo campos que se muestran en la grilla
}
```

### 2.3 Modelo Filter (`[nombre]-filter.model.ts`)
Implementa `QueryParams` con método `toString()`:

```typescript
import { QueryParams } from "../../../generic/models/interfaces/query-params.interface";

export class EntityFilter implements QueryParams {
  id?: number;
  description?: string;

  toString(): string {
    const params = new URLSearchParams();
    if (this.id !== undefined && this.id !== null) {
      params.append('id', this.id.toString());
    }
    if (this.description !== undefined && this.description !== null && this.description !== '') {
      params.append('description', this.description);
    }
    return params.toString();
  }
}
```

---

## 3. Servicio

### 3.1 Estructura del Servicio (`[nombre].service.ts`)

```typescript
import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, catchError, throwError } from 'rxjs';
import { PageFilter } from '../../../generic/models/page-filter.model';
import { PaginatedList } from '../../../generic/models/paginated-list.model';
import { EntityFilter } from '../models/entity-filter.model';
import { Entity } from '../models/entity.model';
import { EntityGrid } from '../models/entity-grid.model';
import { environment } from '../../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class EntityService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.apiUrl}/entities`;

  // GET ALL (paginado y filtrado)
  getEntities(pageFilter: PageFilter, entityParameters: EntityFilter): Observable<PaginatedList<EntityGrid>> {
    const pageParams = pageFilter.toString();    
    const entityParams = entityParameters.toString();
    const paramsString = entityParams ? `${pageParams}&${entityParams}` : pageParams;   
    
    return this.http.get<PaginatedList<EntityGrid>>(`${this.apiUrl}?${paramsString}`, {
      headers: this.getHeaders()
    });
  }

  // GET BY ID
  getEntity(id: number): Observable<Entity> {    
    return this.http.get<Entity>(`${this.apiUrl}/${id}`, {
      headers: this.getHeaders()
    }).pipe(
      catchError(error => {
        console.error('Error fetching entity:', error);
        return throwError(() => error);
      })
    );
  }

  // CREATE
  addEntity(entity: Entity): Observable<Entity> {    
    const { id, ...createData } = entity;
    return this.http.post<Entity>(this.apiUrl, createData, {
      headers: this.getHeaders()
    }).pipe(
      catchError(error => {
        console.error('Error creating entity:', error);
        return throwError(() => error);
      })
    );
  }

  // UPDATE
  updateEntity(entity: Entity): Observable<Entity> {
    const { id, ...updateData } = entity;
    return this.http.patch<Entity>(`${this.apiUrl}/${id}`, updateData, {
      headers: this.getHeaders()
    }).pipe(
      catchError(error => {
        console.error('Error updating entity:', error);
        return throwError(() => error);
      })
    );
  }
  
  // DELETE
  deleteEntity(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`, {
      headers: this.getHeaders()
    }).pipe(
      catchError(error => {
        console.error('Error deleting entity:', error);
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

## 4. Componente Grid Filter

### 4.1 Componente (`[nombre]-grid-filter.component.ts`)

```typescript
import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatTabsModule } from '@angular/material/tabs';
import { EnumActionsType } from '../../../../generic/generic-actions/enums/actions-type.enums';
import { GenericActionsComponent } from '../../../../generic/generic-actions/generic-actions.component';
import { GenericFormComponent } from '../../../../generic/generic-form/generic-form.component';
import { ActionService } from '../../../../generic/generic-actions/services/actions.service';
import { Action } from '../../../../generic/generic-actions/models/actions.model';
import { TranslatePipe } from '../../../../generic/generic-translate/translate.pipe';
import { EntityFilter } from '../../models/entity-filter.model';

@Component({
  selector: 'app-entity-grid-filter',
  templateUrl: './entity-grid-filter.component.html',
  styleUrls: ['./entity-grid-filter.component.scss'],
  standalone: true,
  imports: [
    CommonModule, ReactiveFormsModule, FormsModule,
    MatButtonModule, MatTabsModule,
    GenericFormComponent, GenericActionsComponent, TranslatePipe
  ],
  providers: [ActionService]
})
export class EntityGridFilterComponent implements OnInit {
  @Input() set filter(filter: EntityFilter) { 
    if (!filter) return;
    this._updateForm(filter);
  }
  @Output() apply = new EventEmitter<EntityFilter>();
    
  form: FormGroup = new FormGroup({});
  
  constructor(private fb: FormBuilder, private _actionService: ActionService) { 
    this._createForm();    
  }

  ngOnInit(): void {
    this._loadSecurityActions();
  }
  
  onAction(action: EnumActionsType): void {
    switch (action) {
      case EnumActionsType.actionApply:
        this._apply();        
        break;
      case EnumActionsType.actionReset:
        this._resetFilter();
        break;
    }
  }

  private _createForm() {
    this.form = this.fb.group({
      id: [null],
      description: [null]
    });
  }

  private _updateForm(filter: EntityFilter): void {
    this.form.patchValue({
      id: filter.id,
      description: filter.description
    });
  }

  private _apply(): void {
    const filter = new EntityFilter();
    filter.id = this.form.get('id')?.value;
    filter.description = this.form.get('description')?.value;
    this.apply.emit(filter);
  }

  private _resetFilter(): void {
    this.form.reset();
    this.apply.emit(new EntityFilter());
  }

  private _loadSecurityActions(): void {
    const actions: Action[] = [
      new Action('BUTTON.filter', EnumActionsType.actionApply, 'filter_alt', false),
      new Action('BUTTON.clear', EnumActionsType.actionReset, 'restart_alt', false),
    ];
    this._actionService.setActions(actions);
  }
}
```

### 4.2 Template (`[nombre]-grid-filter.component.html`)

```html
<app-generic-form [title]="'TITLE.filter' | translate">
  <div bodyTop>
    <mat-tab-group>
      <mat-tab>
        <ng-template mat-tab-label>            
          <div class="entities-filter-tab">
            <div class="entities-filter-tab__label">
              {{ 'TITLE.entityData' | translate }}                     
            </div>
          </div>
        </ng-template>
        <form [formGroup]="form">
          <div class="entities-filter">
            <div class="entities-filter__group" col-span="6">
              <label class="entities-filter__label" for="id">{{ 'LABEL.number' | translate }}</label>
              <input id="id" type="number" formControlName="id" class="entities-filter__control">
            </div>
            <div class="entities-filter__group" col-span="6">
              <label class="entities-filter__label" for="description">{{ 'LABEL.description' | translate }}</label>
              <input id="description" type="text" formControlName="description" class="entities-filter__control">
            </div>
          </div>
        </form>
      </mat-tab>
    </mat-tab-group>
  </div>

  <app-generic-actions 
    footerContent
    class="form-actions--footer"
    (action)="onAction($event)">
  </app-generic-actions>
</app-generic-form>
```

### 4.3 Estilos (`[nombre]-grid-filter.component.scss`)

```scss
@import './../../../../styles/form.scss';

.entities-filter {
  @extend .form-grid;
  
  &__group {
    @extend .form-group;
  }
  
  &__label {
    @extend .form-label;
  }
  
  &__control {
    @extend .form-control;
  }
}

.entities-filter-tab {
  display: flex;
  align-items: center;
  
  &__label {
    font-size: 0.875rem;
  }
}
```

---

## 5. Componente Grid

### 5.1 Componente (`[nombre]-grid.component.ts`)

```typescript
import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { Sort } from '@angular/material/sort';
import { EnumActionsType } from '../../../../generic/generic-actions/enums/actions-type.enums';
import { EnumActionsViewType } from '../../../../generic/generic-actions/enums/actions-view-type.enums';
import { EnumActionsStyle } from '../../../../generic/generic-actions/enums/actions-styles.enums';
import { GenericActionsComponent } from '../../../../generic/generic-actions/generic-actions.component';
import { GenericGridComponent } from '../../../../generic/generic-grid/generic-grid.component';
import { GridColumn } from '../../../../generic/generic-grid/models/grid-column.model';
import { GridService } from '../../../../generic/generic-grid/services/grid.service';
import { PageFilter } from '../../../../generic/models/page-filter.model';
import { Action } from '../../../../generic/generic-actions/models/actions.model';
import { TranslationService } from '../../../../generic/generic-translate/translation.service';
import { EntityGrid } from '../../models/entity-grid.model';

@Component({
  selector: 'app-entity-grid',
  templateUrl: './entity-grid.component.html',
  styleUrls: ['./entity-grid.component.scss'],
  standalone: true,
  imports: [GenericGridComponent, GenericActionsComponent],
  providers: []
})
export class EntityGridComponent implements OnInit {
  @Output() edit = new EventEmitter<EntityGrid>();
  @Output() delete = new EventEmitter<EntityGrid>();
  @Output() open = new EventEmitter<EntityGrid>();
  @Output() sortChange = new EventEmitter<PageFilter>();
  @Output() scrollEndChange = new EventEmitter<void>();
  
  columns: GridColumn<EntityGrid>[] = [];

  constructor(
    private _gridService: GridService<EntityGrid>,
    private _translationService: TranslationService
  ) { 
    this._inicializeColumns();
  }
  
  ngOnInit(): void {    
    this._gridService.setColumns(this.columns);
    this._loadSecurityActions();
  }

  onSortChange(event: Sort) {
    const pageFilter = new PageFilter();
    pageFilter.sortField = event.active;
    pageFilter.sortDirection = event.direction;
    this.sortChange.emit(pageFilter);
  }

  onLoadNextPage() {
    this.scrollEndChange.emit();
  }

  onEdit(entity: EntityGrid) {
    this.edit.emit(entity);
  }

  onDelete(entity: EntityGrid) {
    this.delete.emit(entity);
  }

  onOpen(entity: EntityGrid) {
    this.open.emit(entity);
  }

  private _inicializeColumns(): void {
    this.columns = [
      { 
        field: 'id', 
        header: 'LABEL.id',
        sortable: true,
        align: 'center',
        width: '80px'
      },
      { 
        field: 'description', 
        header: 'LABEL.description',
        sortable: true
      }
    ];
  }

  private _loadSecurityActions(): void {
    const actions: Action[] = [
      new Action('', EnumActionsType.actionEdit, 'edit', false, 
        EnumActionsViewType.view16x16, EnumActionsStyle.primary),
      new Action('', EnumActionsType.actionDelete, 'delete', false, 
        EnumActionsViewType.view16x16, EnumActionsStyle.primary),
      new Action('', EnumActionsType.actionOpen, 'open_in_new', false, 
        EnumActionsViewType.view16x16, EnumActionsStyle.primary),
    ];
    this._gridService.setActions(actions);
  }
}
```

### 5.2 Template (`[nombre]-grid.component.html`)

```html
<div class="entity-grid__container">
  <app-generic-grid    
    [infiniteScroll]="true"
    [itemHeight]="48"
    (scrollEnd)="onLoadNextPage()"
    [pageSize]="15"
    (sortChange)="onSortChange($event)"
    (edit)="onEdit($event)"
    (delete)="onDelete($event)"
    (open)="onOpen($event)">   
  </app-generic-grid>
</div>
```

### 5.3 Estilos (`[nombre]-grid.component.scss`)

```scss
.entity-grid__container {
  display: block;
  padding: 0;
  height: 100%;
  width: 100%;
}
```

---

## 6. Componente Drawer

### 6.1 Componente (`[nombre]-drawer.component.ts`)

```typescript
import { Component, Input, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { EnumActionsType } from '../../../generic/generic-actions/enums/actions-type.enums';
import { GenericDrawerComponent } from '../../../generic/generic-drawer/generic-drawer.component';
import { DrawerService } from '../../../generic/generic-drawer/services/drawer.service';
import { MessagesService } from '../../../generic/generic-message/services/message.service';
import { EnumMessageType } from '../../../generic/generic-message/enums/message-type.model';
import { EntityFormComponent } from '../entity-form/entity-form.component';
import { Entity } from '../models/entity.model';

@Component({
  selector: 'app-entity-drawer',
  templateUrl: './entity-drawer.component.html',
  styleUrls: ['./entity-drawer.component.scss'],
  standalone: true,
  imports: [CommonModule, GenericDrawerComponent, EntityFormComponent]
})
export class EntityDrawerComponent {
  @Input() entityId: number = 0;
  
  private _drawerService = inject(DrawerService);
  private _messagesService = inject(MessagesService);

  onCancelEntity(): void {
    this._drawerService.hide(EnumActionsType.actionCancel);
  }

  onSaveEntity(entity: Entity): void {
    this._drawerService.hide(EnumActionsType.actionSave);
    this._messagesService.addMessage("MESSAGE.successSave", EnumMessageType.Info);
  }
}
```

### 6.2 Template (`[nombre]-drawer.component.html`)

```html
<app-generic-drawer>
  <app-entity-form 
    [entityId]="entityId"
    (save)="onSaveEntity($event)"
    (cancel)="onCancelEntity()">
  </app-entity-form>
</app-generic-drawer>
```

---

## 7. Componente Form

### 7.1 Componente (`[nombre]-form.component.ts`)

```typescript
import { Component, EventEmitter, Input, OnInit, OnDestroy, Output, DestroyRef, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { RouterOutlet, ActivatedRoute } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { EnumActionsType } from '../../../generic/generic-actions/enums/actions-type.enums';
import { GenericActionsComponent } from '../../../generic/generic-actions/generic-actions.component';
import { GenericFormComponent } from '../../../generic/generic-form/generic-form.component';
import { ActionService } from '../../../generic/generic-actions/services/actions.service';
import { Action } from '../../../generic/generic-actions/models/actions.model';
import { FormValidationsDirective } from '../../../generic/generic-form-validations/form-validations.directive';
import { SkeletonDirective } from '../../../generic/generic-skeleton/skeleton.directive';
import { TranslatePipe } from '../../../generic/generic-translate/translate.pipe';
import { MessagesService } from '../../../generic/generic-message/services/message.service';
import { EnumMessageType } from '../../../generic/generic-message/enums/message-type.model';
import { ModalService } from '../../../generic/generic-modal/services/modal.service';
import { CONFIRM_CANCEL } from '../../../generic/generic-modal/models/modal-messages';
import { Entity } from '../models/entity.model';
import { EntityService } from '../services/entity.service';

@Component({
  selector: 'app-entity-form',
  templateUrl: './entity-form.component.html',
  styleUrls: ['./entity-form.component.scss'],
  standalone: true,
  imports: [
    CommonModule, ReactiveFormsModule, RouterOutlet, MatButtonModule,
    GenericFormComponent, GenericActionsComponent, 
    FormValidationsDirective, TranslatePipe, SkeletonDirective
  ],
  providers: [ActionService]
})
export class EntityFormComponent implements OnInit, OnDestroy {
  @Input() entityId: number = 0;
  @Output() save = new EventEmitter<Entity>();
  @Output() cancel = new EventEmitter<void>();

  isLoading: boolean = true;
  entityForm: FormGroup = new FormGroup({});
  entity: Entity = new Entity();
  
  private readonly _destroyRef = inject(DestroyRef);

  constructor(
    private fb: FormBuilder, 
    private _entityService: EntityService, 
    private _route: ActivatedRoute, 
    private _actionService: ActionService, 
    private _messagesService: MessagesService, 
    private _modalService: ModalService
  ) {    
    this._createForm();
  }

  ngOnInit(): void {
    this._loadSecurityActions();
    
    if (this.entityId > 0) {
      this._loadEntity(this.entityId);
    } else {
      this.isLoading = false;
    }
  }

  ngOnDestroy(): void {
    // DestroyRef maneja las suscripciones automáticamente
  }

  onAction(action: EnumActionsType): void {
    switch (action) {
      case EnumActionsType.actionSave:
        this._save();
        break;
      case EnumActionsType.actionCancel:
        this._cancel();
        break;
    }
  }

  isReadyToSave(): boolean {
    return this.entityForm.valid && this.entityForm.dirty;
  }

  private _createForm() {
    this.entityForm = this.fb.group({
      description: [null, [Validators.required, Validators.minLength(3)]]
    });
    
    this.entityForm.statusChanges
      .pipe(takeUntilDestroyed(this._destroyRef))
      .subscribe(() => {
        this._enabledActions();
      });
  }

  private _loadEntity(id: number): void {
    this._entityService.getEntity(id)
      .pipe(takeUntilDestroyed(this._destroyRef))
      .subscribe({
        next: (entity) => {
          this.entity = entity;
          this._updateForm(entity);
          this.isLoading = false;
        },
        error: () => {
          this._messagesService.addMessage("MESSAGE.errorLoadingEntity", EnumMessageType.Error);
          this.isLoading = false;
        }
      });
  }

  private _updateForm(entity: Entity): void {
    this.entityForm.patchValue({
      description: entity.description
    });
  }

  private _save(): void {
    if (!this.isReadyToSave()) return;

    const entity: Entity = {
      id: this.entityId,
      description: this.entityForm.get('description')?.value
    };

    const operation = this.entityId === 0 
      ? this._entityService.addEntity(entity)
      : this._entityService.updateEntity(entity);

    operation
      .pipe(takeUntilDestroyed(this._destroyRef))
      .subscribe({
        next: (savedEntity) => {
          this.entity = savedEntity;
          this.entityId = savedEntity.id;
          this.entityForm.markAsPristine();
          this.save.emit(savedEntity);
        },
        error: () => {
          this._messagesService.addMessage("MESSAGE.errorSavingEntity", EnumMessageType.Error);
        }
      });
  }

  private _cancel(): void {
    if (this.entityForm.dirty) {
      this._modalService.showModal(CONFIRM_CANCEL)
        .pipe(takeUntilDestroyed(this._destroyRef))
        .subscribe(action => {
          if (action === EnumActionsType.actionAccept) {
            this.cancel.emit();
          }
        });
    } else {
      this.cancel.emit();
    }
  }

  private _loadSecurityActions(): void {
    const actions: Action[] = [
      new Action('BUTTON.save', EnumActionsType.actionSave, 'save', true),
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
}
```

### 7.2 Template (`[nombre]-form.component.html`)

```html
<app-generic-form [title]="'TITLE.entityData' | translate">
  <div data>
    <form [formGroup]="entityForm" [appSkeleton]="isLoading" [appFormValidations]="entityForm">
      <div class="entity-form">
        <div class="entity-form__group skeleton-field" col-span="12">
          <label class="entity-form__label" for="description">{{ 'LABEL.description' | translate }}</label>
          <input id="description" type="text" formControlName="description" class="entity-form__control">
        </div>
      </div>
    </form>
  </div>
 
  <app-generic-actions 
    footerContent    
    (actionClick)="onAction($event)">
  </app-generic-actions>
</app-generic-form>
```

### 7.3 Estilos (`[nombre]-form.component.scss`)

```scss
@import './../../../styles/form.scss';

.entity-form {
  @extend .form-grid;
  
  &__group {
    @extend .form-group;
  }
  
  &__label {
    @extend .form-label;
  }
  
  &__control {
    @extend .form-control;
  }
}
```

---

## 8. Componente Container

### 8.1 Propiedades del Componente

```typescript
// Propiedades públicas para pestañas
openedEntitiesId: number[] = [];          // IDs de entidades abiertas
selectedEntityId: number | null = null;   // ID de entidad seleccionada
filterParameters: EntityFilter = new EntityFilter();

// Propiedades privadas
private _dataLoaded: EntityGrid[] = [];
private _openedEntities: Entity[] = [];   // Entidades completas (privada)
private _pageFilter: PageFilter = new PageFilter();
private readonly _destroyRef = inject(DestroyRef);
```

### 8.2 Dependencias del Constructor

```typescript
constructor(
  private _router: Router, 
  private _entityService: EntityService, 
  private _gridService: GridService<EntityGrid>, 
  private _messagesService: MessagesService, 
  private _actionService: ActionService,
  private _modalService: ModalService
) {
  this._createPageFilter();
  this._createFilterParameters();
}
```

### 8.3 Método onEdit() - Consultar Servicio

```typescript
onEdit(entity: EntityGrid): void {
  // Si ya está abierta, solo seleccionarla
  if (this.openedEntitiesId.includes(entity.id)) {
    this.selectedEntityId = entity.id;
    return;
  }
  
  // Consultar el servicio para obtener la entidad completa
  this._entityService.getEntity(entity.id)
    .pipe(takeUntilDestroyed(this._destroyRef))
    .subscribe({
      next: (fullEntity) => {
        this.openedEntitiesId.push(entity.id);
        this._openedEntities.push(fullEntity);
        this.selectedEntityId = entity.id;
      },
      error: () => {
        this._messagesService.addMessage("Error al cargar entidad", EnumMessageType.Error);
      }
    });
}
```

### 8.4 Método getEntityById() - Para Template

```typescript
getEntityById(entityId: number): Entity | undefined {
  const index = this.openedEntitiesId.indexOf(entityId);
  return index !== -1 ? this._openedEntities[index] : undefined;
}
```

### 8.5 Método _closeEntity() - Cerrar Pestaña

```typescript
private _closeEntity(entityId: number): void {
  const index = this.openedEntitiesId.indexOf(entityId);
  if (index !== -1) {
    // Sincronizar ambos arrays
    this.openedEntitiesId.splice(index, 1);
    this._openedEntities.splice(index, 1);
    
    // Seleccionar otra pestaña si quedan
    if (this.openedEntitiesId.length > 0) {
      this.selectedEntityId = this.openedEntitiesId[Math.max(index - 1, 0)];
    } else {
      this.selectedEntityId = null;
    }
  }
}
```

### 8.6 Método _createEntity() - Nueva Entidad

```typescript
private _createEntity(): void {
  const entity = new Entity();  // Usar Entity, NO EntityGrid
  entity.id = 0;
  entity.description = 'Nueva Entidad';
  
  this.openedEntitiesId.push(0);
  this._openedEntities.push(entity);
  this.selectedEntityId = 0;
}
```

### 8.7 Método onSaveEntity() - Actualizar en Memoria

```typescript
onSaveEntity(entity: Entity): void {
  // Actualizar en el array de entidades abiertas
  const index = this.openedEntitiesId.indexOf(entity.id);
  if (index !== -1) {
    this._openedEntities[index] = entity;
  }
  
  // Actualizar en la grilla
  const indexData = this._dataLoaded.findIndex(e => e.id === entity.id);
  if (indexData !== -1) {
    this._dataLoaded[indexData] = this._mapEntityToGrid(entity);
  }
  
  this._gridService.setData(this._dataLoaded);
  this._messagesService.addMessage("MESSAGE.successSave", EnumMessageType.Info);
}

private _mapEntityToGrid(entity: Entity): EntityGrid {
  const entityGrid = new EntityGrid();
  entityGrid.id = entity.id;
  entityGrid.description = entity.description;
  return entityGrid;
}
```

### 8.8 Método onDeleteEntity() - Con Confirmación Modal

```typescript
onDeleteEntity(entity: EntityGrid): void {
  this._modalService.showModal(CONFIRM_DELETE)
    .pipe(takeUntilDestroyed(this._destroyRef))
    .subscribe(action => {          
      if (action === EnumActionsType.actionAccept) {
        this._deleteEntity(entity);
      } 
    });      
}

private _deleteEntity(entity: EntityGrid): void {
  this._entityService.deleteEntity(entity.id)
    .pipe(takeUntilDestroyed(this._destroyRef))
    .subscribe({
      next: () => {
        this._messagesService.addMessage("MESSAGE.successDelete", EnumMessageType.Info);
        // Recargar la grilla
        this._dataLoaded = [];
        this._pageFilter.page = 1;
        this.loadEntities(this._pageFilter, this.filterParameters);
      },
      error: (error) => {
        this._messagesService.addMessage(error, EnumMessageType.Error);
      }
    });
}
```

### 8.9 Template del Container

```html
<app-generic-message></app-generic-message>
<app-generic-layout [title]="'TITLE.entities' | translate" class="entities-container">
    <app-generic-actions 
        headerActions
        (actionClick)="onAction($event)">
    </app-generic-actions>

    <app-entity-grid-filter 
        filterContent
        class="entities-container__filter"
        [filter]="filterParameters"
        (apply)="onFilterApplied($event)">
    </app-entity-grid-filter>
 
    <app-entity-grid 
        gridContent        
        class="entities-container__grid"
        (edit)="onEdit($event)"
        (delete)="onDeleteEntity($event)"
        (open)="onOpenEntity($event)"
        (sortChange)="onSortChange($event)"
        (scrollEndChange)="onLoadNextPage()">        
    </app-entity-grid>

    <div formContent>
        <mat-tab-group>
            <mat-tab *ngFor="let entityId of openedEntitiesId; let i = index">
                <ng-template mat-tab-label>
                    <div class="entities-container__tab" (click)="selectedEntityId = entityId">
                        <div class="entities-container__tab-label">
                            {{ getEntityById(entityId)?.description || 'Nueva Entidad' }}
                        </div>
                        <button mat-icon-button class="entities-container__tab-button" 
                                (click)="onCloseTab(entityId); $event.stopPropagation()">
                            <mat-icon>close</mat-icon>
                        </button>
                    </div>
                </ng-template>
                <app-entity-form 
                    formContent
                    [entityId]="entityId"
                    (save)="onSaveEntity($event)" 
                    (cancel)="onCancelEntity()">
                </app-entity-form>
            </mat-tab>
        </mat-tab-group>
    </div>
</app-generic-layout>
```

### 8.10 Estilos del Container

```scss
@import './../../../styles/container.scss';

.entities-container {
  display: flex;
  flex-direction: column;
  height: 100%;
  width: 100%;

  &__tab {
    @extend .container-tab-header; 
    &-label {
      @extend .container-tab-header__label;
    }   
    &-button {
      @extend .container-tab-header__button;
    }
  }

  &__filter {
    flex: 0 0 auto;
    height: 500px;
  }

  &__grid {
    flex: 1 1 auto;
    min-height: 0;
    height: 100%;
  }
}

.mat-mdc-tab-body {
  overflow: hidden !important;
}
```

---

## 9. Componente Form Container

Para abrir formularios en nueva pestaña del navegador:

### 9.1 Componente (`[nombre]-form-container.component.ts`)

```typescript
import { Component, inject, OnInit, DestroyRef } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { NgIf } from '@angular/common';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { GenericLayoutComponent } from '../../../generic/generic-layout/generic-layout.component';
import { GenericMessageComponent } from '../../../generic/generic-message/generic-message';
import { EnumLayoutType } from '../../../generic/generic-layout/enums/layout-type.enum';
import { MessagesService } from '../../../generic/generic-message/services/message.service';
import { EnumMessageType } from '../../../generic/generic-message/enums/message-type.model';
import { EntityFormComponent } from '../entity-form/entity-form.component';
import { Entity } from '../models/entity.model';

@Component({
  selector: 'app-entities-form-container',
  templateUrl: './entities-form-container.component.html',
  styleUrls: ['./entities-form-container.component.scss'],
  standalone: true,
  imports: [NgIf, GenericLayoutComponent, GenericMessageComponent, EntityFormComponent]
})
export class EntitiesFormContainerComponent implements OnInit {
  entityId: number = 0;
  layoutTypes = EnumLayoutType;
  
  private readonly _destroyRef = inject(DestroyRef);
  private _route = inject(ActivatedRoute);
  private _messagesService = inject(MessagesService);

  ngOnInit(): void {
    this._route.queryParams
      .pipe(takeUntilDestroyed(this._destroyRef))
      .subscribe(params => {
        this.entityId = params['id'] ? +params['id'] : 0;
      });
  }

  onSaveEntity(entity: Entity): void {
    this._messagesService.addMessage('MESSAGE.successSave', EnumMessageType.Info);
  }

  onCancelEntity(): void {    
    window.close();
  }
}
```

### 9.2 Template (`[nombre]-form-container.component.html`)

```html
<app-generic-message></app-generic-message>
<app-generic-layout [type]="layoutTypes.form">
  <app-entity-form 
    formContent
    [entityId]="entityId"
    (save)="onSaveEntity($event)"
    (cancel)="onCancelEntity()">
  </app-entity-form>
</app-generic-layout>
```

---

## 10. Módulo y Routing

### 10.1 Module (`[nombre]-module.module.ts`)

```typescript
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { EntitiesModuleRoutingModule } from './entities-module-routing.module';

@NgModule({
  imports: [
    CommonModule,
    ReactiveFormsModule,
    EntitiesModuleRoutingModule
  ],
  declarations: [],
  exports: []
})
export class EntitiesModule {
  constructor() {}
}
```

### 10.2 Routing (`[nombre]-module-routing.module.ts`)

```typescript
import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { EntitiesContainerComponent } from './entities-container/entities-container.component';
import { EntitiesFormContainerComponent } from './entities-form-container/entities-form-container.component';

const routes: Routes = [
  {
    path: 'entities/open',
    component: EntitiesFormContainerComponent,
    data: { operation: 'open' }    
  },
  {
    path: 'entities',
    component: EntitiesContainerComponent    
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class EntitiesModuleRoutingModule {
  constructor() {}
}
```

---

## 11. Actualizar App Routes

Agregar la ruta lazy loading en `app.routes.ts`:

```typescript
{
  path: 'entities-module',
  canActivate: [AuthGuard, PermissionGuard],
  data: { requiredPermissions: [EnumPermissionType.VIEW_ENTITIES] },
  loadChildren: () =>
    import('./components/entities-module/entities-module.module').then(m => m.EntitiesModule)
}
```

---

## 12. Agregar Navegación en Home

Actualizar el componente `app.ts` para agregar el botón de navegación al nuevo módulo, siguiendo el patrón de los botones existentes (persons, quotes, entities, articles, users).

---

## Checklist de Implementación

### Archivos a Crear:
- [ ] `models/[nombre].model.ts`
- [ ] `models/[nombre]-grid.model.ts`
- [ ] `models/[nombre]-filter.model.ts`
- [ ] `services/[nombre].service.ts`
- [ ] `[nombre]-container/[nombre]-container.component.ts|html|scss`
- [ ] `[nombre]-container/[nombre]-grid/[nombre]-grid.component.ts|html|scss`
- [ ] `[nombre]-container/[nombre]-grid-filter/[nombre]-grid-filter.component.ts|html|scss`
- [ ] `[nombre]-form/[nombre]-form.component.ts|html|scss`
- [ ] `[nombre]-form-container/[nombre]-form-container.component.ts|html|scss`
- [ ] `[nombre]-drawer/[nombre]-drawer.component.ts|html|scss`
- [ ] `[nombre]-module.module.ts`
- [ ] `[nombre]-module-routing.module.ts`

### Archivos a Modificar:
- [ ] `app.routes.ts` (agregar lazy loading)
- [ ] `app.ts` (agregar botón de navegación)
- [ ] Permisos en `EnumPermissionType` (si aplica)

### Patrones Clave:
- [ ] Usar `takeUntilDestroyed(this._destroyRef)` para suscripciones
- [ ] Implementar `QueryParams` interface en filtros
- [ ] Usar `ActionService` para gestión de acciones
- [ ] Usar `GridService<T>` para comunicación con grid
- [ ] Usar `MessagesService` para notificaciones
- [ ] Usar `ModalService` para confirmaciones
- [ ] Seguir patrón de pestañas con `openedEntitiesId` y `_openedEntities`

---

## 13. Configuraciones Dinámicas

### 13.1 ConfigurationItem y Personalización de UI

Para módulos que requieren configuraciones dinámicas de interfaz (colores, estilos):

#### 13.1.1 Implementación en Container Component

```typescript
import { Configuration, ConfigurationService, EnumActions } from '@lib/common';
import { ConfigurationItem } from '@lib/common';

export class EntitiesContainerComponent implements OnInit, OnDestroy {
  config: ConfigurationItem = new ConfigurationItem();
  
  constructor(
    // otros servicios...
  ) {
    this._getConfigurationEntities();
  }

  private _getConfigurationEntities(): void {
    const configString = localStorage.getItem('config');
    if (configString) {
      const configEntities = JSON.parse(configString) as Configuration;
      this.config = configEntities.items.find(c => c.literalKey === EnumLiteralKeys.eModule_Entities) || new ConfigurationItem();
    }
  }
}
```

#### 13.1.2 Template con Estilos Dinámicos

```html
<div class="body">
    <div class="floating-toolbar" [style.border]="'4px solid '+config.color">
        <app-generic-actions (action)="onAction($event)"></app-generic-actions>
    </div>

    <app-generic-layout [title]="'TITLE.entities' | translate" class="entities-container">
        <!-- Contenido del layout -->
        
        <div formContent>
            <mat-tab-group [selectedIndex]="selectedTabIndex" [style.border]="'4px solid '+config.color">
                <!-- Tabs content -->
            </mat-tab-group>
        </div>
    </app-generic-layout>
</div>
```

#### 13.1.3 Estilos CSS para Floating Toolbar

```scss
@import 'styles/container.scss';

.body {
  position: relative;
  height: 100vh;
  width: 100vw;
}

.floating-toolbar {
  position: fixed;
  top: 10px;
  right: 10px;
  z-index: 1000;
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 10px rgba(0,0,0,0.1);
  padding: 8px;
}

.entities-container {
  &__tab {
    @extend .container-tab-header; 
    &-label {
      @extend .container-tab-header__label;
    }   
    &-button {
      @extend .container-tab-header__button;
    }
  }
}
```

---

## 14. Security y Permisos

### 14.1 Implementación de UserPermissionsService

#### 14.1.1 Security en Container Component

```typescript
import { AuthService, EnumUserRole } from '@lib/security';
import { UserPermissionsService } from '../../permissions/services/user-permissions.service';

export class EntitiesContainerComponent implements OnInit, OnDestroy {
  constructor(
    private _permissionsEntityService: UserPermissionsService,
    private _authService: AuthService
  ) {}

  ngOnInit(): void {
    this._securityApply();
    // resto de inicialización...
  }

  private _securityApply(): void {
    const actions = this._permissionsEntityService.enabledActions(
      this._authService.getCurrentUser()?.role || EnumUserRole.VIEWER,
      EnumLiteralKeys.eModule_Entities,
      this.makeConditions()
    );
    this._actionService.setActions(actions);
  }

  private makeConditions(): string {
    // Construir condiciones según reglas de negocio
    return '#|V|#'; // Ejemplo: #=campo, |=operador, V=valor
  }
}
```

#### 14.1.2 Security en Form Component

```typescript
export class EntityFormComponent implements OnInit, OnDestroy {
  constructor(
    private _permissionsEntityService: UserPermissionsService,
    private _authService: AuthService
  ) {}

  ngOnInit(): void {
    this._securityApply();
    // resto de inicialización...
  }

  private _securityApply(): void {
    const actions = this._permissionsEntityService.enabledActions(
      this._authService.getCurrentUser()?.role || EnumUserRole.VIEWER,
      EnumLiteralKeys.eModule_Entities,
      this.makeConditions()
    );
    this._actionService.setActions(actions);
  }

  private _enabledActions() {    
    if (this.isReadyToSave()) {
      this._actionService.enable(EnumActions.eAction_Save);
    } else {
      this._actionService.disable(EnumActions.eAction_Save);
    }
  }
}
```

#### 14.1.3 Security en Grid Component

```typescript
export class EntityGridComponent implements OnInit {
  constructor(
    private _permissionsEntityService: UserPermissionsService,
    private _authService: AuthService
  ) {}

  ngOnInit(): void {
    this._gridService.setColumns(this.columns);
    this._securityApply();
  }

  private _securityApply(): void {
    const actions = this._permissionsEntityService.enabledActions(
      this._authService.getCurrentUser()?.role || EnumUserRole.VIEWER,
      EnumLiteralKeys.eGrid_Entities,
      this.makeConditions()
    );
    this._gridService.setActions(actions);
  }

  private makeConditions(): string {
    return '#|V|#';
  }
}
```

### 14.2 Access Control Service

Para control de acceso concurrente:

```typescript
import { AccessControl, AccessControlsService, EnumObjectMode } from '@lib/common';
import { UrlSecurityService } from '@lib/security';

export class EntityFormComponent implements OnInit, OnDestroy {
  constructor(
    private _accessControlService: AccessControlsService,
    private _urlSecurityService: UrlSecurityService
  ) {}

  private _openEntity(id: number): Observable<Entity> {    
    const userId = this._authService.getCurrentUser()?.id || '';
    const terminalId = 'terminal123'; // Obtener ID del terminal real
    
    return this._accessControlService.getAccessControl(userId, terminalId, this.entity.objectKey).pipe(
      takeUntilDestroyed(this._destroyRef),
      switchMap((accessControl: AccessControl | null) => {
        if (accessControl) {        
          this._messagesService.addMessage(
            `${this.entity.objectKey} access denied. Opened in ${accessControl.terminalName} at ${accessControl.createdAt}`, 
            EnumMessageType.Error
          );
        }

        return this._entityService.getEntity(id).pipe(
          takeUntilDestroyed(this._destroyRef),
          map(entity => {
            if (accessControl) {
              entity.objectMode = EnumObjectMode.READONLY;
            }
            return entity;
          })
        );
      })
    );
  }

  private _loadParams(): Observable<void> {    
    return this._route.queryParams.pipe(
      takeUntilDestroyed(this._destroyRef),
      map(params => {
        const idParam = params['id'];
        if (idParam && !this._urlSecurityService.isValidRouteId(idParam)) {
          console.warn('Security: Invalid entity ID detected:', idParam);
          return;
        }
        this.entityId = idParam ? +idParam : 0;
      })
    );
  }
}
```

### 14.3 Literal Keys por Componente

**Nomenclatura estándar:**
- **Módulo Container**: `'eModule_[Nombre]'` (ej: `'eModule_Entities'`)
- **Form Component**: `'eForm_[Nombre]'` (ej: `'eForm_Entities'`) 
- **Grid Component**: `'eGrid_[Nombre]'` (ej: `'eGrid_Entities'`)

---

## 15. Grid Configuration Service

### 15.1 Implementación de GridConfigurationService

Para grillas con configuración dinámica de columnas por usuario:

```typescript
import { GridConfiguration, GridColumnConfiguration, GridConfigurationService, CustomDatePipe } from '@lib/shared';

export class EntityGridComponent implements OnInit {
  private readonly _gridKeyLiteral: string = 'eGrid_Entities';
  private customDatePipe: CustomDatePipe;
  
  constructor(
    private _gridService: GridService<EntityGrid>,
    private _translationService: TranslationService,
    private _authService: AuthService,
    private _gridConfigurationService: GridConfigurationService
  ) { 
    this.customDatePipe = new CustomDatePipe();
    this._loadGridConfiguration();
  }
  
  private _loadGridConfiguration(): void {
    const userId = this._authService.getCurrentUser()?.id || '';    
    this._gridConfigurationService.getGridConfigurationByKey(userId, this._gridKeyLiteral)
      .subscribe(config => {
        if (config) {
          this.columns = config.gridColumns
            .filter(colConfig => colConfig.gridColumnVisible)
            .map(colConfig => this._mapConfigurationColumnToColumn(config, colConfig)); 
          this._gridService.setColumns(this.columns);
        } else {
          this._inicializeColumns();
          this._gridService.setColumns(this.columns);
        }
      });
  }

  private _mapConfigurationColumnToColumn(config: GridConfiguration, configColumn: GridColumnConfiguration): GridColumn<EntityGrid> {
    const column = new GridColumn<EntityGrid>(configColumn.gridColumnField as keyof EntityGrid);
    column.position = configColumn.gridColumnPosition;    
    column.header = this._translationService.translate(configColumn.gridColumnHeader);
    column.sortable = configColumn.gridColumnSortable;
    column.align = configColumn.gridColumnAlign as 'left' | 'right' | 'center';
    column.width = configColumn.gridColumnWidth;
    column.visible = configColumn.gridColumnVisible;
    column.cellBackgroundColor = configColumn.gridColumnCellBackgroundColor || config.gridCellBackgroundColor;
    column.cellTextColor = configColumn.gridColumnCellTextColor || config.gridCellTextColor;
    column.headerBackgroundColor = configColumn.gridColumnHeaderBackgroundColor || config.gridHeaderBackgroundColor;
    column.headerTextColor = configColumn.gridColumnHeaderTextColor || config.gridHeaderTextColor;
    column.cellActionsBackgroundColor = config.gridCellActionsBackgroundColor;
    
    if (configColumn.gridColumnDateFormat) {
      column.datePipe = this.customDatePipe;
    }
    
    return column;
  }

  private _inicializeColumns(): void {
    this.columns = [
      { 
        field: 'id', 
        header: 'LABEL.id',
        sortable: true,
        align: 'center',
        width: '80px',
        cellBackgroundColor: 'var(--grid-primary-bg)',
        cellTextColor: 'var(--grid-primary-text)',
        headerBackgroundColor: 'var(--grid-header-primary-bg)',
        headerTextColor: 'var(--grid-header-primary-text)'
      },
      { 
        field: 'description', 
        header: 'LABEL.description',
        sortable: true
      }
    ];
  }
}
```

---

## 16. Directivas y Utilidades

### 16.1 Skeleton Directive

Para efectos de loading en formularios:

```html
<form [formGroup]="entityForm" [appSkeleton]="isLoading" [appFormValidations]="entityForm">
  <div class="entity-form">
    <div class="entity-form__group skeleton-field" col-span="12">
      <label class="entity-form__label" for="description">{{ 'LABEL.description' | translate }}</label>
      <input id="description" type="text" formControlName="description" class="entity-form__control">
    </div>
  </div>
</form>
```

### 16.2 Form Validations Directive

Para validaciones automáticas de formularios:

```typescript
import { FormValidationsDirective } from '@lib/shared';

// En el componente:
imports: [
  // otros imports...
  FormValidationsDirective
]

// En el template:
[appFormValidations]="entityForm"
```

### 16.3 UrlService para Navegación

```typescript
import { UrlService } from '@lib/shared';

export class EntitiesContainerComponent {
  constructor(private _urlService: UrlService) {}

  private _openArticles(): void {
    this._urlService.openUrl(['articles-module', 'articles']);    
  }

  private _openHome(): void {
    this._urlService.openUrl(['home']);
  }

  private _openEntities(): void {
    this._urlService.openUrl(['entities-module', 'entities']);
  }
}
```

### 16.4 Custom Date Pipe

Para formateo de fechas en grillas:

```typescript
import { CustomDatePipe } from '@lib/shared';

export class EntityGridComponent {
  private customDatePipe: CustomDatePipe;
  
  constructor() { 
    this.customDatePipe = new CustomDatePipe();
  }
  
  // Usar en configuración de columnas:
  if (configColumn.gridColumnDateFormat) {
    column.datePipe = this.customDatePipe;
  }
}
```

---

## 17. Mejores Prácticas y Consideraciones Adicionales

### 17.1 Patrón de Naming de Componentes Genéricos

**✅ USAR:**
- `app-generic-layout`
- `app-generic-form`
- `app-generic-grid`
- `app-generic-actions`
- `app-generic-message`
- `app-generic-drawer`

**❌ NO USAR:**
- `lfsoft-shared-layout`
- `lfsoft-shared-form`
- Otros prefijos no estándar

### 17.2 Patrón de Propiedades de Input/Output

**Container Component:**
```typescript
// Propiedades públicas para pestañas
openedEntitiesId: number[] = [];
selectedEntityId: number | null = null;
private _openedEntities: Entity[] = []; // Array privado con entidades completas
```

**Form Component:**
```typescript
// Usar entityId para consistencia (no userId, personId, etc.)
@Input() entityId: number = 0;
@Output() save = new EventEmitter<Entity>();
@Output() cancel = new EventEmitter<void>();
```

### 17.3 Gestión de Suscripciones

**✅ USAR siempre:**
```typescript
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

export class EntityComponent implements OnInit, OnDestroy {
  private readonly _destroyRef = inject(DestroyRef);

  ngOnInit(): void {
    this._service.getData()
      .pipe(takeUntilDestroyed(this._destroyRef))
      .subscribe(data => {
        // manejar datos
      });
  }

  ngOnDestroy(): void {
    // DestroyRef maneja automáticamente las cancelaciones
  }
}
```

### 17.4 Manejo de Errores Consistente

```typescript
// En servicios
catchError(error => {
  console.error('Error fetching entity:', error);
  return throwError(() => error);
})

// En componentes
.subscribe({
  next: (data) => {
    // manejar éxito
  },
  error: (error) => {
    this._messagesService.addMessage("MESSAGE.errorLoadingEntity", EnumMessageType.Error);
  }
});
```

---

## Checklist de Implementación Actualizado

### **Archivos Básicos a Crear:**
- [ ] `models/[nombre].model.ts` - Hereda de `EntityObject`
- [ ] `models/[nombre]-grid.model.ts` - Hereda de `GridObject`, incluye `selected`
- [ ] `models/[nombre]-filter.model.ts` - Implementa `QueryParams` con `toString()`
- [ ] `services/[nombre].service.ts` - CRUD completo con manejo de errores

### **Componentes Core:**
- [ ] `[nombre]-container/[nombre]-container.component.ts|html|scss`
- [ ] `[nombre]-container/[nombre]-grid/[nombre]-grid.component.ts|html|scss`
- [ ] `[nombre]-container/[nombre]-grid-filter/[nombre]-grid-filter.component.ts|html|scss`
- [ ] `[nombre]-form/[nombre]-form.component.ts|html|scss`
- [ ] `[nombre]-form-container/[nombre]-form-container.component.ts|html|scss`
- [ ] `[nombre]-drawer/[nombre]-drawer.component.ts|html|scss`

### **Módulo y Routing:**
- [ ] `[nombre]-module.module.ts`
- [ ] `[nombre]-module-routing.module.ts`

### **Configuración Global:**
- [ ] Actualizar `app.routes.ts` - Agregar `AuthGuard`, `PermissionGuard`
- [ ] Actualizar navegación en `app.ts`
- [ ] Configurar permisos en `EnumPermissionType`

### **Funcionalidades Avanzadas (Opcional):**
- [ ] **Configuraciones dinámicas** - `ConfigurationItem`, floating toolbar
- [ ] **Security granular** - `UserPermissionsService` por componente
- [ ] **Grid configuration** - `GridConfigurationService` personalizable
- [ ] **Access control** - `AccessControlsService` para concurrencia
- [ ] **URL security** - `UrlSecurityService` para validaciones

### **Patrones de Código Críticos:**
- [ ] **Método `getEntityById()`** en container (crítico para template)
- [ ] **Pattern de pestañas** con `openedEntitiesId` + `_openedEntities`
- [ ] **Consulta al servicio** en `onEdit()` para entidades completas
- [ ] **Mapeo `_mapEntityToGrid()`** para sincronización
- [ ] **Security methods** `_securityApply()` en todos los componentes

### **Estilos y CSS:**
- [ ] Usar imports estándar: `@import './../../../../styles/form.scss'`
- [ ] Clases CSS: `.form-grid`, `.form-group`, `.form-label`, `.form-control`
- [ ] Container tabs: `.container-tab-header`, `.container-tab-header__label`

### **Directivas y Validaciones:**
- [ ] `[appSkeleton]` para loading states
- [ ] `[appFormValidations]` para validaciones automáticas
- [ ] `takeUntilDestroyed()` para todas las suscripciones

---

## Beneficios del Patrón Completo

- **Separación clara** entre IDs y datos completos
- **Consulta al servicio** garantiza datos actualizados
- **Mejor rendimiento** y sincronización
- **Patrón reutilizable** en todos los módulos
- **Security granular** por componente y usuario
- **Configuraciones dinámicas** de UI
- **Grillas personalizables** por usuario
- **Control de acceso concurrente**
- **Validaciones automáticas** y manejo de errores consistente

---

> **Nota:** Detenerse en cada paso para esperar confirmación antes de continuar. Las funcionalidades avanzadas (secciones 13-16) son opcionales según los requisitos del proyecto.

---

> **Nota:** Detenerse en cada paso para esperar confirmación antes de continuar.