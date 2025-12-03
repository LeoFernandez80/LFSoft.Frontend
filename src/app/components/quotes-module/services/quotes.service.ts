import { Observable } from "rxjs/internal/Observable";
import { PaginatedList } from "../../../generic/models/paginated-list.model";
import { Quote } from "../models/quote.model";
import { of } from "rxjs/internal/observable/of";
import { Injectable } from "@angular/core";
import { PageFilter } from "../../../generic/models/page-filter.model";
import { QuoteFilterParameters } from "../models/interfaces/quote-filter-parameters.interface";

@Injectable({
  providedIn: 'root'
})
export class QuotesService {

  private _mockData: Quote[] = [
    { id: 1, customerId: 1, businessName: 'Business 1', description: 'Quote 1', creationDate: new Date(2025,10,5), stateId: 1, items: [
      {quoteId: 1, id: 1, quantity: 1, description: 'Item 1', price: 10, articles: [{quoteId: 1, itemId: 1, id: 1, quantity: 1, assembly: 'Assembly 1', description: 'Article 1', price: 10}]},
      {quoteId: 1, id: 2, quantity: 1, description: 'Item 1', price: 10, articles: [{quoteId: 1, itemId: 1, id: 1, quantity: 1, assembly: 'Assembly 1', description: 'Article 1', price: 10}]},
      {quoteId: 1, id: 3, quantity: 1, description: 'Item 1', price: 10, articles: [{quoteId: 1, itemId: 1, id: 1, quantity: 1, assembly: 'Assembly 1', description: 'Article 1', price: 10}]},
      {quoteId: 1, id: 4, quantity: 1, description: 'Item 1', price: 10, articles: [{quoteId: 1, itemId: 1, id: 1, quantity: 1, assembly: 'Assembly 1', description: 'Article 1', price: 10}]},
      {quoteId: 1, id: 5, quantity: 1, description: 'Item 1', price: 10, articles: [{quoteId: 1, itemId: 1, id: 1, quantity: 1, assembly: 'Assembly 1', description: 'Article 1', price: 10}]},
      {quoteId: 1, id: 6, quantity: 1, description: 'Item 1', price: 10, articles: [{quoteId: 1, itemId: 1, id: 1, quantity: 1, assembly: 'Assembly 1', description: 'Article 1', price: 10}]},
      {quoteId: 1, id: 7, quantity: 1, description: 'Item 1', price: 10, articles: [{quoteId: 1, itemId: 1, id: 1, quantity: 1, assembly: 'Assembly 1', description: 'Article 1', price: 10}]},
      {quoteId: 1, id: 8, quantity: 1, description: 'Item 1', price: 10, articles: [{quoteId: 1, itemId: 1, id: 1, quantity: 1, assembly: 'Assembly 1', description: 'Article 1', price: 10}]},
      {quoteId: 1, id: 9, quantity: 1, description: 'Item 1', price: 10, articles: [{quoteId: 1, itemId: 1, id: 1, quantity: 1, assembly: 'Assembly 1', description: 'Article 1', price: 10}]},
      {quoteId: 1, id: 10, quantity: 1, description: 'Item 1', price: 10, articles: [{quoteId: 1, itemId: 1, id: 1, quantity: 1, assembly: 'Assembly 1', description: 'Article 1', price: 10}]},
      {quoteId: 1, id: 11, quantity: 1, description: 'Item 1', price: 10, articles: [{quoteId: 1, itemId: 1, id: 1, quantity: 1, assembly: 'Assembly 1', description: 'Article 1', price: 10}]},
      {quoteId: 1, id: 12, quantity: 1, description: 'Item 1', price: 10, articles: [{quoteId: 1, itemId: 1, id: 1, quantity: 1, assembly: 'Assembly 1', description: 'Article 1', price: 10}]},
      {quoteId: 1, id: 13, quantity: 1, description: 'Item 1', price: 10, articles: [{quoteId: 1, itemId: 1, id: 1, quantity: 1, assembly: 'Assembly 1', description: 'Article 1', price: 10}]},
      {quoteId: 1, id: 14, quantity: 1, description: 'Item 1', price: 10, articles: [{quoteId: 1, itemId: 1, id: 1, quantity: 1, assembly: 'Assembly 1', description: 'Article 1', price: 10}]}] },
    { id: 2, customerId: 1, businessName: 'Business 2', description: 'Quote 2', creationDate: new Date(1), stateId: 1, items: [{quoteId: 2, id: 1, quantity: 1, description: 'Item 1', price: 10, articles: [{quoteId: 2, itemId: 1, id: 1, quantity: 1, assembly: 'Assembly 1', description: 'Article 1', price: 10}]}] },
    { id: 3, customerId: 1, businessName: 'Business 3', description: 'Quote 1', creationDate: new Date(), stateId: 1, items: [{quoteId: 3, id: 1, quantity: 1, description: 'Item 1', price: 10, articles: [{quoteId: 3, itemId: 1, id: 1, quantity: 1, assembly: 'Assembly 1', description: 'Article 1', price: 10}]}] },
    { id: 4, customerId: 1, businessName: 'Business 3', description: 'Quote 1', creationDate: new Date(), stateId: 1, items: [{quoteId: 3, id: 1, quantity: 1, description: 'Item 1', price: 10, articles: [{quoteId: 3, itemId: 1, id: 1, quantity: 1, assembly: 'Assembly 1', description: 'Article 1', price: 10}]}] },
    { id: 5, customerId: 1, businessName: 'Business 3', description: 'Quote 1', creationDate: new Date(), stateId: 1, items: [{quoteId: 3, id: 1, quantity: 1, description: 'Item 1', price: 10, articles: [{quoteId: 3, itemId: 1, id: 1, quantity: 1, assembly: 'Assembly 1', description: 'Article 1', price: 10}]}] },
    { id: 6, customerId: 1, businessName: 'Business 3', description: 'Quote 1', creationDate: new Date(), stateId: 1, items: [{quoteId: 3, id: 1, quantity: 1, description: 'Item 1', price: 10, articles: [{quoteId: 3, itemId: 1, id: 1, quantity: 1, assembly: 'Assembly 1', description: 'Article 1', price: 10}]}] },
    { id: 7, customerId: 1, businessName: 'Business 3', description: 'Quote 1', creationDate: new Date(), stateId: 1, items: [{quoteId: 3, id: 1, quantity: 1, description: 'Item 1', price: 10, articles: [{quoteId: 3, itemId: 1, id: 1, quantity: 1, assembly: 'Assembly 1', description: 'Article 1', price: 10}]}] },
    { id: 8, customerId: 1,businessName: 'Business 3', description: 'Quote 1', creationDate: new Date(), stateId: 1, items: [{quoteId: 3, id: 1, quantity: 1, description: 'Item 1', price: 10, articles: [{quoteId: 3, itemId: 1, id: 1, quantity: 1, assembly: 'Assembly 1', description: 'Article 1', price: 10}]}] },
    { id: 9, customerId: 1, businessName: 'Business 3',description: 'Quote 1', creationDate: new Date(), stateId: 1, items: [{quoteId: 3, id: 1, quantity: 1, description: 'Item 1', price: 10, articles: [{quoteId: 3, itemId: 1, id: 1, quantity: 1, assembly: 'Assembly 1', description: 'Article 1', price: 10}]}] },
    { id: 10, customerId: 1,businessName: 'Business 3', description: 'Quote 1', creationDate: new Date(), stateId: 1, items: [{quoteId: 3, id: 1, quantity: 1, description: 'Item 1', price: 10, articles: [{quoteId: 3, itemId: 1, id: 1, quantity: 1, assembly: 'Assembly 1', description: 'Article 1', price: 10}]}] },
    { id: 11, customerId: 1,businessName: 'Business 3', description: 'Quote 1', creationDate: new Date(), stateId: 1, items: [{quoteId: 3, id: 1, quantity: 1, description: 'Item 1', price: 10, articles: [{quoteId: 3, itemId: 1, id: 1, quantity: 1, assembly: 'Assembly 1', description: 'Article 1', price: 10}]}] },
    { id: 12, customerId: 1,businessName: 'Business 3', description: 'Quote 1', creationDate: new Date(), stateId: 1, items: [{quoteId: 3, id: 1, quantity: 1, description: 'Item 1', price: 10, articles: [{quoteId: 3, itemId: 1, id: 1, quantity: 1, assembly: 'Assembly 1', description: 'Article 1', price: 10}]}] },
    { id:   13, customerId: 1,businessName: 'Business 3', description: 'Quote 1', creationDate: new Date(), stateId: 1, items: [{quoteId: 3, id: 1, quantity: 1, description: 'Item 1', price: 10, articles: [{quoteId: 3, itemId: 1, id: 1, quantity: 1, assembly: 'Assembly 1', description: 'Article 1', price: 10}]}] },
    { id: 14, customerId: 1,businessName: 'Business 3', description: 'Quote 1', creationDate: new Date(), stateId: 1, items: [{quoteId: 3, id: 1, quantity: 1, description: 'Item 1', price: 10, articles: [{quoteId: 3, itemId: 1, id: 1, quantity: 1, assembly: 'Assembly 1', description: 'Article 1', price: 10}]}] },
    { id: 15, customerId: 1, businessName: 'Business 3',description: 'Quote 2', creationDate: new Date(), stateId: 1, items: [{quoteId: 4, id: 1, quantity: 1, description: 'Item 1', price: 10, articles: [{quoteId: 4, itemId: 1, id: 1, quantity: 1, assembly: 'Assembly 1', description: 'Article 1', price: 10}]}] }
  ];

  getQuotes(pageFilter: PageFilter, filterParameters: QuoteFilterParameters): Observable<PaginatedList<Quote>> {
    let sortedData = [...this._mockData.map(quote => ({ ...quote, selected: false }))];;
    if (filterParameters.id) {
      sortedData = sortedData.filter(quote => quote.id === filterParameters.id);
    }
    if (pageFilter.sortField) {
      sortedData.sort((a: any, b: any) => {
        const sortField = pageFilter.sortField??"";
        const valueA = a[sortField];
        const valueB = b[sortField];
        const direction = pageFilter.sortDirection === 'asc' ? 1 : -1;

        if (valueA < valueB) return -1 * direction;
        if (valueA > valueB) return 1 * direction;
            return 0;        
        });
      }
    //this._mockData=sortedData
    // Calcular la paginaci n
    const start = (pageFilter.page - 1) * pageFilter.pageSize;
    const paginatedData = sortedData.slice(start, start + pageFilter.pageSize);


    return of({
      data: paginatedData,
      total: paginatedData.length
    });
  }

  getQuote(id: number): Observable<Quote> {
    const quote = this._mockData[id-1]//.find(quote => quote.id === id)!;
    
    return of(quote);
  }
}