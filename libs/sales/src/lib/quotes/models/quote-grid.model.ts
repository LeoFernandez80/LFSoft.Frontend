import { EnumQuoteStates } from './quote.model';

export class QuoteGrid {
  quoteId: number = 0;
  customerName: string = '';
  quoteDescription: string = '';
  quoteCreationDate: Date = new Date();
  quoteStateId: EnumQuoteStates = EnumQuoteStates.quoteInMaking;
  quoteTotalPrice: number = 0;
}
