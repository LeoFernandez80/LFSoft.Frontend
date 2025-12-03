import { Component, EventEmitter, Output } from '@angular/core';
import { GridColumn } from '../../../../../generic/generic-grid/models/grid-column.model';
import { DocumentItemDetailGrid } from '../../../models/document-grid.model';
import { GenericGridComponent } from '../../../../../generic/generic-grid/generic-grid.component';
import { Action } from '../../../../../generic/generic-actions/models/actions.model';
import { EnumActionsType } from '../../../../../generic/generic-actions/enums/actions-type.enums';
import { EnumActionsViewType } from '../../../../../generic/generic-actions/enums/actions-view-type.enums';
import { GridService } from '../../../../../generic/generic-grid/services/grid.service';

@Component({
  selector: 'app-item-detail-grid',
  imports: [GenericGridComponent],
  templateUrl: './item-detail-grid.component.html',
  styleUrl: './item-detail-grid.component.scss',
  standalone: true
})
export class ItemDetailGridComponent {
  columns: GridColumn<DocumentItemDetailGrid>[] = [];
  
  @Output() edit = new EventEmitter<DocumentItemDetailGrid>();
  @Output() delete = new EventEmitter<DocumentItemDetailGrid>();
  
   constructor(private _gridService: GridService<DocumentItemDetailGrid>) {
      this._inicializeColumns();
    }
  
    ngOnInit(): void {  
      this._gridService.setColumns(this.columns);
      this._loadSecurityActions();
    }

    onEdit(itemDetailGrid: DocumentItemDetailGrid) {
        this.edit.emit(itemDetailGrid);
    }

    onDelete(itemDetailGrid: DocumentItemDetailGrid) {
      this.delete.emit(itemDetailGrid);
    } 

    private _inicializeColumns(): void {
      this.columns = [
      { 
          field: 'detailId', 
          header: 'LABEL.id',
          sortable: true,
          align: 'right',
          width: '100px'
        },
        { 
          field: 'detailDescription', 
          header: 'LABEL.description',
          sortable: true,
          align: 'center',
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
