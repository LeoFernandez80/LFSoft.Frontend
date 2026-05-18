import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, catchError, throwError } from 'rxjs';
import { PageFilter, PaginatedList } from '@lib/shared';
import { ConfigurationService, Terminal } from '@lib/common';
import { environment } from 'src/environments/environment';
import { Grupo } from '../models/grupo.model';
import { GrupoGrid } from '../models/grupo-grid.model';
import { GrupoFilter } from '../models/grupo-filter.model';
import { GrupoResponse } from '../models/grupo-response.model';

class HTTPRequestGrupo {
  entity: Grupo = new Grupo();
  terminal: Terminal | null = null;
}

@Injectable({
  providedIn: 'root'
})
export class HTTPServiceGrupo {
  private http = inject(HttpClient);
  private configurationService = inject(ConfigurationService);
  private apiUrl = `${environment.basicConfigurationsApiUrl}/grupos`;

  getGrupos(pageFilter: PageFilter, filterParameters: GrupoFilter): Observable<PaginatedList<GrupoGrid>> {
    const pageParams = pageFilter.toString();
    const filterParams = filterParameters.toString();
    const paramsString = filterParams ? `${pageParams}&${filterParams}` : pageParams;
    return this.http.get<PaginatedList<GrupoGrid>>(`${this.apiUrl}?${paramsString}`, {
      headers: this.getHeaders()
    }).pipe(
      catchError(error => {
        console.error('Error fetching grupos:', error);
        return throwError(() => error);
      })
    );
  }

  getGrupo(id: number | string): Observable<GrupoResponse> {
    return this.http.get<GrupoResponse>(`${this.apiUrl}/${id}`, {
      headers: this.getHeaders()
    }).pipe(
      catchError(error => {
        console.error('Error fetching grupo:', error);
        return throwError(() => error);
      })
    );
  }

  open(id: number | string): Observable<GrupoResponse> {
    const terminal = this.configurationService.terminal;
    const query = new URLSearchParams();
    if (terminal.terminalId) {
      query.append('terminalId', terminal.terminalId);
    }
    if (terminal.terminalName) {
      query.append('terminalName', terminal.terminalName);
    }
    const querySuffix = query.toString() ? `?${query.toString()}` : '';

    return this.http.get<GrupoResponse>(`${this.apiUrl}/${id}/open${querySuffix}`, {
      headers: this.getHeaders()
    }).pipe(
      catchError(error => {
        console.error('Error opening grupo:', error);
        return throwError(() => error);
      })
    );
  }

  createGrupo(grupo: Grupo): Observable<Grupo> {
    const request = new HTTPRequestGrupo();
    request.entity = grupo;
    request.terminal = this.configurationService.terminal;
    return this.http.post<Grupo>(this.apiUrl, request, {
      headers: this.getHeaders()
    }).pipe(
      catchError(error => {
        console.error('Error creating grupo:', error);
        return throwError(() => error);
      })
    );
  }

  updateGrupo(grupo: Grupo): Observable<Grupo> {
    const request = new HTTPRequestGrupo();
    request.entity = grupo;
    request.terminal = this.configurationService.terminal;
    return this.http.put<Grupo>(`${this.apiUrl}/${grupo.grupo_codigo}`, request, {
      headers: this.getHeaders()
    }).pipe(
      catchError(error => {
        console.error('Error updating grupo:', error);
        return throwError(() => error);
      })
    );
  }

  deleteGrupo(id: number | string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`, {
      headers: this.getHeaders()
    }).pipe(
      catchError(error => {
        console.error('Error deleting grupo:', error);
        return throwError(() => error);
      })
    );
  }

  closeGrupo(id: number | string): Observable<void> {
    return this.http.post<void>(`${this.apiUrl}/${id}/close`, this.configurationService.terminal, {
      headers: this.getHeaders()
    }).pipe(
      catchError(error => {
        console.error('Error closing grupo:', error);
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

