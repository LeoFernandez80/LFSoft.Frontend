import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DrawerService, EnumActionsType, EnumMessageType, GenericDrawerComponent, MessagesService } from '@lib/shared';
import { UserFormComponent } from '../user-form/user-form.component';

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
