import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable, catchError, throwError } from 'rxjs';
import { PaginatedList, PageFilter } from '@lib/shared';
import { ConfigurationService, Terminal } from '@lib/common';
import { environment } from 'src/environments/environment';
import { EntityFilter } from '../models/entity-filter.model';
import { EntityGrid } from '../models/entity-grid.model';
import { Entity } from '../models/entity.model';
import { EntityResponse } from '../models/entity-response.model';

class HTTPRequestEntity {
  entity: Entity = new Entity();
  terminal: Terminal | null = null;
}

@Injectable({ providedIn: 'root' })
export class HTTPServiceEntity {
  private readonly _configurationService = inject(ConfigurationService);
  private readonly http = inject(HttpClient);
  private readonly apiUrl = `${environment.apiUrl}/entities`;

  getEntities(pageFilter: PageFilter, filterParameters: EntityFilter): Observable<PaginatedList<EntityGrid>> {
    const pageParams = pageFilter.toString();
    const entityParams = filterParameters.toString();
    const paramsString = entityParams ? `${pageParams}&${entityParams}` : pageParams;
    return this.http.get<PaginatedList<EntityGrid>>(`${this.apiUrl}?${paramsString}`, { headers: this.getHeaders() }).pipe(
      catchError(error => { console.error('Error fetching entities:', error); return throwError(() => error); })
    );
  }

  getEntity(id: number): Observable<EntityResponse> {
    return this.http.get<EntityResponse>(`${this.apiUrl}/${id}`, { headers: this.getHeaders() }).pipe(
      catchError(error => { console.error('Error fetching entity:', error); return throwError(() => error); })
    );
  }

  open(id: number): Observable<EntityResponse> {
    return this.http.get<EntityResponse>(`${this.apiUrl}/${id}/open`, {
      headers: this.getHeaders(),
      params: {
        terminalId: this._configurationService.terminal.terminalId,
        terminalName: this._configurationService.terminal.terminalName
      }
    }).pipe(
      catchError(error => { console.error('Error opening entity:', error); return throwError(() => error); })
    );
  }

  createEntity(entity: Entity): Observable<Entity> {
    const request: HTTPRequestEntity = {
      entity: {
        entity_id: entity.entity_id,
        entity_description: entity.entity_description,
        entity_active: entity.entity_active
      } as Entity,
      terminal: this._configurationService.terminal
    };
    return this.http.post<Entity>(this.apiUrl, request, { headers: this.getHeaders() }).pipe(
      catchError(error => { console.error('Error creating entity:', error); return throwError(() => error); })
    );
  }

  updateEntity(entity: Entity): Observable<Entity> {
    const request: HTTPRequestEntity = {
      entity: {
        entity_id: entity.entity_id,
        entity_description: entity.entity_description,
        entity_active: entity.entity_active
      } as Entity,
      terminal: this._configurationService.terminal
    };
    return this.http.put<Entity>(`${this.apiUrl}/${entity.entity_id}`, request, { headers: this.getHeaders() }).pipe(
      catchError(error => { console.error('Error updating entity:', error); return throwError(() => error); })
    );
  }

  deleteEntity(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`, { headers: this.getHeaders() }).pipe(
      catchError(error => { console.error('Error deleting entity:', error); return throwError(() => error); })
    );
  }

  closeEntity(id: number): Observable<void> {
    return this.http.post<void>(`${this.apiUrl}/${id}/close`, this._configurationService.terminal, { headers: this.getHeaders() }).pipe(
      catchError(error => { console.error('Error closing entity:', error); return throwError(() => error); })
    );
  }

  private getHeaders(): HttpHeaders {
    const token = localStorage.getItem('token');
    return new HttpHeaders({ 'Content-Type': 'application/json', Authorization: `Bearer ${token}` });
  }
}
