import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { EnumActionsType } from '../../../../generic/generic-actions/enums/actions-type.enums';
import { GenericActionsComponent } from '../../../../generic/generic-actions/generic-actions.component';
import { GenericGridComponent } from '../../../../generic/generic-grid/generic-grid.component';
import { GridColumn } from '../../../../generic/generic-grid/models/grid-column.model';
import { GridService } from '../../../../generic/generic-grid/services/grid.service';
import { PageFilter } from '../../../../generic/models/page-filter.model';
import { PersonGrid } from '../../models/person-grid.model';
import { Action } from '../../../../generic/generic-actions/models/actions.model';
import { E } from '@angular/cdk/keycodes';
import { EnumActionsViewType } from '../../../../generic/generic-actions/enums/actions-view-type.enums';
import { TranslationService } from '../../../../generic/generic-translate/translation.service';
import { DrawerService } from '../../../../generic/generic-drawer/services/drawer.service';

@Component({
  selector: 'app-person-grid',
  templateUrl: './person-grid.component.html',
  styleUrls: ['./person-grid.component.scss'],
  standalone: true,
  imports: [ GenericGridComponent, GenericActionsComponent],
  providers: [  ]
})
export class PersonGridComponent implements OnInit {
  @Output() edit = new EventEmitter<PersonGrid>();
  @Output() delete = new EventEmitter<PersonGrid>();
  @Output() open = new EventEmitter<PersonGrid>();
  
  @Output() changePage = new EventEmitter<PageFilter>();
  
  columns: GridColumn<PersonGrid>[] = [];

  constructor(private _gridService: GridService<PersonGrid>, private _translationService: TranslationService) { 
    this._inicializeColumns();
  }
  
  ngOnInit(): void {    
    this._gridService.setColumns(this.columns);
    this._loadSecurityActions();
    
  }
  onPageChange(event: {page: number, pageSize: number, sortField?: string, sortDirection?: 'asc' | 'desc'}) {
    this.changePage.emit(event as PageFilter);
  }

  onEdit(person: PersonGrid) {
      this.edit.emit(person);
  }

  onDelete(person: PersonGrid) {
    this.delete.emit(person);
  }

  onOpen(person: PersonGrid) {    
    this.open.emit(person);
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
        field: 'firstName', 
        header: 'LABEL.firstName',
        sortable: true
      },
      { 
        field: 'lastName', 
        header: 'LABEL.lastName',
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
