import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { PageFilter } from '../../../generic/models/page-filter.model';
import { PaginatedList } from '../../../generic/models/paginated-list.model';
import { DocumentFilter } from '../models/document-filter.model';
import { Document, EnumDocumentStatus } from '../models/document.model';
import { DocumentGrid } from '../models/document-grid.model';

@Injectable({
  providedIn: 'root'
})
export class DocumentService {
  private _mockData: Document[] = [
    { documentId: 1, personId: 1, personName: 'John Doe', personDocumentType: '', personDocumentNumber: '', documentDescription: 'Document 1', documentCreationDate: new Date(), documentStatus: EnumDocumentStatus.active, creationUserId: 1, items: [
      { documentId: 1, itemId: 1, itemDescription: 'Item 1', details: [
        { documentId: 1, itemId: 1, detailId: 1, detailDescription: 'Detail 1' },
        { documentId: 1, itemId: 2, detailId: 2, detailDescription: 'Detail 2' }
      ] },
      { documentId: 1, itemId: 2, itemDescription: 'Item 2', details: [] }
    ] },
    { documentId: 2, personId: 2, personName: 'Jane Doe', personDocumentType: '1', personDocumentNumber: '111', documentDescription: 'Document 2', documentCreationDate: new Date(), documentStatus: EnumDocumentStatus.active, creationUserId: 1, items: [] },
    { documentId: 3, personId: 3, personName: 'Alice Smith', personDocumentType: '1', personDocumentNumber: '111', documentDescription: 'Document 3', documentCreationDate: new Date(), documentStatus: EnumDocumentStatus.active, creationUserId: 1, items: [] },
    { documentId: 4, personId: 4, personName: 'Bob Johnson', personDocumentType: '1', personDocumentNumber: '111', documentDescription: 'Document 4', documentCreationDate: new Date(), documentStatus: EnumDocumentStatus.active, creationUserId: 1, items: [] },
    { documentId: 5, personId: 5, personName: 'Charlie Brown', personDocumentType: '1', personDocumentNumber: '111', documentDescription: 'Document 5', documentCreationDate: new Date(), documentStatus: EnumDocumentStatus.active, creationUserId: 1, items: [] },
    { documentId: 6, personId: 6, personName: 'Diana Prince', personDocumentType: '1', personDocumentNumber: '111', documentDescription: 'Document 6', documentCreationDate: new Date(), documentStatus: EnumDocumentStatus.active, creationUserId: 1, items: [] },
    { documentId: 7, personId: 7, personName: 'Ethan Hunt', personDocumentType: '1', personDocumentNumber: '111', documentDescription: 'Document 7', documentCreationDate: new Date(), documentStatus: EnumDocumentStatus.active, creationUserId: 1, items: [] },
    { documentId: 8, personId: 8, personName: 'Fiona Glenanne', personDocumentType: '1', personDocumentNumber: '111', documentDescription: 'Document 8', documentCreationDate: new Date(), documentStatus: EnumDocumentStatus.active, creationUserId: 1, items: [] },
    { documentId: 9, personId: 9, personName: 'George Clooney', personDocumentType: '1', personDocumentNumber: '111', documentDescription: 'Document 9', documentCreationDate: new Date(), documentStatus: EnumDocumentStatus.active, creationUserId: 1, items: [] },
    { documentId: 10, personId: 10, personName: 'Hannah Montana', personDocumentType: '1', personDocumentNumber: '111', documentDescription: 'Document 10', documentCreationDate: new Date(), documentStatus: EnumDocumentStatus.active, creationUserId: 1, items: [] }
  ];

  getDocuments(pageFilter: PageFilter, filterParameters: DocumentFilter): Observable<PaginatedList<DocumentGrid>> {
    let filteredData = this._filterDocuments(this._mockData, filterParameters);
    const total = filteredData.length;
    // Map to DocumentGrid
    let gridData: DocumentGrid[] = filteredData.map(document => ({
      selected: false,
      documentId: document.documentId,
      personName: document.personName,
      documentDescription: document.documentDescription,
      documentCreationDate: document.documentCreationDate
    }));
    // Ordenamiento
    if (pageFilter.sortField) {
      gridData.sort((a: any, b: any) => {
        const sortField = pageFilter.sortField??"";
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

  getDocument(documentId: number): Observable<Document> {
    // Buscar por el campo Key (documentId)
    const document = this._mockData.find(document => document.documentId === documentId);    
    return of(document!);
  }

  addDocument(document: Document): Observable<Document> {
    // Asignar un ID nuevo (simulación)
    const newId = this._mockData.length > 0 ? Math.max(...this._mockData.map(d => d.documentId!)) + 1 : 1;
    document.documentId = newId;
    this._mockData.push(document);
    return of(document);
  }

  updateDocument(document: Document): Observable<Document> {
    const index = this._mockData.findIndex(d => d.documentId === document.documentId);
    this._mockData[index] = document;
    
    return of(document);
  }
  
  deleteDocument(documentId: number): Observable<void> {
    this._mockData = this._mockData.filter(document => document.documentId !== documentId);
    
    return of(void 0);
  }
  /**
   * Filtra el array de documentos según los parámetros de filtro.
   */
  private _filterDocuments(data: Document[], filter: DocumentFilter): Document[] {
    return data.filter(document => {
      let matches = true;
      if (filter.documentId && document.documentId !== filter.documentId) matches = false;
      // Si se agregan más campos a DocumentFilter, agregar aquí
      return matches;
    });
  }
}
