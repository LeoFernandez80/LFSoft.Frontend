import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { InvoiceFormComponent } from '../invoice-form/invoice-form.component';
import { GenericLayoutComponent } from '../../../generic/generic-layout/generic-layout.component';
import { GenericMessageComponent } from '../../../generic/generic-message/generic-message';
import { EnumLayoutType } from '../../../generic/generic-layout/enums/layout-type.enum';
import { NgIf } from '@angular/common';
import { MessagesService } from '../../../generic/generic-message/services/message.service';
import { EnumMessageType } from '../../../generic/generic-message/enums/message-type.model';

@Component({
  selector: 'app-invoices-form-container',
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
