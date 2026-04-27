import { EnumQuoteStates } from './quote.model';

export class QuoteFilter {
  customerName: string = '';
  quoteStateId: EnumQuoteStates | null = null;
  startDate: Date | null = null;
  endDate: Date | null = null;

  toString(): string {
    const params = new URLSearchParams();
    if (this.customerName) params.append('customerName', this.customerName);
    if (this.quoteStateId !== null) params.append('quoteStateId', this.quoteStateId.toString());
    if (this.startDate) params.append('startDate', this.startDate.toISOString());
    if (this.endDate) params.append('endDate', this.endDate.toISOString());
    return params.toString();
  }
}
