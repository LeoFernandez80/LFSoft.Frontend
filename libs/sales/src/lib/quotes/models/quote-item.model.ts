import { QuoteItemArticle } from './quote-item-article.model';

export class QuoteItem {
  quoteId: number = 0;
  itemId: number = 0;
  itemQuantity: number = 0;
  itemDescription: string = '';    
  
  get unitPrice(): number {
    return this.articles.reduce((sum, article) => 
      sum + article.itemArticleQuantity * article.itemArticleUnitPrice, 0);
  }
  
  get totalPrice(): number {
    return this.itemQuantity * this.unitPrice;
  }
  
  articles: QuoteItemArticle[] = [];
}

export { QuoteItemArticle } from './quote-item-article.model';
