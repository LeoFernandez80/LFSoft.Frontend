import { AsyncPipe } from '@angular/common';
import { Component, EventEmitter, Output } from '@angular/core';
import { GenericGridComponent, GridColumn, GridService, Action, EnumActionsType, EnumActionsViewType } from '@lib/shared';
import { QuoteItemGrid } from '../../models/quote-item-grid.model';

@Component({
  selector: 'lfsoft-sales-quote-item-grid',
  imports: [AsyncPipe, GenericGridComponent],
  templateUrl: './quote-item-grid.component.html',
  styleUrl: './quote-item-grid.component.scss',
  standalone: true
})
export class QuoteItemGridComponent {
  columns: GridColumn<QuoteItemGrid>[] = [];

  @Output() edit = new EventEmitter<QuoteItemGrid>();
  @Output() delete = new EventEmitter<QuoteItemGrid>();
  
  constructor(private _gridService: GridService<QuoteItemGrid>) {
    this._inicializeColumns();
  }

  ngOnInit(): void {
    this._gridService.setColumns(this.columns);
    this._loadSecurityActions();
  }

  onEdit(quoteItemGrid: QuoteItemGrid) {
      this.edit.emit(quoteItemGrid);
  }

  onDelete(quoteItemGrid: QuoteItemGrid) {
    this.delete.emit(quoteItemGrid);
  } 

  private _inicializeColumns(): void {
    this.columns = [
      { 
          field: 'itemId',
          header: 'LABEL.id',
          sortable: true,
          align: 'right',
          width: '5%'
      },    
      {
          field: 'itemDescription',
          header: 'LABEL.description',
          sortable: true,
          align: 'left',
          width: '55%'
      },
      { 
          field: 'itemQuantity',
          header: 'LABEL.quantity',
          sortable: true,
          align: 'right',
          width: '8%'
      },
      { 
          field: 'unitPrice',
          header: 'LABEL.unitPrice',
          sortable: true,
          align: 'right',
          width: '12%'
      },
      { 
          field: 'totalPrice',
          header: 'LABEL.totalPrice',
          sortable: true,
          align: 'right',
          width: '12%'
      }
    ];
  }

  private _loadSecurityActions(): void {
    const actions: Action[] = [
      new Action('', EnumActionsType.actionDelete, 'delete', false, EnumActionsViewType.view16x16),
    ];
    this._gridService.setActions(actions);
  }
}
