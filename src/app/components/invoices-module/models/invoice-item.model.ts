import { InvoiceItemDetail } from './invoice-item-detail.model';

export class InvoiceItem {
  invoiceId: number = 0;
  //grid
  itemId: number = 0;
  //grid
  itemDescription: string = '';
  //grid
  itemQuantity: number = 0;
  //grid
  
  get itemUnitPrice(): number {
    return this.details.reduce((sum, detail) => sum + detail.detailQuantity * detail.detailUnitPrice, 0);
  }
  get itemTotalPrice(): number {
    return this.itemQuantity * this.itemUnitPrice;
  }
  // ✅ Colección de detalles anidados
  details: InvoiceItemDetail[] = [];
}

// Re-export for convenience
export { InvoiceItemDetail } from './invoice-item-detail.model';
