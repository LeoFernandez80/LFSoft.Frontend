import { NgIf } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { GenericLayoutComponent, GenericMessageComponent, MessagesService, EnumLayoutType, EnumMessageType } from '@lib/shared';
import { DocumentFormComponent } from '../document-form/document-form.component';


@Component({
  selector: 'app-documents-form-container',
  templateUrl: './documents-form-container.component.html',
  styleUrls: ['./documents-form-container.component.scss'],
  standalone: true,
  imports: [ NgIf, GenericLayoutComponent,
      GenericMessageComponent,DocumentFormComponent],
  providers: [ MessagesService ]
})
export class DocumentsFormContainerComponent implements OnInit {

  constructor( private _messagesService: MessagesService ) { }

  layoutTypes = EnumLayoutType
  ngOnInit(): void {  }

  onSaveDocument(document: any): void {
    this._messagesService.addMessage( 'MESSAGE.successSave', EnumMessageType.Info);
  }

  onCancelDocument(): void {    
    window.open(``, '_self');
    window.close();
  }

}
