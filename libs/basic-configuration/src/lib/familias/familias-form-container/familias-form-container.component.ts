import { Component } from '@angular/core';
import { EnumMessageType, GenericLayoutComponent, GenericMessageComponent, MessagesService, TranslatePipe } from '@lib/shared';
import { FamiliaFormComponent } from '../familia-form/familia-form.component';

@Component({
  selector: 'app-familias-form-container',
  templateUrl: './familias-form-container.component.html',
  styleUrls: ['./familias-form-container.component.scss'],
  standalone: true,
  imports: [TranslatePipe, GenericLayoutComponent, GenericMessageComponent, FamiliaFormComponent],
  providers: [MessagesService]
})
export class FamiliasFormContainerComponent {
  constructor(private _messagesService: MessagesService) {}

  onSaveFamilia(): void {
    this._messagesService.addMessage('MESSAGE.successSave', EnumMessageType.Info);
  }

  onCancelFamilia(): void {
    window.open('', '_self');
    window.close();
  }
}
