import { InvoiceItemDetail } from './invoice-item-detail.model';

export class InvoiceItem {
  invoiceId: number = 0;
  itemId: number = 0;
  itemDescription: string = '';
  itemQuantity: number = 0;  
  get itemUnitPrice(): number {
    return this.details.reduce((sum, detail) => sum + detail.detailQuantity * detail.detailUnitPrice, 0);
  }
  get itemTotalPrice(): number {
    return this.itemQuantity * this.itemUnitPrice;
  }

  details: InvoiceItemDetail[] = [];
}

// Re-export for convenience
export { InvoiceItemDetail } from './invoice-item-detail.model';
