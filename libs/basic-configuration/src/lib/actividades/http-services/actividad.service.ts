import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Observable, catchError, throwError } from 'rxjs';
import { PageFilter, PaginatedList } from '@lib/shared';
import { ConfigurationService, Terminal } from '@lib/common';
import { environment } from 'src/environments/environment';
import { Actividad } from '../models/actividad.model';
import { ActividadGrid } from '../models/actividad-grid.model';
import { ActividadFilter } from '../models/actividad-filter.model';
import { ActividadResponse } from '../models/actividad-response.model';

class HTTPRequestActividad {
  actividad: Actividad = new Actividad();
  terminal: Terminal | null = null;
}

@Injectable({
  providedIn: 'root'
})
export class HTTPServiceActividad {
  private http = inject(HttpClient);
  private configurationService = inject(ConfigurationService);
  private apiUrl = `${environment.apiUrl}/actividades`;

  getActividades(pageFilter: PageFilter, filterParameters: ActividadFilter): Observable<PaginatedList<ActividadGrid>> {
    const pageParams = pageFilter.toString();
    const filterParams = filterParameters.toString();
    const paramsString = filterParams ? `${pageParams}&${filterParams}` : pageParams;
    return this.http.get<PaginatedList<ActividadGrid>>(`${this.apiUrl}?${paramsString}`, {
      headers: this.getHeaders()
    }).pipe(
      catchError(error => {
        console.error('Error fetching actividades:', error);
        return throwError(() => error);
      })
    );
  }

  getActividad(codigo: string): Observable<ActividadResponse> {
    return this.http.get<ActividadResponse>(`${this.apiUrl}/${encodeURIComponent(codigo)}`, {
      headers: this.getHeaders()
    }).pipe(
      catchError(error => {
        console.error('Error fetching actividad:', error);
        return throwError(() => error);
      })
    );
  }

  open(codigo: string): Observable<ActividadResponse> {
    const terminal = this.configurationService.terminal;
    const params = new HttpParams()
      .set('terminalId', terminal.terminalId)
      .set('terminalName', terminal.terminalName);

    return this.http.get<ActividadResponse>(`${this.apiUrl}/${encodeURIComponent(codigo)}/open`, {
      headers: this.getHeaders(),
      params
    }).pipe(
      catchError(error => {
        console.error('Error opening actividad:', error);
        return throwError(() => error);
      })
    );
  }

  createActividad(actividad: Actividad): Observable<Actividad> {
    const request = new HTTPRequestActividad();
    request.actividad = actividad;
    request.terminal = this.configurationService.terminal;
    return this.http.post<Actividad>(this.apiUrl, request, {
      headers: this.getHeaders()
    }).pipe(
      catchError(error => {
        console.error('Error creating actividad:', error);
        return throwError(() => error);
      })
    );
  }

  updateActividad(actividad: Actividad): Observable<Actividad> {
    const request = new HTTPRequestActividad();
    request.actividad = actividad;
    request.terminal = this.configurationService.terminal;
    return this.http.put<Actividad>(`${this.apiUrl}/${encodeURIComponent(actividad.actividad_codigo)}`, request, {
      headers: this.getHeaders()
    }).pipe(
      catchError(error => {
        console.error('Error updating actividad:', error);
        return throwError(() => error);
      })
    );
  }

  deleteActividad(codigo: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${encodeURIComponent(codigo)}`, {
      headers: this.getHeaders()
    }).pipe(
      catchError(error => {
        console.error('Error deleting actividad:', error);
        return throwError(() => error);
      })
    );
  }

  closeActividad(codigo: string): Observable<void> {
    const terminal = this.configurationService.terminal;
    return this.http.post<void>(`${this.apiUrl}/${encodeURIComponent(codigo)}/close`, terminal, {
      headers: this.getHeaders()
    }).pipe(
      catchError(error => {
        console.error('Error closing actividad:', error);
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
