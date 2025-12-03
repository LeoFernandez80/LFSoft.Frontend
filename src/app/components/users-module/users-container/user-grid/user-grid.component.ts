import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { EnumActionsType } from '../../../../generic/generic-actions/enums/actions-type.enums';
import { GenericActionsComponent } from '../../../../generic/generic-actions/generic-actions.component';
import { GenericGridComponent } from '../../../../generic/generic-grid/generic-grid.component';
import { GridColumn } from '../../../../generic/generic-grid/models/grid-column.model';
import { GridService } from '../../../../generic/generic-grid/services/grid.service';
import { PageFilter } from '../../../../generic/models/page-filter.model';
import { UserGrid } from '../../models/user-grid.model';
import { Action } from '../../../../generic/generic-actions/models/actions.model';
import { E } from '@angular/cdk/keycodes';
import { EnumActionsViewType } from '../../../../generic/generic-actions/enums/actions-view-type.enums';
import { TranslationService } from '../../../../generic/generic-translate/translation.service';
import { DrawerService } from '../../../../generic/generic-drawer/services/drawer.service';

@Component({
  selector: 'app-user-grid',
  templateUrl: './user-grid.component.html',
  styleUrls: ['./user-grid.component.scss'],
  standalone: true,
  imports: [ GenericGridComponent, GenericActionsComponent],
  providers: [  ]
})
export class UserGridComponent implements OnInit {
  @Output() edit = new EventEmitter<UserGrid>();
  @Output() delete = new EventEmitter<UserGrid>();
  @Output() open = new EventEmitter<UserGrid>();
  
  @Output() changePage = new EventEmitter<PageFilter>();
  
  columns: GridColumn<UserGrid>[] = [];

  constructor(private _gridService: GridService<UserGrid>, private _translationService: TranslationService) { 
    this._inicializeColumns();
  }
  
  ngOnInit(): void {    
    this._gridService.setColumns(this.columns);
    this._loadSecurityActions();
    
  }
  onPageChange(event: {page: number, pageSize: number, sortField?: string, sortDirection?: 'asc' | 'desc'}) {
    this.changePage.emit(event as PageFilter);
  }

  onEdit(user: UserGrid) {
      this.edit.emit(user);
  }

  onDelete(user: UserGrid) {
    this.delete.emit(user);
  }

  onOpen(user: UserGrid) {    
    this.open.emit(user);
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
        field: 'userName', 
        header: 'LABEL.userName',
        sortable: true
      },
      { 
        field: 'role', 
        header: 'LABEL.role',
        sortable: true
      }
    ];
  }

  private _loadSecurityActions(): void {
    const actions: Action[] = [
        new Action('', EnumActionsType.actionEdit, 'edit', false, EnumActionsViewType.view16x16),
        new Action('', EnumActionsType.actionDelete, 'delete', false, EnumActionsViewType.view16x16),
        new Action('', EnumActionsType.actionOpen, 'open_in_new', false, EnumActionsViewType.view16x16),
      ];
    this._gridService.setActions(actions);
  }
}
