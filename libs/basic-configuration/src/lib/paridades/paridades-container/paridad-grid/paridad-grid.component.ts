import { Component, OnInit, Output, EventEmitter } from '@angular/core';
import { Sort } from '@angular/material/sort';
import {
  GenericGridComponent, GenericActionsComponent, PageFilter, GridColumn,
  GridService, TranslationService, Action, EnumActionsType, EnumActionsViewType, EnumActionsStyle
} from '@lib/shared';
import { ParidadGrid } from '../../models/paridad-grid.model';
import { EnumLiteralKeys } from 'libs/common/src/lib/enums/literal-keys.enum';

@Component({
  selector: 'app-paridad-grid',
  templateUrl: './paridad-grid.component.html',
  styleUrls: ['./paridad-grid.component.scss'],
  standalone: true,
  imports: [GenericGridComponent, GenericActionsComponent],
  providers: []
})
export class ParidadGridComponent implements OnInit {
    readonly literalKey: EnumLiteralKeys = EnumLiteralKeys.eGrid_Paridades;
  
  @Output() edit = new EventEmitter<ParidadGrid>();
  @Output() delete = new EventEmitter<ParidadGrid>();
  @Output() open = new EventEmitter<ParidadGrid>();
  @Output() sortChange = new EventEmitter<PageFilter>();
  @Output() scrollEndChange = new EventEmitter<void>();

  columns: GridColumn<ParidadGrid>[] = [];

  constructor(
    private _gridService: GridService<ParidadGrid>,
    private _translationService: TranslationService
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

  onEdit(item: ParidadGrid): void {
    this.edit.emit(item);
  }

  onDelete(item: ParidadGrid): void {
    this.delete.emit(item);
  }

  onOpen(item: ParidadGrid): void {
    this.open.emit(item);
  }

  private _initializeColumns(): void {
    this.columns = [
      {
        field: 'paridad_fecha',
        header: 'LABEL.paridad_fecha',
        sortable: true,
        align: 'center',
        width: '120px'
      },
      {
        field: 'paridad_fechaCorrespondeA',
        header: 'LABEL.paridad_fechaCorrespondeA',
        sortable: true,
        align: 'center',
        width: '150px'
      },
      {
        field: 'paridad_dolar',
        header: 'LABEL.paridad_dolar',
        sortable: true,
        align: 'right',
        width: '120px'
      },
      {
        field: 'paridad_dolarDivisa',
        header: 'LABEL.paridad_dolarDivisa',
        sortable: true,
        align: 'right',
        width: '130px'
      },
      {
        field: 'paridad_euro',
        header: 'LABEL.paridad_euro',
        sortable: true,
        align: 'right',
        width: '120px'
      },
      {
        field: 'paridad_euroDivisa',
        header: 'LABEL.paridad_euroDivisa',
        sortable: true,
        align: 'right',
        width: '130px'
      }
    ];
  }

  private _securityApply(): void {
    const actions: Action[] = [
      new Action('', EnumActionsType.actionEdit, 'edit', false,
        EnumActionsViewType.view16x16, EnumActionsStyle.primary),
      new Action('', EnumActionsType.actionDelete, 'delete', false,
        EnumActionsViewType.view16x16, EnumActionsStyle.primary),
      new Action('', EnumActionsType.actionOpen, 'open_in_new', false,
        EnumActionsViewType.view16x16, EnumActionsStyle.primary),
    ];
    this._gridService.setActions(actions);
  }
}
