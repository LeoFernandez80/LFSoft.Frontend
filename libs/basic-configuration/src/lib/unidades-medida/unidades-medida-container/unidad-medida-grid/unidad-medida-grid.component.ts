import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { Sort } from '@angular/material/sort';
import { EnumLiteralKeys } from '@lib/common';
import {
  GenericGridComponent, GridColumn, GridService, PageFilter
} from '@lib/shared';
import { AuthService, EnumUserRole, UserPermissionsService } from '@lib/security';
import { UnidadMedidaGrid } from '../../models/unidad-medida-grid.model';

@Component({
  selector: 'app-unidad-medida-grid',
  templateUrl: './unidad-medida-grid.component.html',
  styleUrls: ['./unidad-medida-grid.component.scss'],
  standalone: true,
  imports: [GenericGridComponent]
})
export class UnidadMedidaGridComponent implements OnInit {
  readonly literalKey: EnumLiteralKeys = EnumLiteralKeys.eGrid_UnidadesMedida;

  @Output() edit = new EventEmitter<UnidadMedidaGrid>();
  @Output() delete = new EventEmitter<UnidadMedidaGrid>();
  @Output() open = new EventEmitter<UnidadMedidaGrid>();
  @Output() sortChange = new EventEmitter<PageFilter>();
  @Output() scrollEndChange = new EventEmitter<void>();
  @Output() changePage = new EventEmitter<PageFilter>();

  columns: GridColumn<UnidadMedidaGrid>[] = [];

  constructor(
    private _gridService: GridService<UnidadMedidaGrid>,
    private _authService: AuthService,
    private _permissionsUserService: UserPermissionsService
  ) {
    this._initializeColumns();
  }

  ngOnInit(): void {
    this._gridService.setColumns(this.columns);
    this._securityApply();
  }

  onEdit(item: UnidadMedidaGrid): void {
    this.edit.emit(item);
  }

  onDelete(item: UnidadMedidaGrid): void {
    this.delete.emit(item);
  }

  onOpen(item: UnidadMedidaGrid): void {
    this.open.emit(item);
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
        field: 'unidadMedida_codigo',
        header: 'LABEL.codigo',
        sortable: true,
        align: 'right',
        width: '120px'
      },
      {
        field: 'unidadMedida_descripcion',
        header: 'LABEL.descripcion',
        sortable: true,
        width: '280px'
      },
      {
        field: 'unidadMedida_abreviatura',
        header: 'LABEL.abreviatura',
        sortable: true,
        width: '160px'
      },
      {
        field: 'unidadMedida_activo',
        header: 'LABEL.active',
        sortable: true,
        width: '140px'
      }
    ];
  }

  private _securityApply(): void {
    const actions = this._permissionsUserService.enabledActions(
      this._authService.getCurrentUser()?.role || EnumUserRole.VIEWER,
      EnumLiteralKeys.eGrid_UnidadesMedida,
      this.makeConditions()
    );

    this._gridService.setActions(actions);
  }

  makeConditions(): string {
    return '#|V|#';
  }
}
