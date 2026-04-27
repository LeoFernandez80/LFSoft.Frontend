import { AsyncPipe } from "@angular/common";
import { Component, Output, EventEmitter } from "@angular/core";
import { GenericGridComponent, GridColumn, GridService, Action, EnumActionsType, EnumActionsViewType } from "@lib/shared";
import { DocumentItemGrid } from "../../../models/document-grid.model";

@Component({
  selector: 'app-document-item-grid',
  imports: [AsyncPipe, GenericGridComponent],
  templateUrl: './document-item-grid.component.html',
  styleUrl: './document-item-grid.component.scss',
  standalone: true
})
export class DocumentItemGridComponent {
  columns: GridColumn<DocumentItemGrid>[] = [];

  @Output() edit = new EventEmitter<DocumentItemGrid>();
  @Output() delete = new EventEmitter<DocumentItemGrid>();
  
  constructor(private _gridService: GridService<DocumentItemGrid>) {
     this._inicializeColumns();
   }
 
   ngOnInit(): void {
     this._gridService.setColumns(this.columns);
     this._loadSecurityActions();
   }
  
    onEdit(documentItemGrid: DocumentItemGrid) {
        this.edit.emit(documentItemGrid);
    }
  
    onDelete(documentItemGrid: DocumentItemGrid) {
      this.delete.emit(documentItemGrid);
    } 
 
    private _inicializeColumns(): void {
      this.columns = [
      { 
          field: 'itemId',
          header: 'LABEL.id',
          sortable: true,
          align: 'right',
          width: '100px'
      },    
      {
          field: 'itemDescription',
          header: 'LABEL.description',
          sortable: true,
          align: 'left'
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
