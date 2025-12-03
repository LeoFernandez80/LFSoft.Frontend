import { ChangeDetectionStrategy, Component, EventEmitter, OnInit, Output } from '@angular/core';
import { GenericGridComponent } from '../../../generic/generic-grid/generic-grid.component';
import { GridColumn } from '../../../generic/generic-grid/models/grid-column.model';
import { QuotesService } from '../services/quotes.service';
import { QuoteGrid } from '../models/quoteGrid.model';
import { GridService } from '../../../generic/generic-grid/services/grid.service';
import { PageFilter } from '../../../generic/models/page-filter.model';

@Component({
  selector: 'app-quote-grid',
  templateUrl: './quote-grid.component.html',
  styleUrls: ['./quote-grid.component.scss'],
  standalone: true,
  imports: [ GenericGridComponent]

})
export class QuoteGridComponent implements OnInit { 

  
  columns: GridColumn<QuoteGrid>[] = [
    { 
      field: 'id', 
      header: 'ID',
      sortable: true
    },
    { 
      field: 'description', 
      header: 'Nombre',
      sortable: true
    }
  ];
  
  @Output() edit = new EventEmitter<QuoteGrid>();
  @Output() delete = new EventEmitter<QuoteGrid>();
  @Output() open = new EventEmitter<QuoteGrid>();
  @Output() changePage = new EventEmitter<PageFilter>();
  
  constructor( ) {}

  ngOnInit(): void {
  }

  onPageChange(event: {page: number, pageSize: number, sortField?: string, sortDirection?: 'asc' | 'desc'}) {
    //this.loadQuotes(event.page, event.pageSize, event.sortField, event.sortDirection);
    this.changePage.emit(event as PageFilter);
  }

  onEdit(Quote: QuoteGrid) {
      // Aquí puedes abrir un formulario modal para editar la Quotea
      this.edit.emit(Quote);
  }

  onDelete(Quote: QuoteGrid) {
    this.delete.emit(Quote);
  }

  onOpen(Quote: QuoteGrid) {
    this.open.emit(Quote);
  }


}
