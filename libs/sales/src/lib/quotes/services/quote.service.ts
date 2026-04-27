import { inject, Injectable } from '@angular/core';
import { catchError, Observable, throwError } from 'rxjs';
import { Quote } from '../models/quote.model';
import { QuoteGrid } from '../models/quote-grid.model';
import { PageFilter, PaginatedList } from '@lib/shared';
import { QuoteFilter } from '../models/quote-filter.model';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class QuoteService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.apiUrl}/quotes`;

  // GET ALL (paginado y filtrado)
  getQuotes(pageFilter: PageFilter, parameters: QuoteFilter): Observable<PaginatedList<QuoteGrid>> {
    const pageParams = pageFilter.toString();    
    const filterParams = parameters.toString();
    const paramsString = filterParams ? `${pageParams}&${filterParams}` : pageParams;   
    
    return this.http.get<PaginatedList<QuoteGrid>>(`${this.apiUrl}?${paramsString}`, {
      headers: this.getHeaders()
    });
  }

  // GET BY ID
  getQuote(id: number): Observable<Quote> {    
    return this.http.get<Quote>(`${this.apiUrl}/${id}`, {
      headers: this.getHeaders()
    }).pipe(
      catchError(error => {
        console.error('Error fetching quote:', error);
        return throwError(() => error);
      })
    );
  }

  // CREATE
  addQuote(quote: Quote): Observable<Quote> {    
    const { quoteId, ...createData } = quote;
    return this.http.post<Quote>(this.apiUrl, createData, {
      headers: this.getHeaders()
    }).pipe(
      catchError(error => {
        console.error('Error creating quote:', error);
        return throwError(() => error);
      })
    );
  }

  // UPDATE
  updateQuote(quote: Quote): Observable<Quote> {
    return this.http.put<Quote>(`${this.apiUrl}/${quote.quoteId}`, quote, {
      headers: this.getHeaders()
    }).pipe(
      catchError(error => {
        console.error('Error updating quote:', error);
        return throwError(() => error);
      })
    );
  }

  // DELETE
  deleteQuote(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`, {
      headers: this.getHeaders()
    }).pipe(
      catchError(error => {
        console.error('Error deleting quote:', error);
        return throwError(() => error);
      })
    );
  }

  private getHeaders(): HttpHeaders {
    const token = localStorage.getItem('token');
    return new HttpHeaders({
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    });
  }
}
