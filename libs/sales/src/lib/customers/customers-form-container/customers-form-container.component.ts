import { Component, OnInit, OnDestroy } from '@angular/core';
import { CustomerFormComponent } from '../customer-form/customer-form.component';
import { 
  GenericLayoutComponent, 
  GenericMessageComponent, 
  EnumLayoutType, 
  MessagesService, 
  EnumMessageType 
} from '@lib/shared';

@Component({
  selector: 'lfsoft-sales-customers-form-container',
  templateUrl: './customers-form-container.component.html',
  styleUrls: ['./customers-form-container.component.scss'],
  standalone: true,
  imports: [ GenericLayoutComponent,
      GenericMessageComponent, CustomerFormComponent]
})
export class CustomersFormContainerComponent implements OnInit, OnDestroy {

  constructor( private _messagesService: MessagesService ) { }

  layoutTypes = EnumLayoutType
  ngOnInit(): void {  }

  ngOnDestroy(): void {
    // Cleanup si es necesario en el futuro
  }

  onSaveCustomer(customer: any): void {
    this._messagesService.addMessage('MESSAGE.successSave', EnumMessageType.Info);
  }

  onCancelCustomer(): void {    
    window.close();
  }
}
