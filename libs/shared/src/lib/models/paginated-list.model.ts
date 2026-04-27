/**
 * Modelo para listas paginadas
 */
export interface PaginatedList<T> {
  data: T[];
  total: number;
}
