import { Component, EventEmitter, Output } from '@angular/core';
import { GenericGridComponent, GridColumn, GridService, Action, EnumActionsType, EnumActionsViewType } from '@lib/shared';
import { InvoiceItemDetailGrid } from '../../../models/invoice-item-detail-grid.model';

@Component({
  selector: 'lfsoft-sales-invoice-item-detail-grid',
  imports: [GenericGridComponent],
  templateUrl: './invoice-item-detail-grid.component.html',
  styleUrl: './invoice-item-detail-grid.component.scss',
  standalone: true
})
export class InvoiceItemDetailGridComponent {
  columns: GridColumn<InvoiceItemDetailGrid>[] = [];
  
  @Output() edit = new EventEmitter<InvoiceItemDetailGrid>();
  @Output() delete = new EventEmitter<InvoiceItemDetailGrid>();
  
  constructor(private _gridService: GridService<InvoiceItemDetailGrid>) {
    this._inicializeColumns();
  }

  ngOnInit(): void {  
    this._gridService.setColumns(this.columns);
    this._loadSecurityActions();
  }

  onEdit(itemDetailGrid: InvoiceItemDetailGrid) {
    this.edit.emit(itemDetailGrid);
  }

  onDelete(itemDetailGrid: InvoiceItemDetailGrid) {
    this.delete.emit(itemDetailGrid);
  } 

  private _inicializeColumns(): void {
    this.columns = [
      { 
        field: 'detailId', 
        header: 'LABEL.id',
        sortable: true,
        align: 'right',
        width: '5%',
        cellBackgroundColor: 'var(--grid-primary-bg)',
        cellTextColor: 'var(--grid-primary-text)',
        headerBackgroundColor: 'var(--grid-header-primary-bg)',
        headerTextColor: 'var(--grid-header-primary-text)'
      },
      { 
        field: 'detailDescription', 
        header: 'LABEL.description',
        sortable: true,
        align: 'left',
        width: '60%'
      },
      { 
        field: 'detailQuantity',
        header: 'LABEL.quantity',
        sortable: true,
        align: 'right',
        width: '8%'
      },
      { 
        field: 'detailUnitPrice',
        header: 'LABEL.unitPrice',
        sortable: true,
        align: 'right',
        width: '10%'
      },
      { 
        field: 'detailTotalPrice',
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
    ];
    this._gridService.setActions(actions);
  }
}
