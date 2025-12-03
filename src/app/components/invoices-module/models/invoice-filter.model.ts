export class InvoiceFilter {
  invoiceId?: number = 0;
  personName: string = '';
  invoiceDescription: string = '';
  invoiceCreationDateFrom?: Date;
  invoiceCreationDateTo?: Date;
}
