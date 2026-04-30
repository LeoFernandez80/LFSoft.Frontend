import { Component } from '@angular/core';
import { EnumMessageType, GenericLayoutComponent, GenericMessageComponent, MessagesService, TranslatePipe } from '@lib/shared';
import { EntityFormComponent } from '../entity-form/entity-form.component';

@Component({
  selector: 'app-entities-form-container',
  templateUrl: './entities-form-container.component.html',
  styleUrls: ['./entities-form-container.component.scss'],
  standalone: true,
  imports: [TranslatePipe, GenericLayoutComponent, GenericMessageComponent, EntityFormComponent],
  providers: [MessagesService]
})
export class EntitiesFormContainerComponent {
  constructor(private _messagesService: MessagesService) {}

  onSaveEntity(): void {
    this._messagesService.addMessage('MESSAGE.successSave', EnumMessageType.Info);
  }

  onCancelEntity(): void {
    window.open('', '_self');
    window.close();
  }
}
