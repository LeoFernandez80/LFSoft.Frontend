import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { EnumActionsType } from '../../../../generic/generic-actions/enums/actions-type.enums';
import { GenericActionsComponent } from '../../../../generic/generic-actions/generic-actions.component';
import { GenericGridComponent } from '../../../../generic/generic-grid/generic-grid.component';
import { GridColumn } from '../../../../generic/generic-grid/models/grid-column.model';
import { GridService } from '../../../../generic/generic-grid/services/grid.service';
import { PageFilter } from '../../../../generic/models/page-filter.model';
import { EntityGrid } from '../../models/entity-grid.model';
import { Action } from '../../../../generic/generic-actions/models/actions.model';
import { EnumActionsViewType } from '../../../../generic/generic-actions/enums/actions-view-type.enums';
import { TranslationService } from '../../../../generic/generic-translate/translation.service';
import { EnumActionsStyle } from '../../../../generic/generic-actions/enums/actions-styles.enums';
import { EnumPermissionType } from '../../../security-module/models/enum-permission.type.model';

@Component({
  selector: 'app-entity-grid',
  templateUrl: './entity-grid.component.html',
  styleUrls: ['./entity-grid.component.scss'],
  standalone: true,
  imports: [ GenericGridComponent, GenericActionsComponent],
  providers: [  ]
})
export class EntityGridComponent implements OnInit {
  @Output() edit = new EventEmitter<EntityGrid>();
  @Output() delete = new EventEmitter<EntityGrid>();
  @Output() open = new EventEmitter<EntityGrid>();
  
  @Output() changePage = new EventEmitter<PageFilter>();
  
  columns: GridColumn<EntityGrid>[] = [];

  constructor(private _gridService: GridService<EntityGrid>, private _translationService: TranslationService) { 
    this._inicializeColumns();
  }
  
  ngOnInit(): void {    
    this._gridService.setColumns(this.columns);
    this._loadSecurityActions();
  }

  onPageChange(event: {page: number, pageSize: number, sortField?: string, sortDirection?: 'asc' | 'desc'}) {
    this.changePage.emit(event as PageFilter);
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
      new Action('', EnumActionsType.actionEdit, 'edit', false, EnumActionsViewType.view16x16, EnumActionsStyle.primary, [EnumPermissionType.EDIT_ENTITY]),
      new Action('', EnumActionsType.actionDelete, 'delete', false, EnumActionsViewType.view16x16, EnumActionsStyle.primary),
      new Action('', EnumActionsType.actionOpen, 'open_in_new', false, EnumActionsViewType.view16x16, EnumActionsStyle.primary),
    ];
    this._gridService.setActions(actions);
  }
}