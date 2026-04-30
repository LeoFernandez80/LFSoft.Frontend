import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import {
  GenericGridComponent,
  GenericActionsComponent,
  PageFilter,
  GridColumn,
  GridService,
  TranslationService,
  CustomDatePipe,
  GridConfiguration,
  GridColumnConfiguration,
  GridConfigurationService
} from '@lib/shared';
import { AuthService } from '../../../services/auth.service';
import { UserPermissionsService } from '../../../permissions/services/user-permissions.service';
import { EnumUserRole } from '../../../permissions/enums/user-role.enum';
import { Sort } from '@angular/material/sort';
import { EnumLiteralKeys } from '@lib/common';
import { UserRoleGrid } from '../../models/user-role-grid.model';

@Component({
  selector: 'app-user-role-grid',
  templateUrl: './user-role-grid.component.html',
  styleUrls: ['./user-role-grid.component.scss'],
  standalone: true,
  imports: [GenericGridComponent, GenericActionsComponent],
  providers: []
})
export class UserRoleGridComponent implements OnInit {
  readonly literalKey: EnumLiteralKeys = EnumLiteralKeys.eGrid_UserRoles;

  @Output() edit = new EventEmitter<UserRoleGrid>();
  @Output() delete = new EventEmitter<UserRoleGrid>();
  @Output() open = new EventEmitter<UserRoleGrid>();

  @Output() sortChange = new EventEmitter<PageFilter>();
  @Output() scrollEndChange = new EventEmitter<void>();
  @Output() changePage = new EventEmitter<PageFilter>();

  columns: GridColumn<UserRoleGrid>[] = [];
  private customDatePipe: CustomDatePipe;

  constructor(
    private _gridService: GridService<UserRoleGrid>,
    private _translationService: TranslationService,
    private _authService: AuthService,
    private _permissionsUserService: UserPermissionsService,
    private _gridConfigurationService: GridConfigurationService
  ) {
    this.customDatePipe = new CustomDatePipe();
    this._loadGridConfiguration();
  }

  ngOnInit(): void {
    this._gridService.setColumns(this.columns);
    this._securityApply();
  }

  onPageChange(event: { page: number; pageSize: number; sortField?: string; sortDirection?: 'asc' | 'desc' }): void {
    this.changePage.emit(event as PageFilter);
  }

  onEdit(userRole: UserRoleGrid): void {
    this.edit.emit(userRole);
  }

  onDelete(userRole: UserRoleGrid): void {
    this.delete.emit(userRole);
  }

  onOpen(userRole: UserRoleGrid): void {
    this.open.emit(userRole);
  }

  onSortChange(event: Sort): void {
    const pageFilter = new PageFilter();
    pageFilter.sortField = event.active;
    pageFilter.sortDirection = event.direction;
    this.sortChange.emit(pageFilter);
  }

  onLoadNextPage(): void {
    this.scrollEndChange.emit();
  }

  private _initializeColumns(): void {
    this.columns = [
      {
        field: 'userRolId',
        header: 'LABEL.id',
        sortable: true,
        width: '140px'
      },
      {
        field: 'userRolName',
        header: 'LABEL.roleName',
        sortable: true,
        width: '220px'
      },
      {
        field: 'userRolType',
        header: 'LABEL.role',
        sortable: true
      }
    ];
  }

  private _loadGridConfiguration(): void {
    this._gridConfigurationService.getUserGridConfiguration(this.literalKey)
      .subscribe(userConfiguration => {
        if (userConfiguration) {
          this.columns = userConfiguration.gridColumns
            .filter(colConfig => colConfig.gridColumnVisible)
            .map(colConfig => this._mapConfigurationColumnToColumn(userConfiguration, colConfig));
          this._gridService.setColumns(this.columns);
        } else {
          this._initializeColumns();
          this._gridService.setColumns(this.columns);
        }
      });
  }

  private _mapConfigurationColumnToColumn(config: GridConfiguration, configColumn: GridColumnConfiguration): GridColumn<UserRoleGrid> {
    const column = new GridColumn<UserRoleGrid>(configColumn.gridColumnField as keyof UserRoleGrid);
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
    column.cellActionsBackgroundColor = config.gridCellActionsBackgroundColor;

    if (configColumn.gridColumnDateFormat) {
      column.datePipe = this.customDatePipe;
    }
    if (!configColumn.gridColumnCellBackgroundColor) {
      column.cellBackgroundColor = config.gridCellBackgroundColor;
    }
    if (!configColumn.gridColumnCellTextColor) {
      column.cellTextColor = config.gridCellTextColor;
    }
    if (!configColumn.gridColumnHeaderBackgroundColor) {
      column.headerBackgroundColor = config.gridHeaderBackgroundColor;
    }
    if (!configColumn.gridColumnHeaderTextColor) {
      column.headerTextColor = config.gridHeaderTextColor;
    }

    return column;
  }

  private _securityApply(): void {
    const actions = this._permissionsUserService.enabledActions(
      this._authService.getCurrentUser()?.role || EnumUserRole.VIEWER,
      EnumLiteralKeys.eGrid_UserRoles,
      this.makeConditions()
    );
    this._gridService.setActions(actions);
  }

  private makeConditions(): string {
    return '#|V|#';
  }
}
