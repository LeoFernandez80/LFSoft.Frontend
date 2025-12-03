import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { PageFilter } from '../../../generic/models/page-filter.model';
import { PaginatedList } from '../../../generic/models/paginated-list.model';
import { InvoiceFilter } from '../models/invoice-filter.model';
import { Invoice } from '../models/invoice.model';
import { InvoiceGrid } from '../models/invoice-grid.model';

@Injectable({
  providedIn: 'root'
})
export class InvoiceService {
  private _mockData: Invoice[] = [
    { 
      invoiceId: 1, 
      personId: 1, 
      personName: 'John Doe', 
      personDocumentType: 'DNI', 
      personDocumentNumber: '12345678', 
      invoiceDescription: 'Invoice 1', 
      invoiceCreationDate: new Date('2024-01-15'), 
      invoiceSentDate: new Date('2024-01-16'),
      creationUserId: 1, 
      items: Array.from({ length: 70 }, (_, i) => ({
        invoiceId: 1,
        itemId: i + 1,
        itemDescription: `Item ${i + 1}`,
        details: Array.from({ length: 3 }, (_, j) => ({
          invoiceId: 1,
          itemId: i + 1,
          detailId: j + 1,
          detailDescription: `Detail ${j + 1}`,
          detailQuantity: Math.floor(Math.random() * 10) + 1,
          detailUnitPrice: Math.floor(Math.random() * 100) + 10,
          detailTotalPrice: 0
        })).map(detail => ({
          ...detail,
          detailTotalPrice: detail.detailQuantity * detail.detailUnitPrice
        })),
        itemQuantity: Math.floor(Math.random() * 50) + 1,
        itemUnitPrice: Math.floor(Math.random() * 200) + 50,
        itemTotalPrice: 0
      })).map(item => ({
        ...item,
        itemTotalPrice: item.itemQuantity * item.itemUnitPrice
      }))
    },
    { 
      invoiceId: 2, 
      personId: 2, 
      personName: 'Jane Doe', 
      personDocumentType: 'DNI', 
      personDocumentNumber: '87654321', 
      invoiceDescription: 'Invoice 2', 
      invoiceCreationDate: new Date('2024-02-10'), 
      invoiceSentDate: new Date('2024-02-11'),
      creationUserId: 1, 
      items: [] 
    },
    { 
      invoiceId: 3, 
      personId: 3, 
      personName: 'Alice Smith', 
      personDocumentType: 'DNI', 
      personDocumentNumber: '11223344', 
      invoiceDescription: 'Invoice 3', 
      invoiceCreationDate: new Date('2024-03-05'), 
      invoiceSentDate: new Date('2024-03-06'),
      creationUserId: 1, 
      items: [] 
    },
    { 
      invoiceId: 4, 
      personId: 4, 
      personName: 'Bob Johnson', 
      personDocumentType: 'DNI', 
      personDocumentNumber: '44332211', 
      invoiceDescription: 'Invoice 4', 
      invoiceCreationDate: new Date('2024-04-20'), 
      invoiceSentDate: new Date('2024-04-21'),
      creationUserId: 1, 
      items: [] 
    },
    { 
      invoiceId: 5, 
      personId: 5, 
      personName: 'Charlie Brown', 
      personDocumentType: 'DNI', 
      personDocumentNumber: '55667788', 
      invoiceDescription: 'Invoice 5', 
      invoiceCreationDate: new Date('2024-05-15'), 
      invoiceSentDate: new Date('2024-05-16'),
      creationUserId: 1, 
      items: [] 
    },
    { 
      invoiceId: 6, 
      personId: 6, 
      personName: 'Diana Prince', 
      personDocumentType: 'DNI', 
      personDocumentNumber: '99887766', 
      invoiceDescription: 'Invoice 6', 
      invoiceCreationDate: new Date('2024-06-10'), 
      invoiceSentDate: new Date('2024-06-11'),
      creationUserId: 1, 
      items: [] 
    },
    { 
      invoiceId: 7, 
      personId: 7, 
      personName: 'Ethan Hunt', 
      personDocumentType: 'DNI', 
      personDocumentNumber: '22334455', 
      invoiceDescription: 'Invoice 7', 
      invoiceCreationDate: new Date('2024-07-25'), 
      invoiceSentDate: new Date('2024-07-26'),
      creationUserId: 1, 
      items: [] 
    },
    { 
      invoiceId: 8, 
      personId: 8, 
      personName: 'Fiona Glenanne', 
      personDocumentType: 'DNI', 
      personDocumentNumber: '66778899', 
      invoiceDescription: 'Invoice 8', 
      invoiceCreationDate: new Date('2024-08-30'), 
      invoiceSentDate: new Date('2024-08-31'),
      creationUserId: 1, 
      items: [] 
    },
    { 
      invoiceId: 9, 
      personId: 9, 
      personName: 'George Clooney', 
      personDocumentType: 'DNI', 
      personDocumentNumber: '33445566', 
      invoiceDescription: 'Invoice 9', 
      invoiceCreationDate: new Date('2024-09-18'), 
      invoiceSentDate: new Date('2024-09-19'),
      creationUserId: 1, 
      items: [] 
    },
    { 
      invoiceId: 10, 
      personId: 10, 
      personName: 'Hannah Montana', 
      personDocumentType: 'DNI', 
      personDocumentNumber: '77889900', 
      invoiceDescription: 'Invoice 10', 
      invoiceCreationDate: new Date('2024-10-22'), 
      invoiceSentDate: new Date('2024-10-23'),
      creationUserId: 1, 
      items: [] 
    }
  ];

  getInvoices(pageFilter: PageFilter, filterParameters: InvoiceFilter): Observable<PaginatedList<InvoiceGrid>> {
    let filteredData = this._filterInvoices(this._mockData, filterParameters);
    const total = filteredData.length;
    
    // Map to InvoiceGrid
    let gridData: InvoiceGrid[] = filteredData.map(invoice => ({
      selected: false,
      invoiceId: invoice.invoiceId,
      personName: invoice.personName,
      invoiceDescription: invoice.invoiceDescription,
      invoiceCreationDate: invoice.invoiceCreationDate
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

  getInvoice(invoiceId: number): Observable<Invoice> {
    const invoice = this._mockData.find(invoice => invoice.invoiceId === invoiceId);
    return of(invoice!);
  }

  addInvoice(invoice: Invoice): Observable<Invoice> {
    const newId = this._mockData.length > 0 ? Math.max(...this._mockData.map(i => i.invoiceId)) + 1 : 1;
    invoice.invoiceId = newId;
    this._mockData.push(invoice);
    return of(invoice);
  }

  updateInvoice(invoice: Invoice): Observable<Invoice> {
    const index = this._mockData.findIndex(i => i.invoiceId === invoice.invoiceId);
    if (index !== -1) {
      this._mockData[index] = invoice;
    }
    return of(invoice);
  }
  
  deleteInvoice(invoiceId: number): Observable<void> {
    this._mockData = this._mockData.filter(invoice => invoice.invoiceId !== invoiceId);
    return of(void 0);
  }

  private _filterInvoices(data: Invoice[], filter: InvoiceFilter): Invoice[] {
    return data.filter(invoice => {
      let matches = true;
      
      if (filter.invoiceId && invoice.invoiceId !== filter.invoiceId) {
        matches = false;
      }
      
      if (filter.personName && !invoice.personName.toLowerCase().includes(filter.personName.toLowerCase())) {
        matches = false;
      }
      
      if (filter.invoiceDescription && !invoice.invoiceDescription.toLowerCase().includes(filter.invoiceDescription.toLowerCase())) {
        matches = false;
      }
      
      if (filter.invoiceCreationDateFrom && invoice.invoiceCreationDate < filter.invoiceCreationDateFrom) {
        matches = false;
      }
      
      if (filter.invoiceCreationDateTo && invoice.invoiceCreationDate > filter.invoiceCreationDateTo) {
        matches = false;
      }
      
      return matches;
    });
  }
}
