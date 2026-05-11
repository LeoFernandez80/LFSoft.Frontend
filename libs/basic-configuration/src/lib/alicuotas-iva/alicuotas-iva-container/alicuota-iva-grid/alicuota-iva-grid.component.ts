import { Component, OnInit, Output, EventEmitter } from '@angular/core';
import { Sort } from '@angular/material/sort';
import {
  GenericGridComponent, PageFilter, GridColumn,
  GridService
} from '@lib/shared';
import { AuthService, EnumUserRole, UserPermissionsService } from '@lib/security';
import { EnumLiteralKeys } from '@lib/common';
import { AlicuotaIvaGrid } from '../../models/alicuota-iva-grid.model';

@Component({
  selector: 'app-alicuota-iva-grid',
  templateUrl: './alicuota-iva-grid.component.html',
  styleUrls: ['./alicuota-iva-grid.component.scss'],
  standalone: true,
  imports: [GenericGridComponent],
  providers: []
})
export class AlicuotaIvaGridComponent implements OnInit {
  readonly literalKey: EnumLiteralKeys = EnumLiteralKeys.eGrid_AlicuotasIva;
  
  @Output() edit = new EventEmitter<AlicuotaIvaGrid>();
  @Output() delete = new EventEmitter<AlicuotaIvaGrid>();
  @Output() open = new EventEmitter<AlicuotaIvaGrid>();
  @Output() sortChange = new EventEmitter<PageFilter>();
  @Output() scrollEndChange = new EventEmitter<void>();

  columns: GridColumn<AlicuotaIvaGrid>[] = [];

  constructor(
    private _gridService: GridService<AlicuotaIvaGrid>,
    private _authService: AuthService,
    private _permissionsUserService: UserPermissionsService
  ) {
    this._initializeColumns();
  }

  ngOnInit(): void {
    this._gridService.setColumns(this.columns);
    this._securityApply();
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

  onEdit(item: AlicuotaIvaGrid): void {
    this.edit.emit(item);
  }

  onDelete(item: AlicuotaIvaGrid): void {
    this.delete.emit(item);
  }

  onOpen(item: AlicuotaIvaGrid): void {
    this.open.emit(item);
  }

  private _initializeColumns(): void {
    this.columns = [
      {
        field: 'alicuotaIva_codigo',
        header: 'LABEL.number',
        sortable: true,
        align: 'right',
        width: '120px'
      },
      {
        field: 'alicuotaIva_descripcion',
        header: 'LABEL.description',
        sortable: true,
        width: '280px'
      },
      {
        field: 'alicuotaIva_tasa',
        header: 'LABEL.alicuotaIva_tasa',
        sortable: true,
        align: 'right',
        width: '120px'
      }
    ];
  }

  private _securityApply(): void {
    const actions = this._permissionsUserService.enabledActions(
      this._authService.getCurrentUser()?.role || EnumUserRole.VIEWER,
      EnumLiteralKeys.eGrid_AlicuotasIva,
      this.makeConditions()
    );
    this._gridService.setActions(actions);
  }

  makeConditions(): string { return '#|V|#'; }
}
