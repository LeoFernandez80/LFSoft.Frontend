import { QueryParams } from "@lib/shared";

export class InvoiceFilter implements QueryParams{
  invoiceId?: number = 0;
  personName: string = '';
  invoiceDescription: string = '';
  invoiceCreationDateFrom?: Date;
  invoiceCreationDateTo?: Date;

  toString(): string {
    const params= new URLSearchParams();

    if (this.invoiceId !== undefined && this.invoiceId !== null) {
      params.append('invoiceId', this.invoiceId.toString());
    }
    if (this.personName !== undefined && this.personName !== null && this.personName.trim() !== '') {
      params.append('personName', this.personName);
    }
    if (this.invoiceDescription !== undefined && this.invoiceDescription !== null && this.invoiceDescription.trim() !== '') {
      params.append('invoiceDescription', this.invoiceDescription);
    }
    if (this.invoiceCreationDateFrom) {
      params.append('invoiceCreationDateFrom', this.invoiceCreationDateFrom.toISOString());
    }
    if (this.invoiceCreationDateTo) {
      params.append('invoiceCreationDateTo', this.invoiceCreationDateTo.toISOString());
    }
    return params.toString();
  }
}