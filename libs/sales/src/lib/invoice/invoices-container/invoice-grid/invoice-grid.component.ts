import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { Action, CustomDatePipe, DateConfigService, EnumActionsType, EnumActionsViewType, GenericActionsComponent, GenericGridComponent, GridColumn, GridService, PageFilter, TranslationService } from '@lib/shared';
import { InvoiceGrid } from '../../models/invoice-grid.model';

@Component({
  selector: 'lfsoft-sales-invoice-grid',
  templateUrl: './invoice-grid.component.html',
  styleUrls: ['./invoice-grid.component.scss'],
  standalone: true,
  imports: [ GenericGridComponent, GenericActionsComponent],
  providers: [  ]
})
export class InvoiceGridComponent implements OnInit {
  @Output() edit = new EventEmitter<InvoiceGrid>();
  @Output() delete = new EventEmitter<InvoiceGrid>();
  @Output() open = new EventEmitter<InvoiceGrid>();
  
  @Output() changePage = new EventEmitter<PageFilter>();
  
  columns: GridColumn<InvoiceGrid>[] = [];

  private customDatePipe: CustomDatePipe ;
  

  constructor(private _gridService: GridService<InvoiceGrid>, private _translationService: TranslationService, private _dateConfigService: DateConfigService) { 
    this.customDatePipe = new CustomDatePipe();
    this._inicializeColumns();
  }
  
  ngOnInit(): void {    
    this._gridService.setColumns(this.columns);
    this._loadSecurityActions();
  }
  
  onPageChange(event: {page: number, pageSize: number, sortField?: string, sortDirection?: 'asc' | 'desc'}) {
    this.changePage.emit(event as PageFilter);
  }

  onEdit(invoice: InvoiceGrid) {
      this.edit.emit(invoice);
  }

  onDelete(invoice: InvoiceGrid) {
    this.delete.emit(invoice);
  }

  onOpen(invoice: InvoiceGrid) {    
    this.open.emit(invoice);
  }
  
  private _inicializeColumns(): void {
    this.columns = [
      { 
        field: 'invoiceId', 
        header: 'LABEL.number',
        sortable: true,
        align: 'center',
        width: '5%',
        cellBackgroundColor: 'var(--grid-primary-bg)',
        cellTextColor: 'var(--grid-primary-text)',
        headerBackgroundColor: 'var(--grid-header-primary-bg)',
        headerTextColor: 'var(--grid-header-primary-text)'
      },
      { 
        field: 'personName', 
        header: 'LABEL.personName',
        sortable: true,
        width: '20%'
      },
      { 
        field: 'invoiceDescription', 
        header: 'LABEL.description',
        sortable: true,
        width: '30%'
      },
      { 
        field: 'invoiceCreationDate', 
        header: 'LABEL.creationDate',
        sortable: true,
        width: '20%',
        datePipe: this.customDatePipe
      }
    ];
  }

  private _loadSecurityActions(): void {
    const actions: Action[] = [
        //new Action('', EnumActionsType.actionEdit, 'edit', false, EnumActionsViewType.view16x16),
        new Action('', EnumActionsType.actionDelete, 'delete', false, EnumActionsViewType.view16x16),
        new Action('', EnumActionsType.actionOpen, 'open_in_new', false, EnumActionsViewType.view16x16),
      ];
    this._gridService.setActions(actions);
  }
}
