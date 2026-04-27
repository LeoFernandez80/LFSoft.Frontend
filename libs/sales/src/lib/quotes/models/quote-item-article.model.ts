export class QuoteItemArticle {
  quoteId: number = 0;
  itemId: number = 0;
  itemArticleId: number = 0;  
  itemArticleQuantity: number = 0;
  itemArticleAssembly: string = '';
  itemArticleDescription: string = '';
  itemArticleUnitPrice: number = 0;

  get itemArticleTotalPrice(): number {
    return this.itemArticleQuantity * this.itemArticleUnitPrice;
  }
}
