import { Component, EventEmitter, Input, Output } from '@angular/core';
import { Message } from '../models/message.model';
import { EnumMessageType } from '../enums/message-type.enum';
import { NgClass, NgIf } from '@angular/common';
import { TranslatePipe } from '../../generic-translate/translate.pipe';

@Component({
  selector: 'lfsoft-shared-message-item',
  templateUrl: './generic-message-item.component.html',
  styleUrl: './generic-message-item.component.scss',
  imports: [NgClass, NgIf, TranslatePipe],
  standalone: true
})
export class GenericMessageItemComponent {
  @Input() message: Message;
  
  @Output() close = new EventEmitter<void>();
  
  isVisible: boolean = true;

  getMessageClass(): string {   
    switch (this.message.type) {
      case EnumMessageType.Info:
        return 'message--info';
      case EnumMessageType.Success:
        return 'message--success';
      case EnumMessageType.Warning:
        return 'message--warning';
      case EnumMessageType.Error:
        return 'message--error';
      default:
        return '';
    }
  }

  constructor() { 
    this.message = new Message('', EnumMessageType.Info);
    if (this.message.autoClose && this.message.autoClose > 0) {
      setTimeout(() => {
        this.closeMessage();
      }, this.message.autoClose);
    }
  }

  closeMessage(): void {
    this.isVisible = false;
    this.close.emit();
  }
}
