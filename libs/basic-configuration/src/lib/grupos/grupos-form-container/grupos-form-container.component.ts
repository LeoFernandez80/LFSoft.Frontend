import { Component } from '@angular/core';
import {
  EnumMessageType,
  GenericLayoutComponent,
  GenericMessageComponent,
  MessagesService,
  TranslatePipe
} from '@lib/shared';
import { GrupoFormComponent } from '../grupo-form/grupo-form.component';

@Component({
  selector: 'app-grupos-form-container',
  templateUrl: './grupos-form-container.component.html',
  styleUrls: ['./grupos-form-container.component.scss'],
  standalone: true,
  imports: [TranslatePipe, GenericLayoutComponent, GenericMessageComponent, GrupoFormComponent],
  providers: [MessagesService]
})
export class GruposFormContainerComponent {
  constructor(private _messagesService: MessagesService) {}

  onSaveGrupo(): void {
    this._messagesService.addMessage('MESSAGE.successSave', EnumMessageType.Info);
  }

  onCancelGrupo(): void {
    window.open('', '_self');
    window.close();
  }
}
