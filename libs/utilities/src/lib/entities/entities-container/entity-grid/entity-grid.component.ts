import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { Sort } from '@angular/material/sort';
import { EnumLiteralKeys } from '@lib/common';
import {
  CustomDatePipe, GenericGridComponent, GridColumn, GridColumnConfiguration,
  GridConfiguration, GridConfigurationService, GridService, PageFilter, TranslationService
} from '@lib/shared';
import { AuthService, EnumUserRole, UserPermissionsService } from '@lib/security';
import { EntityGrid } from '../../models/entity-grid.model';

@Component({
  selector: 'app-entity-grid',
  templateUrl: './entity-grid.component.html',
  styleUrls: ['./entity-grid.component.scss'],
  standalone: true,
  imports: [GenericGridComponent]
})
export class EntityGridComponent implements OnInit {
  readonly literalKey: EnumLiteralKeys = EnumLiteralKeys.eGrid_Entities;

  @Output() edit = new EventEmitter<EntityGrid>();
  @Output() delete = new EventEmitter<EntityGrid>();
  @Output() open = new EventEmitter<EntityGrid>();
  @Output() sortChange = new EventEmitter<PageFilter>();
  @Output() scrollEndChange = new EventEmitter<void>();
  @Output() changePage = new EventEmitter<PageFilter>();

  columns: GridColumn<EntityGrid>[] = [];

  private _customDatePipe: CustomDatePipe;

  constructor(
    private _gridService: GridService<EntityGrid>,
    private _translationService: TranslationService,
    private _authService: AuthService,
    private _permissionsUserService: UserPermissionsService,
    private _gridConfigurationService: GridConfigurationService
  ) {
    this._customDatePipe = new CustomDatePipe();
    this._loadGridConfiguration();
  }

  ngOnInit(): void {
    this._gridService.setColumns(this.columns);
    this._securityApply();
  }

  onEdit(entity: EntityGrid): void { this.edit.emit(entity); }
  onDelete(entity: EntityGrid): void { this.delete.emit(entity); }
  onOpen(entity: EntityGrid): void { this.open.emit(entity); }

  onSortChange(event: Sort): void {
    const pageFilter = new PageFilter();
    pageFilter.sortField = event.active;
    pageFilter.sortDirection = event.direction;
    this.sortChange.emit(pageFilter);
  }

  onLoadNextPage(): void { this.scrollEndChange.emit(); }

  private _initializeColumns(): void {
    this.columns = [
      { field: 'entity_id', header: 'LABEL.number', sortable: true, align: 'right', width: '120px' },
      { field: 'entity_description', header: 'LABEL.description', sortable: true, width: '280px' },
      { field: 'entity_active', header: 'LABEL.active', sortable: true, width: '120px' }
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
  ): GridColumn<EntityGrid> {
    return {
      field: colConfig.gridColumnField as keyof EntityGrid,
      header: colConfig.gridColumnHeader,
      sortable: colConfig.gridColumnSortable,
      width: colConfig.gridColumnWidth,
      align: colConfig.gridColumnAlign as any
    };
  }

  private _securityApply(): void {
    const actions = this._permissionsUserService.enabledActions(
      this._authService.getCurrentUser()?.role || EnumUserRole.VIEWER,
      EnumLiteralKeys.eGrid_Entities,
      this.makeConditions()
    );
    this._gridService.setActions(actions);
  }

  makeConditions(): string { return '#|V|#'; }
}
