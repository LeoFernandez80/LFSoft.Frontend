import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { GenericDrawerComponent, MessagesService, DrawerService, EnumActionsType, EnumMessageType } from '@lib/shared';
import { PersonFormComponent } from '../person-form/person-form.component';

@Component({
  selector: 'lfsoft-utilities-person-drawer',
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
