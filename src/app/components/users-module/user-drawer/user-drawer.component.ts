import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { GenericDrawerComponent } from '../../../generic/generic-drawer/generic-drawer.component';
import { DrawerService } from '../../../generic/generic-drawer/services/drawer.service';
import { UserFormComponent } from '../user-form/user-form.component';
import { MessagesService } from '../../../generic/generic-message/services/message.service';
import { EnumMessageType } from '../../../generic/generic-message/enums/message-type.model';
import { EnumActionsType } from '../../../generic/generic-actions/enums/actions-type.enums';

@Component({
  selector: 'app-user-drawer',
  templateUrl: './user-drawer.component.html',
  styleUrls: ['./user-drawer.component.scss'],
  standalone: true,
  imports: [CommonModule, GenericDrawerComponent, UserFormComponent]
})
export class UserDrawerComponent implements OnInit {
  @Input() set userId(value: number | null) {
    if (!value ) {
      return;
    }
    this._userId = value;   
  }
  get userId(): number  {
    return this._userId;
  }

  private _userId: number = 0;
  constructor(private _messagesService: MessagesService,private p_drawerService: DrawerService) {}

  ngOnInit(): void { }

  onCancelUser(): void {
    this.p_drawerService.hide( EnumActionsType.actionCancel );
  }

  onSaveUser(user: any): void {
    this.p_drawerService.hide( EnumActionsType.actionSave );
    this._messagesService.addMessage("MESSAGE.successSave", EnumMessageType.Info);
  }

}
