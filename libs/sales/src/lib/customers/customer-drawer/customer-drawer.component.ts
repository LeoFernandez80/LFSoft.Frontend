import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { 
  GenericDrawerComponent, 
  DrawerService, 
  MessagesService, 
  EnumMessageType, 
  EnumActionsType 
} from '@lib/shared';
import { CustomerFormComponent } from '../customer-form/customer-form.component';

@Component({
  selector: 'lfsoft-sales-customer-drawer',
  templateUrl: './customer-drawer.component.html',
  styleUrls: ['./customer-drawer.component.scss'],
  standalone: true,
  imports: [CommonModule, GenericDrawerComponent, CustomerFormComponent]
})
export class CustomerDrawerComponent implements OnInit {
  @Input() set customerId(value: number | null) {
    if (!value ) {
      return;
    }
    this._customerId = value;   
  }
  get customerId(): number  {
    return this._customerId;
  }

  private _customerId: number = 0;
  constructor(private _messagesService: MessagesService, private p_drawerService: DrawerService) {}

  ngOnInit(): void { }

  onCancelCustomer(): void {
    this.p_drawerService.hide( EnumActionsType.actionCancel );
  }

  onSaveCustomer(customer: any): void {
    this.p_drawerService.hide( EnumActionsType.actionSave );
    this._messagesService.addMessage("MESSAGE.successSave", EnumMessageType.Info);
  }
}
