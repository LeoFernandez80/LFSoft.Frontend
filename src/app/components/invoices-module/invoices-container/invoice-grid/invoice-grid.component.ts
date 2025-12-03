import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { EnumActionsType } from '../../../../generic/generic-actions/enums/actions-type.enums';
import { GenericActionsComponent } from '../../../../generic/generic-actions/generic-actions.component';
import { GenericGridComponent } from '../../../../generic/generic-grid/generic-grid.component';
import { GridColumn } from '../../../../generic/generic-grid/models/grid-column.model';
import { GridService } from '../../../../generic/generic-grid/services/grid.service';
import { PageFilter } from '../../../../generic/models/page-filter.model';
import { InvoiceGrid } from '../../models/invoice-grid.model';
import { Action } from '../../../../generic/generic-actions/models/actions.model';
import { EnumActionsViewType } from '../../../../generic/generic-actions/enums/actions-view-type.enums';
import { TranslationService } from '../../../../generic/generic-translate/translation.service';
import { CustomDatePipe, DateConfigService, DEFAULT_DATE_CONFIG } from '../../../../generic/pipes';

@Component({
  selector: 'app-invoice-grid',
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
        width: '5%'
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
