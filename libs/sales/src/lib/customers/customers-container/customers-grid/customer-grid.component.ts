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
import { Sort } from '@angular/material/sort';
import { CustomerGrid } from '../../models/customer-grid.model';
import { EnumActionsIcons } from 'libs/shared/src/lib/generic-actions/enums/actions-icons.enums';

@Component({
  selector: 'lfsoft-sales-customer-grid',
  templateUrl: './customer-grid.component.html',
  styleUrls: ['./customer-grid.component.scss'],
  standalone: true,
  imports: [ GenericGridComponent ],
  providers: [  ]
})
export class CustomerGridComponent implements OnInit {
  @Output() edit = new EventEmitter<CustomerGrid>();
  @Output() delete = new EventEmitter<CustomerGrid>();
  @Output() open = new EventEmitter<CustomerGrid>();
  
  @Output() sortChange = new EventEmitter<PageFilter>();
  @Output() scrollEndChange = new EventEmitter<void>();
  
  columns: GridColumn<CustomerGrid>[] = [];

  constructor(private _gridService: GridService<CustomerGrid>, private _translationService: TranslationService) { 
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

  onEdit(customer: CustomerGrid) {
    this.edit.emit(customer);
  }

  onDelete(customer: CustomerGrid) {
    this.delete.emit(customer);
  }

  onOpen(customer: CustomerGrid) {    
    this.open.emit(customer);
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
        field: 'razonSocial', 
        header: 'LABEL.razonSocial',
        sortable: true,
        width: '200px'
      },
      { 
        field: 'documento', 
        header: 'LABEL.documento',
        sortable: true,
        width: '120px'
      },     
      { 
        field: 'activo', 
        header: 'LABEL.activo',
        sortable: true,
        align: 'center',
        width: '100px'
      }
    ];
  }

  private _loadSecurityActions(): void {
    const actions: Action[] = [
      new Action('', EnumActionsType.actionEdit, EnumActionsIcons.actionEdit, false, EnumActionsViewType.view16x16, EnumActionsStyle.primary),
      new Action('', EnumActionsType.actionDelete, EnumActionsIcons.actionDelete, false, EnumActionsViewType.view16x16, EnumActionsStyle.primary),
      new Action('', EnumActionsType.actionOpen, EnumActionsIcons.actionOpen, false, EnumActionsViewType.view16x16, EnumActionsStyle.primary),
    ];
    this._gridService.setActions(actions);
  }
}
