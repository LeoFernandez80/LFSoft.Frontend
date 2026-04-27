import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { PersonFormComponent } from '../person-form/person-form.component';
import { NgIf } from '@angular/common';
import { GenericLayoutComponent, GenericMessageComponent, MessagesService, EnumLayoutType, EnumMessageType } from '@lib/shared';


@Component({
  selector: 'lfsoft-utilities-persons-form-container',
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
