import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { EntityFormComponent } from '../entity-form/entity-form.component';
import { GenericLayoutComponent } from '../../../generic/generic-layout/generic-layout.component';
import { GenericMessageComponent } from '../../../generic/generic-message/generic-message';
import { EnumLayoutType } from '../../../generic/generic-layout/enums/layout-type.enum';
import { NgIf } from '@angular/common';
import { MessagesService } from '../../../generic/generic-message/services/message.service';
import { EnumMessageType } from '../../../generic/generic-message/enums/message-type.model';

@Component({
  selector: 'app-entities-form-container',
  templateUrl: './entities-form-container.component.html',
  styleUrls: ['./entities-form-container.component.scss'],
  standalone: true,
  imports: [ NgIf, GenericLayoutComponent,
      GenericMessageComponent, EntityFormComponent]
})
export class EntitiesFormContainerComponent implements OnInit, OnDestroy {

  constructor( private _messagesService: MessagesService ) { }

  layoutTypes = EnumLayoutType
  ngOnInit(): void {  }

  ngOnDestroy(): void {
    // Cleanup si es necesario en el futuro
  }

  onSaveEntity(entity: any): void {
    this._messagesService.addMessage('MESSAGE.successSave', EnumMessageType.Info);
  }

  onCancelEntity(): void {    
    window.close();
  }
}