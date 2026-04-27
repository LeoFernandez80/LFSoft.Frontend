import { Component, OnInit, OnDestroy } from '@angular/core';
import { EntityFormComponent } from '../entity-form/entity-form.component';
import { 
  GenericLayoutComponent, 
  GenericMessageComponent, 
  EnumLayoutType, 
  MessagesService, 
  EnumMessageType 
} from '@lib/shared';

@Component({
  selector: 'lfsoft-utilities-entities-form-container',
  templateUrl: './entities-form-container.component.html',
  styleUrls: ['./entities-form-container.component.scss'],
  standalone: true,
  imports: [ GenericLayoutComponent,
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
