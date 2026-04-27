import { inject, Injectable } from '@angular/core';
import { catchError, Observable, of, throwError } from 'rxjs';
import { Invoice } from '../models/invoice.model';
import { InvoiceGrid } from '../models/invoice-grid.model';
import { PageFilter, PaginatedList } from '@lib/shared';
import { InvoiceFilter } from '../models/invoice-filter.model';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class InvoiceService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.apiUrl}/invoices`;

  // GET ALL (paginado y filtrado)
  getInvoices(pageFilter: PageFilter, invoiceParameters: InvoiceFilter): Observable<PaginatedList<InvoiceGrid>> {
    const pageParams = pageFilter.toString();    
    const invoiceParams = invoiceParameters.toString();
    const paramsString = invoiceParams ? `${pageParams}&${invoiceParams}` : pageParams;   
    
    return this.http.get<PaginatedList<InvoiceGrid>>(`${this.apiUrl}?${paramsString}`, {
      headers: this.getHeaders()
    });
  }

  // GET BY ID
  getInvoice(id: number): Observable<Invoice> {    
    return this.http.get<Invoice>(`${this.apiUrl}/${id}`, {
      headers: this.getHeaders()
    }).pipe(
      catchError(error => {
        console.error('Error fetching invoice:', error);
        return throwError(() => error);
      })
    );
  }

  // CREATE
  addInvoice(invoice: Invoice): Observable<Invoice> {    
    const { invoiceId, ...createData } = invoice;
    return this.http.post<Invoice>(this.apiUrl, createData, {
      headers: this.getHeaders()
    }).pipe(
      catchError(error => {
        console.error('Error creating invoice:', error);
        return throwError(() => error);
      })
    );
  }

  // UPDATE
  updateInvoice(invoice: Invoice): Observable<Invoice> {
    const { invoiceId, ...updateData } = invoice;
    return this.http.patch<Invoice>(`${this.apiUrl}/${invoiceId}`, updateData, {
      headers: this.getHeaders()
    }).pipe(
      catchError(error => {
        console.error('Error updating article:', error);
        return throwError(() => error);
      })
    );
  }
  
  // DELETE
  deleteInvoice(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`, {
      headers: this.getHeaders()
    }).pipe(
      catchError(error => {
        console.error('Error deleting invoice:', error);
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
