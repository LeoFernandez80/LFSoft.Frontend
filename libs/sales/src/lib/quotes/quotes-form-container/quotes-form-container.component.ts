import { NgIf } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { GenericLayoutComponent, GenericMessageComponent, MessagesService, EnumLayoutType, EnumMessageType, TranslatePipe } from '@lib/shared';
import { QuoteFormComponent } from '../quote-form/quote-form.component';

@Component({
  selector: 'lfsoft-sales-quotes-form-container',
  templateUrl: './quotes-form-container.component.html',
  styleUrls: ['./quotes-form-container.component.scss'],
  standalone: true,
  imports: [NgIf, GenericLayoutComponent, GenericMessageComponent, GenericLayoutComponent, TranslatePipe, QuoteFormComponent],
  providers: [MessagesService]
})
export class QuotesFormContainerComponent implements OnInit {
  quoteId: number = 0;
  layoutTypes = EnumLayoutType;

  constructor(
    private _router: Router,
    private _route: ActivatedRoute,
    private _messagesService: MessagesService
  ) {}

  ngOnInit(): void {
    this._route.queryParams.subscribe(params => {
      this.quoteId = params['id'];
    });
  }

  onSave(): void {
    this._messagesService.addMessage('MESSAGE.successSave', EnumMessageType.Success);
  }

  onCancel(): void {
    window.close();
  }
}
