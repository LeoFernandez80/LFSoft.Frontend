import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { Sort } from '@angular/material/sort';
import { EnumLiteralKeys } from '@lib/common';
import { GridConfiguration, GridColumnConfiguration, GridColumn, GridConfigurationService, GridService, PageFilter, GenericGridComponent } from '@lib/shared';
import { AuthService, EnumUserRole, UserPermissionsService } from '@lib/security';
import { ActividadGrid } from '../../models/actividad-grid.model';

@Component({
  selector: 'app-actividad-grid',
  templateUrl: './actividad-grid.component.html',
  styleUrls: ['./actividad-grid.component.scss'],
  standalone: true,
  imports: [GenericGridComponent]
})
export class ActividadGridComponent implements OnInit {
  readonly literalKey: EnumLiteralKeys = EnumLiteralKeys.eGrid_Actividades;

  @Output() edit = new EventEmitter<ActividadGrid>();
  @Output() delete = new EventEmitter<ActividadGrid>();
  @Output() open = new EventEmitter<ActividadGrid>();
  @Output() sortChange = new EventEmitter<PageFilter>();
  @Output() scrollEndChange = new EventEmitter<void>();
  @Output() changePage = new EventEmitter<PageFilter>();

  columns: GridColumn<ActividadGrid>[] = [];

  constructor(
    private _gridService: GridService<ActividadGrid>,
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

  onEdit(actividad: ActividadGrid): void { this.edit.emit(actividad); }
  onDelete(actividad: ActividadGrid): void { this.delete.emit(actividad); }
  onOpen(actividad: ActividadGrid): void { this.open.emit(actividad); }

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
      { field: 'actividad_codigo', header: 'LABEL.actividad_codigo', sortable: true, align: 'center', width: '120px' },
      { field: 'actividad_descripcion', header: 'LABEL.actividad_descripcion', sortable: true, width: '380px' },
      { field: 'actividad_colorHojaRGB', header: 'LABEL.actividad_colorHojaRGB', sortable: true, align: 'right', width: '180px' }
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
  ): GridColumn<ActividadGrid> {
    return {
      field: colConfig.gridColumnField as keyof ActividadGrid,
      header: colConfig.gridColumnHeader,
      sortable: colConfig.gridColumnSortable,
      width: colConfig.gridColumnWidth,
      align: colConfig.gridColumnAlign as any
    };
  }

  private _securityApply(): void {
    const actions = this._permissionsUserService.enabledActions(
      this._authService.getCurrentUser()?.role || EnumUserRole.VIEWER,
      EnumLiteralKeys.eGrid_Actividades,
      this.makeConditions()
    );
    this._gridService.setActions(actions);
  }

  makeConditions(): string {
    return '#|V|#';
  }
}
