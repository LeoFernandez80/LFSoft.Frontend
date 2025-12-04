import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, map, catchError, throwError } from 'rxjs';
import { PageFilter } from '../../../generic/models/page-filter.model';
import { PaginatedList } from '../../../generic/models/paginated-list.model';
import { EntityFilter } from '../models/entity-filter.model';
import { Entity } from '../models/entity.model';
import { EntityGrid } from '../models/entity-grid.model';
import { environment } from '../../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class EntityService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.apiUrl}/entities`;

  getEntities(pageFilter: PageFilter, entityParameters: EntityFilter): Observable<PaginatedList<EntityGrid>> {
    
    const pageParams = pageFilter.toString();    
    const entityParams = entityParameters.toString();
    const paramsString = entityParams ? `${pageParams}&${entityParams}` : pageParams;   
    
    return this.http.get<PaginatedList<EntityGrid>>(`${this.apiUrl}?${paramsString}`, {
      headers: this.getHeaders()
    })
  }

  getEntity(id: number): Observable<Entity> {    
    return this.http.get<Entity>(`${this.apiUrl}/${id}`, {
      headers: this.getHeaders()
    }).pipe(
      catchError(error => {
        console.error('Error fetching entity:', error);
        return throwError(() => error);
      })
    );
  }

  addEntity(entity: Entity): Observable<Entity> {    
    const { id, ...updateData } = entity;
    return this.http.post<Entity>(this.apiUrl, updateData, {
      headers: this.getHeaders()
    }).pipe(
      catchError(error => {
        console.error('Error creating entity:', error);
        return throwError(() => error);
      })
    );
  }

  updateEntity(entity: Entity): Observable<Entity> {
    const { id, ...updateData } = entity;
    
    return this.http.patch<Entity>(`${this.apiUrl}/${id}`, updateData, {
      headers: this.getHeaders()
    }).pipe(
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

  /**
   * Filtra el array de entidades según los parámetros de filtro.
   */
  private _filterEntities(data: Entity[], filter: EntityFilter): Entity[] {
    return data.filter(entity => {
      let matches = true;
      if (filter.id && entity.id !== filter.id) matches = false;
      if (filter.description && !entity.description.toLowerCase().includes(filter.description.toLowerCase())) matches = false;
      return matches;
    });
  }
}