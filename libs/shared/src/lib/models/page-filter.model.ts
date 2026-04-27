import { SortDirection } from '@angular/material/sort';
import { QueryParams } from './interfaces/query-params.interface';

/**
 * Modelo para filtros de paginación
 */
export class PageFilter implements QueryParams {
  page: number = 1;
  pageSize: number = 5;
  sortField?: string = '';
  sortDirection?: SortDirection = 'asc';

  toString(): string {
    const params = new URLSearchParams();
    params.append('page', this.page.toString());
    params.append('pageSize', this.pageSize.toString());
    if (this.sortField) {
      params.append('sortField', this.sortField);
    }
    if (this.sortDirection) {
      params.append('sortDirection', this.sortDirection);
    }
    return params.toString();
  }
}
