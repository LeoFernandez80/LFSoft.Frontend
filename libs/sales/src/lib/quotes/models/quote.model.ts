import { QuoteItem } from './quote-item.model';

export enum EnumQuoteStates {
  quoteInMaking = 1,
  quoteApproved = 2,
  quoteRejected = 3,
  quoteCancelled = 4
}

export class Quote {
  quoteId: number = 0;
  customerId: number = 0;
  customerName: string = '';
  customerDocumentType: string = '';
  customerDocumentNumber: string = '';
  quoteDescription: string = '';
  quoteCreationDate: Date = new Date();
  quoteModificationDate: Date = new Date();
  quoteStateId: EnumQuoteStates = EnumQuoteStates.quoteInMaking;
  quoteTotalPrice: number = 0;
  creationUserId: number = 0;
  modificationUserId: number = 0;
  
  items: QuoteItem[] = [];
}

export { QuoteItem } from './quote-item.model';
export { QuoteItemArticle } from './quote-item-article.model';
