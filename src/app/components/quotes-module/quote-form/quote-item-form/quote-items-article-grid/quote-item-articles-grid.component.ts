import { Component, EventEmitter, Input, Output } from '@angular/core';
import { GridColumn } from '../../../../../generic/generic-grid/models/grid-column.model';
import { QuoteItem, QuoteItemArticle } from '../../../models/quote.model';
import { QuoteGrid } from '../../../models/quoteGrid.model';
import { GenericGridComponent } from '../../../../../generic/generic-grid/generic-grid.component';

@Component({
  selector: 'app-quote-item-articles-grid',
  imports: [GenericGridComponent],
  templateUrl: './quote-item-articles-grid.component.html',
  styleUrl: './quote-item-articles-grid.component.scss'
})
export class QuoteItemArticlesGridComponent {
  columns: GridColumn<QuoteItemArticle>[] = [
    { 
      field: 'quantity', 
      header: 'Cant',
      sortable: true,
      align: 'right',
      width: '10%'
    },
    { 
      field: 'assembly', 
      header: 'Cod/Assy',
      sortable: true,
      align: 'center',
      width: '20%'
    },
    { 
      field: 'description', 
      header: 'Descripci{on',
      sortable: true,
      align: 'left',
      width: '50%'
    },    
    { 
      field: 'price', 
      header: 'Precio',
      sortable: true,
      align: 'right',
      width: '20%'
    }
  ];

  @Output() edit = new EventEmitter<QuoteItemArticle>();
  @Output() delete = new EventEmitter<QuoteItemArticle>();
  
   constructor() { }
  
    ngOnInit(): void {  }
  
    onEdit(quoteItemArticle: QuoteItemArticle) {
        this.edit.emit(quoteItemArticle);
    }
  
    onDelete(quoteItemArticle: QuoteItemArticle) {
      //this.delete.emit(quoteItemArticle);
    } 
}
