import { Component } from '@angular/core';
import { EnumMessageType, GenericLayoutComponent, GenericMessageComponent, MessagesService, TranslatePipe } from '@lib/shared';
import { PersonFormComponent } from '../person-form/person-form.component';

@Component({
  selector: 'app-persons-form-container',
  templateUrl: './persons-form-container.component.html',
  styleUrls: ['./persons-form-container.component.scss'],
  standalone: true,
  imports: [TranslatePipe, GenericLayoutComponent, GenericMessageComponent, PersonFormComponent],
  providers: [MessagesService]
})
export class PersonsFormContainerComponent {
  constructor(private _messagesService: MessagesService) {}

  onSavePerson(): void { this._messagesService.addMessage('MESSAGE.successSave', EnumMessageType.Info); }
  onCancelPerson(): void { window.open('', '_self'); window.close(); }
}
