import { AsyncPipe } from '@angular/common';
import { Component, EventEmitter, Output } from '@angular/core';
import { GenericGridComponent } from '../../../../generic/generic-grid/generic-grid.component';
import { GridColumn } from '../../../../generic/generic-grid/models/grid-column.model';
import { GridService } from '../../../../generic/generic-grid/services/grid.service';
import { Action } from '../../../../generic/generic-actions/models/actions.model';
import { EnumActionsType } from '../../../../generic/generic-actions/enums/actions-type.enums';
import { EnumActionsViewType } from '../../../../generic/generic-actions/enums/actions-view-type.enums';
import { InvoiceItemGrid } from '../../models/invoice-item-grid.model';

@Component({
  selector: 'app-invoice-item-grid',
  imports: [AsyncPipe, GenericGridComponent],
  templateUrl: './invoice-item-grid.component.html',
  styleUrl: './invoice-item-grid.component.scss',
  standalone: true
})
export class InvoiceItemGridComponent {
  columns: GridColumn<InvoiceItemGrid>[] = [];

  @Output() edit = new EventEmitter<InvoiceItemGrid>();
  @Output() delete = new EventEmitter<InvoiceItemGrid>();
  
  constructor(private _gridService: GridService<InvoiceItemGrid>) {
    this._inicializeColumns();
  }

  ngOnInit(): void {
    this._gridService.setColumns(this.columns);
    this._loadSecurityActions();
  }

  onEdit(invoiceItemGrid: InvoiceItemGrid) {
      this.edit.emit(invoiceItemGrid);
  }

  onDelete(invoiceItemGrid: InvoiceItemGrid) {
    this.delete.emit(invoiceItemGrid);
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
          width: '60%'
      },
      { 
          field: 'itemQuantity',
          header: 'LABEL.quantity',
          sortable: true,
          align: 'right',
          width: '8%'
      },
      { 
          field: 'itemUnitPrice',
          header: 'LABEL.unitPrice',
          sortable: true,
          align: 'right',
          width: '10%'
      },
      { 
          field: 'itemTotalPrice',
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
