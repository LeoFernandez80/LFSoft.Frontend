import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { DocumentFormComponent } from '../document-form/document-form.component';
import { GenericLayoutComponent } from '../../../generic/generic-layout/generic-layout.component';
import { GenericMessageComponent } from '../../../generic/generic-message/generic-message';
import { EnumLayoutType } from '../../../generic/generic-layout/enums/layout-type.enum';
import { NgIf } from '@angular/common';
import { MessagesService } from '../../../generic/generic-message/services/message.service';
import { EnumMessageType } from '../../../generic/generic-message/enums/message-type.model';

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
