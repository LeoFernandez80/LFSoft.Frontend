import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, catchError, throwError } from 'rxjs';
import { PageFilter } from '../../../generic/models/page-filter.model';
import { PaginatedList } from '../../../generic/models/paginated-list.model';
import { ArticleFilter } from '../models/article-filter.model';
import { Article } from '../models/article.model';
import { ArticleGrid } from '../models/article-grid.model';
import { environment } from '../../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class ArticleService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.articlesApiUrl}/articles`;

  // GET ALL (paginado y filtrado)
  getArticles(pageFilter: PageFilter, articleParameters: ArticleFilter): Observable<PaginatedList<ArticleGrid>> {
    const pageParams = pageFilter.toString();    
    const articleParams = articleParameters.toString();
    const paramsString = articleParams ? `${pageParams}&${articleParams}` : pageParams;   
    
    return this.http.get<PaginatedList<ArticleGrid>>(`${this.apiUrl}?${paramsString}`, {
      headers: this.getHeaders()
    });
  }

  // GET BY ID
  getArticle(id: number): Observable<Article> {    
    return this.http.get<Article>(`${this.apiUrl}/${id}`, {
      headers: this.getHeaders()
    }).pipe(
      catchError(error => {
        console.error('Error fetching article:', error);
        return throwError(() => error);
      })
    );
  }

  // GET BY CODIGO ASY
  getArticleByAssy(codigoAsy: string): Observable<Article> {
    return this.http.get<Article>(`${this.apiUrl}/by-codigo/${codigoAsy}`, {
      headers: this.getHeaders()
    }).pipe(
      catchError(error => {
        console.error('Error fetching article by codigoAsy:', error);
        return throwError(() => error);
      })
    );
  }

  // CREATE
  addArticle(article: Article): Observable<Article> {    
    const { id, ...createData } = article;
    return this.http.post<Article>(this.apiUrl, createData, {
      headers: this.getHeaders()
    }).pipe(
      catchError(error => {
        console.error('Error creating article:', error);
        return throwError(() => error);
      })
    );
  }

  // UPDATE
  updateArticle(article: Article): Observable<Article> {
    const { id, ...updateData } = article;
    return this.http.patch<Article>(`${this.apiUrl}/${id}`, updateData, {
      headers: this.getHeaders()
    }).pipe(
      catchError(error => {
        console.error('Error updating article:', error);
        return throwError(() => error);
      })
    );
  }
  
  // DELETE
  deleteArticle(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`, {
      headers: this.getHeaders()
    }).pipe(
      catchError(error => {
        console.error('Error deleting article:', error);
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
