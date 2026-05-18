import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, catchError, throwError } from 'rxjs';
import { PageFilter, PaginatedList } from '@lib/shared';
import { ConfigurationService, Terminal } from '@lib/common';
import { environment } from 'src/environments/environment';
import { AlicuotaIva } from '../models/alicuota-iva.model';
import { AlicuotaIvaGrid } from '../models/alicuota-iva-grid.model';
import { AlicuotaIvaFilter } from '../models/alicuota-iva-filter.model';
import { AlicuotaIvaResponse } from '../models/alicuota-iva-response.model';

class HTTPRequestAlicuotaIva {
  alicuotaIva: AlicuotaIva = new AlicuotaIva();
  terminal: Terminal | null = null;
}

@Injectable({
  providedIn: 'root'
})
export class HTTPServiceAlicuotaIva {
  private readonly _configurationService = inject(ConfigurationService);
  private http = inject(HttpClient);
  private apiUrl = `${environment.basicConfigurationsApiUrl}/alicuotas-iva`;

  getAlicuotasIva(pageFilter: PageFilter, filterParameters: AlicuotaIvaFilter): Observable<PaginatedList<AlicuotaIvaGrid>> {
    const pageParams = pageFilter.toString();
    const filterParams = filterParameters.toString();
    const paramsString = filterParams ? `${pageParams}&${filterParams}` : pageParams;
    return this.http.get<PaginatedList<AlicuotaIvaGrid>>(`${this.apiUrl}?${paramsString}`, {
      headers: this.getHeaders()
    }).pipe(
      catchError(error => {
        console.error('Error fetching AlicuotasIva:', error);
        return throwError(() => error);
      })
    );
  }

  getAlicuotaIva(codigo: number): Observable<AlicuotaIvaResponse> {
    return this.http.get<AlicuotaIvaResponse>(`${this.apiUrl}/${codigo}`, {
      headers: this.getHeaders()
    }).pipe(
      catchError(error => {
        console.error('Error fetching AlicuotaIva:', error);
        return throwError(() => error);
      })
    );
  }

  open(codigo: number): Observable<AlicuotaIvaResponse> {
    return this.http.get<AlicuotaIvaResponse>(`${this.apiUrl}/${codigo}/open`, {
      headers: this.getHeaders()
      ,params: {
        terminalId: this._configurationService.terminal.terminalId,
        terminalName: this._configurationService.terminal.terminalName
      }
    }).pipe(
      catchError(error => {
        console.error('Error opening AlicuotaIva:', error);
        return throwError(() => error);
      })
    );
  }

  createAlicuotaIva(alicuotaIva: AlicuotaIva): Observable<AlicuotaIva> {
    const request = new HTTPRequestAlicuotaIva();
    request.alicuotaIva = alicuotaIva;
    request.terminal = this._configurationService.terminal;
    return this.http.post<AlicuotaIva>(this.apiUrl, request, {
      headers: this.getHeaders()
    }).pipe(
      catchError(error => {
        console.error('Error creating AlicuotaIva:', error);
        return throwError(() => error);
      })
    );
  }

  updateAlicuotaIva(alicuotaIva: AlicuotaIva): Observable<AlicuotaIva> {
    const request = new HTTPRequestAlicuotaIva();
    request.alicuotaIva = alicuotaIva;
    request.terminal = this._configurationService.terminal;
    return this.http.put<AlicuotaIva>(`${this.apiUrl}/${alicuotaIva.alicuotaIva_codigo}`, request, {
      headers: this.getHeaders()
    }).pipe(
      catchError(error => {
        console.error('Error updating AlicuotaIva:', error);
        return throwError(() => error);
      })
    );
  }

  deleteAlicuotaIva(codigo: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${codigo}`, {
      headers: this.getHeaders()
    }).pipe(
      catchError(error => {
        console.error('Error deleting AlicuotaIva:', error);
        return throwError(() => error);
      })
    );
  }

  closeAlicuotaIva(codigo: number): Observable<void> {
    return this.http.post<void>(`${this.apiUrl}/${codigo}/close`, this._configurationService.terminal, {
      headers: this.getHeaders()
    }).pipe(
      catchError(error => {
        console.error('Error closing AlicuotaIva:', error);
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
