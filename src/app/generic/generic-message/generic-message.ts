import { Component, OnDestroy } from '@angular/core';
import { MessagesService } from './services/message.service';
import { Message } from './models/message.model';
import { CommonModule, NgFor } from '@angular/common';
import { GenericMessageItemComponent } from './generic-message-item/generic-message-item';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-generic-message',
  imports: [NgFor,CommonModule, GenericMessageItemComponent],
  templateUrl: './generic-message.html',
  styleUrl: './generic-message.scss',
  standalone: true
})
export class GenericMessageComponent implements OnDestroy {
  messages: Message[] = [];
  isVisible: boolean = true;


  private _subscriptions: Subscription[] = [];

  constructor(private _messageService: MessagesService) {
    this._subscriptions.push(this._messageService.getMessages().subscribe(messages => {
      this.messages = messages;
      this.isVisible = this.messages.length > 0;
   }));
  }

  ngOnDestroy(): void {
    this._messageService.clearMessages();
    this._subscriptions.forEach(sub => sub.unsubscribe());
  }

  closeMessages() {
    this._messageService.clearMessages();
    this.messages = [];
    this.isVisible = false;
  }


  closeMessage(index: number): void {
    this._messageService.removeMessage(index);
  }
}
