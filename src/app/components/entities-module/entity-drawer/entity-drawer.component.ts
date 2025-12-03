import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { GenericDrawerComponent } from '../../../generic/generic-drawer/generic-drawer.component';
import { DrawerService } from '../../../generic/generic-drawer/services/drawer.service';
import { EntityFormComponent } from '../entity-form/entity-form.component';
import { MessagesService } from '../../../generic/generic-message/services/message.service';
import { EnumMessageType } from '../../../generic/generic-message/enums/message-type.model';
import { EnumActionsType } from '../../../generic/generic-actions/enums/actions-type.enums';

@Component({
  selector: 'app-entity-drawer',
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