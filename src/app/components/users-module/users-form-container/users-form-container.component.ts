import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { UserFormComponent } from '../user-form/user-form.component';
import { GenericLayoutComponent } from '../../../generic/generic-layout/generic-layout.component';
import { GenericMessageComponent } from '../../../generic/generic-message/generic-message';
import { EnumLayoutType } from '../../../generic/generic-layout/enums/layout-type.enum';
import { NgIf } from '@angular/common';
import { MessagesService } from '../../../generic/generic-message/services/message.service';
import { EnumMessageType } from '../../../generic/generic-message/enums/message-type.model';
import { TranslatePipe } from '../../../generic/generic-translate/translate.pipe';

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
