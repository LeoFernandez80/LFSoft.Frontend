import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { PageFilter } from '../../../generic/models/page-filter.model';
import { PaginatedList } from '../../../generic/models/paginated-list.model';
import { ArticleFilter } from '../models/article-filter.model';
import { Article } from '../models/article.model';
import { ArticleGrid } from '../models/article-grid.model';
import { H } from '@angular/cdk/keycodes';
import { HttpErrorResponse } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class ArticleService {
  private _mockData: Article[] = [
    { id: 1, codigoAsy: 'ART001', description: 'Artículo de prueba 1', listprice: 100.00, revendedorsPrice: 80.00, codigoProvider: 'PROV001', descriptionProvider: 'Proveedor 1' },
    { id: 2, codigoAsy: 'ART002', description: 'Artículo de prueba 2', listprice: 150.00, revendedorsPrice: 120.00, codigoProvider: 'PROV002', descriptionProvider: 'Proveedor 2' },
    { id: 3, codigoAsy: 'ART003', description: 'Artículo de prueba 3', listprice: 200.00, revendedorsPrice: 160.00, codigoProvider: 'PROV001', descriptionProvider: 'Proveedor 1' },
    { id: 4, codigoAsy: 'ART004', description: 'Artículo de prueba 4', listprice: 75.00, revendedorsPrice: 60.00, codigoProvider: 'PROV003', descriptionProvider: 'Proveedor 3' },
    { id: 5, codigoAsy: 'ART005', description: 'Artículo de prueba 5', listprice: 250.00, revendedorsPrice: 200.00, codigoProvider: 'PROV002', descriptionProvider: 'Proveedor 2' },
    { id: 6, codigoAsy: 'ART006', description: 'Artículo de prueba 6', listprice: 125.00, revendedorsPrice: 100.00, codigoProvider: 'PROV001', descriptionProvider: 'Proveedor 1' },
    { id: 7, codigoAsy: 'ART007', description: 'Artículo de prueba 7', listprice: 175.00, revendedorsPrice: 140.00, codigoProvider: 'PROV004', descriptionProvider: 'Proveedor 4' },
    { id: 8, codigoAsy: 'ART008', description: 'Artículo de prueba 8', listprice: 220.00, revendedorsPrice: 176.00, codigoProvider: 'PROV003', descriptionProvider: 'Proveedor 3' },
    { id: 9, codigoAsy: 'ART009', description: 'Artículo de prueba 9', listprice: 90.00, revendedorsPrice: 72.00, codigoProvider: 'PROV002', descriptionProvider: 'Proveedor 2' },
    { id: 10, codigoAsy: 'ART010', description: 'Artículo de prueba 10', listprice: 180.00, revendedorsPrice: 144.00, codigoProvider: 'PROV001', descriptionProvider: 'Proveedor 1' },
    { id: 11, codigoAsy: 'ART011', description: 'Artículo de prueba 11', listprice: 140.00, revendedorsPrice: 112.00, codigoProvider: 'PROV005', descriptionProvider: 'Proveedor 5' },
    { id: 12, codigoAsy: 'ART012', description: 'Artículo de prueba 12', listprice: 210.00, revendedorsPrice: 168.00, codigoProvider: 'PROV003', descriptionProvider: 'Proveedor 3' },
    { id: 13, codigoAsy: 'ART013', description: 'Artículo de prueba 13', listprice: 110.00, revendedorsPrice: 88.00, codigoProvider: 'PROV004', descriptionProvider: 'Proveedor 4' },
    { id: 14, codigoAsy: 'ART014', description: 'Artículo de prueba 14', listprice: 260.00, revendedorsPrice: 208.00, codigoProvider: 'PROV002', descriptionProvider: 'Proveedor 2' },
    { id: 15, codigoAsy: 'ART015', description: 'Artículo de prueba 15', listprice: 135.00, revendedorsPrice: 108.00, codigoProvider: 'PROV001', descriptionProvider: 'Proveedor 1' },
    { id: 16, codigoAsy: 'ART016', description: 'Artículo de prueba 16', listprice: 190.00, revendedorsPrice: 152.00, codigoProvider: 'PROV005', descriptionProvider: 'Proveedor 5' },
    { id: 17, codigoAsy: 'ART017', description: 'Artículo de prueba 17', listprice: 230.00, revendedorsPrice: 184.00, codigoProvider: 'PROV003', descriptionProvider: 'Proveedor 3' },
    { id: 18, codigoAsy: 'ART018', description: 'Artículo de prueba 18', listprice: 105.00, revendedorsPrice: 84.00, codigoProvider: 'PROV004', descriptionProvider: 'Proveedor 4' },
    { id: 19, codigoAsy: 'ART019', description: 'Artículo de prueba 19', listprice: 270.00, revendedorsPrice: 216.00, codigoProvider: 'PROV002', descriptionProvider: 'Proveedor 2' },
    { id: 20, codigoAsy: 'ART020', description: 'Artículo de prueba 20', listprice: 145.00, revendedorsPrice: 116.00, codigoProvider: 'PROV001', descriptionProvider: 'Proveedor 1' },
    { id: 21, codigoAsy: 'ART021', description: 'Artículo de prueba 21', listprice: 200.00, revendedorsPrice: 160.00, codigoProvider: 'PROV005', descriptionProvider: 'Proveedor 5' },
    { id: 22, codigoAsy: 'ART022', description: 'Artículo de prueba 22', listprice: 240.00, revendedorsPrice: 192.00, codigoProvider: 'PROV003', descriptionProvider: 'Proveedor 3' },
    { id: 23, codigoAsy: 'ART023', description: 'Artículo de prueba 23', listprice: 120.00, revendedorsPrice: 96.00, codigoProvider: 'PROV004', descriptionProvider: 'Proveedor 4' },
    { id: 24, codigoAsy: 'ART024', description: 'Artículo de prueba 24', listprice: 280.00, revendedorsPrice: 224.00, codigoProvider: 'PROV002', descriptionProvider: 'Proveedor 2' },
    { id: 25, codigoAsy: 'ART025', description: 'Artículo de prueba 25', listprice: 155.00, revendedorsPrice: 124.00, codigoProvider: 'PROV001', descriptionProvider: 'Proveedor 1' },
    { id: 26, codigoAsy: 'ART026', description: 'Artículo de prueba 26', listprice: 210.00, revendedorsPrice: 168.00, codigoProvider: 'PROV005', descriptionProvider: 'Proveedor 5' },
    { id: 27, codigoAsy: 'ART027', description: 'Artículo de prueba 27', listprice: 250.00, revendedorsPrice: 200.00, codigoProvider: 'PROV003', descriptionProvider: 'Proveedor 3' },
    { id: 28, codigoAsy: 'ART028', description: 'Artículo de prueba 28', listprice: 130.00, revendedorsPrice: 104.00, codigoProvider: 'PROV004', descriptionProvider: 'Proveedor 4' },
    { id: 29, codigoAsy: 'ART029', description: 'Artículo de prueba 29', listprice: 290.00, revendedorsPrice: 232.00, codigoProvider: 'PROV002', descriptionProvider: 'Proveedor 2' },
    { id: 30, codigoAsy: 'ART030', description: 'Artículo de prueba 30', listprice: 165.00, revendedorsPrice: 132.00, codigoProvider: 'PROV001', descriptionProvider: 'Proveedor 1' }
  ];

  getArticles(pageFilter: PageFilter, filterParameters: ArticleFilter): Observable<PaginatedList<ArticleGrid>> {
    let filteredData = this._filterArticles(this._mockData, filterParameters);
    const total = filteredData.length;
    // Map to ArticleGrid
    let gridData: ArticleGrid[] = filteredData.map(article => ({
      selected: false,
      id: article.id,
      codigoAsy: article.codigoAsy,
      description: article.description,
      listprice: article.listprice
    }));
    // Ordenamiento
    if (pageFilter.sortField) {
      gridData.sort((a: any, b: any) => {
        const sortField = pageFilter.sortField ?? "";
        const valueA = a[sortField];
        const valueB = b[sortField];
        const direction = pageFilter.sortDirection === 'asc' ? 1 : -1;
        if (valueA < valueB) return -1 * direction;
        if (valueA > valueB) return 1 * direction;
        return 0;
      });
    }
    // Paginación
    const start = (pageFilter.page - 1) * pageFilter.pageSize;
    const paginatedData = gridData.slice(start, start + pageFilter.pageSize);
    return of({
      data: paginatedData,
      total
    });
  }

  getArticle(id: number): Observable<Article> {
    // Buscar por el campo Key (id)
    const article = this._mockData.find(article => article.id === id);
    if (!article) {
      throw new HttpErrorResponse({ status: 404, statusText: 'Not Found' });
    }
    return of(article);
  }

    getArticleByAssy(codigoAsy: string): Observable<Article> {
    // Buscar por el campo Key (id)
    const article = this._mockData.find(article => article.codigoAsy === codigoAsy);
    if (!article) {
      throw new HttpErrorResponse({ status: 404, statusText: 'Not Found' });
    }
    return of(article);
  }

  addArticle(article: Article): Observable<Article> {
    // Asignar un ID nuevo (simulación)
    const newId = this._mockData.length > 0 ? Math.max(...this._mockData.map(a => a.id!)) + 1 : 1;
    article.id = newId;
    this._mockData.push(article);
    return of(article);
  }

  updateArticle(article: Article): Observable<Article> {
    const index = this._mockData.findIndex(a => a.id === article.id);
    this._mockData[index] = article;
    return of(article);
  }

  deleteArticle(id: number): Observable<void> {
    this._mockData = this._mockData.filter(article => article.id !== id);
    return of(void 0);
  }

  private _filterArticles(data: Article[], filter: ArticleFilter): Article[] {
    return data.filter(article => {
      let matches = true;
      if (filter.id && article.id !== filter.id) matches = false;
      return matches;
    });
  }
}
