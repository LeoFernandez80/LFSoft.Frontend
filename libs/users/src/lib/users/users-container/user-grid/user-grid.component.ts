import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { GenericGridComponent, GenericActionsComponent, PageFilter, GridColumn, GridService, TranslationService, Action, EnumActionsType, EnumActionsViewType, ActionService, CustomDatePipe, GridConfiguration, GridColumnConfiguration, GridConfigurationService } from '@lib/shared';
import { AuthService, EnumUserRole } from '@lib/security';
import { Sort } from '@angular/material/sort';

import { UserGrid } from '../../models/user-grid.model';
import { UserPermissionsService } from '../../../../../../security/src/lib/permissions/services/user-permissions.service';
import { EnumLiteralKeys } from 'libs/common/src/lib/enums/literal-keys.enum';

@Component({
  selector: 'app-user-grid',
  templateUrl: './user-grid.component.html',
  styleUrls: ['./user-grid.component.scss'],
  standalone: true,
  imports: [ GenericGridComponent, GenericActionsComponent],
  providers: [  ]
})
export class UserGridComponent implements OnInit {
  readonly literalKey: EnumLiteralKeys = EnumLiteralKeys.eGrid_Users;

  @Output() edit = new EventEmitter<UserGrid>();
  @Output() delete = new EventEmitter<UserGrid>();
  @Output() open = new EventEmitter<UserGrid>();
  
  @Output() sortChange = new EventEmitter<PageFilter>();
  @Output() scrollEndChange = new EventEmitter<void>();
  @Output() changePage = new EventEmitter<PageFilter>();
  
  columns: GridColumn<UserGrid>[] = [];

  private customDatePipe: CustomDatePipe ;
  
  constructor(private _gridService: GridService<UserGrid>, private _translationService: TranslationService,
    private _authService: AuthService,
    private _permissionsUserService: UserPermissionsService, private _gridConfigurationService: GridConfigurationService
  ) { 
    this.customDatePipe = new CustomDatePipe();
    this._loadGridConfiguration();
  }
  
  ngOnInit(): void {    
    this._gridService.setColumns(this.columns);
    this._securityApply();    
  }

  onPageChange(event: {page: number, pageSize: number, sortField?: string, sortDirection?: 'asc' | 'desc'}) {
    this.changePage.emit(event as PageFilter);
  }

  onEdit(user: UserGrid) {
      this.edit.emit(user);
  }

  onDelete(user: UserGrid) {
    this.delete.emit(user);
  }

  onOpen(user: UserGrid) {    
    this.open.emit(user);
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
  
  private _inicializeColumns(): void {
    this.columns = [  
      { 
        field: 'user_email', 
        header: 'LABEL.email',
        sortable: true,
        align: 'right',
        width: '200px'
      },
      { 
        field: 'user_role', 
        header: 'LABEL.role',
        sortable: true
      }
    ];
  }
  
  private _loadGridConfiguration(): void {
    const userId = this._authService.getCurrentUser()?.id || '';    
    this._gridConfigurationService.getUserGridConfiguration(this.literalKey)
      .subscribe(userConfiguration=> {
        if (userConfiguration) {          
          this.columns = userConfiguration.gridColumns.filter(colConfig => colConfig.gridColumnVisible).map(colConfig => {
            const column = this._mapConfigurationColumnToColumn(userConfiguration, colConfig); 
            return column;
          }) || [];
          this._gridService.setColumns(this.columns);
        } else {
          this._inicializeColumns();
          this._gridService.setColumns(this.columns);
        }
      });
  }

  private _mapConfigurationColumnToColumn(config: GridConfiguration, configColumn: GridColumnConfiguration): GridColumn<UserGrid> {
    const column = new GridColumn<UserGrid>(configColumn.gridColumnField as keyof UserGrid);
    column.position = configColumn.gridColumnPosition;    
    column.header = this._translationService.translate(configColumn.gridColumnHeader);
    column.sortable = configColumn.gridColumnSortable;
    column.align = configColumn.gridColumnAlign as 'left' | 'right' | 'center';
    column.width = configColumn.gridColumnWidth;
    column.visible = configColumn.gridColumnVisible;
    column.cellBackgroundColor = configColumn.gridColumnCellBackgroundColor;
    column.cellTextColor = configColumn.gridColumnCellTextColor;
    column.headerBackgroundColor = configColumn.gridColumnHeaderBackgroundColor;
    column.headerTextColor = configColumn.gridColumnHeaderTextColor;
    column.cellActionsBackgroundColor = config.gridCellActionsBackgroundColor
    if (configColumn.gridColumnDateFormat) {
      column.datePipe = this.customDatePipe;
    }
    if (!configColumn.gridColumnCellBackgroundColor){
      column.cellBackgroundColor = config.gridCellBackgroundColor;
    }
    if (!configColumn.gridColumnCellTextColor){
      column.cellTextColor = config.gridCellTextColor;
    }
    if (!configColumn.gridColumnHeaderBackgroundColor){
      column.headerBackgroundColor = config.gridHeaderBackgroundColor;
    }
    if (!configColumn.gridColumnHeaderTextColor){
      column.headerTextColor = config.gridHeaderTextColor;
    }
    return column;
  }

  private _securityApply(): void {
  
      const actions = this._permissionsUserService.enabledActions(
        this._authService.getCurrentUser()?.role || EnumUserRole.VIEWER,
        EnumLiteralKeys.eGrid_Users,
        this.makeConditions()
      );      
      this._gridService.setActions(actions);
    }
  
    private makeConditions(): string {
      // Aquí puedes construir la cadena de condiciones según tus necesidades
      return '#|V|#'; // Ejemplo simple
    }
}
