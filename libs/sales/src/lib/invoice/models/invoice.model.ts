import { InvoiceItem } from './invoice-item.model';

export class Invoice {
  invoiceId: number = 0;
  personName: string = '';
  personId: number = 0;
  personDocumentType: string = '';
  personDocumentNumber: string = '';
  invoiceDescription: string = '';
  invoiceCreationDate: Date = new Date();
  invoiceSentDate: Date = new Date();
  creationUserId: number = 0;
  invoiceTotalPrice: number = 0;
  
  items: InvoiceItem[] = [];
}

// Re-export for convenience
export { InvoiceItem } from './invoice-item.model';
