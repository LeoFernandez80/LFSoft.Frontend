import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { PersonFormComponent } from '../person-form/person-form.component';
import { GenericLayoutComponent } from '../../../generic/generic-layout/generic-layout.component';
import { GenericMessageComponent } from '../../../generic/generic-message/generic-message';
import { EnumLayoutType } from '../../../generic/generic-layout/enums/layout-type.enum';
import { NgIf } from '@angular/common';
import { MessagesService } from '../../../generic/generic-message/services/message.service';
import { EnumMessageType } from '../../../generic/generic-message/enums/message-type.model';

@Component({
  selector: 'app-persons-form-container',
  templateUrl: './persons-form-container.component.html',
  styleUrls: ['./persons-form-container.component.scss'],
  standalone: true,
  imports: [ NgIf, GenericLayoutComponent,
      GenericMessageComponent,PersonFormComponent],
  providers: [ MessagesService ]
})
export class PersonsFormContainerComponent implements OnInit {

  constructor( private _messagesService: MessagesService ) { }

  layoutTypes = EnumLayoutType
  ngOnInit(): void {  }

  onSavePerson(person: any): void {
    this._messagesService.addMessage( 'MESSAGE.successSave', EnumMessageType.Info);
  }

  onCancelPerson(): void {
    window.open(``, '_self');
    window.close();
  }

}