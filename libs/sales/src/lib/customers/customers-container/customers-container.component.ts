import { Component, OnInit, OnDestroy, DestroyRef, inject } from '@angular/core';
import { CustomerGridFilterComponent } from './customers-grid-filter/customer-grid-filter.component';
import { Customer } from '../models/customer.model';
import { ActivatedRoute, Router } from '@angular/router';
import { MatTabsModule } from '@angular/material/tabs';
import { NgFor } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

import { CustomerGridComponent } from './customers-grid/customer-grid.component';
import { CustomerFormComponent } from '../customer-form/customer-form.component';
import { CustomerFilter } from '../models/customer-filter.model';
import { CustomerGrid } from '../models/customer-grid.model';
import { 
  EnumActionsType, 
  GenericActionsComponent, 
  ActionService, 
  GridService, 
  GenericLayoutComponent, 
  EnumMessageType, 
  GenericMessageComponent, 
  MessagesService, 
  PageFilter, 
  Action, 
  ModalService, 
  CONFIRM_DELETE, 
  TranslatePipe,
  EnumActionsViewType,
  EnumActionsStyle 
} from '@lib/shared';
import { UrlService } from 'libs/shared/src/lib/services/url.service';
import { CustomerService } from '../services/customer.service';
import { EnumActions } from 'libs/common/src/lib/enums/actions.enum';

@Component({
  selector: 'lfsoft-sales-customers-container',
  templateUrl: './customers-container.component.html',
  styleUrls: ['./customers-container.component.scss'],
  standalone: true,
  imports: [
    NgFor,
    MatTabsModule,
    MatIconModule,
    TranslatePipe,
    GenericLayoutComponent,
    GenericMessageComponent,
    GenericActionsComponent,
    CustomerGridFilterComponent,
    CustomerGridComponent,
    CustomerFormComponent,
  ],
  providers: [Router, GridService]
})
export class CustomersContainerComponent implements OnInit, OnDestroy {
  openedCustomersId: number[] = [];
  selectedCustomerId: number | null = null;
  filterParameters: CustomerFilter = new CustomerFilter();
  
  private _dataLoaded: CustomerGrid[] = [];
  private _openedCustomers: Customer[] = [];
  private _pageFilter: PageFilter = new PageFilter();
  private readonly _destroyRef = inject(DestroyRef);

  constructor(private _router: Router, 
    private _customerService: CustomerService, private _gridService: GridService<CustomerGrid>, 
    private _messagesService: MessagesService, private _actionService: ActionService,
    private _modalService: ModalService, private _urlService: UrlService
  ) {
    this._createPageFilter();
    this._createFilterParameters();
  }

  ngOnInit(): void {
    try {
      this._loadSecurityActions();
      this.loadCustomers(this._pageFilter, this.filterParameters);
    } catch (error) {
      this._messagesService.addMessage("Error al cargar la página", EnumMessageType.Error);
    }
  }

  ngOnDestroy(): void {
    // El DestroyRef se encarga automáticamente de cancelar todas las suscripciones
    // que usen takeUntilDestroyed()
  }

  onFilterApplied(filter: CustomerFilter): void {
    try {   
      this._dataLoaded = [];   
      this._pageFilter.page = 1;
      this.filterParameters = filter;
      this.loadCustomers(this._pageFilter, this.filterParameters);
    } catch (error) {
      this._messagesService.addMessage("Error al aplicar filtro", EnumMessageType.Error);
    }
  }

  onSortChange(pageFilter: PageFilter): void {
    try {      
      this._pageFilter.sortDirection=pageFilter.sortDirection;
      this._pageFilter.sortField=pageFilter.sortField;
      this.loadCustomers(this._pageFilter, this.filterParameters);
    } catch (error) {
      this._messagesService.addMessage("ERROR.", EnumMessageType.Error);
    }
  }

  onLoadNextPage(): void {
    try {
      this._pageFilter.page += 1;
      this.loadCustomers(this._pageFilter, this.filterParameters);
    } catch (error) {
      this._messagesService.addMessage("Error al cargar la siguiente página", EnumMessageType.Error);
    }
  }

  onAction(action: EnumActionsType | EnumActions): void {
    switch (action) {
      case EnumActionsType.openHome:
        this._openHome();
        break;
      case EnumActionsType.actionNew:
        try {
          this._actionNewCustomer();
        } catch (error) {
          this._messagesService.addMessage("Error al crear customer", EnumMessageType.Error);
        }
        break;
      case EnumActionsType.openUsers:
        this._openUsers();
        break;
      case EnumActionsType.actionLogout:
        this._actionLogout();
        break;
      
    }
  }

  onEdit(customer: CustomerGrid): void {
    try {
      if (this.openedCustomersId.includes(customer.id)) {
        this.selectedCustomerId = customer.id;
        return;
      }
      
      this._customerService.getCustomer(customer.id)
        .pipe(takeUntilDestroyed(this._destroyRef))
        .subscribe({
          next: (fullCustomer) => {
            this.openedCustomersId.push(customer.id);
            this._openedCustomers.push(fullCustomer);
            this.selectedCustomerId = customer.id;
          },
          error: () => {
            this._messagesService.addMessage("Error al cargar customer", EnumMessageType.Error);
          }
        });
    } catch (error) {
      this._messagesService.addMessage("Error al editar customer", EnumMessageType.Error);
    }
  }

  onDeleteCustomer(customer: CustomerGrid): void {
    try { 
      this._modalService.showModal(CONFIRM_DELETE)
        .pipe(takeUntilDestroyed(this._destroyRef))
        .subscribe(action => {          
          if (action === EnumActionsType.actionAccept) {
            this._deleteCustomer(customer);
          } 
        });      
    } catch (error) {
      this._messagesService.addMessage("Error al eliminar customer", EnumMessageType.Error);
    }
  }
  
  onOpenCustomer(customer: CustomerGrid): void {
    try {      
      this._openCustomer(customer);
    } catch (error) {
      this._messagesService.addMessage("Error al abrir customer en nueva pestaña", EnumMessageType.Error);
    }
  }

  onCloseTab(customerId: number): void {
    try {
      this._closeCustomer(customerId);
    } catch (error) {
      this._messagesService.addMessage("Error al cerrar pestaña", EnumMessageType.Error);
    }
  }

  onSaveCustomer(customer: Customer): void {
    try {
      const index = this.openedCustomersId.indexOf(customer.id);
      if (index !== -1) {
        this._openedCustomers[index] = customer;
      }
      const indexData = this._dataLoaded.findIndex(e => e.id === customer.id);
      if (indexData !== -1) {
        this._dataLoaded[indexData] = this._mapCustomerToGrid(customer);
      }
      this._gridService.setData(this._dataLoaded);

      this._messagesService.addMessage("MESSAGE.successSave", EnumMessageType.Info);
    } catch (error) {
      this._messagesService.addMessage("Error al guardar customer", EnumMessageType.Error);
    }
  }

  onCancelCustomer(): void {
    try {
      if (this.selectedCustomerId !== null) {
        this._closeCustomer(this.selectedCustomerId);
      }
    } catch (error) {
      this._messagesService.addMessage("Error al cancelar", EnumMessageType.Error);
    }
  }

  loadCustomers(pageFilter: PageFilter, filterParameters: CustomerFilter): void {
    this._customerService.getCustomers(pageFilter, filterParameters)
      .pipe(takeUntilDestroyed(this._destroyRef))
      .subscribe({
        next: (response) => {           
          this._dataLoaded = this._dataLoaded.concat(response.data);
          this._gridService.setData(this._dataLoaded);
        },
        error: (error) => {
          this._messagesService.addMessage(error, EnumMessageType.Error);
        }
      });
  }

  private _mapCustomerToGrid(customer: Customer): CustomerGrid {
    const customerGrid = new CustomerGrid();
    customerGrid.id = customer.id;
    customerGrid.nombre = customer.nombre;
    customerGrid.apellido = customer.apellido;
    customerGrid.razonSocial = customer.razonSocial;
    customerGrid.documento = customer.documento;
    customerGrid.telefono = customer.telefono;
    customerGrid.email = customer.email;
    customerGrid.activo = customer.activo;
    return customerGrid;
  }

  private _closeCustomer(customerId: number): void {
    const index = this.openedCustomersId.indexOf(customerId);
    if (index !== -1) {
      this.openedCustomersId.splice(index, 1);
      this._openedCustomers.splice(index, 1);
      
      if (this.openedCustomersId.length > 0) {
        this.selectedCustomerId = this.openedCustomersId[Math.max(index - 1, 0)];
      } else {
        this.selectedCustomerId = null;
      }
    }
  }
  
  private _createPageFilter(): void {
    this._pageFilter.page = 1;
    this._pageFilter.pageSize = 15;
    this._pageFilter.sortDirection = 'asc';
    this._pageFilter.sortField = 'id';
  }

  private _createFilterParameters(): void {
    this.filterParameters = new CustomerFilter();
  }

  private _actionNewCustomer(): void {
    const customer = new Customer();
    customer.id = 0;
    customer.nombre = 'Nuevo Customer';
    
    this.openedCustomersId.push(0);
    this._openedCustomers.push(customer);
    this.selectedCustomerId = 0;
  }

  getCustomerById(customerId: number): Customer | undefined {
    const index = this.openedCustomersId.indexOf(customerId);
    return index !== -1 ? this._openedCustomers[index] : undefined;
  }

  private _deleteCustomer(customer: CustomerGrid): void {
    this._customerService.deleteCustomer(customer.id)
      .pipe(takeUntilDestroyed(this._destroyRef))
      .subscribe({
        next: () => {
          this._messagesService.addMessage("MESSAGE.successDelete", EnumMessageType.Info);
          this.loadCustomers(this._pageFilter, this.filterParameters);
        },
        error: (error) => {
          this._messagesService.addMessage(error, EnumMessageType.Error);
        }
      });
  }

  private _openCustomer(customer: CustomerGrid): void {
    try {
      const url = this._router.serializeUrl(
        this._router.createUrlTree(['customers-module', 'customers', 'open'], { queryParams: { id: customer.id } })
      );
      window.open(url, '_blank');
    } catch (error) {
      this._messagesService.addMessage("Error al abrir customer en nueva pestaña", EnumMessageType.Error);
    }
  }

  private _loadSecurityActions(): void {
    const actions: Action[] = [
      new Action('BUTTON.home', EnumActionsType.openHome, 'home', false, EnumActionsViewType.view16x16),
      new Action('BUTTON.new', EnumActionsType.actionNew, 'add', false, EnumActionsViewType.view16x16, EnumActionsStyle.primary),
      new Action('BUTTON.users', EnumActionsType.openUsers, 'group', false, EnumActionsViewType.view16x16),
      new Action('BUTTON.logout', EnumActionsType.actionLogout, 'exit_to_app', false, EnumActionsViewType.view16x16),
    ];
    this._actionService.setActions(actions);
  }

  private _openHome(): void {
    this._urlService.openUrl(['home']);
  }

  private _openUsers(): void {
    this._urlService.openUrl(['users-module', 'users']);
  }

  private _actionLogout(): void {
    this._urlService.openUrl(['login']);
  }
}
