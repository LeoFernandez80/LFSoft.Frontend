import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { Sort } from '@angular/material/sort';
import { EnumLiteralKeys } from '@lib/common';
import { Action, EnumActionsType, GenericGridComponent, GridColumn, GridService, PageFilter } from '@lib/shared';
import { EntityGrid } from '../../models/entity-grid.model';

@Component({
  selector: 'app-entity-grid',
  templateUrl: './entity-grid.component.html',
  styleUrls: ['./entity-grid.component.scss'],
  standalone: true,
  imports: [GenericGridComponent]
})
export class EntityGridComponent implements OnInit {
  readonly literalKey: EnumLiteralKeys = EnumLiteralKeys.eLiteralKey_Empty;

  @Output() edit = new EventEmitter<EntityGrid>();
  @Output() delete = new EventEmitter<EntityGrid>();
  @Output() open = new EventEmitter<EntityGrid>();
  @Output() sortChange = new EventEmitter<PageFilter>();
  @Output() scrollEndChange = new EventEmitter<void>();
  @Output() changePage = new EventEmitter<PageFilter>();

  columns: GridColumn<EntityGrid>[] = [];

  constructor(private _gridService: GridService<EntityGrid>) {
    this._initializeColumns();
  }

  ngOnInit(): void {
    this._gridService.setColumns(this.columns);
    this._gridService.setActions([
      new Action('BUTTON.edit', EnumActionsType.actionEdit, 'edit', false),
      new Action('BUTTON.delete', EnumActionsType.actionDelete, 'delete', false),
      new Action('BUTTON.open', EnumActionsType.actionOpen, 'open_in_new', false)
    ]);
  }

  onEdit(entity: EntityGrid): void {
    this.edit.emit(entity);
  }

  onDelete(entity: EntityGrid): void {
    this.delete.emit(entity);
  }

  onOpen(entity: EntityGrid): void {
    this.open.emit(entity);
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
        field: 'entity_id',
        header: 'LABEL.number',
        sortable: true,
        align: 'right',
        width: '120px'
      },
      {
        field: 'entity_description',
        header: 'LABEL.description',
        sortable: true,
        width: '280px'
      },
      {
        field: 'entity_active',
        header: 'LABEL.active',
        sortable: true,
        width: '120px'
      }
    ];
  }
}