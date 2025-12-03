import { NgFor } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { MatTabsModule } from '@angular/material/tabs';
import { GenericLayoutComponent } from '../../../generic/generic-layout/generic-layout.component';
import { Router, ActivatedRoute } from '@angular/router';
import { QuoteHeaderActionsComponent } from '../quote-header-actions/quote-header-actions.component';
import { QuoteGridFilterComponent } from '../quote-grid-filter/quote-grid-filter.component';
import { QuoteGridComponent } from '../quote-grid/quote-grid.component';
import { QuoteFormComponent } from '../quote-form/quote-form.component';
import { QuoteFilterParameters } from '../models/interfaces/quote-filter-parameters.interface';
import { QuoteGrid } from '../models/quoteGrid.model';
import { GridService } from '../../../generic/generic-grid/services/grid.service';
import { QuotesService } from '../services/quotes.service';
import { PageFilter } from '../../../generic/models/page-filter.model';


@Component({
  selector: 'app-quotes-module',
  templateUrl: './quotes-module.component.html',
  styleUrl: './quotes-module.component.scss',
  standalone: true,
  imports: [
      NgFor,
      MatTabsModule,
      MatIconModule,
      GenericLayoutComponent,
      QuoteFormComponent,
      QuoteGridComponent,
      QuoteGridFilterComponent,
      QuoteHeaderActionsComponent
  ],
  providers: [Router,GridService]
    
})
export class QuotesModuleComponent implements OnInit {

  quotesOpened: QuoteGrid[] = [];
  selectedQuote:QuoteGrid = new QuoteGrid();
  
  filterParameters: QuoteFilterParameters = new QuoteFilterParameters();
  private _pageFilter: PageFilter = new PageFilter();

  constructor(private _router: Router, private _route: ActivatedRoute, private _quoteService: QuotesService, private _gridService: GridService<QuoteGrid>) { 
    this._createPageFilter();
    this._createFilterParameters();
  }
  
  ngOnInit(): void {
    this.loadQuotes(this._pageFilter, this.filterParameters);
  }

  onCreate(): void {
    this.quotesOpened.push(new QuoteGrid());

    // this._router.navigate(['quotes',
    //   { outlets: { personModuleContent: ['create'] } ,relativeTo: this._route}
    // ]);  
  }

  onEdit(quote: QuoteGrid): void {
    if (this.quotesOpened.includes(quote)) {
      return;
    }
    this.selectedQuote = quote;
    this.quotesOpened.push(quote);
  }

  onDelete(quote: QuoteGrid): void {
    console.log('Delete person:', quote);
    
  }

  onOpen(quote: QuoteGrid): void {
    const url = this._router.serializeUrl(
      this._router.createUrlTree(['quotes-module', 'edit'], { queryParams: { id: quote.id } })
    );
    window.open(url, '_blank');
  }

  onPageChange(pageFilter: PageFilter): void {
    this._pageFilter = pageFilter;
    this.loadQuotes(this._pageFilter, this.filterParameters);
  }

  onFilterApplied(filter: QuoteFilterParameters): void {
    this.filterParameters = filter;
    this.loadQuotes(this._pageFilter, this.filterParameters);
  }

  onSave(quote: any): void {
    const index = this.quotesOpened.indexOf(this.selectedQuote);
    
    if (index !== -1) {
      this.quotesOpened.splice(index, 1, quote);
    }
    this._gridService.setData(this.quotesOpened);
  }

  onCancel(): void {
    // TODO: Implement cancel edit logic
    console.log('Cancel edit clicked');
  }

  onCloseTab(quote: QuoteGrid): void {
    const index = this.quotesOpened.indexOf(quote);
    if (index !== -1) {
      this.quotesOpened.splice(index, 1);
    }
  }

  private _createPageFilter() {
    this._pageFilter.page = 1;
    this._pageFilter.pageSize = 5;
    this._pageFilter.sortField = "id";
    this._pageFilter.sortDirection = "asc";
  }

  private _createFilterParameters() {
    this.filterParameters.id = 10;
  }

  private loadQuotes(pageFilter:PageFilter, filterParameters: QuoteFilterParameters) {
    this._quoteService.getQuotes(pageFilter, filterParameters)
      .subscribe(response => { 
        this._gridService.setData(response.data);
      });
  }
}