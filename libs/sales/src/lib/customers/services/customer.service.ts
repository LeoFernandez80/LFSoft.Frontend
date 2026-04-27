import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, map, catchError, throwError } from 'rxjs';
import { PageFilter, PaginatedList } from '@lib/shared';
import { CustomerFilter } from '../models/customer-filter.model';
import { Customer } from '../models/customer.model';
import { CustomerGrid } from '../models/customer-grid.model';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class CustomerService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.apiUrl}/customers`;

  getCustomers(pageFilter: PageFilter, customerParameters: CustomerFilter): Observable<PaginatedList<CustomerGrid>> {
    
    const pageParams = pageFilter.toString();    
    const customerParams = customerParameters.toString();
    const paramsString = customerParams ? `${pageParams}&${customerParams}` : pageParams;   
    
    return this.http.get<PaginatedList<CustomerGrid>>(`${this.apiUrl}?${paramsString}`, {
      headers: this.getHeaders()
    })
  }

  getCustomer(id: number): Observable<Customer> {    
    return this.http.get<Customer>(`${this.apiUrl}/${id}`, {
      headers: this.getHeaders()
    }).pipe(
      catchError(error => {
        console.error('Error fetching customer:', error);
        return throwError(() => error);
      })
    );
  }

  addCustomer(customer: Customer): Observable<Customer> {    
    const { id, ...updateData } = customer;
    return this.http.post<Customer>(this.apiUrl, updateData, {
      headers: this.getHeaders()
    }).pipe(
      catchError(error => {
        console.error('Error creating customer:', error);
        return throwError(() => error);
      })
    );
  }

  updateCustomer(customer: Customer): Observable<Customer> {
    const { id, ...updateData } = customer;
    
    return this.http.patch<Customer>(`${this.apiUrl}/${id}`, updateData, {
      headers: this.getHeaders()
    }).pipe(
      catchError(error => {
        console.error('Error updating customer:', error);
        return throwError(() => error);
      })
    );
  }
  
  deleteCustomer(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`, {
      headers: this.getHeaders()
    }).pipe(
      catchError(error => {
        console.error('Error deleting customer:', error);
        return throwError(() => error);
      })
    );
  }

  /**
   * Obtiene los headers con el token de autenticación
   */
  private getHeaders(): HttpHeaders {
    const token = localStorage.getItem('token');
    return new HttpHeaders({
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    });
  }
}
