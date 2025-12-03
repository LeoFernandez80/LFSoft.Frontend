import { EnumQuoteStates } from "../enums/quote-state.enums";

export class QuoteGrid {
  id: number=0;
  customerId: number=0;
  description: string ='';
  creationDate: Date = new Date();
  stateId: EnumQuoteStates = EnumQuoteStates.quoteInMaking;
}
