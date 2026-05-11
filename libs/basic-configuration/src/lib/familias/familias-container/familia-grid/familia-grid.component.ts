import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { Sort } from '@angular/material/sort';
import { EnumLiteralKeys } from '@lib/common';
import {
  GenericGridComponent, GridColumn, GridColumnConfiguration,
  GridConfiguration, GridConfigurationService, GridService, PageFilter
} from '@lib/shared';
import { AuthService, EnumUserRole, UserPermissionsService } from '@lib/security';
import { FamiliaGrid } from '../../models/familia-grid.model';

@Component({
  selector: 'app-familia-grid',
  templateUrl: './familia-grid.component.html',
  styleUrls: ['./familia-grid.component.scss'],
  standalone: true,
  imports: [GenericGridComponent]
})
export class FamiliaGridComponent implements OnInit {
  readonly literalKey: EnumLiteralKeys = EnumLiteralKeys.eGrid_Familias;

  @Output() edit = new EventEmitter<FamiliaGrid>();
  @Output() delete = new EventEmitter<FamiliaGrid>();
  @Output() open = new EventEmitter<FamiliaGrid>();
  @Output() sortChange = new EventEmitter<PageFilter>();
  @Output() scrollEndChange = new EventEmitter<void>();
  @Output() changePage = new EventEmitter<PageFilter>();

  columns: GridColumn<FamiliaGrid>[] = [];

  constructor(
    private _gridService: GridService<FamiliaGrid>,
    private _authService: AuthService,
    private _permissionsUserService: UserPermissionsService,
    private _gridConfigurationService: GridConfigurationService
  ) {
    this._loadGridConfiguration();
  }

  ngOnInit(): void {
    this._gridService.setColumns(this.columns);
    this._securityApply();
  }

  onEdit(familia: FamiliaGrid): void { this.edit.emit(familia); }
  onDelete(familia: FamiliaGrid): void { this.delete.emit(familia); }
  onOpen(familia: FamiliaGrid): void { this.open.emit(familia); }

  onSortChange(event: Sort): void {
    const pageFilter = new PageFilter();
    pageFilter.sortField = event.active;
    pageFilter.sortDirection = event.direction;
    this.sortChange.emit(pageFilter);
  }

  onLoadNextPage(): void { this.scrollEndChange.emit(); }

  private _initializeColumns(): void {
    this.columns = [
      { field: 'familia_codigo', header: 'LABEL.familia_codigo', sortable: true, align: 'right', width: '140px' },
      { field: 'familia_descripcion', header: 'LABEL.familia_descripcion', sortable: true, width: '320px' },
      { field: 'familia_gruposCount', header: 'LABEL.familia_gruposCount', sortable: true, align: 'right', width: '180px' }
    ];
  }

  private _loadGridConfiguration(): void {
    this._gridConfigurationService.getUserGridConfiguration(this.literalKey).subscribe(userConfiguration => {
      if (userConfiguration) {
        this.columns = userConfiguration.gridColumns
          .filter(colConfig => colConfig.gridColumnVisible)
          .map(colConfig => this._mapConfigurationColumnToColumn(userConfiguration, colConfig));
        this._gridService.setColumns(this.columns);
      } else {
        this._initializeColumns();
      }
    });
  }

  private _mapConfigurationColumnToColumn(
    config: GridConfiguration,
    colConfig: GridColumnConfiguration
  ): GridColumn<FamiliaGrid> {
    return {
      field: colConfig.gridColumnField as keyof FamiliaGrid,
      header: colConfig.gridColumnHeader,
      sortable: colConfig.gridColumnSortable,
      width: colConfig.gridColumnWidth,
      align: colConfig.gridColumnAlign as any
    };
  }

  private _securityApply(): void {
    const actions = this._permissionsUserService.enabledActions(
      this._authService.getCurrentUser()?.role || EnumUserRole.VIEWER,
      EnumLiteralKeys.eGrid_Familias,
      this.makeConditions()
    );
    this._gridService.setActions(actions);
  }

  makeConditions(): string { return '#|V|#'; }
}
