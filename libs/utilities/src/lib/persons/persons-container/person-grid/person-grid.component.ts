import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { GenericGridComponent, GenericActionsComponent, PageFilter, GridColumn, GridService, TranslationService } from '@lib/shared';
import { PersonGrid } from '../../models/person-grid.model';


@Component({
  selector: 'lfsoft-utilities-person-grid',
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
        header: 'ID',
        sortable: true
      },
      { 
        field: 'firstName', 
        header: 'Nombre',
        sortable: true
      },
      { 
        field: 'lastName', 
        header: 'Apellido',
        sortable: true
      }
    ];
  }
  private _loadSecurityActions(): void {
    // Implementar si es necesario
  }
}
