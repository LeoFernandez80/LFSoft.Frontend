import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, catchError, throwError } from 'rxjs';
import { PageFilter, PaginatedList } from '@lib/shared';
import { environment } from 'src/environments/environment';
import { Paridad } from '../models/paridad.model';
import { ParidadGrid } from '../models/paridad-grid.model';
import { ParidadFilter } from '../models/paridad-filter.model';
import { ParidadResponse } from '../models/paridad-response.model';

class HTTPRequestParidad {
  paridad: Paridad = new Paridad();
}

@Injectable({
  providedIn: 'root'
})
export class HTTPServiceParidad {
  private http = inject(HttpClient);
  private apiUrl = `${environment.apiUrl}/paridades`;

  getParidades(pageFilter: PageFilter, filterParameters: ParidadFilter): Observable<PaginatedList<ParidadGrid>> {
    const pageParams = pageFilter.toString();
    const filterParams = filterParameters.toString();
    const paramsString = filterParams ? `${pageParams}&${filterParams}` : pageParams;
    return this.http.get<PaginatedList<ParidadGrid>>(`${this.apiUrl}?${paramsString}`, {
      headers: this.getHeaders()
    }).pipe(
      catchError(error => {
        console.error('Error fetching paridades:', error);
        return throwError(() => error);
      })
    );
  }

  getParidad(fecha: string): Observable<ParidadResponse> {
    return this.http.get<ParidadResponse>(`${this.apiUrl}/${encodeURIComponent(fecha)}`, {
      headers: this.getHeaders()
    }).pipe(
      catchError(error => {
        console.error('Error fetching paridad:', error);
        return throwError(() => error);
      })
    );
  }

  open(fecha: string): Observable<ParidadResponse> {
    return this.http.get<ParidadResponse>(`${this.apiUrl}/${encodeURIComponent(fecha)}/open`, {
      headers: this.getHeaders()
    }).pipe(
      catchError(error => {
        console.error('Error opening paridad:', error);
        return throwError(() => error);
      })
    );
  }

  createParidad(paridad: Paridad): Observable<Paridad> {
    const request = new HTTPRequestParidad();
    request.paridad = paridad;
    return this.http.post<Paridad>(this.apiUrl, request, {
      headers: this.getHeaders()
    }).pipe(
      catchError(error => {
        console.error('Error creating paridad:', error);
        return throwError(() => error);
      })
    );
  }

  updateParidad(paridad: Paridad): Observable<Paridad> {
    const request = new HTTPRequestParidad();
    request.paridad = paridad;
    return this.http.put<Paridad>(`${this.apiUrl}/${encodeURIComponent(paridad.paridad_fecha)}`, request, {
      headers: this.getHeaders()
    }).pipe(
      catchError(error => {
        console.error('Error updating paridad:', error);
        return throwError(() => error);
      })
    );
  }

  deleteParidad(fecha: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${encodeURIComponent(fecha)}`, {
      headers: this.getHeaders()
    }).pipe(
      catchError(error => {
        console.error('Error deleting paridad:', error);
        return throwError(() => error);
      })
    );
  }

  closeParidad(fecha: string): Observable<void> {
    return this.http.post<void>(`${this.apiUrl}/${encodeURIComponent(fecha)}/close`, {}, {
      headers: this.getHeaders()
    }).pipe(
      catchError(error => {
        console.error('Error closing paridad:', error);
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
