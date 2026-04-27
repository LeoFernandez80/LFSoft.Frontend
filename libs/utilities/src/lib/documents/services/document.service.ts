import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, catchError, throwError } from 'rxjs';
import { PageFilter, PaginatedList } from '@lib/shared';
import { Document } from '../models/document.model';
import { DocumentGrid } from '../models/document-grid.model';
import { DocumentFilter } from '../models/document-filter.model';
import { environment } from 'src/environments/environment';

@Injectable({ providedIn: 'root' })
export class DocumentService {
	private http = inject(HttpClient);
	private apiUrl = `${environment.apiUrl}/documents`;

	getDocuments(pageFilter: PageFilter, filter: DocumentFilter): Observable<PaginatedList<DocumentGrid>> {
		const pageParams = pageFilter.toString();    
		const documentsParams = filter.toString();
		const paramsString = documentsParams ? `${pageParams}&${documentsParams}` : pageParams;   
    
		return this.http.get<PaginatedList<DocumentGrid>>(`${this.apiUrl}?${paramsString}`, { headers: this.getHeaders() });
	}

	getDocument(id: number): Observable<Document> {
		return this.http.get<Document>(`${this.apiUrl}/${id}`, { headers: this.getHeaders() }).pipe(
			catchError(error => throwError(() => error))
		);
	}

	addDocument(document: Document): Observable<Document> {
		const { id, ...data } = document as any;
		return this.http.post<Document>(this.apiUrl, data, { headers: this.getHeaders() }).pipe(
			catchError(error => throwError(() => error))
		);
	}

	updateDocument(document: Document): Observable<Document> {
		const { documentId, ...data } = document as any;
		return this.http.patch<Document>(`${this.apiUrl}/${document.documentId}`, data, { headers: this.getHeaders() }).pipe(
			catchError(error => throwError(() => error))
		);
	}

	deleteDocument(id: number): Observable<void> {
		return this.http.delete<void>(`${this.apiUrl}/${id}`, { headers: this.getHeaders() }).pipe(
			catchError(error => throwError(() => error))
		);
	}

	private getHeaders(): HttpHeaders {
		const token = localStorage.getItem('token');
		return new HttpHeaders({ 'Content-Type': 'application/json', Authorization: `Bearer ${token}` });
	}
}