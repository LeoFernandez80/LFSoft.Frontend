import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { 
  GenericDrawerComponent, 
  DrawerService, 
  MessagesService, 
  EnumMessageType, 
  EnumActionsType 
} from '@lib/shared';
import { EntityFormComponent } from '../entity-form/entity-form.component';

@Component({
  selector: 'lfsoft-utilities-entity-drawer',
  templateUrl: './entity-drawer.component.html',
  styleUrls: ['./entity-drawer.component.scss'],
  standalone: true,
  imports: [CommonModule, GenericDrawerComponent, EntityFormComponent]
})
export class EntityDrawerComponent implements OnInit {
  @Input() set entityId(value: number | null) {
    if (!value ) {
      return;
    }
    this._entityId = value;   
  }
  get entityId(): number  {
    return this._entityId;
  }

  private _entityId: number = 0;
  constructor(private _messagesService: MessagesService, private p_drawerService: DrawerService) {}

  ngOnInit(): void { }

  onCancelEntity(): void {
    this.p_drawerService.hide( EnumActionsType.actionCancel );
  }

  onSaveEntity(entity: any): void {
    this.p_drawerService.hide( EnumActionsType.actionSave );
    this._messagesService.addMessage("MESSAGE.successSave", EnumMessageType.Info);
  }
}
