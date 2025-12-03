import { Component, Input, Output, EventEmitter, OnInit, ViewChild, AfterViewInit, OnChanges, SimpleChanges, ChangeDetectionStrategy, OnDestroy } from '@angular/core';
import { GridColumn } from './models/grid-column.model';
import { MatTableModule, MatTable, MatTableDataSource } from '@angular/material/table';
import { MatSortModule, Sort, MatSort } from '@angular/material/sort';
import { MatPaginatorModule, PageEvent, MatPaginator } from '@angular/material/paginator';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatTooltipModule } from '@angular/material/tooltip';
import { NgFor, NgIf } from '@angular/common';
import { GridService } from './services/grid.service';
import { Action } from '../generic-actions/models/actions.model';
import { ActionService } from '../generic-actions/services/actions.service';
import { GenericActionsComponent } from '../generic-actions/generic-actions.component';
import { EnumActionsType } from '../generic-actions/enums/actions-type.enums';
import { Subscription } from 'rxjs';
import { TranslatePipe } from '../generic-translate/translate.pipe';
import { DrawerService } from '../generic-drawer/services/drawer.service';
import { ConfigurationsDrawerComponent } from './configurations-drawer/configurations-drawer.component';

@Component({
  selector: 'app-generic-grid',
  templateUrl: './generic-grid.component.html',
  styleUrls: ['./generic-grid.component.scss'],
  standalone: true,
  imports: [
    NgFor, NgIf,
    MatTableModule,
    MatSortModule,
    MatPaginatorModule,
    MatIconModule,
    MatButtonModule,
    MatTooltipModule,
    TranslatePipe,
    GenericActionsComponent,
    ConfigurationsDrawerComponent
  ],
  providers: [ActionService, DrawerService]
})
export class GenericGridComponent<T> implements OnInit, AfterViewInit, OnDestroy {  
   @ViewChild ( MatTable ) tabla : MatTable < T > | undefined ;

  @Input() columns: GridColumn<T>[] = [];
  @Input() pageSize: number = 0;
  @Input() totalRecords: number = 0;
  @Input() serverSidePagination: boolean = false;
  @Input() currentPage: number = 1;
  
  @Output() pageChange = new EventEmitter<{page: number, pageSize: number, sortField?: string, sortDirection?: 'asc' | 'desc'}>();
  @Output() edit = new EventEmitter<T>();
  @Output() delete = new EventEmitter<T>();
  @Output() open = new EventEmitter<T>();
  
  @ViewChild(MatSort) sort!: MatSort;
  @ViewChild(MatPaginator) paginator!: MatPaginator;
  
  displayedColumns: string[] = [];
  dataSource!: MatTableDataSource<T>;
  selectedElement: T | null = null;
  hasActions: boolean = true;
  
  private _actions: Action[] = [];
  private _subscriptions: Subscription[] = [];

  constructor(private _gridService: GridService<T>, private _actionService: ActionService,  private _drawerService: DrawerService) {
    this.dataSource = new MatTableDataSource<T>();
  }
  
  
  
  ngOnInit(): void { 
    this._subcriptionData();
    this._subscriptionColumns();
    this._subscriptionActions();
  }

  ngOnDestroy(): void {
    this._subscriptions.forEach(sub => sub.unsubscribe());
  }

  ngAfterViewInit() {
    this.dataSource.sort = this.sort;
    this.dataSource.paginator = this.paginator;
  }

  onAction(action: EnumActionsType, element: T): void {
    switch (action) {
      case EnumActionsType.actionEdit:
        this.edit.emit(element);
        break;
      case EnumActionsType.actionDelete:
        this.delete.emit(element);
        break;
      case EnumActionsType.actionOpen:
        this.open.emit(element);
        break;
    }
  }
  
  onEdit(element: T): void {
    this.selectedElement = element;
    this.edit.emit(element);
  }
  onDelete(element: T): void {
    this.delete.emit(element);
  }

  onOpen(element: T): void {
    this.open.emit(element);
  }
  
  getCellValue(item: T, column: GridColumn<T>): string {   
    const value = item[column.field];
    if (column.formatter) {
      return column.formatter(value);
    }
    if (column.datePipe) {      
      return column.datePipe.transform(value as Date ) ?? '';
    }
    return value?.toString() ?? '';
  }

  onSortChange(sortState: Sort): void {
    if (this.serverSidePagination) {
      this.pageChange.emit({
        page: this.currentPage,
        pageSize: this.pageSize,
        sortField: sortState.active,
        sortDirection: sortState.direction as 'asc' | 'desc'
      });
    } else {
      this.dataSource.data = [...this.dataSource.data ].sort((a, b) => {
        const isAsc = sortState.direction === 'asc';
        const column = this.columns.find(col => col.field.toString() === sortState.active);
        if (!column) return 0;
        
        const valueA = a[column.field] as any;
        const valueB = b[column.field] as any;
        
        if (valueA === valueB) return 0;
        return (valueA < valueB ? -1 : 1) * (isAsc ? 1 : -1);
      });
    }
  }

  onPageChange(event: PageEvent): void {
    const page = event.pageIndex + 1;
    if (this.serverSidePagination) {
      this.pageChange.emit({
        page,
        pageSize: event.pageSize,
        sortField: this.sort?.active,
        sortDirection: this.sort?.direction as 'asc' | 'desc'
      });
    }
  }

  onConfigurationClick(): void {
    this._openDrawer();
  }

  private _openDrawer() {
    this._drawerService.show({
      width: '600px',
      position: 'right'
    })
    
    this._drawerService.afterClose().subscribe(action => {      
      if (action === EnumActionsType.actionSave) {
     
      } else if (action === EnumActionsType.actionCancel) {
      }
    });
  }

  
  private _subcriptionData() {
    this._subscriptions.push( this._gridService.getData().subscribe((data: T[]) => {
      this.dataSource.data = data;
      this._actionService.setActions(this._actions);
    }) );
  }

  private _subscriptionColumns() {
    this._subscriptions.push( this._gridService.getColumns().subscribe((cols: GridColumn<T>[]) => {
      this.columns = cols;
      this.displayedColumns = this.columns.map(col => col.field.toString());
    }) );
  }
  private _subscriptionActions() {
    this._subscriptions.push( this._gridService.getActions().subscribe((actions: Action[]) => {
      this._actions = actions;
      this._actionService.setActions(actions);
      this.hasActions = actions?.length > 0;
      this.displayedColumns = this.columns.map(col => col.field.toString());
      if (this.hasActions) {
        this.displayedColumns = [...this.displayedColumns, 'actions'];
      }
    }));
  }

}
