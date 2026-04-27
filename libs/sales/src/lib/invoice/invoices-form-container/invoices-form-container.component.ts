import { NgIf } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { GenericLayoutComponent, GenericMessageComponent, MessagesService, EnumLayoutType, EnumMessageType } from '@lib/shared';
import { InvoiceFormComponent } from '../invoice-form/invoice-form.component';

@Component({
  selector: 'lfsoft-sales-invoices-form-container',
  templateUrl: './invoices-form-container.component.html',
  styleUrls: ['./invoices-form-container.component.scss'],
  standalone: true,
  imports: [NgIf, GenericLayoutComponent, GenericMessageComponent, GenericLayoutComponent, InvoiceFormComponent],
  providers: [MessagesService]
})
export class InvoicesFormContainerComponent implements OnInit {
  invoiceId: number = 0;
  layoutTypes = EnumLayoutType;

  constructor(
    private _router: Router,
    private _route: ActivatedRoute,
    private _messagesService: MessagesService
  ) {}

  ngOnInit(): void {
    this._route.queryParams.subscribe(params => {
      this.invoiceId = params['id'];
    });
  }

  onSave(): void {
    this._messagesService.addMessage('MESSAGE.successSave', EnumMessageType.Success);
  }

  onCancel(): void {
    window.close();
  }
}
