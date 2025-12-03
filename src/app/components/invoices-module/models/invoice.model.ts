import { InvoiceItem } from './invoice-item.model';

export class Invoice {
  //grid, filter
  invoiceId: number = 0;
  //grid
  personName: string = '';
  personId: number = 0;
  personDocumentType: string = '';
  personDocumentNumber: string = '';
  //grid, filter
  invoiceDescription: string = '';
  //grid, filter
  invoiceCreationDate: Date = new Date();
  invoiceSentDate: Date = new Date();
  creationUserId: number = 0;
  
  // ✅ Colección de items anidados
  items: InvoiceItem[] = [];
}

// Re-export for convenience
export { InvoiceItem } from './invoice-item.model';
