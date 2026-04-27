import { Component, OnInit, Output, EventEmitter } from "@angular/core";
import { GenericGridComponent, GenericActionsComponent, PageFilter, GridColumn, GridService, TranslationService, Action, EnumActionsType, EnumActionsViewType } from "@lib/shared";
import { DocumentGrid } from "../../../models/document-grid.model";
import { Sort } from '@angular/material/sort';


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
  
  @Output() sortChange = new EventEmitter<PageFilter>();
  @Output() scrollEndChange = new EventEmitter<void>();

  columns: GridColumn<DocumentGrid>[] = [];

  constructor(private _gridService: GridService<DocumentGrid>, private _translationService: TranslationService) { 
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
