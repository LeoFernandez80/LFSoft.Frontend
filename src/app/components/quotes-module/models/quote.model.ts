import { EnumQuoteStates } from "../enums/quote-state.enums";

export class Quote {
  id: number=0;
  customerId: number=0;
  businessName: string = "";
  description: string ='';
  creationDate: Date = new Date();
  stateId: EnumQuoteStates=EnumQuoteStates.quoteInMaking;
  items: QuoteItem[] = [];
}

export class QuoteItem{
  quoteId: number = 0;
  id: number =0;
  quantity: number = 0;
  description: string="";
  price: number = 0;  
  articles: QuoteItemArticle[] = [];
}

export class QuoteItemArticle{
  quoteId: number = 0;
  itemId: number = 0;
  id: number =0;
  quantity: number = 0; 
  assembly:string = "";
  description: string="";
  price: number = 0
}
