import { NgIf } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { TranslatePipe, GenericLayoutComponent, GenericMessageComponent, MessagesService, EnumLayoutType, EnumMessageType } from '@lib/shared';
import { UserRoleFormComponent } from '../user-role-form/user-role-form.component';

@Component({
  selector: 'app-user-roles-form-container',
  templateUrl: './user-roles-form-container.component.html',
  styleUrls: ['./user-roles-form-container.component.scss'],
  standalone: true,
  imports: [NgIf, TranslatePipe, GenericLayoutComponent, GenericMessageComponent, UserRoleFormComponent],
  providers: [MessagesService]
})
export class UserRolesFormContainerComponent implements OnInit {
  layoutTypes = EnumLayoutType;

  constructor(private _messagesService: MessagesService) { }

  ngOnInit(): void { }

  onSaveUserRole(userRole: any): void {
    this._messagesService.addMessage('MESSAGE.successSave', EnumMessageType.Info);
  }

  onCancelUserRole(): void {
    window.open('', '_self');
    window.close();
  }
}
