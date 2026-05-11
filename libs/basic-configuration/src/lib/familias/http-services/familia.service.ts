import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable, catchError, throwError } from 'rxjs';
import { PaginatedList, PageFilter } from '@lib/shared';
import { ConfigurationService, Terminal } from '@lib/common';
import { environment } from 'src/environments/environment';
import { Familia } from '../models/familia.model';
import { FamiliaGrid } from '../models/familia-grid.model';
import { FamiliaFilter } from '../models/familia-filter.model';
import { FamiliaResponse } from '../models/familia-response.model';

class HTTPRequestFamilia {
  familia: Familia = new Familia();
  terminal: Terminal | null = null;
}

@Injectable({ providedIn: 'root' })
export class HTTPServiceFamilia {
  private readonly _configurationService = inject(ConfigurationService);
  private readonly http = inject(HttpClient);
  private readonly apiUrl = `${environment.apiUrl}/familias`;

  getFamilias(pageFilter: PageFilter, filterParameters: FamiliaFilter): Observable<PaginatedList<FamiliaGrid>> {
    const pageParams = pageFilter.toString();
    const familiaParams = filterParameters.toString();
    const paramsString = familiaParams ? `${pageParams}&${familiaParams}` : pageParams;
    return this.http.get<PaginatedList<FamiliaGrid>>(`${this.apiUrl}?${paramsString}`, { headers: this.getHeaders() }).pipe(
      catchError(error => {
        console.error('Error fetching familias:', error);
        return throwError(() => error);
      })
    );
  }

  getFamilia(id: number): Observable<FamiliaResponse> {
    return this.http.get<FamiliaResponse>(`${this.apiUrl}/${id}`, { headers: this.getHeaders() }).pipe(
      catchError(error => {
        console.error('Error fetching familia:', error);
        return throwError(() => error);
      })
    );
  }

  open(id: number): Observable<FamiliaResponse> {
    return this.http.get<FamiliaResponse>(`${this.apiUrl}/${id}/open`, {
      headers: this.getHeaders(),
      params: {
        terminalId: this._configurationService.terminal.terminalId,
        terminalName: this._configurationService.terminal.terminalName
      }
    }).pipe(
      catchError(error => {
        console.error('Error opening familia:', error);
        return throwError(() => error);
      })
    );
  }

  createFamilia(familia: Familia): Observable<Familia> {
    const request = new HTTPRequestFamilia();
    request.familia = {
      familia_codigo: familia.familia_codigo,
      familia_descripcion: familia.familia_descripcion
    } as Familia;
    request.terminal = this._configurationService.terminal;

    return this.http.post<Familia>(this.apiUrl, request, { headers: this.getHeaders() }).pipe(
      catchError(error => {
        console.error('Error creating familia:', error);
        return throwError(() => error);
      })
    );
  }

  updateFamilia(familia: Familia): Observable<Familia> {
    const request = new HTTPRequestFamilia();
    request.familia = {
      familia_codigo: familia.familia_codigo,
      familia_descripcion: familia.familia_descripcion
    } as Familia;
    request.terminal = this._configurationService.terminal;

    return this.http.put<Familia>(`${this.apiUrl}/${familia.familia_codigo}`, request, { headers: this.getHeaders() }).pipe(
      catchError(error => {
        console.error('Error updating familia:', error);
        return throwError(() => error);
      })
    );
  }

  deleteFamilia(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`, { headers: this.getHeaders() }).pipe(
      catchError(error => {
        console.error('Error deleting familia:', error);
        return throwError(() => error);
      })
    );
  }

  closeFamilia(id: number): Observable<void> {
    return this.http.post<void>(`${this.apiUrl}/${id}/close`, this._configurationService.terminal, { headers: this.getHeaders() }).pipe(
      catchError(error => {
        console.error('Error closing familia:', error);
        return throwError(() => error);
      })
    );
  }

  private getHeaders(): HttpHeaders {
    const token = localStorage.getItem('token');
    return new HttpHeaders({
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`
    });
  }
}
