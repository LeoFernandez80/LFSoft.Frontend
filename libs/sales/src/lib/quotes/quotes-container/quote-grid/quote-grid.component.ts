import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { Action, CustomDatePipe, DateConfigService, EnumActionsType, EnumActionsViewType, GenericActionsComponent, GenericGridComponent, GridColumn, GridService, PageFilter, TranslationService } from '@lib/shared';
import { QuoteGrid } from '../../models/quote-grid.model';

@Component({
  selector: 'lfsoft-sales-quote-grid',
  templateUrl: './quote-grid.component.html',
  styleUrls: ['./quote-grid.component.scss'],
  standalone: true,
  imports: [ GenericGridComponent, GenericActionsComponent],
  providers: [  ]
})
export class QuoteGridComponent implements OnInit {
  @Output() edit = new EventEmitter<QuoteGrid>();
  @Output() delete = new EventEmitter<QuoteGrid>();
  @Output() open = new EventEmitter<QuoteGrid>();
  
  @Output() changePage = new EventEmitter<PageFilter>();
  
  columns: GridColumn<QuoteGrid>[] = [];

  private customDatePipe: CustomDatePipe ;
  

  constructor(private _gridService: GridService<QuoteGrid>, private _translationService: TranslationService, private _dateConfigService: DateConfigService) { 
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

  onEdit(quote: QuoteGrid) {
      this.edit.emit(quote);
  }

  onDelete(quote: QuoteGrid) {
    this.delete.emit(quote);
  }

  onOpen(quote: QuoteGrid) {    
    this.open.emit(quote);
  }
  
  private _inicializeColumns(): void {
    this.columns = [
      { 
        field: 'quoteId', 
        header: 'LABEL.number',
        sortable: true,
        align: 'center',
        width: '5%'
      },
      { 
        field: 'customerName', 
        header: 'LABEL.customerName',
        sortable: true,
        width: '20%'
      },
      { 
        field: 'quoteDescription', 
        header: 'LABEL.description',
        sortable: true,
        width: '30%'
      },
      { 
        field: 'quoteCreationDate', 
        header: 'LABEL.creationDate',
        sortable: true,
        width: '15%',
        datePipe: this.customDatePipe
      },
      { 
        field: 'quoteTotalPrice', 
        header: 'LABEL.totalPrice',
        sortable: true,
        align: 'right',
        width: '10%'
      }
    ];
  }

  private _loadSecurityActions(): void {
    const actions: Action[] = [
        new Action('', EnumActionsType.actionDelete, 'delete', false, EnumActionsViewType.view16x16),
        new Action('', EnumActionsType.actionOpen, 'open_in_new', false, EnumActionsViewType.view16x16),
      ];
    this._gridService.setActions(actions);
  }
}
