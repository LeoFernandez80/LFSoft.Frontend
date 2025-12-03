import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { GenericDrawerComponent } from '../../../generic/generic-drawer/generic-drawer.component';
import { DrawerService } from '../../../generic/generic-drawer/services/drawer.service';
import { PersonFormComponent } from '../person-form/person-form.component';
import { MessagesService } from '../../../generic/generic-message/services/message.service';
import { EnumMessageType } from '../../../generic/generic-message/enums/message-type.model';
import { EnumActionsType } from '../../../generic/generic-actions/enums/actions-type.enums';

@Component({
  selector: 'app-person-drawer',
  templateUrl: './person-drawer.component.html',
  styleUrls: ['./person-drawer.component.scss'],
  standalone: true,
  imports: [CommonModule, GenericDrawerComponent, PersonFormComponent]
})
export class PersonDrawerComponent implements OnInit {
  @Input() set personId(value: number | null) {
    if (!value ) {
      return;
    }
    this._personId = value;   
  }
  get personId(): number  {
    return this._personId;
  }

  private _personId: number = 0;
  constructor(private _messagesService: MessagesService,private p_drawerService: DrawerService) {}

  ngOnInit(): void { }

  onCancelPerson(): void {
    this.p_drawerService.hide( EnumActionsType.actionCancel );
  }

  onSavePerson(person: any): void {
    this.p_drawerService.hide( EnumActionsType.actionSave );
    this._messagesService.addMessage("MESSAGE.successSave", EnumMessageType.Info);
  }

}