import { Component, Output, EventEmitter } from "@angular/core";
import { GenericGridComponent, GridColumn, GridService, Action, EnumActionsType, EnumActionsViewType } from "@lib/shared";
import { DocumentItemDetailGrid } from "../../../../models/document-grid.model";


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
