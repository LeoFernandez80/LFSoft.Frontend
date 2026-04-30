import { Component, Input, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DrawerService, EnumActionsType, EnumMessageType, GenericDrawerComponent, MessagesService } from '@lib/shared';
import { UserRoleFormComponent } from '../user-role-form/user-role-form.component';

@Component({
  selector: 'app-user-role-drawer',
  templateUrl: './user-role-drawer.component.html',
  styleUrls: ['./user-role-drawer.component.scss'],
  standalone: true,
  imports: [CommonModule, GenericDrawerComponent, UserRoleFormComponent]
})
export class UserRoleDrawerComponent implements OnInit {
  @Input() set userRoleId(value: string | null) {
    if (!value) {
      return;
    }
    this._userRoleId = value;
  }

  get userRoleId(): string {
    return this._userRoleId;
  }

  private _userRoleId: string = '';

  constructor(private _messagesService: MessagesService, private _drawerService: DrawerService) {}

  ngOnInit(): void { }

  onCancelUserRole(): void {
    this._drawerService.hide(EnumActionsType.actionCancel);
  }

  onSaveUserRole(userRole: any): void {
    this._drawerService.hide(EnumActionsType.actionSave);
    this._messagesService.addMessage('MESSAGE.successSave', EnumMessageType.Info);
  }
}
