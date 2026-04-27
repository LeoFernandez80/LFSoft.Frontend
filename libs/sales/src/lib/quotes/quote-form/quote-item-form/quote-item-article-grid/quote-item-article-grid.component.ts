import { Component, EventEmitter, Output } from '@angular/core';
import { GenericGridComponent, GridColumn, GridService, Action, EnumActionsType, EnumActionsViewType } from '@lib/shared';
import { QuoteItemArticleGrid } from '../../../models/quote-item-article-grid.model';

@Component({
  selector: 'lfsoft-sales-quote-item-article-grid',
  imports: [GenericGridComponent],
  templateUrl: './quote-item-article-grid.component.html',
  styleUrl: './quote-item-article-grid.component.scss',
  standalone: true
})
export class QuoteItemArticleGridComponent {
  columns: GridColumn<QuoteItemArticleGrid>[] = [];
  
  @Output() edit = new EventEmitter<QuoteItemArticleGrid>();
  @Output() delete = new EventEmitter<QuoteItemArticleGrid>();
  
  constructor(private _gridService: GridService<QuoteItemArticleGrid>) {
    this._inicializeColumns();
  }

  ngOnInit(): void {  
    this._gridService.setColumns(this.columns);
    this._loadSecurityActions();
  }

  onEdit(itemArticleGrid: QuoteItemArticleGrid) {
    this.edit.emit(itemArticleGrid);
  }

  onDelete(itemArticleGrid: QuoteItemArticleGrid) {
    this.delete.emit(itemArticleGrid);
  } 

  private _inicializeColumns(): void {
    this.columns = [
      { 
        field: 'itemArticleId', 
        header: 'LABEL.id',
        sortable: true,
        align: 'right',
        width: '5%'
      },
      { 
        field: 'itemArticleAssembly', 
        header: 'LABEL.assembly',
        sortable: true,
        align: 'left',
        width: '15%'
      },
      { 
        field: 'itemArticleDescription', 
        header: 'LABEL.description',
        sortable: true,
        align: 'left',
        width: '40%'
      },
      { 
        field: 'itemArticleQuantity',
        header: 'LABEL.quantity',
        sortable: true,
        align: 'right',
        width: '8%'
      },
      { 
        field: 'itemArticleUnitPrice',
        header: 'LABEL.unitPrice',
        sortable: true,
        align: 'right',
        width: '12%'
      },
      { 
        field: 'itemArticleTotalPrice',
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
