export class InvoiceItemDetail {
  invoiceId: number = 0;
  itemId: number = 0;
  //grid
  detailId: number = 0;
  //grid
  detailCode?: string = '';
  //grid
  detailDescription: string = '';
  //grid
  detailQuantity: number = 0;
  //grid
  detailUnitPrice: number = 0;

  get detailTotalPrice(): number {
    return this.detailQuantity * this.detailUnitPrice;  
  }
}
