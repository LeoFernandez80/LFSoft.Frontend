---
agent: agent
---
# 📋 CREAR MÓDULO DOCUMENTO - GUÍA COMPLETA

> **Guía completa y concisa para crear un módulo siguiendo la estructura de Invoice**
> 
> **Fecha:** Diciembre 16, 2025

---

## 📁 1. ESTRUCTURA DE CARPETAS

```
libs/[categoría]/src/lib/[módulo]/
├── models/
│   ├── [módulo].model.ts                    # Modelo completo con sub-items
│   ├── [módulo]-grid.model.ts               # Modelo para grid principal
│   ├── [módulo]-filter.model.ts             # Modelo para filtros
│   ├── [módulo]-item.model.ts               # Sub-items
│   ├── [módulo]-item-grid.model.ts          # Grid de sub-items
│   ├── [módulo]-item-detail.model.ts        # Detalles de items
│   └── [módulo]-item-detail-grid.model.ts   # Grid de detalles
├── services/
│   ├── [módulo].service.ts                  # CRUD principal
│   └── [módulo]-pdf.service.ts              # Exportación PDF (opcional)
├── [módulo]s-container/                     # Contenedor principal (PLURAL)
│   ├── [módulo]s-container.component.ts
│   ├── [módulo]s-container.component.html
│   ├── [módulo]s-container.component.scss
│   ├── [módulo]-grid/                       # Grid principal
│   │   ├── [módulo]-grid.component.ts
│   │   ├── [módulo]-grid.component.html
│   │   └── [módulo]-grid.component.scss
│   └── [módulo]-grid-filter/                # Filtros
│       ├── [módulo]-grid-filter.component.ts
│       ├── [módulo]-grid-filter.component.html
│       └── [módulo]-grid-filter.component.scss
├── [módulo]s-form-container/                # Form container (PLURAL)
│   ├── [módulo]s-form-container.component.ts
│   ├── [módulo]s-form-container.component.html
│   └── [módulo]s-form-container.component.scss
├── [módulo]-form/                           # Formulario principal (SINGULAR)
│   ├── [módulo]-form.component.ts
│   ├── [módulo]-form.component.html
│   ├── [módulo]-form.component.scss
│   ├── [módulo]-item-form/                  # Form de sub-items
│   │   ├── [módulo]-item-form.component.ts
│   │   ├── [módulo]-item-form.component.html
│   │   ├── [módulo]-item-form.component.scss
│   │   ├── [módulo]-item-detail-form/       # Form de detalles
│   │   │   ├── [módulo]-item-detail-form.component.ts
│   │   │   ├── [módulo]-item-detail-form.component.html
│   │   │   └── [módulo]-item-detail-form.component.scss
│   │   └── [módulo]-item-detail-grid/       # Grid de detalles
│   │       ├── [módulo]-item-detail-grid.component.ts
│   │       ├── [módulo]-item-detail-grid.component.html
│   │       └── [módulo]-item-detail-grid.component.scss
│   └── [módulo]-item-grid/                  # Grid de items
│       ├── [módulo]-item-grid.component.ts
│       ├── [módulo]-item-grid.component.html
│       └── [módulo]-item-grid.component.scss
├── [módulo]s.module.ts                      # Módulo Angular (PLURAL)
├── [módulo]s-module-routing.module.ts       # Routing (PLURAL)
└── index.ts                                 # Exports públicos
```

---

## 📦 2. MODELOS (models/)

### 2.1. Modelo Principal (`[módulo].model.ts`)
```typescript
import { [Módulo]Item } from './[módulo]-item.model';

export class [Módulo] {
  [módulo]Id: number = 0;
  [módulo]Number: string = '';
  description: string = '';
  status: string = '';
  
  personId: number = 0;
  personName: string = '';
  personDocumentType: string = '';
  personDocumentNumber: string = '';
  
  creationDate: Date = new Date();
  modificationDate: Date = new Date();
  creationUserId: number = 0;
  modificationUserId: number = 0;
  
  totalAmount: number = 0;
  
  items: [Módulo]Item[] = [];
}

export { [Módulo]Item } from './[módulo]-item.model';
```

### 2.2. Modelo Grid (`[módulo]-grid.model.ts`)
```typescript
export class [Módulo]Grid {
  [módulo]Id: number = 0;
  [módulo]Number: string = '';
  personName: string = '';
  description: string = '';
  status: string = '';
  creationDate: Date = new Date();
  totalAmount: number = 0;
}
```

### 2.3. Modelo Filter (`[módulo]-filter.model.ts`)
```typescript
export class [Módulo]Filter {
  [módulo]Number: string = '';
  personName: string = '';
  status: string = '';
  startDate: Date | null = null;
  endDate: Date | null = null;

  toString(): string {
    const params = new URLSearchParams();
    if (this.[módulo]Number) params.append('[módulo]Number', this.[módulo]Number);
    if (this.personName) params.append('personName', this.personName);
    if (this.status) params.append('status', this.status);
    if (this.startDate) params.append('startDate', this.startDate.toISOString());
    if (this.endDate) params.append('endDate', this.endDate.toISOString());
    return params.toString();
  }
}
```

### 2.4. Sub-Items Models
```typescript
// [módulo]-item.model.ts
export class [Módulo]Item {
  [módulo]ItemId: number = 0;
  [módulo]Id: number = 0;
  itemNumber: number = 0;
  description: string = '';
  quantity: number = 0;
  unitPrice: number = 0;
  totalPrice: number = 0;
  
  details: [Módulo]ItemDetail[] = [];
}

// [módulo]-item-grid.model.ts
export class [Módulo]ItemGrid {
  [módulo]ItemId: number = 0;
  itemNumber: number = 0;
  description: string = '';
  quantity: number = 0;
  unitPrice: number = 0;
  totalPrice: number = 0;
}

// [módulo]-item-detail.model.ts
export class [Módulo]ItemDetail {
  [módulo]ItemDetailId: number = 0;
  [módulo]ItemId: number = 0;
  detailNumber: number = 0;
  description: string = '';
  value: string = '';
}

// [módulo]-item-detail-grid.model.ts
export class [Módulo]ItemDetailGrid {
  [módulo]ItemDetailId: number = 0;
  detailNumber: number = 0;
  description: string = '';
  value: string = '';
}
```

---

## 🔧 3. SERVICIOS (services/)

### 3.1. Servicio Principal (`[módulo].service.ts`)
```typescript
import { inject, Injectable } from '@angular/core';
import { catchError, Observable, throwError } from 'rxjs';
import { [Módulo] } from '../models/[módulo].model';
import { [Módulo]Grid } from '../models/[módulo]-grid.model';
import { PageFilter, PaginatedList } from '@lib/shared';
import { [Módulo]Filter } from '../models/[módulo]-filter.model';
import { HttpClient } from '@angular/common/http';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class [Módulo]Service {
  private http = inject(HttpClient);
  private apiUrl = `${environment.apiUrl}/[módulos]`;

  // GET ALL (paginado y filtrado)
  get[Módulos](pageFilter: PageFilter, parameters: [Módulo]Filter): Observable<PaginatedList<[Módulo]Grid>> {
    const pageParams = pageFilter.toString();    
    const filterParams = parameters.toString();
    const paramsString = filterParams ? `${pageParams}&${filterParams}` : pageParams;   
    
    return this.http.get<PaginatedList<[Módulo]Grid>>(`${this.apiUrl}?${paramsString}`, {
      headers: this.getHeaders()
    });
  }

  // GET BY ID
  get[Módulo](id: number): Observable<[Módulo]> {    
    return this.http.get<[Módulo]>(`${this.apiUrl}/${id}`, {
      headers: this.getHeaders()
    }).pipe(
      catchError(error => {
        console.error('Error fetching [módulo]:', error);
        return throwError(() => error);
      })
    );
  }

  // CREATE
  add[Módulo]([módulo]: [Módulo]): Observable<[Módulo]> {    
    const { [módulo]Id, ...createData } = [módulo];
    return this.http.post<[Módulo]>(this.apiUrl, createData, {
      headers: this.getHeaders()
    }).pipe(
      catchError(error => {
        console.error('Error creating [módulo]:', error);
        return throwError(() => error);
      })
    );
  }

  // UPDATE
  update[Módulo]([módulo]: [Módulo]): Observable<[Módulo]> {
    return this.http.put<[Módulo]>(`${this.apiUrl}/${[módulo].[módulo]Id}`, [módulo], {
      headers: this.getHeaders()
    }).pipe(
      catchError(error => {
        console.error('Error updating [módulo]:', error);
        return throwError(() => error);
      })
    );
  }

  // DELETE
  delete[Módulo](id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`, {
      headers: this.getHeaders()
    }).pipe(
      catchError(error => {
        console.error('Error deleting [módulo]:', error);
        return throwError(() => error);
      })
    );
  }

  private getHeaders() {
    return {
      'Content-Type': 'application/json',
      'Accept': 'application/json'
    };
  }
}
```

---

## 📋 4. CONTENEDOR PRINCIPAL ([módulo]s-container/)

### 4.1. Component TypeScript
```typescript
import { Component, OnInit, OnDestroy, DestroyRef, inject } from '@angular/core';
import { [Módulo]GridFilterComponent } from './[módulo]-grid-filter/[módulo]-grid-filter.component';
import { [Módulo]GridComponent } from './[módulo]-grid/[módulo]-grid.component';
import { [Módulo]FormComponent } from '../[módulo]-form/[módulo]-form.component';
import { [Módulo]Grid } from '../models/[módulo]-grid.model';
import { [Módulo] } from '../models/[módulo].model';
import { ActivatedRoute, Router } from '@angular/router';
import { MatTabsModule } from '@angular/material/tabs';
import { AsyncPipe, NgFor } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { [Módulo]Filter } from '../models/[módulo]-filter.model';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { AuthService, UrlSecurityService } from '@lib/security';
import { TranslatePipe, GenericLayoutComponent, GenericMessageComponent, GenericActionsComponent, MessagesService, GridService, PageFilter, ActionService, ModalService, EnumMessageType, EnumActionsType, CONFIRM_DELETE, Action, EnumActionsViewType, EnumActionsStyle } from '@lib/shared';
import { [Módulo]Service } from '../services/[módulo].service';

@Component({
  selector: 'lfsoft-[categoría]-[módulos]-container',
  templateUrl: './[módulos]-container.component.html',
  styleUrls: ['./[módulos]-container.component.scss'],
  standalone: true,
  imports: [
    NgFor, AsyncPipe, MatTabsModule, MatIconModule, TranslatePipe,
    GenericLayoutComponent, GenericMessageComponent, GenericActionsComponent,
    [Módulo]GridFilterComponent, [Módulo]GridComponent, [Módulo]FormComponent
  ],
  providers: [Router, MessagesService, GridService]
})
export class [Módulos]ContainerComponent implements OnInit, OnDestroy {
  opened[Módulos]Id: number[] = [];
  selected[Módulo]Id: number | null = null;
  filterParameters: [Módulo]Filter = new [Módulo]Filter();  
  
  private _opened[Módulos]: [Módulo][] = [];
  private _pageFilter: PageFilter = new PageFilter();
  private readonly _destroyRef = inject(DestroyRef);

  constructor(
    private _router: Router, 
    private _route: ActivatedRoute, 
    private _[módulo]Service: [Módulo]Service, 
    private _gridService: GridService<[Módulo]Grid>, 
    private _messagesService: MessagesService, 
    private _actionService: ActionService,
    private _modalService: ModalService, 
    private _authService: AuthService,
    private _urlSecurityService: UrlSecurityService
  ) {
    this._createPageFilter();
    this._createFilterParameters();
  }

  ngOnInit(): void {
    try {
      this._loadSecurityActions();
      this.load[Módulos](this._pageFilter, this.filterParameters);
    } catch (error) {
      this._messagesService.addMessage("Error al cargar la página", EnumMessageType.Error);
    }
  }

  ngOnDestroy(): void {}

  onPageChange(pageFilter: PageFilter): void {
    this._pageFilter = pageFilter;
    this.load[Módulos](this._pageFilter, this.filterParameters);
  }

  onFilterApplied(filter: [Módulo]Filter): void {
    this.filterParameters = filter;
    this.load[Módulos](this._pageFilter, this.filterParameters);
  }

  onAction(action: EnumActionsType): void {
    switch (action) {
      case EnumActionsType.actionNew:
        this._create[Módulo]();
        break;            
      case EnumActionsType.openHome:        
        this._openHome();       
        break;      
      case EnumActionsType.actionLogout:
        this._logout();
        break;
      default:
        break;
    }
  }

  onGridAction(event: { action: EnumActionsType, row: [Módulo]Grid }): void {
    switch (event.action) {
      case EnumActionsType.actionEdit:
        this._edit[Módulo](event.row.[módulo]Id);
        break;
      case EnumActionsType.actionDelete:
        this._delete[Módulo](event.row.[módulo]Id);
        break;
      case EnumActionsType.actionOpen:
        this._open[Módulo](event.row.[módulo]Id);
        break;
      default:
        break;
    }
  }

  onSave([módulo]: [Módulo]): void {
    if ([módulo].[módulo]Id === 0) {
      this._add[Módulo]([módulo]);
    } else {
      this._update[Módulo]([módulo]);
    }
  }

  onCancel([módulo]Id: number): void {
    this._close[Módulo]([módulo]Id);
  }

  onSelectTab(index: number): void {
    this.selected[Módulo]Id = this.opened[Módulos]Id[index - 1];
  }

  // Métodos privados
  private load[Módulos](pageFilter: PageFilter, parameters: [Módulo]Filter): void {
    this._[módulo]Service.get[Módulos](pageFilter, parameters)
      .pipe(takeUntilDestroyed(this._destroyRef))
      .subscribe({
        next: (response) => {
          this._gridService.setData(response);
        },
        error: (error) => {
          this._messagesService.addMessage("Error al cargar [módulos]", EnumMessageType.Error);
        }
      });
  }

  private _create[Módulo](): void {
    const new[Módulo] = new [Módulo]();
    this._opened[Módulos].push(new[Módulo]);
    this.opened[Módulos]Id.push(0);
    this.selected[Módulo]Id = 0;
    this._disableAction(EnumActionsType.actionNew);
  }

  private _edit[Módulo](id: number): void {
    if (this.opened[Módulos]Id.includes(id)) {
      this.selected[Módulo]Id = id;
      return;
    }
    
    this._[módulo]Service.get[Módulo](id)
      .pipe(takeUntilDestroyed(this._destroyRef))
      .subscribe({
        next: ([módulo]) => {
          this._opened[Módulos].push([módulo]);
          this.opened[Módulos]Id.push(id);
          this.selected[Módulo]Id = id;
          this._disableAction(EnumActionsType.actionNew);
        },
        error: () => {
          this._messagesService.addMessage("Error al cargar [módulo]", EnumMessageType.Error);
        }
      });
  }

  private _delete[Módulo](id: number): void {
    this._modalService.openConfirmModal(CONFIRM_DELETE)
      .pipe(takeUntilDestroyed(this._destroyRef))
      .subscribe(confirmed => {
        if (confirmed) {
          this._[módulo]Service.delete[Módulo](id)
            .pipe(takeUntilDestroyed(this._destroyRef))
            .subscribe({
              next: () => {
                this._messagesService.addMessage("[Módulo] eliminado correctamente", EnumMessageType.Success);
                this.load[Módulos](this._pageFilter, this.filterParameters);
              },
              error: () => {
                this._messagesService.addMessage("Error al eliminar [módulo]", EnumMessageType.Error);
              }
            });
        }
      });
  }

  private _add[Módulo]([módulo]: [Módulo]): void {
    this._[módulo]Service.add[Módulo]([módulo])
      .pipe(takeUntilDestroyed(this._destroyRef))
      .subscribe({
        next: (created[Módulo]) => {
          this._messagesService.addMessage("[Módulo] creado correctamente", EnumMessageType.Success);
          this._close[Módulo](0);
          this.load[Módulos](this._pageFilter, this.filterParameters);
        },
        error: () => {
          this._messagesService.addMessage("Error al crear [módulo]", EnumMessageType.Error);
        }
      });
  }

  private _update[Módulo]([módulo]: [Módulo]): void {
    this._[módulo]Service.update[Módulo]([módulo])
      .pipe(takeUntilDestroyed(this._destroyRef))
      .subscribe({
        next: () => {
          this._messagesService.addMessage("[Módulo] actualizado correctamente", EnumMessageType.Success);
          this._close[Módulo]([módulo].[módulo]Id);
          this.load[Módulos](this._pageFilter, this.filterParameters);
        },
        error: () => {
          this._messagesService.addMessage("Error al actualizar [módulo]", EnumMessageType.Error);
        }
      });
  }

  private _close[Módulo]([módulo]Id: number): void {
    const index = this.opened[Módulos]Id.indexOf([módulo]Id);
    if (index !== -1) {
      this._opened[Módulos].splice(index, 1);
      this.opened[Módulos]Id.splice(index, 1);
    }
    
    if (this.opened[Módulos]Id.length === 0) {
      this.selected[Módulo]Id = null;
      this._enableAction(EnumActionsType.actionNew);
    } else {
      this.selected[Módulo]Id = this.opened[Módulos]Id[this.opened[Módulos]Id.length - 1];
    }
  }

  private _open[Módulo](id: number): void {
    const url = this._urlSecurityService.getUrl('[módulos]-form');
    this._router.navigate([url, id]);
  }

  private _openHome(): void {
    this._router.navigate(['/home']);
  }

  private _logout(): void {
    this._authService.logout();
  }

  private _loadSecurityActions(): void {
    const url = this._urlSecurityService.getUrl('[módulos]');
    const actions: Action[] = [
      { label: 'actions.new', actionType: EnumActionsType.actionNew, icon: 'add', enabled: true },
      { label: 'actions.home', actionType: EnumActionsType.openHome, icon: 'home', enabled: true },
      { label: 'actions.logout', actionType: EnumActionsType.actionLogout, icon: 'logout', enabled: true }
    ];
    this._actionService.setActions(actions);
  }

  private _enableAction(actionType: EnumActionsType): void {
    this._actionService.enable(actionType);
  }

  private _disableAction(actionType: EnumActionsType): void {
    this._actionService.disable(actionType);
  }

  private _createPageFilter(): void {
    this._pageFilter.pageNumber = 1;
    this._pageFilter.pageSize = 10;
  }

  private _createFilterParameters(): void {
    this.filterParameters = new [Módulo]Filter();
  }
}
```

### 4.2. Template HTML
```html
<lfsoft-generic-layout>
  <!-- ACTIONS -->
  <div actions>
    <lfsoft-generic-actions (actionClick)="onAction($event)"></lfsoft-generic-actions>
  </div>

  <!-- MESSAGES -->
  <div messages>
    <lfsoft-generic-message></lfsoft-generic-message>
  </div>

  <!-- CONTENT -->
  <div content>
    <mat-tab-group 
      [selectedIndex]="selected[Módulo]Id === null ? 0 : opened[Módulos]Id.indexOf(selected[Módulo]Id) + 1"
      (selectedIndexChange)="onSelectTab($event)">
      
      <!-- TAB GRID -->
      <mat-tab>
        <ng-template mat-tab-label>
          <mat-icon>list</mat-icon>
          {{ '[módulos].title' | translate }}
        </ng-template>
        
        <lfsoft-[categoría]-[módulo]-grid-filter
          (filterApplied)="onFilterApplied($event)">
        </lfsoft-[categoría]-[módulo]-grid-filter>
        
        <lfsoft-[categoría]-[módulo]-grid
          (actionClick)="onGridAction($event)"
          (pageChange)="onPageChange($event)">
        </lfsoft-[categoría]-[módulo]-grid>
      </mat-tab>

      <!-- TABS FORMS -->
      <mat-tab *ngFor="let [módulo]Id of opened[Módulos]Id; let i = index">
        <ng-template mat-tab-label>
          <mat-icon>description</mat-icon>
          {{ [módulo]Id === 0 ? ('[módulos].new' | translate) : ('[módulos].edit' | translate) }}
        </ng-template>
        
        <lfsoft-[categoría]-[módulo]-form
          [[módulo]Id]="[módulo]Id"
          (save)="onSave($event)"
          (cancel)="onCancel([módulo]Id)">
        </lfsoft-[categoría]-[módulo]-form>
      </mat-tab>
    </mat-tab-group>
  </div>
</lfsoft-generic-layout>
```

---

## 🔍 5. GRID PRINCIPAL ([módulo]-grid/)

### 5.1. Component TypeScript
```typescript
import { Component, EventEmitter, OnInit, Output, DestroyRef, inject } from '@angular/core';
import { [Módulo]Grid } from '../../models/[módulo]-grid.model';
import { CommonModule, DatePipe } from '@angular/common';
import { MatTableModule } from '@angular/material/table';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { EnumActionsType, GridService, PageFilter, TranslatePipe } from '@lib/shared';

@Component({
  selector: 'lfsoft-[categoría]-[módulo]-grid',
  templateUrl: './[módulo]-grid.component.html',
  styleUrls: ['./[módulo]-grid.component.scss'],
  standalone: true,
  imports: [CommonModule, DatePipe, MatTableModule, MatPaginatorModule, 
    MatButtonModule, MatIconModule, MatTooltipModule, TranslatePipe]
})
export class [Módulo]GridComponent implements OnInit {
  @Output() actionClick = new EventEmitter<{ action: EnumActionsType, row: [Módulo]Grid }>();
  @Output() pageChange = new EventEmitter<PageFilter>();

  displayedColumns: string[] = ['[módulo]Number', 'personName', 'description', 'status', 'creationDate', 'totalAmount', 'actions'];
  dataSource: [Módulo]Grid[] = [];
  totalRecords: number = 0;
  pageSize: number = 10;
  pageNumber: number = 1;

  private readonly _destroyRef = inject(DestroyRef);

  constructor(private _gridService: GridService<[Módulo]Grid>) {}

  ngOnInit(): void {
    this._gridService.getData()
      .pipe(takeUntilDestroyed(this._destroyRef))
      .subscribe(data => {
        this.dataSource = data.items;
        this.totalRecords = data.totalCount;
        this.pageNumber = data.pageNumber;
        this.pageSize = data.pageSize;
      });
  }

  onEdit(row: [Módulo]Grid): void {
    this.actionClick.emit({ action: EnumActionsType.actionEdit, row });
  }

  onDelete(row: [Módulo]Grid): void {
    this.actionClick.emit({ action: EnumActionsType.actionDelete, row });
  }

  onOpen(row: [Módulo]Grid): void {
    this.actionClick.emit({ action: EnumActionsType.actionOpen, row });
  }

  onPageChange(event: PageEvent): void {
    const pageFilter = new PageFilter();
    pageFilter.pageNumber = event.pageIndex + 1;
    pageFilter.pageSize = event.pageSize;
    this.pageChange.emit(pageFilter);
  }
}
```

### 5.2. Template HTML
```html
<div class="grid-container">
  <table mat-table [dataSource]="dataSource" class="mat-elevation-z2">
    
    <!-- Columns -->
    <ng-container matColumnDef="[módulo]Number">
      <th mat-header-cell *matHeaderCellDef>{{ '[módulos].grid.number' | translate }}</th>
      <td mat-cell *matCellDef="let row">{{ row.[módulo]Number }}</td>
    </ng-container>

    <ng-container matColumnDef="personName">
      <th mat-header-cell *matHeaderCellDef>{{ '[módulos].grid.person' | translate }}</th>
      <td mat-cell *matCellDef="let row">{{ row.personName }}</td>
    </ng-container>

    <ng-container matColumnDef="description">
      <th mat-header-cell *matHeaderCellDef>{{ '[módulos].grid.description' | translate }}</th>
      <td mat-cell *matCellDef="let row">{{ row.description }}</td>
    </ng-container>

    <ng-container matColumnDef="status">
      <th mat-header-cell *matHeaderCellDef>{{ '[módulos].grid.status' | translate }}</th>
      <td mat-cell *matCellDef="let row">{{ row.status }}</td>
    </ng-container>

    <ng-container matColumnDef="creationDate">
      <th mat-header-cell *matHeaderCellDef>{{ '[módulos].grid.date' | translate }}</th>
      <td mat-cell *matCellDef="let row">{{ row.creationDate | date:'short' }}</td>
    </ng-container>

    <ng-container matColumnDef="totalAmount">
      <th mat-header-cell *matHeaderCellDef>{{ '[módulos].grid.total' | translate }}</th>
      <td mat-cell *matCellDef="let row">{{ row.totalAmount | currency }}</td>
    </ng-container>

    <ng-container matColumnDef="actions">
      <th mat-header-cell *matHeaderCellDef>{{ 'actions.title' | translate }}</th>
      <td mat-cell *matCellDef="let row">
        <button mat-icon-button (click)="onEdit(row)" matTooltip="{{ 'actions.edit' | translate }}">
          <mat-icon>edit</mat-icon>
        </button>
        <button mat-icon-button (click)="onDelete(row)" matTooltip="{{ 'actions.delete' | translate }}">
          <mat-icon>delete</mat-icon>
        </button>
        <button mat-icon-button (click)="onOpen(row)" matTooltip="{{ 'actions.open' | translate }}">
          <mat-icon>open_in_new</mat-icon>
        </button>
      </td>
    </ng-container>

    <tr mat-header-row *matHeaderRowDef="displayedColumns"></tr>
    <tr mat-row *matRowDef="let row; columns: displayedColumns;"></tr>
  </table>

  <mat-paginator 
    [length]="totalRecords"
    [pageSize]="pageSize"
    [pageSizeOptions]="[5, 10, 25, 50]"
    [pageIndex]="pageNumber - 1"
    (page)="onPageChange($event)">
  </mat-paginator>
</div>
```

---

## 🔍 6. FILTROS ([módulo]-grid-filter/)

### 6.1. Component TypeScript
```typescript
import { Component, EventEmitter, Output } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatSelectModule } from '@angular/material/select';
import { [Módulo]Filter } from '../../models/[módulo]-filter.model';
import { TranslatePipe } from '@lib/shared';

@Component({
  selector: 'lfsoft-[categoría]-[módulo]-grid-filter',
  templateUrl: './[módulo]-grid-filter.component.html',
  styleUrls: ['./[módulo]-grid-filter.component.scss'],
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, MatFormFieldModule, MatInputModule, 
    MatButtonModule, MatDatepickerModule, MatSelectModule, TranslatePipe]
})
export class [Módulo]GridFilterComponent {
  @Output() filterApplied = new EventEmitter<[Módulo]Filter>();

  filterForm: FormGroup;

  constructor(private fb: FormBuilder) {
    this.filterForm = this.fb.group({
      [módulo]Number: [''],
      personName: [''],
      status: [''],
      startDate: [null],
      endDate: [null]
    });
  }

  onApplyFilter(): void {
    const filter = new [Módulo]Filter();
    Object.assign(filter, this.filterForm.value);
    this.filterApplied.emit(filter);
  }

  onClearFilter(): void {
    this.filterForm.reset();
    this.onApplyFilter();
  }
}
```

### 6.2. Template HTML
```html
<form [formGroup]="filterForm" class="filter-form">
  <mat-form-field>
    <mat-label>{{ '[módulos].filter.number' | translate }}</mat-label>
    <input matInput formControlName="[módulo]Number">
  </mat-form-field>

  <mat-form-field>
    <mat-label>{{ '[módulos].filter.person' | translate }}</mat-label>
    <input matInput formControlName="personName">
  </mat-form-field>

  <mat-form-field>
    <mat-label>{{ '[módulos].filter.status' | translate }}</mat-label>
    <mat-select formControlName="status">
      <mat-option value="">{{ 'common.all' | translate }}</mat-option>
      <mat-option value="active">{{ 'common.active' | translate }}</mat-option>
      <mat-option value="inactive">{{ 'common.inactive' | translate }}</mat-option>
    </mat-select>
  </mat-form-field>

  <mat-form-field>
    <mat-label>{{ '[módulos].filter.startDate' | translate }}</mat-label>
    <input matInput [matDatepicker]="startPicker" formControlName="startDate">
    <mat-datepicker-toggle matSuffix [for]="startPicker"></mat-datepicker-toggle>
    <mat-datepicker #startPicker></mat-datepicker>
  </mat-form-field>

  <mat-form-field>
    <mat-label>{{ '[módulos].filter.endDate' | translate }}</mat-label>
    <input matInput [matDatepicker]="endPicker" formControlName="endDate">
    <mat-datepicker-toggle matSuffix [for]="endPicker"></mat-datepicker-toggle>
    <mat-datepicker #endPicker></mat-datepicker>
  </mat-form-field>

  <div class="filter-actions">
    <button mat-raised-button color="primary" (click)="onApplyFilter()">
      {{ 'actions.apply' | translate }}
    </button>
    <button mat-button (click)="onClearFilter()">
      {{ 'actions.clear' | translate }}
    </button>
  </div>
</form>
```

---

## 📝 7. FORM CONTAINER ([módulo]s-form-container/)

### 7.1. Component TypeScript
```typescript
import { NgIf } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { GenericLayoutComponent, GenericMessageComponent, MessagesService, EnumLayoutType, EnumMessageType } from '@lib/shared';
import { [Módulo]FormComponent } from '../[módulo]-form/[módulo]-form.component';

@Component({
  selector: 'lfsoft-[categoría]-[módulos]-form-container',
  templateUrl: './[módulos]-form-container.component.html',
  styleUrls: ['./[módulos]-form-container.component.scss'],
  standalone: true,
  imports: [NgIf, GenericLayoutComponent, GenericMessageComponent, [Módulo]FormComponent],
  providers: [MessagesService]
})
export class [Módulos]FormContainerComponent implements OnInit {
  [módulo]Id: number = 0;
  layoutTypes = EnumLayoutType;

  constructor(
    private _router: Router,
    private _route: ActivatedRoute,
    private _messagesService: MessagesService
  ) {}

  ngOnInit(): void {
    this._route.queryParams.subscribe(params => {
      this.[módulo]Id = params['id'];
    });
  }

  onSave(): void {
    this._messagesService.addMessage('MESSAGE.successSave', EnumMessageType.Success);
  }

  onCancel(): void {
    window.close();
  }
}
```

### 7.2. Template HTML
```html
<lfsoft-shared-message></lfsoft-shared-message>
<lfsoft-shared-layout  
  [title]="'[módulos].title' | translate" 
  [type]="layoutTypes.layoutWithoutSidebar" 
  class="[módulo]-container">
  <lfsoft-[categoría]-[módulo]-form
    formContent
    (save)="onSave()"
    (cancel)="onCancel()">
  </lfsoft-[categoría]-[módulo]-form>
</lfsoft-shared-layout>
```

---

## 📝 8. FORMULARIO PRINCIPAL ([módulo]-form/)

### 8.1. Component TypeScript (Estructura Base)
```typescript
import { Component, EventEmitter, Input, OnInit, Output, OnDestroy, DestroyRef, inject } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { [Módulo], [Módulo]Item } from '../models/[módulo].model';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { GenericFormComponent, GenericActionsComponent, FormValidationsDirective, TranslatePipe, SkeletonDirective, ActionService, GridService, MessagesService, ModalService, EnumMessageType, EnumActionsType, CONFIRM_CANCEL, Action } from '@lib/shared';
import { [Módulo]ItemGrid } from '../models/[módulo]-item-grid.model';
import { [Módulo]Service } from '../services/[módulo].service';
import { [Módulo]ItemFormComponent } from './[módulo]-item-form/[módulo]-item-form.component';
import { [Módulo]ItemGridComponent } from './[módulo]-item-grid/[módulo]-item-grid.component';

@Component({
  selector: 'lfsoft-[categoría]-[módulo]-form',
  templateUrl: './[módulo]-form.component.html',
  styleUrls: ['./[módulo]-form.component.scss'],
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, MatIconModule, GenericFormComponent, 
    GenericActionsComponent, FormValidationsDirective, TranslatePipe, 
    SkeletonDirective, MatButtonModule, [Módulo]ItemGridComponent, [Módulo]ItemFormComponent],
  providers: [ActionService, GridService]
})
export class [Módulo]FormComponent implements OnInit, OnDestroy {
  @Input() [módulo]Id: number = 0;
  @Output() save = new EventEmitter<[Módulo]>();
  @Output() cancel = new EventEmitter<void>();

  showForm = false;
  isLoading: boolean = true;
  [módulo]Form: FormGroup = new FormGroup({});
  [módulo]: [Módulo] = new [Módulo]();
  [módulo]ItemSelected: [Módulo]Item = new [Módulo]Item();

  private _itemsTMP: [Módulo]Item[] = [];
  private readonly _destroyRef = inject(DestroyRef);
  private _hasItemsDirty: boolean = false;

  private get itemsGrid(): [Módulo]ItemGrid[] {
    return this._mapTo[Módulo]ItemGrid(this._itemsTMP);
  }

  constructor(
    private fb: FormBuilder, 
    private _[módulo]Service: [Módulo]Service, 
    private _actionService: ActionService, 
    private _messagesService: MessagesService,
    private _modalService: ModalService,
    private _gridService: GridService<[Módulo]ItemGrid>
  ) {}

  ngOnInit(): void {
    this._createForm();
    this._loadSecurityActions();
    
    if (this.[módulo]Id > 0) {
      this._load[Módulo]();
    } else {
      this.isLoading = false;
      this.showForm = true;
    }
  }

  ngOnDestroy(): void {}

  onAction(action: EnumActionsType): void {
    switch (action) {
      case EnumActionsType.actionSave:
        this._save[Módulo]();
        break;
      case EnumActionsType.actionCancel:
        this._cancel();
        break;
      case EnumActionsType.actionAddItem:
        this._addItem();
        break;
      default:
        break;
    }
  }

  onItemAction(event: { action: EnumActionsType, row: [Módulo]ItemGrid }): void {
    switch (event.action) {
      case EnumActionsType.actionEdit:
        this._editItem(event.row);
        break;
      case EnumActionsType.actionDelete:
        this._deleteItem(event.row);
        break;
      default:
        break;
    }
  }

  onItemSave(item: [Módulo]Item): void {
    if (item.[módulo]ItemId === 0) {
      item.[módulo]ItemId = -(this._itemsTMP.length + 1);
      this._itemsTMP.push(item);
    } else {
      const index = this._itemsTMP.findIndex(i => i.[módulo]ItemId === item.[módulo]ItemId);
      if (index !== -1) {
        this._itemsTMP[index] = item;
      }
    }
    
    this._hasItemsDirty = true;
    this._gridService.setData({
      items: this.itemsGrid,
      totalCount: this.itemsGrid.length,
      pageNumber: 1,
      pageSize: this.itemsGrid.length
    });
    
    this.[módulo]ItemSelected = new [Módulo]Item();
    this._enableAction(EnumActionsType.actionAddItem);
  }

  onItemCancel(): void {
    this.[módulo]ItemSelected = new [Módulo]Item();
    this._enableAction(EnumActionsType.actionAddItem);
  }

  // Métodos privados
  private _createForm(): void {
    this.[módulo]Form = this.fb.group({
      [módulo]Number: ['', Validators.required],
      description: ['', Validators.required],
      status: ['', Validators.required],
      personId: [0, [Validators.required, Validators.min(1)]],
      personName: ['', Validators.required],
      creationDate: [new Date()],
      totalAmount: [0]
    });
  }

  private _load[Módulo](): void {
    this._[módulo]Service.get[Módulo](this.[módulo]Id)
      .pipe(takeUntilDestroyed(this._destroyRef))
      .subscribe({
        next: ([módulo]) => {
          this.[módulo] = [módulo];
          this._itemsTMP = [...[módulo].items];
          this.[módulo]Form.patchValue([módulo]);
          
          this._gridService.setData({
            items: this.itemsGrid,
            totalCount: this.itemsGrid.length,
            pageNumber: 1,
            pageSize: this.itemsGrid.length
          });
          
          this.isLoading = false;
          this.showForm = true;
        },
        error: () => {
          this._messagesService.addMessage("Error al cargar [módulo]", EnumMessageType.Error);
          this.isLoading = false;
        }
      });
  }

  private _save[Módulo](): void {
    if (this.[módulo]Form.invalid) {
      this._messagesService.addMessage("Formulario inválido", EnumMessageType.Warning);
      return;
    }

    const [módulo]Data: [Módulo] = {
      ...this.[módulo],
      ...this.[módulo]Form.value,
      items: this._itemsTMP
    };

    this.save.emit([módulo]Data);
  }

  private _cancel(): void {
    if (this.[módulo]Form.dirty || this._hasItemsDirty) {
      this._modalService.openConfirmModal(CONFIRM_CANCEL)
        .pipe(takeUntilDestroyed(this._destroyRef))
        .subscribe(confirmed => {
          if (confirmed) {
            this.cancel.emit();
          }
        });
    } else {
      this.cancel.emit();
    }
  }

  private _addItem(): void {
    this.[módulo]ItemSelected = new [Módulo]Item();
    this._disableAction(EnumActionsType.actionAddItem);
  }

  private _editItem(itemGrid: [Módulo]ItemGrid): void {
    const item = this._itemsTMP.find(i => i.[módulo]ItemId === itemGrid.[módulo]ItemId);
    if (item) {
      this.[módulo]ItemSelected = { ...item };
      this._disableAction(EnumActionsType.actionAddItem);
    }
  }

  private _deleteItem(itemGrid: [Módulo]ItemGrid): void {
    const index = this._itemsTMP.findIndex(i => i.[módulo]ItemId === itemGrid.[módulo]ItemId);
    if (index !== -1) {
      this._itemsTMP.splice(index, 1);
      this._hasItemsDirty = true;
      
      this._gridService.setData({
        items: this.itemsGrid,
        totalCount: this.itemsGrid.length,
        pageNumber: 1,
        pageSize: this.itemsGrid.length
      });
    }
  }

  private _loadSecurityActions(): void {
    const actions: Action[] = [
      new Action('actions.save', EnumActionsType.actionSave, 'save', false),
      new Action('actions.cancel', EnumActionsType.actionCancel, 'cancel', false),
      new Action('actions.addItem', EnumActionsType.actionAddItem, 'add', false)
    ];
    this._actionService.setActions(actions);
  }

  private _enableAction(actionType: EnumActionsType): void {
    this._actionService.enable(actionType);
  }

  private _disableAction(actionType: EnumActionsType): void {
    this._actionService.disable(actionType);
  }

  private _mapTo[Módulo]ItemGrid(items: [Módulo]Item[]): [Módulo]ItemGrid[] {
    return items.map(item => ({
      [módulo]ItemId: item.[módulo]ItemId,
      itemNumber: item.itemNumber,
      description: item.description,
      quantity: item.quantity,
      unitPrice: item.unitPrice,
      totalPrice: item.totalPrice
    }));
  }
}
```

### 8.2. Template HTML
```html
<lfsoft-generic-form *ngIf="showForm" [title]="'[módulos].form.title' | translate">
  <!-- ACTIONS -->
  <div actions>
    <lfsoft-generic-actions (actionClick)="onAction($event)"></lfsoft-generic-actions>
  </div>

  <!-- FORM -->
  <div content>
    <form [formGroup]="[módulo]Form">
      <!-- CAMPOS PRINCIPALES -->
      <mat-form-field>
        <mat-label>{{ '[módulos].form.number' | translate }}</mat-label>
        <input matInput formControlName="[módulo]Number" appFormValidations>
      </mat-form-field>

      <mat-form-field>
        <mat-label>{{ '[módulos].form.description' | translate }}</mat-label>
        <input matInput formControlName="description" appFormValidations>
      </mat-form-field>

      <!-- GRID DE ITEMS -->
      <div class="items-section">
        <h3>{{ '[módulos].items.title' | translate }}</h3>
        
        <lfsoft-[categoría]-[módulo]-item-form
          *ngIf="[módulo]ItemSelected.[módulo]ItemId !== undefined"
          [[módulo]Item]="[módulo]ItemSelected"
          (save)="onItemSave($event)"
          (cancel)="onItemCancel()">
        </lfsoft-[categoría]-[módulo]-item-form>
        
        <lfsoft-[categoría]-[módulo]-item-grid
          (actionClick)="onItemAction($event)">
        </lfsoft-[categoría]-[módulo]-item-grid>
      </div>
    </form>
  </div>
</lfsoft-generic-form>

<div *ngIf="isLoading" class="loading-container">
  <mat-spinner></mat-spinner>
</div>
```

---

## 📊 9. ITEM-FORM ([módulo]-item-form/)

### 9.1. Component TypeScript
```typescript
import { Component, DestroyRef, EventEmitter, inject, Input, Output } from '@angular/core';
import { [Módulo]Item, [Módulo]ItemDetail } from '../../models/[módulo]-item.model';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormGroup, FormBuilder, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { RouterOutlet } from '@angular/router';
import { HttpErrorResponse } from '@angular/common/http';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { MatIconModule } from '@angular/material/icon';
import { GenericFormComponent, GenericActionsComponent, TranslatePipe, FormValidationsDirective, GridService, ActionService, MessagesService, ModalService, EnumActionsType, EnumMessageType, CONFIRM_DELETE, Action } from '@lib/shared';
import { [Módulo]ItemDetailGrid } from '../../models/[módulo]-item-detail-grid.model';
import { [Módulo]ItemDetailFormComponent } from './[módulo]-item-detail-form/[módulo]-item-detail-form.component';
import { [Módulo]ItemDetailGridComponent } from './[módulo]-item-detail-grid/[módulo]-item-detail-grid.component';

@Component({
  selector: 'lfsoft-[categoría]-[módulo]-item-form',
  templateUrl: './[módulo]-item-form.component.html',
  styleUrl: './[módulo]-item-form.component.scss',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterOutlet, MatIconModule, GenericFormComponent, 
    GenericActionsComponent, MatButtonModule, TranslatePipe, FormValidationsDirective, 
    [Módulo]ItemDetailGridComponent, [Módulo]ItemDetailFormComponent],
  providers: [GridService, ActionService]
})
export class [Módulo]ItemFormComponent {
  private _[módulo]Item: [Módulo]Item = new [Módulo]Item();
  private _hasDetailsDirty: boolean = false;
  private readonly _destroyRef = inject(DestroyRef);

  @Input() set [módulo]Item(value: [Módulo]Item | null) {
    if (!value) return;
    
    this._[módulo]Item = value;
    this.updateForm(value);
  }

  get [módulo]Item(): [Módulo]Item {
    return this._[módulo]Item;
  }

  @Output() accept = new EventEmitter<[Módulo]Item>();
  @Output() cancel = new EventEmitter<void>();
  
  itemDetailSelected: [Módulo]ItemDetail = new [Módulo]ItemDetail();
  showForm: boolean = false;
  form: FormGroup = new FormGroup({});  
  
  private _detailsTMP: [Módulo]ItemDetail[] = [];

  private get detailsGrid(): [Módulo]ItemDetailGrid[] {
    return this._mapToItemDetailGrid(this._detailsTMP);
  }

  constructor(
    private fb: FormBuilder, 
    private _gridService: GridService<[Módulo]ItemDetail>,
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

  onAction(action: EnumActionsType): void {
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
    const updated[Módulo]Item: [Módulo]Item = this._mapFormTo[Módulo]Item();
    this._hasDetailsDirty = false;
    this.form.markAsPristine();
    this.accept.emit(updated[Módulo]Item);
  }

  private _cancelItem(): void {
    this.showForm = false;
    this.cancel.emit();
  } 
  //#endregion

  //#region Mapping Methods
  private _mapToItemDetailGrid(details: [Módulo]ItemDetail[]): [Módulo]ItemDetailGrid[] {
    return details.map(detail => ({
      selected: false,
      [módulo]Id: detail.[módulo]Id,
      itemId: detail.itemId,
      detailId: detail.detailId,
      detailDescription: detail.detailDescription,
      detailQuantity: detail.detailQuantity,
      detailUnitPrice: detail.detailUnitPrice,
      detailTotalPrice: detail.detailTotalPrice
    }));
  }

  private _mapFormTo[Módulo]Item(): [Módulo]Item {
    const formData = this.form.getRawValue() as [Módulo]Item; 
     
    const item = new [Módulo]Item();
    item.[módulo]Id = formData.[módulo]Id;
    item.itemId = formData.itemId;
    item.itemDescription = formData.itemDescription;
    item.itemQuantity = formData.itemQuantity; 
    item.details = this._detailsTMP;   
    return item;
  }
  //#endregion

  //#region Items Details Public Methods
  onEditItemDetail(itemDetail: [Módulo]ItemDetailGrid) {
    const detail: [Módulo]ItemDetail | undefined = this._detailsTMP.find(x => x.detailId === itemDetail.detailId);
    if (!detail) {
      this._messagesService.addMessage('ERROR.itemNotFound', EnumMessageType.Error);
      return;
    }
    this.itemDetailSelected = detail;
    this.showForm = true;
  }

  onDeleteItemDetail(itemDetailGrid: [Módulo]ItemDetailGrid) {
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

  onAcceptItemDetail(itemDetail: [Módulo]ItemDetail) {    
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
    
    this.itemDetailSelected = new [Módulo]ItemDetail();
    this.itemDetailSelected.detailId = maxId + 1;
    this.itemDetailSelected.itemId = this.[módulo]Item.itemId;
    this.itemDetailSelected.[módulo]Id = this.[módulo]Item.[módulo]Id;
    this.showForm = true;
  }
  //#endregion
  
  //#region Private Methods
  private createForm() {
    this.form = this.fb.group({
      [módulo]Id: [0],
      itemId: [null],
      itemDescription: [''],
      itemQuantity: [0],
      itemUnitPrice: [{ value: 0, disabled: true }],
      itemTotalPrice: [{ value: 0, disabled: true }]
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

  private updateForm([módulo]Item: [Módulo]Item | undefined) {
    if (![módulo]Item) return;
    this.form.patchValue({
      [módulo]Id: [módulo]Item.[módulo]Id,
      itemId: [módulo]Item.itemId,
      itemDescription: [módulo]Item.itemDescription,
      itemQuantity: [módulo]Item.itemQuantity,
      itemUnitPrice: [módulo]Item.itemUnitPrice,
      itemTotalPrice: [módulo]Item.itemTotalPrice
    });
        
    this._detailsTMP = [módulo]Item.details;
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
```

### 9.2. Template HTML
```html
<lfsoft-shared-form [title]="'Datos del item ' + ([módulo]Item?.itemId || '')" [showActions]="!showForm">
  <div data>
    <form [formGroup]="form"  [lfsoftFormValidations]="form">
      <div class="[módulo]-item-form">
        <div class="[módulo]-item-form__group skeleton-field" col-span="1">
          <label class="[módulo]-item-form__label" for="itemQuantity">{{ 'LABEL.quantity' | translate}}</label>
          <input 
            id="itemQuantity"
            type="number"
            formControlName="itemQuantity"
            class="[módulo]-item-form__control"
            min="0"
            step="1">
        </div>
        <div class="[módulo]-item-form__group skeleton-field" col-span="3" row-span="2">
          <label class="[módulo]-item-form__label" for="itemDescription">{{ 'LABEL.description' | translate}}</label>
          <textarea 
            id="itemDescription"
            formControlName="itemDescription"
            class="[módulo]-item-form__control"
            rows="7">
          </textarea>
        </div>        
        <div class="[módulo]-item-form__group skeleton-field" col-span="1">
          <label class="[módulo]-item-form__label" for="itemUnitPrice">{{ 'LABEL.unitPrice' | translate}}</label>
          <input 
            id="itemUnitPrice"
            type="number"
            formControlName="itemUnitPrice"
            class="[módulo]-item-form__control"
            readonly>
        </div>
        <div class="[módulo]-item-form__group skeleton-field" col-span="1">
          <label class="[módulo]-item-form__label" for="itemTotalPrice">{{ 'LABEL.totalPrice' | translate}}</label>
          <input 
            id="itemTotalPrice"
            type="number"
            formControlName="itemTotalPrice"
            class="[módulo]-item-form__control"
            readonly>
        </div>
      </div>
    </form>
  </div>
  @if(!showForm){
    <div bodyTop>
      <div class="[módulo]-item-form__grid">
        <lfsoft-[categoría]-[módulo]-item-detail-grid 
          (edit)="onEditItemDetail($event)" 
          (delete)="onDeleteItemDetail($event)">
        </lfsoft-[categoría]-[módulo]-item-detail-grid>
      </div>
      <div class="[módulo]-item-form__actions">
        <div class="[módulo]-item-form__actions--buttons">          
          <mat-icon  (click)="onAddItemDetail()">add</mat-icon> 
        </div>
      </div>
    </div> 
  }
  @if(showForm){
  <div  bodyTop>
    <div class="[módulo]-item-form__main">
      <lfsoft-[categoría]-[módulo]-item-detail-form 
        [[módulo]ItemDetail]="itemDetailSelected" 
        (accept)="onAcceptItemDetail($event)" 
        (cancel)="onCancelItemDetail()">
      </lfsoft-[categoría]-[módulo]-item-detail-form>
    </div>
  </div>
  }
  <lfsoft-shared-actions
    footerContent
    (action)="onAction($event)">
  </lfsoft-shared-actions>
</lfsoft-shared-form>
```

---

## 📋 10. ITEM-GRID ([módulo]-item-grid/)

### 10.1. Component TypeScript
```typescript
import { AsyncPipe } from '@angular/common';
import { Component, EventEmitter, Output } from '@angular/core';
import { GenericGridComponent, GridColumn, GridService, Action, EnumActionsType, EnumActionsViewType } from '@lib/shared';
import { [Módulo]ItemGrid } from '../../models/[módulo]-item-grid.model';

@Component({
  selector: 'lfsoft-[categoría]-[módulo]-item-grid',
  imports: [AsyncPipe, GenericGridComponent],
  templateUrl: './[módulo]-item-grid.component.html',
  styleUrl: './[módulo]-item-grid.component.scss',
  standalone: true
})
export class [Módulo]ItemGridComponent {
  columns: GridColumn<[Módulo]ItemGrid>[] = [];

  @Output() edit = new EventEmitter<[Módulo]ItemGrid>();
  @Output() delete = new EventEmitter<[Módulo]ItemGrid>();
  
  constructor(private _gridService: GridService<[Módulo]ItemGrid>) {
    this._inicializeColumns();
  }

  ngOnInit(): void {
    this._gridService.setColumns(this.columns);
    this._loadSecurityActions();
  }

  onEdit([módulo]ItemGrid: [Módulo]ItemGrid) {
      this.edit.emit([módulo]ItemGrid);
  }

  onDelete([módulo]ItemGrid: [Módulo]ItemGrid) {
    this.delete.emit([módulo]ItemGrid);
  } 

  private _inicializeColumns(): void {
    this.columns = [
      { 
          field: 'itemId',
          header: 'LABEL.id',
          sortable: true,
          align: 'right',
          width: '5%'
      },    
      {
          field: 'itemDescription',
          header: 'LABEL.description',
          sortable: true,
          align: 'left',
          width: '60%'
      },
      { 
          field: 'itemQuantity',
          header: 'LABEL.quantity',
          sortable: true,
          align: 'right',
          width: '8%'
      },
      { 
          field: 'itemUnitPrice',
          header: 'LABEL.unitPrice',
          sortable: true,
          align: 'right',
          width: '10%'
      },
      { 
          field: 'itemTotalPrice',
          header: 'LABEL.totalPrice',
          sortable: true,
          align: 'right',
          width: '10%'
      }
    ];
  }

  private _loadSecurityActions(): void {
    const actions: Action[] = [
      new Action('', EnumActionsType.actionDelete, 'delete', false, EnumActionsViewType.view16x16),
    ];
    this._gridService.setActions(actions);
  }
}
```

### 10.2. Template HTML
```html
<lfsoft-shared-grid 
  [data]="_gridService.getData() | async"
  [columns]="columns"
  [actions]="_gridService.getActions()"
  (edit)="onEdit($event)"
  (delete)="onDelete($event)">
</lfsoft-shared-grid>
```

---

## 📋 11. ITEM-DETAIL-FORM ([módulo]-item-detail-form/)

### 11.1. Component TypeScript
```typescript
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { [Módulo]ItemDetail } from '../../../models/[módulo]-item-detail.model';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormGroup, FormBuilder, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { RouterOutlet } from '@angular/router';
import { HttpErrorResponse } from '@angular/common/http';
import { ArticleService } from '@lib/articles';
import { GenericFormComponent, TranslatePipe, FormValidationsDirective, GenericActionsComponent, ActionService, MessagesService, EnumActionsType, EnumMessageType, Action } from '@lib/shared';

@Component({
  selector: 'lfsoft-[categoría]-[módulo]-item-detail-form',
  templateUrl: './[módulo]-item-detail-form.component.html',
  styleUrl: './[módulo]-item-detail-form.component.scss',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterOutlet, GenericFormComponent, MatButtonModule, TranslatePipe, FormValidationsDirective, GenericActionsComponent],
  providers: [ActionService]
})
export class [Módulo]ItemDetailFormComponent {
  private _itemDetail: [Módulo]ItemDetail= new [Módulo]ItemDetail();
  @Input() set [módulo]ItemDetail(value: [Módulo]ItemDetail) {
    if (!value) return;
    this._itemDetail = value;
    this._updateForm(value);
  }
  get [módulo]ItemDetail(): [Módulo]ItemDetail {
    return this._itemDetail;
  }

  @Output() accept = new EventEmitter<[Módulo]ItemDetail>();
  @Output() cancel = new EventEmitter<void>();

  form: FormGroup = new FormGroup({});  

  constructor(
    private fb: FormBuilder, 
    private _messagesService: MessagesService, 
    private _actionService: ActionService,
    private _articleService: ArticleService
  ) {    
    this._createForm();
  }

  ngOnDestroy(): void { }

  ngOnInit(): void {   
    this._loadSecurityActions();
  }

  isReadyToAccept(): boolean {
    return this.form.valid && this.form.dirty;
  }

  onAction(action: EnumActionsType): void {
    try {
      switch (action) {
        case EnumActionsType.actionAccept:
          this._acceptItemDetail();
          break;
        case EnumActionsType.actionCancel:
          this._cancelItemDetail();
          break;
      }
    } catch (error) {
      this._messagesService.addMessage(error as HttpErrorResponse, EnumMessageType.Error);
    }
  }

  onSearchArticle(): void {
    const code = this.form.get('detailCode')?.value;
    if (!code) return;

    this._articleService.getArticleByAssy(code).subscribe({
      next: (article) => {
        this.form.patchValue({
          detailDescription: article.description,
          detailUnitPrice: article.listprice
        });
        this.form.get('detailDescription')?.disable();
        this.form.get('detailUnitPrice')?.disable();
        
        this._recalculatePrices();
      },
      error: (error: HttpErrorResponse) => {
        this.form.get('detailDescription')?.enable();
        this.form.get('detailUnitPrice')?.enable();
      }
    });
  }

  //#region Item Details Private Methods
  private _acceptItemDetail(): void {
    if (this.form.valid) {
      const updated[Módulo]ItemDetail: [Módulo]ItemDetail = this._mapFormToDetail();      
      this.accept.emit(updated[Módulo]ItemDetail);
    }
  }

  private _cancelItemDetail(): void {
    this.cancel.emit();
  } 
  //#endregion

  //#region Private Methods
  private _updateForm([módulo]ItemDetail: [Módulo]ItemDetail) {
    this.form.patchValue({
      [módulo]Id: [módulo]ItemDetail.[módulo]Id,
      itemId: [módulo]ItemDetail.itemId,
      detailId: [módulo]ItemDetail.detailId,
      detailCode: [módulo]ItemDetail.detailCode,
      detailDescription: [módulo]ItemDetail.detailDescription,
      detailQuantity: [módulo]ItemDetail.detailQuantity,
      detailUnitPrice: [módulo]ItemDetail.detailUnitPrice,
      detailTotalPrice: [módulo]ItemDetail.detailTotalPrice
    });
  }
    
  private _createForm() {
    this.form = this.fb.group({
      [módulo]Id: [],
      itemId: [],
      detailId: [],
      detailCode: [],
      detailDescription: [null, Validators.required],
      detailQuantity: [null, [Validators.required, Validators.min(0)]],
      detailUnitPrice: [null, [Validators.required, Validators.min(0)]],
      detailTotalPrice: [{ value: null, disabled: true }]
    });

    this.form.get('detailQuantity')?.valueChanges.subscribe(() => this._recalculatePrices());
    this.form.get('detailUnitPrice')?.valueChanges.subscribe(() => this._recalculatePrices());
  }

  private _recalculatePrices(): void {
    const quantity = this.form.get('detailQuantity')?.value || 0;
    const unitPrice = this.form.get('detailUnitPrice')?.value || 0;
    const totalPrice = quantity * unitPrice;
    this.form.get('detailTotalPrice')?.setValue(totalPrice, { emitEvent: false });
  }

  //#endregion

  //#region Mapping Methods
  private _mapFormToDetail(): [Módulo]ItemDetail { 
    const formData = this.form.getRawValue() as [Módulo]ItemDetail;
    const detail: [Módulo]ItemDetail = new [Módulo]ItemDetail () 
    detail.[módulo]Id = formData.[módulo]Id;
    detail.itemId = formData.itemId;
    detail.detailId = formData.detailId;
    detail.detailCode = formData.detailCode;
    detail.detailDescription = formData.detailDescription;
    detail.detailQuantity = formData.detailQuantity;
    detail.detailUnitPrice = formData.detailUnitPrice;
    return detail;  
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
  //#endregion
}
```

### 11.2. Template HTML
```html
<lfsoft-shared-form [title]="'Datos del detalle'" + ([módulo]ItemDetail?.itemId || '')" [showActions]="true">
  <div data>
    <form [formGroup]="form"  [lfsoftFormValidations]="form">
      <div class="[módulo]-item-detail-form">
        <div class="[módulo]-item-detail-form__group skeleton-field" col-span="1">
          <label class="[módulo]-item-detail-form__label" for="detailQuantity">{{ 'LABEL.quantity' | translate}}</label>
          <input 
            id="detailQuantity"
            type="number"
            formControlName="detailQuantity"
            class="[módulo]-item-detail-form__control"
            min="0"
            step="1">
        </div>
        <div class="[módulo]-item-detail-form__group skeleton-field" col-span="1">
          <label class="[módulo]-item-detail-form__label" for="detailCode">{{ 'LABEL.code' | translate}}</label>
          <input 
            id="detailCode"
            type="text"
            formControlName="detailCode"
            class="[módulo]-item-detail-form__control"
            (keydown.enter)="onSearchArticle()">
        </div>
        <div class="[módulo]-item-detail-form__group skeleton-field" col-span="2" >
          <label class="[módulo]-item-detail-form__label" for="detailDescription">{{ 'LABEL.description' | translate}}</label>
          <input 
            id="detailDescription"
            type="text"
            formControlName="detailDescription"
            class="[módulo]-item-detail-form__control ">
        </div>        
        <div class="[módulo]-item-detail-form__group skeleton-field" col-span="1">
          <label class="[módulo]-item-detail-form__label" for="detailUnitPrice">{{ 'LABEL.unitPrice' | translate}}</label>
          <input 
            id="detailUnitPrice"
            type="number"
            formControlName="detailUnitPrice"
            class="[módulo]-item-detail-form__control"
            min="0"
            step="0.01">
        </div>
        <div class="[módulo]-item-detail-form__group skeleton-field" col-span="1">
          <label class="[módulo]-item-detail-form__label" for="detailTotalPrice">{{ 'LABEL.totalPrice' | translate}}</label>
          <input 
            id="detailTotalPrice"
            type="number"
            formControlName="detailTotalPrice"
            class="[módulo]-item-detail-form__control"
            readonly>
        </div>
      </div>
    </form>
  </div>

<lfsoft-shared-actions
    footerContent
    (action)="onAction($event)">
  </lfsoft-shared-actions>
  
</lfsoft-shared-form>
```

---

## 📋 12. ITEM-DETAIL-GRID ([módulo]-item-detail-grid/)

### 12.1. Component TypeScript
```typescript
import { Component, EventEmitter, Output } from '@angular/core';
import { GenericGridComponent, GridColumn, GridService, Action, EnumActionsType, EnumActionsViewType } from '@lib/shared';
import { [Módulo]ItemDetailGrid } from '../../../models/[módulo]-item-detail-grid.model';

@Component({
  selector: 'lfsoft-[categoría]-[módulo]-item-detail-grid',
  imports: [GenericGridComponent],
  templateUrl: './[módulo]-item-detail-grid.component.html',
  styleUrl: './[módulo]-item-detail-grid.component.scss',
  standalone: true
})
export class [Módulo]ItemDetailGridComponent {
  columns: GridColumn<[Módulo]ItemDetailGrid>[] = [];
  
  @Output() edit = new EventEmitter<[Módulo]ItemDetailGrid>();
  @Output() delete = new EventEmitter<[Módulo]ItemDetailGrid>();
  
  constructor(private _gridService: GridService<[Módulo]ItemDetailGrid>) {
    this._inicializeColumns();
  }

  ngOnInit(): void {  
    this._gridService.setColumns(this.columns);
    this._loadSecurityActions();
  }

  onEdit(itemDetailGrid: [Módulo]ItemDetailGrid) {
    this.edit.emit(itemDetailGrid);
  }

  onDelete(itemDetailGrid: [Módulo]ItemDetailGrid) {
    this.delete.emit(itemDetailGrid);
  } 

  private _inicializeColumns(): void {
    this.columns = [
      { 
        field: 'detailId', 
        header: 'LABEL.id',
        sortable: true,
        align: 'right',
        width: '5%'
      },
      { 
        field: 'detailDescription', 
        header: 'LABEL.description',
        sortable: true,
        align: 'left',
        width: '60%'
      },
      { 
        field: 'detailQuantity',
        header: 'LABEL.quantity',
        sortable: true,
        align: 'right',
        width: '8%'
      },
      { 
        field: 'detailUnitPrice',
        header: 'LABEL.unitPrice',
        sortable: true,
        align: 'right',
        width: '10%'
      },
      { 
        field: 'detailTotalPrice',
        header: 'LABEL.totalPrice',
        sortable: true,
        align: 'right',
        width: '10%'
      }
    ];
  }

  private _loadSecurityActions(): void {
    const actions: Action[] = [
      new Action('', EnumActionsType.actionDelete, 'delete', false, EnumActionsViewType.view16x16),
    ];
    this._gridService.setActions(actions);
  }
}
```

### 12.2. Template HTML
```html
<lfsoft-shared-grid 
  [data]="_gridService.getData() | async"
  [columns]="columns"
  [actions]="_gridService.getActions()"
  (edit)="onEdit($event)"
  (delete)="onDelete($event)">
</lfsoft-shared-grid>
```

---

## 🛣️ 13. ROUTING Y MÓDULO

### 13.1. Routing (`[módulos]-module-routing.module.ts`)
```typescript
import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { [Módulos]ContainerComponent } from './[módulos]-container/[módulos]-container.component';
import { [Módulos]FormContainerComponent } from './[módulos]-form-container/[módulos]-form-container.component';

const routes: Routes = [
  { path: '', component: [Módulos]ContainerComponent },
  { path: 'form/:id', component: [Módulos]FormContainerComponent }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class [Módulos]ModuleRoutingModule { }
```

### 13.2. Module (`[módulos].module.ts`)
```typescript
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { [Módulos]ModuleRoutingModule } from './[módulos]-module-routing.module';

@NgModule({
  imports: [
    CommonModule,
    ReactiveFormsModule,
    [Módulos]ModuleRoutingModule
  ],
  declarations: [],
  exports: []
})
export class [Módulos]Module {
  constructor() {}
}
```

### 13.3. Index (`index.ts`)
```typescript
export * from './[módulos].module';
export * from './[módulos]-module-routing.module';
export * from './models/[módulo].model';
export * from './models/[módulo]-grid.model';
export * from './models/[módulo]-filter.model';
export * from './models/[módulo]-item.model';
export * from './models/[módulo]-item-grid.model';
export * from './models/[módulo]-item-detail.model';
export * from './models/[módulo]-item-detail-grid.model';
export * from './services/[módulo].service';
export * from './[módulos]-container/[módulos]-container.component';
export * from './[módulos]-form-container/[módulos]-form-container.component';
export * from './[módulo]-form/[módulo]-form.component';
export * from './[módulo]-form/[módulo]-item-form/[módulo]-item-form.component';
export * from './[módulo]-form/[módulo]-item-grid/[módulo]-item-grid.component';
export * from './[módulo]-form/[módulo]-item-form/[módulo]-item-detail-form/[módulo]-item-detail-form.component';
export * from './[módulo]-form/[módulo]-item-form/[módulo]-item-detail-grid/[módulo]-item-detail-grid.component';
```

---

## 🎨 14. ESTILOS (SCSS)

### 14.1. Estilos Generales
Todos los archivos `.scss` siguen el mismo patrón básico:

```scss
:host {
  display: block;
  width: 100%;
  height: 100%;
  padding: 1rem;
}

.container {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}
```

### 14.2. Estilos de Formularios
```scss
.[módulo]-item-form {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 1rem;
  padding: 1rem;

  &__group {
    display: flex;
    flex-direction: column;
    
    &[col-span="1"] { grid-column: span 1; }
    &[col-span="2"] { grid-column: span 2; }
    &[col-span="3"] { grid-column: span 3; }
    &[col-span="4"] { grid-column: span 4; }
    
    &[row-span="2"] { grid-row: span 2; }
  }

  &__label {
    font-weight: 500;
    margin-bottom: 0.5rem;
  }

  &__control {
    padding: 0.5rem;
    border: 1px solid #ccc;
    border-radius: 4px;
    
    &:focus {
      outline: none;
      border-color: #1976d2;
    }
    
    &:disabled {
      background-color: #f5f5f5;
      cursor: not-allowed;
    }
  }

  &__grid {
    margin-top: 1rem;
  }

  &__actions {
    display: flex;
    justify-content: flex-end;
    margin-top: 1rem;
    
    &--buttons {
      display: flex;
      gap: 0.5rem;
    }
  }
}
```

---

## ✅ 15. CHECKLIST DE IMPLEMENTACIÓN

### Fase 1: Modelos y Servicios
1. ☐ Crear estructura de carpetas completa
2. ☐ Implementar modelo principal ([módulo].model.ts)
3. ☐ Implementar modelo grid ([módulo]-grid.model.ts)
4. ☐ Implementar modelo filter ([módulo]-filter.model.ts)
5. ☐ Implementar modelo item ([módulo]-item.model.ts)
6. ☐ Implementar modelo item-grid ([módulo]-item-grid.model.ts)
7. ☐ Implementar modelo item-detail ([módulo]-item-detail.model.ts)
8. ☐ Implementar modelo item-detail-grid ([módulo]-item-detail-grid.model.ts)
9. ☐ Implementar servicio principal ([módulo].service.ts)
10. ☐ Implementar servicio PDF (opcional, [módulo]-pdf.service.ts)

### Fase 2: Contenedor y Grid Principal
11. ☐ Implementar contenedor principal (TS + HTML + SCSS)
12. ☐ Implementar grid principal (TS + HTML + SCSS)
13. ☐ Implementar filtros (TS + HTML + SCSS)

### Fase 3: Formularios
14. ☐ Implementar form-container (TS + HTML + SCSS)
15. ☐ Implementar formulario principal (TS + HTML + SCSS)
16. ☐ Implementar item-form (TS + HTML + SCSS)
17. ☐ Implementar item-grid (TS + HTML + SCSS)
18. ☐ Implementar item-detail-form (TS + HTML + SCSS)
19. ☐ Implementar item-detail-grid (TS + HTML + SCSS)

### Fase 4: Configuración
20. ☐ Configurar routing ([módulos]-module-routing.module.ts)
21. ☐ Configurar módulo Angular ([módulos].module.ts)
22. ☐ Configurar exports en index.ts

### Fase 5: Integración
23. ☐ Agregar traducciones (es.json, en.json)
24. ☐ Configurar permisos y seguridad
25. ☐ Integrar con el menú principal
26. ☐ Configurar rutas en app.routes.ts

### Fase 6: Pruebas
27. ☐ Pruebas de CRUD básico
28. ☐ Pruebas de items y sub-items
29. ☐ Pruebas de validaciones
30. ☐ Pruebas de filtros y paginación
31. ☐ Pruebas de permisos
32. ☐ Pruebas de navegación

---

## 🔑 16. CONVENCIONES Y MEJORES PRÁCTICAS

### 16.1. Nomenclatura
- **Nombres en plural**: Container, Module, Routing → `[módulos]`
- **Nombres en singular**: Form, Model → `[módulo]`
- **PascalCase**: Clases y tipos → `[Módulo]`, `[MóduloItem]`
- **camelCase**: Variables y propiedades → `[módulo]Id`, `[módulo]Service`
- **kebab-case**: Archivos y selectores → `[módulo]-form`, `[módulo]-item-grid`
- **Prefijos en selectores**: `lfsoft-[categoría]-[módulo]-[componente]`

### 16.2. Imports y Módulos
- ✅ **Usar standalone components**: Todos los componentes deben ser standalone
- ✅ **Imports específicos**: Importar solo lo necesario en cada componente
- ✅ **Providers locales**: GridService y ActionService por componente cuando sea necesario
- ✅ **Shared imports**: Usar desde `@lib/shared` para componentes genéricos

### 16.3. Gestión de Estado
- ✅ **DestroyRef**: Para manejo automático de suscripciones con `takeUntilDestroyed()`
- ✅ **Flags de estado**: `_hasItemsDirty`, `_hasDetailsDirty` para tracking de cambios
- ✅ **Arrays temporales**: `_itemsTMP`, `_detailsTMP` para manejo de sub-entidades
- ✅ **Immutability**: Usar spread operator y copias para evitar mutaciones

### 16.4. Servicios Compartidos
- **ActionService**: Gestión centralizada de acciones (botones, permisos)
- **GridService**: Gestión de datos y configuración de grids
- **MessagesService**: Mensajes al usuario (success, error, warning)
- **ModalService**: Confirmaciones y diálogos
- **UrlSecurityService**: Gestión de URLs con permisos

### 16.5. Patrones de Acciones
```typescript
// Usar la clase Action con new
const actions: Action[] = [
  new Action('BUTTON.accept', EnumActionsType.actionAccept, 'check_small', false),
  new Action('BUTTON.cancel', EnumActionsType.actionCancel, 'cancel', false)
];

// NO usar object literals
// ❌ { label: 'accept', actionType: EnumActionsType.actionAccept, ... }
```

### 16.6. Gestión de Grids
```typescript
// Usar GenericGridComponent con columnas tipadas
columns: GridColumn<[Módulo]ItemGrid>[] = [
  { 
    field: 'itemId',
    header: 'LABEL.id',
    sortable: true,
    align: 'right',
    width: '5%'
  }
];

// Configurar acciones de grid
const actions: Action[] = [
  new Action('', EnumActionsType.actionDelete, 'delete', false, EnumActionsViewType.view16x16)
];
this._gridService.setActions(actions);
```

### 16.7. Recalculo de Precios
- ✅ **Suscribirse a valueChanges**: Recalcular automáticamente en cambios
- ✅ **Campos readonly**: Precios calculados deben ser readonly
- ✅ **Actualizar sin emitir**: Usar `{ emitEvent: false }` en setValue
- ✅ **Propagar cambios**: De detalles → items → documento principal

```typescript
this.form.get('detailQuantity')?.valueChanges.subscribe(() => this._recalculatePrices());
this.form.get('detailUnitPrice')?.valueChanges.subscribe(() => this._recalculatePrices());

private _recalculatePrices(): void {
  const quantity = this.form.get('detailQuantity')?.value || 0;
  const unitPrice = this.form.get('detailUnitPrice')?.value || 0;
  const totalPrice = quantity * unitPrice;
  this.form.get('detailTotalPrice')?.setValue(totalPrice, { emitEvent: false });
}
```

### 16.8. Manejo de IDs Temporales
```typescript
// Para nuevos items antes de guardar, usar IDs negativos
if (item.[módulo]ItemId === 0) {
  item.[módulo]ItemId = -(this._itemsTMP.length + 1);
  this._itemsTMP.push(item);
}

// Para detalles, usar max + 1
const maxId = this._detailsTMP.length > 0 
  ? Math.max(...this._detailsTMP.map(x => x.detailId)) 
  : 0;
this.itemDetailSelected.detailId = maxId + 1;
```

### 16.9. Validaciones
- ✅ **FormValidationsDirective**: Aplicar en forms para validaciones automáticas
- ✅ **Validators.required**: Para campos obligatorios
- ✅ **Validators.min()**: Para valores numéricos mínimos
- ✅ **Custom validators**: Cuando sea necesario
- ✅ **isReadyToAccept()**: Método para validar estado antes de aceptar

### 16.10. Búsquedas y Autocompletados
```typescript
// Implementar búsqueda con enter
onSearchArticle(): void {
  const code = this.form.get('detailCode')?.value;
  if (!code) return;

  this._articleService.getArticleByAssy(code).subscribe({
    next: (article) => {
      this.form.patchValue({
        detailDescription: article.description,
        detailUnitPrice: article.listprice
      });
      // Deshabilitar campos autocompletados
      this.form.get('detailDescription')?.disable();
      this.form.get('detailUnitPrice')?.disable();
    },
    error: () => {
      // Habilitar edición manual en caso de error
      this.form.get('detailDescription')?.enable();
      this.form.get('detailUnitPrice')?.enable();
    }
  });
}

// En template: (keydown.enter)="onSearchArticle()"
```

### 16.11. Mapeos de Modelos
- ✅ **Métodos privados**: `_mapTo[Módulo]ItemGrid()`, `_mapFormTo[Módulo]Item()`
- ✅ **Mantener separación**: Grid models vs Full models
- ✅ **Usar getRawValue()**: Para obtener valores de campos disabled

### 16.12. Confirmaciones
```typescript
// Usar constantes predefinidas
this._modalService.showModal(CONFIRM_DELETE)
  .pipe(takeUntilDestroyed(this._destroyRef))
  .subscribe(action => {
    if (action === EnumActionsType.actionAccept) {
      // Ejecutar acción
    }
  });

// Verificar cambios antes de cancelar
private _cancel(): void {
  if (this.[módulo]Form.dirty || this._hasItemsDirty) {
    this._modalService.openConfirmModal(CONFIRM_CANCEL)
      .pipe(takeUntilDestroyed(this._destroyRef))
      .subscribe(confirmed => {
        if (confirmed) {
          this.cancel.emit();
        }
      });
  } else {
    this.cancel.emit();
  }
}
```

### 16.13. Organización de Código
- ✅ **Regions**: Usar `#region` y `#endregion` para organizar
  - Items Public/Private Methods
  - Item Details Public/Private Methods
  - Mapping Methods
  - Security Actions
  - Private Methods
- ✅ **Orden de métodos**: Public → Lifecycle → Event handlers → Private
- ✅ **Prefijo privado**: `_` para métodos y propiedades privadas

### 16.14. Templates
- ✅ **Control flow**: Usar `@if` y `@for` (sintaxis moderna de Angular)
- ✅ **Async pipe**: Para observables en templates
- ✅ **Translate pipe**: Para todos los textos visibles
- ✅ **Skeleton directive**: Para loading states
- ✅ **Form validations**: `[lfsoftFormValidations]="form"`

### 16.15. Manejo de Errores
```typescript
// Catch errors en servicios
.pipe(
  catchError(error => {
    console.error('Error fetching [módulo]:', error);
    return throwError(() => error);
  })
)

// Mostrar mensajes al usuario
.subscribe({
  next: (data) => { /* ... */ },
  error: () => {
    this._messagesService.addMessage("Error al cargar [módulo]", EnumMessageType.Error);
  }
});
```

---

## 📝 17. NOTAS IMPORTANTES

1. **Standalone Components**: Todos los componentes deben ser standalone, no usar declarations en módulos
2. **Action Class**: SIEMPRE usar `new Action()` en lugar de object literals
3. **DestroyRef**: Preferir sobre ngOnDestroy para suscripciones
4. **GenericGridComponent**: Usar en lugar de mat-table directamente
5. **Providers locales**: GridService y ActionService deben estar en providers del componente
6. **Immutability**: Evitar mutaciones directas, usar spread operator
7. **TypeScript strict**: Inicializar todas las propiedades correctamente
8. **Error handling**: Siempre manejar errores en subscripciones
9. **Loading states**: Usar isLoading y skeleton para UX
10. **Dirty tracking**: Implementar para sub-entidades (_hasItemsDirty, _hasDetailsDirty)

---

**FIN DEL DOCUMENTO - VERSIÓN ACTUALIZADA**
