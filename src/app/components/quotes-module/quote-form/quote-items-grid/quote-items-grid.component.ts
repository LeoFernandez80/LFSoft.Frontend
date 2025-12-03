import { ChangeDetectionStrategy, Component, EventEmitter, Input, Output } from '@angular/core';
import { GridColumn } from '../../../../generic/generic-grid/models/grid-column.model';
import { QuoteItem } from '../../models/quote.model';
import { QuoteGrid } from '../../models/quoteGrid.model';
import { GenericGridComponent } from '../../../../generic/generic-grid/generic-grid.component';
import { BehaviorSubject } from 'rxjs';
import { AsyncPipe } from '@angular/common';

@Component({
  selector: 'app-quote-items-grid',
  imports: [AsyncPipe, GenericGridComponent],
  templateUrl: './quote-items-grid.component.html',
  styleUrl: './quote-items-grid.component.scss',
  standalone: true
})
export class QuoteItemsGridComponent {

  columns: GridColumn<QuoteItem>[] = [
    { 
      field: 'id', 
      header: 'Item',
      sortable: true
    },
    { 
      field: 'quantity', 
      header: 'Cant',
      sortable: true
    },
    { 
      field: 'description', 
      header: 'Descripci{on',
      sortable: true
    },    
    { 
      field: 'price', 
      header: 'Precio',
      sortable: true
    }
  ];

  @Output() edit = new EventEmitter<QuoteItem>();
  @Output() delete = new EventEmitter<QuoteItem>();
  
   constructor() { }
  
    ngOnInit(): void { }
  
    onEdit(quoteItem: QuoteItem) {
        this.edit.emit(quoteItem);
    }
  
    onDelete(quoteItem: QuoteItem) {
      this.delete.emit(quoteItem);
    } 
 
}
