import { Component, EventEmitter, Output } from '@angular/core';
import { GridColumn } from '../../../../../generic/generic-grid/models/grid-column.model';
import { InvoiceItemDetailGrid } from '../../../models/invoice-item-detail-grid.model';
import { GenericGridComponent } from '../../../../../generic/generic-grid/generic-grid.component';
import { Action } from '../../../../../generic/generic-actions/models/actions.model';
import { EnumActionsType } from '../../../../../generic/generic-actions/enums/actions-type.enums';
import { EnumActionsViewType } from '../../../../../generic/generic-actions/enums/actions-view-type.enums';
import { GridService } from '../../../../../generic/generic-grid/services/grid.service';

@Component({
  selector: 'app-invoice-item-detail-grid',
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
        width: '5%'
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
