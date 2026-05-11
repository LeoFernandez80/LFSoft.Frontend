import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { Sort } from '@angular/material/sort';
import { EnumLiteralKeys } from '@lib/common';
import {
  GenericGridComponent, PageFilter, GridColumn, GridColumnConfiguration,
  GridConfiguration, GridConfigurationService, GridService, TranslationService
} from '@lib/shared';
import { AuthService, EnumUserRole, UserPermissionsService } from '@lib/security';
import { GrupoGrid } from '../../models/grupo-grid.model';

@Component({
  selector: 'app-grupo-grid',
  templateUrl: './grupo-grid.component.html',
  styleUrls: ['./grupo-grid.component.scss'],
  standalone: true,
  imports: [GenericGridComponent],
  providers: []
})
export class GrupoGridComponent implements OnInit {
  readonly literalKey: EnumLiteralKeys = EnumLiteralKeys.eGrid_Grupos;

  @Output() edit = new EventEmitter<GrupoGrid>();
  @Output() delete = new EventEmitter<GrupoGrid>();
  @Output() open = new EventEmitter<GrupoGrid>();
  @Output() sortChange = new EventEmitter<PageFilter>();
  @Output() scrollEndChange = new EventEmitter<void>();
  @Output() changePage = new EventEmitter<PageFilter>();

  columns: GridColumn<GrupoGrid>[] = [];

  constructor(
    private _gridService: GridService<GrupoGrid>,
    private _translationService: TranslationService,
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

  onEdit(grupo: GrupoGrid): void { this.edit.emit(grupo); }
  onDelete(grupo: GrupoGrid): void { this.delete.emit(grupo); }
  onOpen(grupo: GrupoGrid): void { this.open.emit(grupo); }

  onSortChange(event: Sort): void {
    const pageFilter = new PageFilter();
    pageFilter.sortField = event.active;
    pageFilter.sortDirection = event.direction;
    this.sortChange.emit(pageFilter);
  }

  onLoadNextPage(): void { this.scrollEndChange.emit(); }

  private _initializeColumns(): void {
    this.columns = [
      { field: 'grupo_codigo', header: 'LABEL.number', sortable: true, align: 'right', width: '120px' },
      { field: 'grupo_descripcion', header: 'LABEL.grupo_descripcion', sortable: true, width: '280px' },
      { field: 'grupo_familiaCodigo', header: 'LABEL.grupo_familiaCodigo', sortable: true, align: 'center', width: '120px' },
      { field: 'grupo_isActive', header: 'LABEL.active', sortable: true, width: '120px' }
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
  ): GridColumn<GrupoGrid> {
    return {
      field: colConfig.gridColumnField as keyof GrupoGrid,
      header: colConfig.gridColumnHeader,
      sortable: colConfig.gridColumnSortable,
      width: colConfig.gridColumnWidth,
      align: colConfig.gridColumnAlign as any
    };
  }

  private _securityApply(): void {
    const actions = this._permissionsUserService.enabledActions(
      this._authService.getCurrentUser()?.role || EnumUserRole.VIEWER,
      EnumLiteralKeys.eGrid_Grupos,
      this.makeConditions()
    );
    this._gridService.setActions(actions);
  }

  makeConditions(): string {
    return '#|V|#';
  }
}
