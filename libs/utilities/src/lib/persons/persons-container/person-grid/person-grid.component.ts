import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { Sort } from '@angular/material/sort';
import { EnumLiteralKeys } from '@lib/common';
import { Action, EnumActionsType, GenericGridComponent, GridColumn, GridService, PageFilter } from '@lib/shared';
import { PersonGrid } from '../../models/person-grid.model';

@Component({
  selector: 'app-person-grid',
  templateUrl: './person-grid.component.html',
  styleUrls: ['./person-grid.component.scss'],
  standalone: true,
  imports: [GenericGridComponent]
})
export class PersonGridComponent implements OnInit {
  readonly literalKey = EnumLiteralKeys.eLiteralKey_Empty;

  @Output() edit = new EventEmitter<PersonGrid>();
  @Output() delete = new EventEmitter<PersonGrid>();
  @Output() open = new EventEmitter<PersonGrid>();
  @Output() sortChange = new EventEmitter<PageFilter>();
  @Output() scrollEndChange = new EventEmitter<void>();
  @Output() changePage = new EventEmitter<PageFilter>();

  columns: GridColumn<PersonGrid>[] = [];

  constructor(private _gridService: GridService<PersonGrid>) { this._initializeColumns(); }

  ngOnInit(): void {
    this._gridService.setColumns(this.columns);
    this._gridService.setActions([
      new Action('BUTTON.edit', EnumActionsType.actionEdit, 'edit', false),
      new Action('BUTTON.delete', EnumActionsType.actionDelete, 'delete', false),
      new Action('BUTTON.open', EnumActionsType.actionOpen, 'open_in_new', false)
    ]);
  }

  onEdit(person: PersonGrid): void { this.edit.emit(person); }
  onDelete(person: PersonGrid): void { this.delete.emit(person); }
  onOpen(person: PersonGrid): void { this.open.emit(person); }

  onSortChange(event: Sort): void {
    const pageFilter = new PageFilter();
    pageFilter.sortField = event.active;
    pageFilter.sortDirection = event.direction;
    this.sortChange.emit(pageFilter);
  }

  onLoadNextPage(): void { this.scrollEndChange.emit(); }

  private _initializeColumns(): void {
    this.columns = [
      { field: 'person_id', header: 'LABEL.number', sortable: true, align: 'right', width: '120px' },
      { field: 'person_name', header: 'LABEL.name', sortable: true, width: '200px' },
      { field: 'person_lastName', header: 'LABEL.lastName', sortable: true, width: '200px' },
      { field: 'person_fullName', header: 'LABEL.fullName', sortable: true, width: '280px' }
    ];
  }
}
