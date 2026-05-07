import { Component } from '@angular/core';
import { EnumMessageType, GenericLayoutComponent, GenericMessageComponent, MessagesService, TranslatePipe } from '@lib/shared';
import { CompanyFormComponent } from '../company-form/company-form.component';

@Component({
  selector: 'app-companies-form-container',
  templateUrl: './companies-form-container.component.html',
  styleUrls: ['./companies-form-container.component.scss'],
  standalone: true,
  imports: [TranslatePipe, GenericLayoutComponent, GenericMessageComponent, CompanyFormComponent],
  providers: [MessagesService]
})
export class CompaniesFormContainerComponent {
  constructor(private _messagesService: MessagesService) {}

  onSaveCompany(): void {
    this._messagesService.addMessage('MESSAGE.successSave', EnumMessageType.Info);
  }

  onCancelCompany(): void {
    window.open('', '_self');
    window.close();
  }
}




