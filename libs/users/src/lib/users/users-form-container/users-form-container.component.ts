import { NgIf } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { TranslatePipe, GenericLayoutComponent, GenericMessageComponent, MessagesService, EnumLayoutType, EnumMessageType } from '@lib/shared';
import { UserFormComponent } from '../user-form/user-form.component';
@Component({
  selector: 'app-users-form-container',
  templateUrl: './users-form-container.component.html',
  styleUrls: ['./users-form-container.component.scss'],
  standalone: true,
  imports: [ NgIf, TranslatePipe, GenericLayoutComponent,
      GenericMessageComponent,UserFormComponent],
  providers: [ MessagesService ]
})
export class UsersFormContainerComponent implements OnInit {

  constructor( private _messagesService: MessagesService ) { }

  layoutTypes = EnumLayoutType
  ngOnInit(): void {  }

  onSaveUser(user: any): void {
    this._messagesService.addMessage( 'MESSAGE.successSave', EnumMessageType.Info);
  }

  onCancelUser(): void {    
    window.open(``, '_self');
    window.close();
  }

}
