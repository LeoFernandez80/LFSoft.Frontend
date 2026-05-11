import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, catchError, throwError } from 'rxjs';
import { PageFilter, PaginatedList } from '@lib/shared';
import { ConfigurationService, Terminal } from '@lib/common';
import { environment } from 'src/environments/environment';
import { UnidadMedida } from '../models/unidad-medida.model';
import { UnidadMedidaGrid } from '../models/unidad-medida-grid.model';
import { UnidadMedidaFilter } from '../models/unidad-medida-filter.model';
import { UnidadMedidaResponse } from '../models/unidad-medida-response.model';

class HTTPRequestUnidadMedida {
  entity: UnidadMedida = new UnidadMedida();
  terminal: Terminal | null = null;
}

@Injectable({
  providedIn: 'root'
})
export class HTTPServiceUnidadMedida {
  private readonly _configurationService = inject(ConfigurationService);
  private readonly http = inject(HttpClient);
  private readonly apiUrl = `${environment.apiUrl}/unidades-medida`;

  getUnidadesMedida(pageFilter: PageFilter, filterParameters: UnidadMedidaFilter): Observable<PaginatedList<UnidadMedidaGrid>> {
    const pageParams = pageFilter.toString();
    const filterParams = filterParameters.toString();
    const paramsString = filterParams ? `${pageParams}&${filterParams}` : pageParams;

    return this.http.get<PaginatedList<UnidadMedidaGrid>>(`${this.apiUrl}?${paramsString}`, {
      headers: this.getHeaders()
    }).pipe(
      catchError(error => {
        console.error('Error fetching unidades de medida:', error);
        return throwError(() => error);
      })
    );
  }

  getUnidadMedida(id: number): Observable<UnidadMedidaResponse> {
    return this.http.get<UnidadMedidaResponse>(`${this.apiUrl}/${id}`, {
      headers: this.getHeaders()
    }).pipe(
      catchError(error => {
        console.error('Error fetching unidad de medida:', error);
        return throwError(() => error);
      })
    );
  }

  open(id: number): Observable<UnidadMedidaResponse> {
    return this.http.get<UnidadMedidaResponse>(`${this.apiUrl}/${id}/open`, {
      headers: this.getHeaders(),
      params: {
        terminalId: this._configurationService.terminal.terminalId,
        terminalName: this._configurationService.terminal.terminalName
      }
    }).pipe(
      catchError(error => {
        console.error('Error opening unidad de medida:', error);
        return throwError(() => error);
      })
    );
  }

  createUnidadMedida(unidadMedida: UnidadMedida): Observable<UnidadMedida> {
    const request = new HTTPRequestUnidadMedida();
    request.entity = {
      unidadMedida_codigo: unidadMedida.unidadMedida_codigo,
      unidadMedida_descripcion: unidadMedida.unidadMedida_descripcion,
      unidadMedida_abreviatura: unidadMedida.unidadMedida_abreviatura,
      unidadMedida_activo: unidadMedida.unidadMedida_activo
    } as UnidadMedida;
    request.terminal = this._configurationService.terminal;

    return this.http.post<UnidadMedida>(this.apiUrl, request, {
      headers: this.getHeaders()
    }).pipe(
      catchError(error => {
        console.error('Error creating unidad de medida:', error);
        return throwError(() => error);
      })
    );
  }

  updateUnidadMedida(unidadMedida: UnidadMedida): Observable<UnidadMedida> {
    const request = new HTTPRequestUnidadMedida();
    request.entity = {
      unidadMedida_codigo: unidadMedida.unidadMedida_codigo,
      unidadMedida_descripcion: unidadMedida.unidadMedida_descripcion,
      unidadMedida_abreviatura: unidadMedida.unidadMedida_abreviatura,
      unidadMedida_activo: unidadMedida.unidadMedida_activo
    } as UnidadMedida;
    request.terminal = this._configurationService.terminal;

    return this.http.put<UnidadMedida>(`${this.apiUrl}/${unidadMedida.unidadMedida_codigo}`, request, {
      headers: this.getHeaders()
    }).pipe(
      catchError(error => {
        console.error('Error updating unidad de medida:', error);
        return throwError(() => error);
      })
    );
  }

  deleteUnidadMedida(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`, {
      headers: this.getHeaders()
    }).pipe(
      catchError(error => {
        console.error('Error deleting unidad de medida:', error);
        return throwError(() => error);
      })
    );
  }

  closeUnidadMedida(id: number): Observable<void> {
    return this.http.post<void>(`${this.apiUrl}/${id}/close`, this._configurationService.terminal, {
      headers: this.getHeaders()
    }).pipe(
      catchError(error => {
        console.error('Error closing unidad de medida:', error);
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
