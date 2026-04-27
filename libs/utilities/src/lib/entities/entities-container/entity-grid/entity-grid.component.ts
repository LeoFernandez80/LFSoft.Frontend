import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { 
  EnumActionsType, 
  GenericGridComponent, 
  GridColumn, 
  GridService, 
  PageFilter, 
  Action, 
  EnumActionsViewType, 
  TranslationService, 
  EnumActionsStyle 
} from '@lib/shared';
//import { EnumPermissionType } from '@lib/security';
import { Sort } from '@angular/material/sort';
import { EntityGrid } from '../../models/entity-grid.model';

@Component({
  selector: 'lfsoft-utilities-entity-grid',
  templateUrl: './entity-grid.component.html',
  styleUrls: ['./entity-grid.component.scss'],
  standalone: true,
  imports: [ GenericGridComponent ],
  providers: [  ]
})
export class EntityGridComponent implements OnInit {
  @Output() edit = new EventEmitter<EntityGrid>();
  @Output() delete = new EventEmitter<EntityGrid>();
  @Output() open = new EventEmitter<EntityGrid>();
  
  @Output() sortChange = new EventEmitter<PageFilter>();
  @Output() scrollEndChange = new EventEmitter<void>();
  
  columns: GridColumn<EntityGrid>[] = [];

  constructor(private _gridService: GridService<EntityGrid>, private _translationService: TranslationService) { 
    this._inicializeColumns();
  }
  
  ngOnInit(): void {    
    this._gridService.setColumns(this.columns);
    this._loadSecurityActions();
  }

  onSortChange(event: Sort) {
    const pageFilter= new PageFilter();
    pageFilter.sortField= event.active;
    pageFilter.sortDirection= event.direction ;    
    this.sortChange.emit(pageFilter);
  }

  onLoadNextPage() {
    this.scrollEndChange.emit();
  }

  onEdit(entity: EntityGrid) {
    this.edit.emit(entity);
  }

  onDelete(entity: EntityGrid) {
    this.delete.emit(entity);
  }

  onOpen(entity: EntityGrid) {    
    this.open.emit(entity);
  }
  
  private _inicializeColumns(): void {
    this.columns = [
      { 
        field: 'id', 
        header: 'LABEL.id',
        sortable: true,
        align: 'center',
        width: '80px'
      },
      { 
        field: 'description', 
        header: 'LABEL.description',
        sortable: true
      }
    ];
  }

  private _loadSecurityActions(): void {
    const actions: Action[] = [
      new Action('', EnumActionsType.actionEdit, 'edit', false, EnumActionsViewType.view16x16, EnumActionsStyle.primary),
      new Action('', EnumActionsType.actionDelete, 'delete', false, EnumActionsViewType.view16x16, EnumActionsStyle.primary),
      new Action('', EnumActionsType.actionOpen, 'open_in_new', false, EnumActionsViewType.view16x16, EnumActionsStyle.primary),
    ];
    this._gridService.setActions(actions);
  }
}
