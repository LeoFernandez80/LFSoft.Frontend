import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable, catchError, map, throwError } from 'rxjs';
import { PaginatedList, PageFilter } from '@lib/shared';
import { environment } from 'src/environments/environment';
import { EntityFilter } from '../models/entity-filter.model';
import { EntityGrid } from '../models/entity-grid.model';
import { Entity } from '../models/entity.model';

interface ApiEntity {
  id: number;
  description: string;
  isActive: boolean;
}

interface CreateEntityRequest {
  description: string;
}

interface UpdateEntityRequest {
  description: string;
  isActive: boolean;
}

@Injectable({
  providedIn: 'root'
})
export class HTTPServiceEntity {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = `${environment.apiUrl}/entities`;

  getEntities(pageFilter: PageFilter, filterParameters: EntityFilter): Observable<PaginatedList<EntityGrid>> {
    const pageParams = pageFilter.toString();
    const entityParams = filterParameters.toString();
    const paramsString = entityParams ? `${pageParams}&${entityParams}` : pageParams;

    return this.http.get<PaginatedList<ApiEntity>>(`${this.apiUrl}?${paramsString}`, {
      headers: this.getHeaders()
    }).pipe(
      map(response => ({
        ...response,
        data: response.data.map(entity => this._mapApiEntityToGrid(entity))
      })),
      catchError(error => {
        console.error('Error fetching entities:', error);
        return throwError(() => error);
      })
    );
  }

  getEntity(id: number): Observable<Entity> {
    return this.http.get<ApiEntity>(`${this.apiUrl}/${id}`, {
      headers: this.getHeaders()
    }).pipe(
      map(entity => this._mapApiEntity(entity)),
      catchError(error => {
        console.error('Error fetching entity:', error);
        return throwError(() => error);
      })
    );
  }

  createEntity(entity: Entity): Observable<Entity> {
    const request: CreateEntityRequest = {
      description: entity.entity_description
    };

    return this.http.post<ApiEntity>(this.apiUrl, request, {
      headers: this.getHeaders()
    }).pipe(
      map(createdEntity => this._mapApiEntity(createdEntity)),
      catchError(error => {
        console.error('Error creating entity:', error);
        return throwError(() => error);
      })
    );
  }

  updateEntity(entity: Entity): Observable<Entity> {
    const request: UpdateEntityRequest = {
      description: entity.entity_description,
      isActive: entity.entity_active
    };

    return this.http.patch<ApiEntity>(`${this.apiUrl}/${entity.entity_id}`, request, {
      headers: this.getHeaders()
    }).pipe(
      map(updatedEntity => this._mapApiEntity(updatedEntity)),
      catchError(error => {
        console.error('Error updating entity:', error);
        return throwError(() => error);
      })
    );
  }

  deleteEntity(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`, {
      headers: this.getHeaders()
    }).pipe(
      catchError(error => {
        console.error('Error deleting entity:', error);
        return throwError(() => error);
      })
    );
  }

  private _mapApiEntity(entity: ApiEntity): Entity {
    const mappedEntity = new Entity();
    mappedEntity.entity_id = entity.id;
    mappedEntity.entity_description = entity.description;
    mappedEntity.entity_active = entity.isActive;
    return mappedEntity;
  }

  private _mapApiEntityToGrid(entity: ApiEntity): EntityGrid {
    const mappedEntity = new EntityGrid();
    mappedEntity.entity_id = entity.id;
    mappedEntity.entity_description = entity.description;
    mappedEntity.entity_active = entity.isActive;
    return mappedEntity;
  }

  private getHeaders(): HttpHeaders {
    const token = localStorage.getItem('token');
    return new HttpHeaders({
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`
    });
  }
}