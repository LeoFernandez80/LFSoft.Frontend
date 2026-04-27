---
agent: agent
---
# Plan: Crear Módulo Entidad

**Estándar para módulos CRUD en estructura de librería utilities**

---

## 1. Estructura Base
```
libs/utilities/src/lib/[nombre-modulo]/
├── models/
│   ├── [nombre].model.ts
│   ├── [nombre]-grid.model.ts
│   └── [nombre]-filter.model.ts
├── services/
│   └── [nombre].service.ts
├── [nombre]s-container/
│   ├── [nombre]s-container.component.ts|html|scss
│   ├── [nombre]s-grid/
│   │   └── [nombre]s-grid.component.ts|html|scss
│   └── [nombre]s-grid-filter/
│       └── [nombre]s-grid-filter.component.ts|html|scss
├── [nombre]-form/
│   └── [nombre]-form.component.ts|html|scss
├── [nombre]s-form-container/
│   └── [nombre]s-form-container.component.ts|html|scss
├── [nombre]-drawer/
│   └── [nombre]-drawer.component.ts|html|scss
├── [nombre]s-module.module.ts
├── [nombre]s-module-routing.module.ts
└── index.ts
```

---

## 2. Modelos

### [nombre].model.ts
```typescript
export class Entity {
  id: number = 0;
  description: string = '';
  // Campos completos de la entidad
}
```

### [nombre]-grid.model.ts
```typescript
export class EntityGrid {
  selected: boolean = false;  // Obligatorio
  id: number = 0;
  description: string = '';
  // Solo campos visibles en grilla
}
```

### [nombre]-filter.model.ts
```typescript
import { QueryParams } from '@lib/shared';

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
    if (params.toString() === '') {
      return '';
    }
    return params.toString();
  }
}
```

---

## 3. Servicio

### [nombre].service.ts
```typescript
import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, map, catchError, throwError } from 'rxjs';
import { PageFilter, PaginatedList } from '@lib/shared';
import { EntityFilter } from '../models/entity-filter.model';
import { Entity } from '../models/entity.model';
import { EntityGrid } from '../models/entity-grid.model';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class EntityService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.apiUrl}/entities`;

  getEntities(pageFilter: PageFilter, entityParameters: EntityFilter): Observable<PaginatedList<EntityGrid>> {
    const pageParams = pageFilter.toString();    
    const entityParams = entityParameters.toString();
    const paramsString = entityParams ? `${pageParams}&${entityParams}` : pageParams;   
    
    return this.http.get<PaginatedList<EntityGrid>>(`${this.apiUrl}?${paramsString}`, {
      headers: this.getHeaders()
    })
  }

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

  addEntity(entity: Entity): Observable<Entity> {    
    const { id, ...updateData } = entity;
    return this.http.post<Entity>(this.apiUrl, updateData, {
      headers: this.getHeaders()
    }).pipe(
      catchError(error => {
        console.error('Error creating entity:', error);
        return throwError(() => error);
      })
    );
  }

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

  /**
   * Obtiene los headers con el token de autenticación
   */
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

## 4. Componentes

**IMPORTANTE: Todos los componentes deben ser standalone con `standalone: true`**

### Grid Filter ([nombre]s-grid-filter)

#### TypeScript
```typescript
import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { EntityFilter } from '../../models/entity-filter.model';
import { MatTab, MatTabsModule } from '@angular/material/tabs';
import { 
  EnumActionsType, 
  GenericActionsComponent, 
  ActionService, 
  GenericFormComponent, 
  Action, 
  TranslatePipe 
} from '@lib/shared';

@Component({
  selector: 'lfsoft-[library]-entity-grid-filter',
  imports: [
    CommonModule, ReactiveFormsModule,
    FormsModule,
    MatButtonModule,
    MatTabsModule,
    GenericFormComponent,
    GenericActionsComponent,
    TranslatePipe
  ],
  templateUrl: './entity-grid-filter.component.html',
  styleUrls: ['./entity-grid-filter.component.scss'],
  standalone: true,
  providers: [ ActionService]
})
export class EntityGridFilterComponent implements OnInit {
  @Input() set filter(filter: EntityFilter) { 
    if (!filter) return;
    this._updateForm(filter);
  };
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

  private _resetFilter(): void {
    this.form.reset();
    this._apply();
  }

  private _apply(): void {
    const filter = this._mapToFilter();    
    this.apply.emit(filter);
  }

  private _mapToFilter(): EntityFilter {
    const formData = this.form.value as EntityFilter;     
    const filter = new EntityFilter();
    filter.id = formData.id;
    filter.description = formData.description;
    // Mapear todos los campos del filtro
    return filter;
  }
  
  private _createForm() {
    this.form = this.fb.group({
      id: [null],
      description: [null]
      // Agregar todos los campos de filtro
    });
  }

  private _updateForm(filter: EntityFilter) {
    this.form.patchValue({
      id: filter.id,
      description: filter.description
      // Agregar todos los campos
    });
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

#### HTML
```html
<lfsoft-shared-form [title]="'TITLE.filter' | translate">
  <div data>
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
              <label class="entities-filter__label" for="id">{{ 'number' | translate }}</label>
              <input 
                id="id"
                type="number"
                name="id"
                formControlName="id"
                class="entities-filter__control">
            </div>
            <div class="entities-filter__group" col-span="6">
              <label class="entities-filter__label" for="description">{{ 'description' | translate }}</label>
              <input 
                id="description"
                type="text"
                name="description"
                formControlName="description"
                class="entities-filter__control">
            </div>
          </div>
        </form>
      </mat-tab>
    </mat-tab-group>
  </div>

  <lfsoft-shared-actions 
    footerContent
    class="form-actions--footer"
    (action)="onAction($event)">
  </lfsoft-shared-actions>
</lfsoft-shared-form>
```

#### SCSS
```scss
@import 'styles/container.scss';
@import 'styles/form.scss';

.entities-filter-tab {
  @extend .container-tab-header;
  
  &__label{
    @extend .container-tab-header__label;
  }  
}

.entities-filter {
  @extend .form;
  @extend .form-container--full;
  
  &__label {
    @extend .form-control-label;
  }

  &__control {
    @extend .form-control;
  }

  &__group {
    @extend .form-group;
  }
}
```

---

### Grid ([nombre]s-grid)

#### TypeScript
```typescript
import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { 
  EnumActionsType, 
  GenericGridComponent, 
  GridColumn, 
  GridService, 
  PageFilter, 
  Action, 
  EnumActionsViewType, 
  TranslationService, 
  EnumActionsStyle 
} from '@lib/shared';
import { EnumPermissionType } from '@lib/security';
import { Sort } from '@angular/material/sort';
import { EntityGrid } from '../../models/entity-grid.model';

@Component({
  selector: 'lfsoft-[library]-entity-grid',
  templateUrl: './entity-grid.component.html',
  styleUrls: ['./entity-grid.component.scss'],
  standalone: true,
  imports: [ GenericGridComponent ],
  providers: [  ]
})
export class EntityGridComponent implements OnInit {
  @Output() edit = new EventEmitter<EntityGrid>();
  @Output() delete = new EventEmitter<EntityGrid>();
  @Output() open = new EventEmitter<EntityGrid>();
  
  @Output() sortChange = new EventEmitter<PageFilter>();
  @Output() scrollEndChange = new EventEmitter<void>();
  
  columns: GridColumn<EntityGrid>[] = [];

  constructor(private _gridService: GridService<EntityGrid>, private _translationService: TranslationService) { 
    this._inicializeColumns();
  }
  
  ngOnInit(): void {    
    this._gridService.setColumns(this.columns);
    this._loadSecurityActions();
  }

  onSortChange(event: Sort) {
    const pageFilter= new PageFilter();
    pageFilter.sortField= event.active;
    pageFilter.sortDirection= event.direction;    
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
      // Agregar todas las columnas necesarias
    ];
  }

  private _loadSecurityActions(): void {
    const actions: Action[] = [
      new Action('', EnumActionsType.actionEdit, 'edit', false, EnumActionsViewType.view16x16, EnumActionsStyle.primary, [EnumPermissionType.EDIT_ENTITY]),
      new Action('', EnumActionsType.actionDelete, 'delete', false, EnumActionsViewType.view16x16, EnumActionsStyle.primary),
      new Action('', EnumActionsType.actionOpen, 'open_in_new', false, EnumActionsViewType.view16x16, EnumActionsStyle.primary),
    ];
    this._gridService.setActions(actions);
  }
}
```

#### HTML
```html
<div class="entity-grid__container">
  <lfsoft-shared-grid    
    [infiniteScroll]="true"
    [itemHeight]="48"
    (scrollEnd)="onLoadNextPage()"
    [pageSize]="15"
    (sortChange)="onSortChange($event)"
    (edit)="onEdit($event)"
    (delete)="onDelete($event)"
    (open)="onOpen($event)">   
  </lfsoft-shared-grid>
</div>
```

#### SCSS
```scss
.entity-grid__container {
  padding: 0;
  flex-direction: column;
  display: block;
  height: 100%;
  width: 100%;
}
```

---

### Container ([nombre]s-container)

#### TypeScript
```typescript
import { Component, OnInit, OnDestroy, DestroyRef, inject } from '@angular/core';
import { EntityGridFilterComponent } from './entity-grid-filter/entity-grid-filter.component';
import { Entity } from '../models/entity.model';
import { ActivatedRoute, Router } from '@angular/router';
import { MatTabsModule } from '@angular/material/tabs';
import { NgFor } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

import { EntityGridComponent } from './entity-grid/entity-grid.component';
import { EntityFormComponent } from '../entity-form/entity-form.component';
import { EntityFilter } from '../models/entity-filter.model';
import { EntityGrid } from '../models/entity-grid.model';
import { 
  EnumActionsType, 
  GenericActionsComponent, 
  ActionService, 
  GridService, 
  GenericLayoutComponent, 
  EnumMessageType, 
  GenericMessageComponent, 
  MessagesService, 
  PageFilter, 
  Action, 
  ModalService, 
  CONFIRM_DELETE, 
  TranslatePipe 
} from '@lib/shared';
import { EntityService } from '../services/entity.service';

@Component({
  selector: 'lfsoft-[library]-entities-container',
  templateUrl: './entities-container.component.html',
  styleUrls: ['./entities-container.component.scss'],
  standalone: true,
  imports: [
    NgFor,
    MatTabsModule,
    MatIconModule,
    TranslatePipe,
    GenericLayoutComponent,
    GenericMessageComponent,
    GenericActionsComponent,
    EntityGridFilterComponent,
    EntityGridComponent,
    EntityFormComponent,
  ],
  providers: [Router, GridService, ActionService]
})
export class EntitiesContainerComponent implements OnInit, OnDestroy {
  openedEntitiesId: number[] = [];
  selectedEntityId: number | null = null;
  filterParameters: EntityFilter = new EntityFilter();
  
  private _dataLoaded: EntityGrid[] = [];
  private _openedEntities: Entity[] = [];
  private _pageFilter: PageFilter = new PageFilter();
  private readonly _destroyRef = inject(DestroyRef);

  constructor(private _router: Router, 
    private _entityService: EntityService, private _gridService: GridService<EntityGrid>, 
    private _messagesService: MessagesService, private _actionService: ActionService,
    private _modalService: ModalService
  ) {
    this._createPageFilter();
    this._createFilterParameters();
  }

  ngOnInit(): void {
    try {
      this._loadSecurityActions();
      this.loadEntities(this._pageFilter, this.filterParameters);
    } catch (error) {
      this._messagesService.addMessage("Error al cargar la página", EnumMessageType.Error);
    }
  }

  ngOnDestroy(): void {
    // El DestroyRef se encarga automáticamente de cancelar todas las suscripciones
  }

  onFilterApplied(filter: EntityFilter): void {
    try {   
      this._dataLoaded = [];   
      this._pageFilter.page = 1;
      this.filterParameters = filter;
      this.loadEntities(this._pageFilter, this.filterParameters);
    } catch (error) {
      this._messagesService.addMessage("Error al aplicar filtro", EnumMessageType.Error);
    }
  }

  onSortChange(pageFilter: PageFilter): void {
    try {      
      this._pageFilter.sortDirection=pageFilter.sortDirection;
      this._pageFilter.sortField=pageFilter.sortField;
      this.loadEntities(this._pageFilter, this.filterParameters);
    } catch (error) {
      this._messagesService.addMessage("ERROR.", EnumMessageType.Error);
    }
  }

  onLoadNextPage(): void {
    try {
      this._pageFilter.page += 1;
      this.loadEntities(this._pageFilter, this.filterParameters);
    } catch (error) {
      this._messagesService.addMessage("Error al cargar la siguiente página", EnumMessageType.Error);
    }
  }

  onAction(action: EnumActionsType): void {
    switch (action) {
      case EnumActionsType.actionNew:
        try {
          this._createEntity();
        } catch (error) {
          this._messagesService.addMessage("Error al crear entidad", EnumMessageType.Error);
        }
        break;
      case EnumActionsType.actionList:
        try {
          this.openedEntitiesId = [];
          this._openedEntities = [];
          this.selectedEntityId = null;
        } catch (error) {
          this._messagesService.addMessage("Error al cerrar pestañas", EnumMessageType.Error);
        }
    }
  }

  onEdit(entity: EntityGrid): void {
    try {
      if (this.openedEntitiesId.includes(entity.id)) {
        this.selectedEntityId = entity.id;
        return;
      }
      
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
    } catch (error) {
      this._messagesService.addMessage("Error al editar entidad", EnumMessageType.Error);
    }
  }

  onDeleteEntity(entity: EntityGrid): void {
    try { 
      this._modalService.showModal(CONFIRM_DELETE)
        .pipe(takeUntilDestroyed(this._destroyRef))
        .subscribe(action => {          
          if (action === EnumActionsType.actionAccept) {
            this._deleteEntity(entity);
          } 
        });      
    } catch (error) {
      this._messagesService.addMessage("Error al eliminar entidad", EnumMessageType.Error);
    }
  }
  
  onOpenEntity(entity: EntityGrid): void {
    try {      
      this._openEntity(entity);
    } catch (error) {
      this._messagesService.addMessage("Error al abrir entidad en nueva pestaña", EnumMessageType.Error);
    }
  }

  onCloseTab(entityId: number): void {
    try {
      this._closeEntity(entityId);
    } catch (error) {
      this._messagesService.addMessage("Error al cerrar pestaña", EnumMessageType.Error);
    }
  }

  onSaveEntity(entity: Entity): void {
    try {
      const index = this.openedEntitiesId.indexOf(entity.id);
      if (index !== -1) {
        this._openedEntities[index] = entity;
      }
      const indexData = this._dataLoaded.findIndex(e => e.id === entity.id);
      if (indexData !== -1) {
        this._dataLoaded[indexData] = this._mapEntityToGrid(entity);
      }
      this._gridService.setData(this._dataLoaded);

      this._messagesService.addMessage("MESSAGE.successSave", EnumMessageType.Info);
    } catch (error) {
      this._messagesService.addMessage("Error al guardar entidad", EnumMessageType.Error);
    }
  }

  onCancelEntity(): void {
    try {
      if (this.selectedEntityId !== null) {
        this._closeEntity(this.selectedEntityId);
      }
    } catch (error) {
      this._messagesService.addMessage("Error al cancelar", EnumMessageType.Error);
    }
  }

  loadEntities(pageFilter: PageFilter, filterParameters: EntityFilter): void {
    this._entityService.getEntities(pageFilter, filterParameters)
      .pipe(takeUntilDestroyed(this._destroyRef))
      .subscribe({
        next: (response) => {           
          this._dataLoaded = this._dataLoaded.concat(response.data);
          this._gridService.setData(this._dataLoaded);
        },
        error: (error) => {
          this._messagesService.addMessage(error, EnumMessageType.Error);
        }
      });
  }

  private _mapEntityToGrid(entity: Entity): EntityGrid {
    const entityGrid = new EntityGrid();
    entityGrid.id = entity.id;
    entityGrid.description = entity.description;
    // Mapear todos los campos
    return entityGrid;
  }

  private _closeEntity(entityId: number): void {
    const index = this.openedEntitiesId.indexOf(entityId);
    if (index !== -1) {
      this.openedEntitiesId.splice(index, 1);
      this._openedEntities.splice(index, 1);
      
      if (this.openedEntitiesId.length > 0) {
        this.selectedEntityId = this.openedEntitiesId[Math.max(index - 1, 0)];
      } else {
        this.selectedEntityId = null;
      }
    }
  }
  
  private _createPageFilter(): void {
    this._pageFilter.page = 1;
    this._pageFilter.pageSize = 15;
    this._pageFilter.sortDirection = 'asc';
    this._pageFilter.sortField = 'id';
  }

  private _createFilterParameters(): void {
    this.filterParameters = new EntityFilter();
  }

  private _createEntity(): void {
    const entity = new Entity();
    entity.id = 0;
    entity.description = 'Nueva Entidad';
    
    this.openedEntitiesId.push(0);
    this._openedEntities.push(entity);
    this.selectedEntityId = 0;
  }

  getEntityById(entityId: number): Entity | undefined {
    const index = this.openedEntitiesId.indexOf(entityId);
    return index !== -1 ? this._openedEntities[index] : undefined;
  }

  private _deleteEntity(entity: EntityGrid): void {
    this._entityService.deleteEntity(entity.id)
      .pipe(takeUntilDestroyed(this._destroyRef))
      .subscribe({
        next: () => {
          this._messagesService.addMessage("MESSAGE.successDelete", EnumMessageType.Info);
          this.loadEntities(this._pageFilter, this.filterParameters);
        },
        error: (error) => {
          this._messagesService.addMessage(error, EnumMessageType.Error);
        }
      });
  }

  private _openEntity(entity: EntityGrid): void {
    try {
      const url = this._router.serializeUrl(
        this._router.createUrlTree(['entities-module', 'entities', 'open'], { queryParams: { id: entity.id } })
      );
      window.open(url, '_blank');
    } catch (error) {
      this._messagesService.addMessage("Error al abrir entidad en nueva pestaña", EnumMessageType.Error);
    }
  }

  private _loadSecurityActions(): void {
    const actions: Action[] = [
      new Action('BUTTON.new', EnumActionsType.actionNew, 'add', false),
      new Action('BUTTON.lists', EnumActionsType.actionList, 'list', false),
    ];
    this._actionService.setActions(actions);
  }
}
```

#### HTML
```html
<lfsoft-shared-message></lfsoft-shared-message>
<lfsoft-shared-layout [title]="'TITLE.entities' | translate" class="entities-container">
    <lfsoft-shared-actions 
        headerActions
        (action)="onAction($event)">
    </lfsoft-shared-actions>

    <lfsoft-[library]-entity-grid-filter 
        filterContent
        class="entities-container__filter"
        [filter]="filterParameters"
        (apply)="onFilterApplied($event)">
    </lfsoft-[library]-entity-grid-filter>
 
     <lfsoft-[library]-entity-grid 
        gridContent        
        class="entities-container__grid"
        (edit)="onEdit($event)"
        (delete)="onDeleteEntity($event)"
        (open)="onOpenEntity($event)"
        (sortChange)="onSortChange($event)"
        (scrollEndChange)="onLoadNextPage()">        
    </lfsoft-[library]-entity-grid>

    <div formContent>
        <mat-tab-group>
            <mat-tab *ngFor="let entityId of openedEntitiesId; let i = index">
                <ng-template mat-tab-label>
                    <div class="entities-container__tab" (click)="selectedEntityId = entityId">
                        <div class="entities-container__tab-label">
                            {{ getEntityById(entityId)?.description || 'Nueva Entidad' }}
                        </div>
                        <button mat-icon-button class="entities-container__tab-button" (click)="onCloseTab(entityId); $event.stopPropagation()">
                            <mat-icon>close</mat-icon>
                        </button>
                    </div>
                </ng-template>
                <lfsoft-[library]-entity-form 
                    formContent
                    [entityId]="entityId"
                    (save)="onSaveEntity($event)" 
                    (cancel)="onCancelEntity()">
                </lfsoft-[library]-entity-form>
            </mat-tab>
        </mat-tab-group>
    </div>
</lfsoft-shared-layout>
```

#### SCSS
```scss
@import 'styles/container.scss';

.entities-container {
  display: flex;
  flex-direction: column;
  height: 100%;
  width: 100%;

  &__tab {
    @extend .container-tab-header; 
    &-label{
      @extend .container-tab-header__label;
    }   
    &-button{
      @extend .container-tab-header__button;
    }
  }

  &__content {
    flex: 1 1 auto;
    display: flex;
    flex-direction: column;
    gap: 1rem;
    padding: 1rem;
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

### Form ([nombre]-form)

#### TypeScript
```typescript
import { Component, EventEmitter, Input, OnInit, Output, OnDestroy, DestroyRef, inject } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Entity } from '../models/entity.model';

import { ActivatedRoute } from '@angular/router';
import { map } from 'rxjs/operators';
import { Observable, of } from 'rxjs';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { MatButtonModule } from '@angular/material/button';
import { 
  EnumActionsType, 
  GenericActionsComponent, 
  ActionService, 
  GenericFormComponent, 
  Action, 
  MessagesService, 
  EnumMessageType, 
  TranslatePipe, 
  ModalService,
  CONFIRM_CANCEL,
  SkeletonDirective,
  FormValidationsDirective
} from '@lib/shared';
import { EntityService } from '../services/entity.service';
import { HttpErrorResponse } from '@angular/common/http';
import { UrlSecurityService } from '@lib/security';

@Component({
  selector: 'lfsoft-[library]-entity-form',
  templateUrl: './entity-form.component.html',
  styleUrls: ['./entity-form.component.scss'],
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, GenericFormComponent, 
    GenericActionsComponent, TranslatePipe, MatButtonModule, 
    SkeletonDirective, FormValidationsDirective],
  providers: [ ActionService ]
})
export class EntityFormComponent implements OnInit, OnDestroy {
  @Input() entityId: number = 0;
  @Output() save = new EventEmitter<Entity>();
  @Output() cancel = new EventEmitter<void>();

  isLoading: boolean = true;
  entityForm: FormGroup = new FormGroup({});
  entity: Entity = new Entity();
  drawerOpen = false;
  private readonly _destroyRef = inject(DestroyRef);
  private _operation: any;

  constructor(private fb: FormBuilder, private _entityService: EntityService, private _route: ActivatedRoute, 
              private _actionService: ActionService, private _messagesService: MessagesService, 
              private _modalService: ModalService, private _urlSecurityService: UrlSecurityService ) {    
    this._createForm();
  }
  
  ngOnInit(): void {  
    try {     
      this._loadSecurityActions();
      this._loadData();   
    }
    catch (error) {
      this._messagesService.addMessage('Error loading entity data.', EnumMessageType.Error);
    }
  }

  ngOnDestroy(): void {
    // El DestroyRef se encarga automáticamente de cancelar todas las suscripciones
  }

  isReadyToSave(): boolean {
    return this.entityForm.valid && this.entityForm.dirty;
  }

  onAction(action: EnumActionsType): void {
    try {
      switch (action) {
        case EnumActionsType.actionSave:
          this._save();
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

  private _createForm() {
    this.entityForm = this.fb.group({
      description: [null, [Validators.required, Validators.minLength(3)]]
      // Agregar todos los campos con sus validaciones
    });
    this.entityForm.statusChanges
      .pipe(takeUntilDestroyed(this._destroyRef))
      .subscribe(() => {
        this._enabledActions();
      });
  }

  private _loadData() {
    this.isLoading = false;
    this._loadParams().subscribe(() => {    
      console.log("operation", this._operation);
                    
      switch (this._operation) {
        case 'open':          
          this._editEntity(this.entityId).subscribe(entity => {
            this._updateEntity(entity);
            this._enabledActions();
          });
          break;
        default: 
          if (this.entityId <= 0) {
            return;
          }
          this._editEntity(this.entityId).subscribe(entity => {                   
            this._updateEntity(entity);
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
          
          // Validar que el ID sea seguro
          if (!idParam || !this._urlSecurityService.isValidRouteId(idParam)) {
            console.warn('Security: Invalid entity ID detected:', idParam);
            this._messagesService.addMessage('ID de entidad inválido', EnumMessageType.Error);
            throw new Error('Invalid entity ID');
          }
          
          this.entityId = Number(idParam);          
          return;
        })
      );
    } else {
      return of(void 0);
    }
  }

  private _editEntity(id: number): Observable<Entity> {
    return this._entityService.getEntity(id);
  }

  private _updateEntity(entity: Entity): void {
    this.entity = entity;    
    this.entityForm.patchValue(this.entity, { emitEvent: false });
  }
  
  private _cancel(): void {
    if (!this.entityForm.dirty) {
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

  private _save(): void {
    try {
      if (!this.entityForm.dirty) {
        return;
      }

      const updatedEntity: Entity = this._mapFormToEntity();
      
      if (!updatedEntity.id) {
        this._entityService.addEntity(updatedEntity).pipe(
          takeUntilDestroyed(this._destroyRef)
        ).subscribe(createdEntity => {
          this.entityForm.markAsPristine();
          this._enabledActions();
          this.save.emit(createdEntity);
        });
      } else {
        this._entityService.updateEntity(updatedEntity).pipe(
          takeUntilDestroyed(this._destroyRef)
        ).subscribe(updatedEntity => {
          this.entityForm.markAsPristine();
          this._enabledActions();
          this.save.emit(updatedEntity);
        }, error => {          
          throw error;
        });
      }
    } catch (error) {      
      throw error;
    }
  }

  //#region Mapping
  private _mapFormToEntity(): Entity {
    const formValues = this.entityForm.value;
    const entity: Entity = {
      id: this.entity.id,
      description: formValues.description
      // Mapear todos los campos
    };
    return entity;
  }
  //#endregion

  //#region Security
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
```

#### HTML
```html
<lfsoft-shared-form [title]="'TITLE.entityData' | translate">
  <div data>
    <form [formGroup]="entityForm" [lfsoftSkeleton]="isLoading" [lfsoftFormValidations]="entityForm">
      <div class="entity-form">
        <div class="entity-form__group skeleton-field" col-span="6">
          <label class="entity-form__label" for="description">{{ 'LABEL.description' | translate }}</label>
          <input 
            id="description"
            type="text"
            formControlName="description"
            class="entity-form__control">
        </div>
        <!-- Agregar todos los campos necesarios -->
      </div>
    </form>
  </div>
 
  <lfsoft-shared-actions 
    footerContent    
    (action)="onAction($event)">
  </lfsoft-shared-actions>
</lfsoft-shared-form>
```

#### SCSS
```scss
@import 'styles/form.scss';

.entity-form {
  @extend .form;
  @extend .form-container--full;
  padding-bottom: 30px;
  
  &__label {
    @extend .form-control-label;
  }

  &__control {
    @extend .form-control;
  }

  &__group {
    @extend .form-group;
  }
}
```

---

### Form Container ([nombre]s-form-container)

#### TypeScript
```typescript
import { Component, OnInit, OnDestroy } from '@angular/core';
import { EntityFormComponent } from '../entity-form/entity-form.component';
import { 
  GenericLayoutComponent, 
  GenericMessageComponent, 
  EnumLayoutType, 
  MessagesService, 
  EnumMessageType 
} from '@lib/shared';

@Component({
  selector: 'lfsoft-[library]-entities-form-container',
  templateUrl: './entities-form-container.component.html',
  styleUrls: ['./entities-form-container.component.scss'],
  standalone: true,
  imports: [ GenericLayoutComponent,
      GenericMessageComponent, EntityFormComponent]
})
export class EntitiesFormContainerComponent implements OnInit, OnDestroy {

  constructor( private _messagesService: MessagesService ) { }

  layoutTypes = EnumLayoutType
  ngOnInit(): void {  }

  ngOnDestroy(): void {
    // Cleanup si es necesario en el futuro
  }

  onSaveEntity(entity: any): void {
    this._messagesService.addMessage('MESSAGE.successSave', EnumMessageType.Info);
  }

  onCancelEntity(): void {    
    window.close();
  }
}
```

#### HTML
```html
<lfsoft-shared-message></lfsoft-shared-message>

<lfsoft-shared-layout [title]="'Entidades'" [type]="layoutTypes.layoutWithoutSidebar" class="entities-container">
  <lfsoft-[library]-entity-form
    formContent    
    (save)="onSaveEntity($event)"
    (cancel)="onCancelEntity()">
  </lfsoft-[library]-entity-form>
</lfsoft-shared-layout>
```

#### SCSS
```scss
// Vacío o estilos específicos del form container
```

---

### Drawer ([nombre]-drawer)

#### TypeScript
```typescript
import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { 
  GenericDrawerComponent, 
  DrawerService, 
  MessagesService, 
  EnumMessageType, 
  EnumActionsType 
} from '@lib/shared';
import { EntityFormComponent } from '../entity-form/entity-form.component';

@Component({
  selector: 'lfsoft-[library]-entity-drawer',
  templateUrl: './entity-drawer.component.html',
  styleUrls: ['./entity-drawer.component.scss'],
  standalone: true,
  imports: [CommonModule, GenericDrawerComponent, EntityFormComponent]
})
export class EntityDrawerComponent implements OnInit {
  @Input() set entityId(value: number | null) {
    if (!value ) {
      return;
    }
    this._entityId = value;   
  }
  get entityId(): number  {
    return this._entityId;
  }

  private _entityId: number = 0;
  constructor(private _messagesService: MessagesService, private p_drawerService: DrawerService) {}

  ngOnInit(): void { }

  onCancelEntity(): void {
    this.p_drawerService.hide( EnumActionsType.actionCancel );
  }

  onSaveEntity(entity: any): void {
    this.p_drawerService.hide( EnumActionsType.actionSave );
    this._messagesService.addMessage("MESSAGE.successSave", EnumMessageType.Info);
  }
}
```

#### HTML
```html
<lfsoft-shared-drawer>    
    <lfsoft-[library]-entity-form drawer-content 
    [entityId]="entityId"
    (save)="onSaveEntity($event)"
    (cancel)="onCancelEntity()">
    </lfsoft-[library]-entity-form>
</lfsoft-shared-drawer>
```

#### SCSS
```scss
// Vacío o estilos específicos del drawer
```

---

## 5. Módulo y Routing

### [nombre]s-module.module.ts
```typescript
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { EntitiesModuleRoutingModule } from './entities-module-routing.module';
// Importar componentes

@NgModule({
  imports: [CommonModule, ReactiveFormsModule, EntitiesModuleRoutingModule],
  providers: [EntityService],
  declarations: [/* componentes */]
})
export class EntitiesModule {}
```

### [nombre]s-module-routing.module.ts
```typescript
const routes: Routes = [
  { path: 'entities/open', component: EntitiesFormContainerComponent, data: { operation: 'open' } },
  { path: 'entities', component: EntitiesContainerComponent }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class EntitiesModuleRoutingModule {}
```

### index.ts (Public API)
```typescript
export * from './entities-module.module';
export * from './models/entity.model';
export * from './models/entity-grid.model';
export * from './services/entity.service';
```

---

## 6. Integración

### Actualizar libs/[library]/src/index.ts
```typescript
// Public API for @lib/[library]

export * from './lib/entities';
// ... otros exports
```

### Actualizar app.routes.ts
```typescript
{
  path: 'entities-module',
  canActivate: [AuthGuard, PermissionGuard],
  data: { requiredPermissions: [EnumPermissionType.VIEW_ENTITIES] },
  loadChildren: () =>
    import('@lib/[library]').then(m => m.EntitiesModule)
}
```

### Agregar navegación en home (opcional)
```typescript
<nz-card nzTitle="Entidades" (click)="navigate('/entities-module/entities')">
  <i nz-icon nzType="bank" nzTheme="outline"></i>
</nz-card>
```

---

## 7. Notas Importantes

### Dependencias clave de @lib/shared:
- `EnumActionsType` - Tipos de acciones del sistema
- `GenericGridComponent` - Grid reutilizable con scroll infinito
- `GenericActionsComponent` - Botones de acción
- `GenericFormComponent` - Contenedor de formularios
- `GenericLayoutComponent` - Layout principal
- `GenericMessageComponent` - Sistema de mensajes
- `ActionService` - Gestión de acciones y permisos
- `GridService` - Gestión del grid y datos
- `MessagesService` - Servicio de mensajes
- `ModalService` - Modales de confirmación
- `PageFilter` - Paginación y ordenamiento
- `PaginatedList` - Respuesta paginada
- `TranslatePipe` - Internacionalización
- `SkeletonDirective` - Loading skeleton
- `FormValidationsDirective` - Validaciones de formulario
- `CONFIRM_DELETE`, `CONFIRM_CANCEL` - Configuraciones de modal

### Dependencias clave de @lib/security:
- `AuthGuard` - Guard de autenticación
- `PermissionGuard` - Guard de permisos
- `EnumPermissionType` - Tipos de permisos
- `UrlSecurityService` - Validación de IDs en URL

### Patrones de código:
1. **Gestión de memoria**: Usar `DestroyRef` con `takeUntilDestroyed()` para suscripciones
2. **Inyección de dependencias**: Usar `inject()` en constructores
3. **Scroll infinito**: Concatenar datos al cargar más páginas
4. **Mapeo de modelos**: Crear métodos `_mapXToY()` privados
5. **Validación de seguridad**: Validar IDs de URL con `UrlSecurityService`
6. **Confirmaciones**: Usar `ModalService.showModal()` antes de eliminar/cancelar
7. **Mensajes**: Usar `MessagesService.addMessage()` para feedback
8. **Acciones**: Configurar con `ActionService.setActions()` y habilitar/deshabilitar dinámicamente
9. **Estilos**: Usar `@import` y `@extend` de styles globales
10. **Traducciones**: Usar `TranslatePipe` con claves de i18n

### Estructura del selector:
- Filter: `lfsoft-[library]-entity-grid-filter`
- Grid: `lfsoft-[library]-entity-grid`
- Container: `lfsoft-[library]-entities-container`
- Form: `lfsoft-[library]-entity-form`
- Form Container: `lfsoft-[library]-entities-form-container`
- Drawer: `lfsoft-[library]-entity-drawer`

### Convenciones de nombres:
- Singular para modelo: `Entity`
- Plural para colecciones: `entities`
- Sufijo Grid para vista de grilla: `EntityGrid`
- Sufijo Filter para filtros: `EntityFilter`
- Prefijo `_` para métodos privados
- Prefijo `on` para event handlers públicos

---

## Checklist

- [ ] Crear estructura de carpetas según el patrón base
- [ ] Implementar 3 modelos (base, grid, filter)
  - [ ] Model debe tener todos los campos de la entidad
  - [ ] Grid Model debe incluir `selected: boolean = false`
  - [ ] Filter Model debe implementar `QueryParams.toString()`
- [ ] Crear servicio con 5 métodos CRUD
  - [ ] getEntities() con paginación y filtros
  - [ ] getEntity() por ID
  - [ ] addEntity() con destructuring del id
  - [ ] updateEntity() con destructuring del id
  - [ ] deleteEntity() por ID
  - [ ] Método privado getHeaders() con token
  - [ ] Método privado _filterEntities() opcional
- [ ] Desarrollar componente Grid Filter (TS, HTML, SCSS)
  - [ ] Componente standalone con todos los imports
  - [ ] Formulario reactivo con FormBuilder
  - [ ] Input setter para filter con _updateForm()
  - [ ] Output apply con EventEmitter
  - [ ] Métodos onAction(), _apply(), _resetFilter()
  - [ ] Método _mapToFilter() para transformación
  - [ ] Método _createForm() en constructor
  - [ ] Método _loadSecurityActions() con ActionService
  - [ ] HTML con mat-tab-group y lfsoft-shared-form
  - [ ] SCSS con @import y @extend de estilos globales
- [ ] Desarrollar componente Grid (TS, HTML, SCSS)
  - [ ] Componente standalone con GenericGridComponent
  - [ ] Outputs: edit, delete, open, sortChange, scrollEndChange
  - [ ] Array de GridColumn con configuración
  - [ ] Constructor con GridService y TranslationService
  - [ ] Método onSortChange() para ordenamiento
  - [ ] Método onLoadNextPage() para scroll infinito
  - [ ] Métodos onEdit(), onDelete(), onOpen()
  - [ ] Método _inicializeColumns() con todas las columnas
  - [ ] Método _loadSecurityActions() con acciones CRUD
  - [ ] HTML con lfsoft-shared-grid e infiniteScroll
  - [ ] SCSS básico para el contenedor
- [ ] Desarrollar componente Container (TS, HTML, SCSS)
  - [ ] Componente standalone con todos los imports
  - [ ] Usar DestroyRef con inject() y takeUntilDestroyed()
  - [ ] Arrays: openedEntitiesId, _openedEntities, _dataLoaded
  - [ ] Variables: selectedEntityId, filterParameters, _pageFilter
  - [ ] Constructor con todos los servicios inyectados
  - [ ] Métodos _createPageFilter() y _createFilterParameters()
  - [ ] Método loadEntities() con concatenación de datos
  - [ ] Método onFilterApplied() que resetea datos
  - [ ] Métodos onSortChange() y onLoadNextPage()
  - [ ] Método onAction() para nuevo y listar
  - [ ] Método onEdit() que carga entidad completa
  - [ ] Método onDeleteEntity() con confirmación modal
  - [ ] Método onOpenEntity() para nueva ventana
  - [ ] Métodos onCloseTab(), onSaveEntity(), onCancelEntity()
  - [ ] Método getEntityById() para tabs
  - [ ] Métodos privados: _createEntity(), _deleteEntity(), _openEntity()
  - [ ] Método _mapEntityToGrid() para transformación
  - [ ] Método _closeEntity() para gestión de tabs
  - [ ] Método _loadSecurityActions() con acciones del header
  - [ ] HTML con lfsoft-shared-layout y mat-tab-group
  - [ ] SCSS con @import y estilos de tabs
- [ ] Desarrollar componente Form (TS, HTML, SCSS)
  - [ ] Componente standalone con todas las directivas
  - [ ] Usar DestroyRef con inject() y takeUntilDestroyed()
  - [ ] Inputs: entityId (number)
  - [ ] Outputs: save, cancel con EventEmitter
  - [ ] Variables: isLoading, entityForm, entity, _operation
  - [ ] Constructor con todos los servicios
  - [ ] Método _createForm() con validaciones
  - [ ] Suscripción a statusChanges para _enabledActions()
  - [ ] Método _loadData() con _loadParams()
  - [ ] Método _loadParams() con validación de seguridad
  - [ ] Métodos _editEntity() y _updateEntity()
  - [ ] Método isReadyToSave() para validación
  - [ ] Método onAction() para save y cancel
  - [ ] Método _cancel() con modal de confirmación
  - [ ] Método _save() que distingue add/update
  - [ ] Método _mapFormToEntity() para transformación
  - [ ] Métodos _loadSecurityActions() y _enabledActions()
  - [ ] HTML con lfsoftSkeleton y lfsoftFormValidations
  - [ ] SCSS con @import y estilos de formulario
- [ ] Desarrollar componente Form Container (TS, HTML, SCSS)
  - [ ] Componente standalone simple
  - [ ] Variable layoutTypes = EnumLayoutType
  - [ ] Métodos onSaveEntity() y onCancelEntity()
  - [ ] onCancelEntity() debe ejecutar window.close()
  - [ ] HTML con layoutWithoutSidebar
  - [ ] SCSS vacío o minimal
- [ ] Desarrollar componente Drawer (TS, HTML, SCSS)
  - [ ] Componente standalone con GenericDrawerComponent
  - [ ] Input setter/getter para entityId
  - [ ] Constructor con MessagesService y DrawerService
  - [ ] Métodos onCancelEntity() y onSaveEntity()
  - [ ] HTML con lfsoft-shared-drawer
  - [ ] SCSS vacío o minimal
- [ ] Configurar módulo y routing
  - [ ] EntitiesModule con imports básicos
  - [ ] Routing con path 'entities' y 'entities/open'
  - [ ] Ruta open con data: { operation: 'open' }
- [ ] Exportar public API en index.ts del módulo
  - [ ] Exportar módulo y routing
  - [ ] Exportar todos los modelos
  - [ ] Exportar servicio
  - [ ] Exportar todos los componentes
- [ ] Registrar ruta lazy en app.routes.ts
  - [ ] Path '[nombre]-module'
  - [ ] canActivate con guards
  - [ ] data con requiredPermissions
  - [ ] loadChildren con import dinámico
- [ ] Actualizar library index.ts
  - [ ] Agregar export * from './lib/[nombre]'
- [ ] Agregar navegación en home (opcional)
  - [ ] Card o botón con navigate

---

**Verificación final:**
- ✓ Todos los componentes son standalone
- ✓ Todos los selectores usan prefijo lfsoft-[library]
- ✓ Todas las suscripciones usan takeUntilDestroyed()
- ✓ Todos los modales de confirmación implementados
- ✓ Todos los mensajes de éxito/error implementados
- ✓ Todo el scroll infinito configurado
- ✓ Todas las validaciones de seguridad implementadas
- ✓ Todos los estilos usan @import y @extend
- ✓ Todas las traducciones usan TranslatePipe
- ✓ Todo el mapeo entre modelos implementado

---

**Patrones clave:**
- Filter implementa `QueryParams.toString()`
- Grid model incluye `selected: boolean`
- Servicio usa `inject()` y `catchError`
- Container maneja estado y coordinación
- Form container gestiona operaciones por ruta
- Lazy loading con `loadChildren`
