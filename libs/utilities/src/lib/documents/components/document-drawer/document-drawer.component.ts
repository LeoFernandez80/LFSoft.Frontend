import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { GenericDrawerComponent, MessagesService, DrawerService, EnumActionsType, EnumMessageType } from '@lib/shared';
import { DocumentFormComponent } from '../document-form/document-form.component';

@Component({
  selector: 'app-document-drawer',
  templateUrl: './document-drawer.component.html',
  styleUrls: ['./document-drawer.component.scss'],
  standalone: true,
  imports: [CommonModule, GenericDrawerComponent, DocumentFormComponent]
})
export class DocumentDrawerComponent implements OnInit {
  @Input() set documentId(value: number | null) {
    if (!value ) {
      return;
    }
    this._documentId = value;   
  }
  get documentId(): number  {
    return this._documentId;
  }

  private _documentId: number = 0;
  constructor(private _messagesService: MessagesService,private p_drawerService: DrawerService) {}

  ngOnInit(): void { }

  onCancelDocument(): void {
    this.p_drawerService.hide( EnumActionsType.actionCancel );
  }

  onSaveDocument(document: any): void {
    this.p_drawerService.hide( EnumActionsType.actionSave );
    this._messagesService.addMessage("MESSAGE.successSave", EnumMessageType.Info);
  }

}
