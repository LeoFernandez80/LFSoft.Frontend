import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { EnumActionsType } from '../../../../generic/generic-actions/enums/actions-type.enums';
import { GenericActionsComponent } from '../../../../generic/generic-actions/generic-actions.component';
import { GenericGridComponent } from '../../../../generic/generic-grid/generic-grid.component';
import { GridColumn } from '../../../../generic/generic-grid/models/grid-column.model';
import { GridService } from '../../../../generic/generic-grid/services/grid.service';
import { PageFilter } from '../../../../generic/models/page-filter.model';
import { DocumentGrid } from '../../models/document-grid.model';
import { Action } from '../../../../generic/generic-actions/models/actions.model';
import { E } from '@angular/cdk/keycodes';
import { EnumActionsViewType } from '../../../../generic/generic-actions/enums/actions-view-type.enums';
import { TranslationService } from '../../../../generic/generic-translate/translation.service';
import { DrawerService } from '../../../../generic/generic-drawer/services/drawer.service';

@Component({
  selector: 'app-document-grid',
  templateUrl: './document-grid.component.html',
  styleUrls: ['./document-grid.component.scss'],
  standalone: true,
  imports: [ GenericGridComponent, GenericActionsComponent],
  providers: [  ]
})
export class DocumentGridComponent implements OnInit {
  @Output() edit = new EventEmitter<DocumentGrid>();
  @Output() delete = new EventEmitter<DocumentGrid>();
  @Output() open = new EventEmitter<DocumentGrid>();
  
  @Output() changePage = new EventEmitter<PageFilter>();
  
  columns: GridColumn<DocumentGrid>[] = [];

  constructor(private _gridService: GridService<DocumentGrid>, private _translationService: TranslationService) { 
    this._inicializeColumns();
  }
  
  ngOnInit(): void {    
    this._gridService.setColumns(this.columns);
    this._loadSecurityActions();
    
  }
  onPageChange(event: {page: number, pageSize: number, sortField?: string, sortDirection?: 'asc' | 'desc'}) {
    this.changePage.emit(event as PageFilter);
  }

  onEdit(document: DocumentGrid) {
      this.edit.emit(document);
  }

  onDelete(document: DocumentGrid) {
    this.delete.emit(document);
  }

  onOpen(document: DocumentGrid) {    
    this.open.emit(document);
  }
  
  private _inicializeColumns(): void {
    this.columns = [
    { 
        field: 'documentId', 
        header: 'LABEL.documentId',
        sortable: true,
        align: 'center',
        width: '80px'
      },
      { 
        field: 'personName', 
        header: 'LABEL.personName',
        sortable: true
      },
      { 
        field: 'documentDescription', 
        header: 'LABEL.documentDescription',
        sortable: true
      },
      { 
        field: 'documentCreationDate', 
        header: 'LABEL.documentCreationDate',
        sortable: true,
        width: '150px'
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
