import { Component, OnInit, OnDestroy, DestroyRef, inject } from '@angular/core';
import { InvoiceGridFilterComponent } from './invoice-grid-filter/invoice-grid-filter.component';
import { InvoiceGridComponent } from './invoice-grid/invoice-grid.component';
import { InvoiceFormComponent } from '../invoice-form/invoice-form.component';
import { InvoiceGrid } from '../models/invoice-grid.model';
import { Invoice } from '../models/invoice.model';
import { ActivatedRoute, Router } from '@angular/router';
import { MatTabsModule } from '@angular/material/tabs';
import { AsyncPipe, NgFor } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { InvoiceFilter } from '../models/invoice-filter.model';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

import { EnumActionsType } from '../../../generic/generic-actions/enums/actions-type.enums';
import { GenericActionsComponent } from '../../../generic/generic-actions/generic-actions.component';
import { ActionService } from '../../../generic/generic-actions/services/actions.service';
import { GridService } from '../../../generic/generic-grid/services/grid.service';
import { GenericLayoutComponent } from '../../../generic/generic-layout/generic-layout.component';
import { EnumMessageType } from '../../../generic/generic-message/enums/message-type.model';
import { GenericMessageComponent } from '../../../generic/generic-message/generic-message';
import { MessagesService } from '../../../generic/generic-message/services/message.service';
import { PageFilter } from '../../../generic/models/page-filter.model';
import { Action } from '../../../generic/generic-actions/models/actions.model';
import { InvoiceService } from '../services/invoice.service';
import { ModalService } from '../../../generic/generic-modal/services/modal.service';
import { CONFIRM_DELETE } from '../../../generic/generic-modal/models/modal-messages';
import { TranslatePipe } from '../../../generic/generic-translate/translate.pipe';
import { EnumActionsViewType } from '../../../generic/generic-actions/enums/actions-view-type.enums';
import { EnumActionsStyle } from '../../../generic/generic-actions/enums/actions-styles.enums';
import { UrlSecurityService } from '../../../core/security/services/url-security.service';
import { AuthService } from '../../../core/security/services/auth.service';

@Component({
  selector: 'app-invoices-container',
  templateUrl: './invoices-container.component.html',
  styleUrls: ['./invoices-container.component.scss'],
  standalone: true,
  imports: [
    NgFor,
    AsyncPipe,
    MatTabsModule,
    MatIconModule,
    TranslatePipe,
    GenericLayoutComponent,
    GenericMessageComponent,
    GenericActionsComponent,
    InvoiceGridFilterComponent,
    InvoiceGridComponent,
    InvoiceFormComponent,
  ],
  providers: [Router, MessagesService, GridService]
})
export class InvoicesContainerComponent implements OnInit, OnDestroy {
  openedInvoicesId: number[] = [];
  selectedInvoiceId: number | null = null;
  filterParameters: InvoiceFilter = new InvoiceFilter();  
  
  private _openedInvoices: Invoice[] = [];
  private _pageFilter: PageFilter = new PageFilter();
  private readonly _destroyRef = inject(DestroyRef);

  constructor(
    private _router: Router, 
    private _route: ActivatedRoute, 
    private _invoiceService: InvoiceService, 
    private _gridService: GridService<InvoiceGrid>, 
    private _messagesService: MessagesService, 
    private _actionService: ActionService,
    private _modalService: ModalService, 
    private _authService: AuthService,
    private _urlSecurityService: UrlSecurityService
  ) {
    this._createPageFilter();
    this._createFilterParameters();
  }

  ngOnInit(): void {
    try {
      this._loadSecurityActions();
      this.loadInvoices(this._pageFilter, this.filterParameters);
    } catch (error) {
      this._messagesService.addMessage("Error al cargar la pagina", EnumMessageType.Error);
    }
  }

  ngOnDestroy(): void {
  }

  onPageChange(pageFilter: PageFilter): void {
    try {
      this._pageFilter = pageFilter;
      this.loadInvoices(this._pageFilter, this.filterParameters);
    } catch (error) {
      this._messagesService.addMessage("Error al cambiar página", EnumMessageType.Error);
    }
  }

  onFilterApplied(filter: InvoiceFilter): void {
    try {
      this.filterParameters = filter;
      this.loadInvoices(this._pageFilter, this.filterParameters);
    } catch (error) {
      this._messagesService.addMessage("Error al aplicar filtro", EnumMessageType.Error);
    }
  }

  onAction(action: EnumActionsType): void {
    switch (action) {
      case EnumActionsType.actionNew:
        this._createInvoice();
        break;            
      case EnumActionsType.openHome:        
        this._openHome();       
        break;      
      case EnumActionsType.actionLogout:
        this._actionLogout();
        break;
    }
  }

  onEdit(invoice: InvoiceGrid): void {
    try {
      if (this.openedInvoicesId.includes(invoice.invoiceId)) {
        this.selectedInvoiceId = invoice.invoiceId;
        return;
      }
      
      this._invoiceService.getInvoice(invoice.invoiceId)
        .pipe(takeUntilDestroyed(this._destroyRef))
        .subscribe({
          next: (fullInvoice) => {
            this.openedInvoicesId.push(invoice.invoiceId);
            this._openedInvoices.push(fullInvoice);
            this.selectedInvoiceId = invoice.invoiceId;
          },
          error: () => {
            this._messagesService.addMessage("Error al cargar factura", EnumMessageType.Error);
          }
        });
    } catch (error) {
      this._messagesService.addMessage("Error al editar factura", EnumMessageType.Error);
    }
  }

  onDeleteInvoice(invoice: InvoiceGrid): void {
    try { 
      this._modalService.showModal(CONFIRM_DELETE)
        .pipe(takeUntilDestroyed(this._destroyRef))
        .subscribe(action => {          
          if (action === EnumActionsType.actionAccept) {
            this._deleteInvoice(invoice);
          } 
        });      
    } catch (error) {
      this._messagesService.addMessage("Error al eliminar factura", EnumMessageType.Error);
    }
  }
  
  onOpenInvoice(invoice: InvoiceGrid): void {
    try {      
      this._openInvoice(invoice);
    } catch (error) {
      this._messagesService.addMessage("Error al abrir factura en nueva pestaña", EnumMessageType.Error);
    }
  }  
  
  private _actionLogout(): void {
    try {
      const urlTree = this._router.createUrlTree(['login']);
      const url = this._router.serializeUrl(urlTree);
      
      if (!this._urlSecurityService.isSecureUrl(url)) {
        this._messagesService.addMessage("URL no segura detectada", EnumMessageType.Error);
        return;
      }
      
      const windowRef = window.open(url, '_self', 'noopener,noreferrer');
      if (!windowRef) {
        this._messagesService.addMessage("No se pudo abrir la ventana. Verifica la configuración del navegador.", EnumMessageType.Warning);
      }
      this._authService.logout();
    } catch (error) {
      console.error('Error opening login:', error);
      this._messagesService.addMessage("Error al cerrar sesión", EnumMessageType.Error);
    }
  }

  private _createInvoice(): void {
    try {
      const newInvoice = new Invoice();
      newInvoice.invoiceId = 0;
      newInvoice.invoiceDescription = 'Nueva Factura';
      newInvoice.personName = 'Nueva Persona';
      
      this.openedInvoicesId.push(0);
      this._openedInvoices.push(newInvoice);
      this.selectedInvoiceId = 0;
    } catch (error) {
      throw error;
    }
  }

  private _openHome(): void {
    try {
      const urlTree = this._router.createUrlTree(['home']);
      const url = this._router.serializeUrl(urlTree);
      
      if (!this._urlSecurityService.isSecureUrl(url)) {
        this._messagesService.addMessage("URL no segura detectada", EnumMessageType.Error);
        return;
      }
      
      const windowRef = window.open(url, '_self', 'noopener,noreferrer');
      if (!windowRef) {
        this._messagesService.addMessage("No se pudo abrir la ventana. Verifica la configuración del navegador.", EnumMessageType.Warning);
      }
    } catch (error) {
      console.error('Error opening home:', error);
      this._messagesService.addMessage("Error al abrir inicio", EnumMessageType.Error);
    }
  }

  private _openInvoice(invoice: InvoiceGrid): void {
    try {
      const url = this._router.serializeUrl(
        this._router.createUrlTree(['invoices-module', 'invoices','open'], { queryParams: { id: invoice.invoiceId } })
      );
      window.open(url, '_blank');
    } catch (error) {
      this._messagesService.addMessage("Error al abrir factura en nueva pestaña", EnumMessageType.Error);
    }
  }

  onSaveInvoice(invoice: Invoice): void {
    const index = this.openedInvoicesId.indexOf(invoice.invoiceId);
    if (index !== -1) {
      this._openedInvoices[index] = invoice;
    }
    this._messagesService.addMessage('MESSAGE.successSave', EnumMessageType.Info);
    this.loadInvoices(this._pageFilter, this.filterParameters);
  }

  onCancelInvoice(): void {
    try {      
      if (this.selectedInvoiceId !== null) {
        this._closeInvoice(this.selectedInvoiceId);
      }
    } catch (error) {
      this._messagesService.addMessage("Error al cerrar pestaña de factura", EnumMessageType.Error);
    }
  }

  onCloseTab(invoiceId: number): void {
    try {
      this._closeInvoice(invoiceId);
    } catch (error) {
      this._messagesService.addMessage("Error al cerrar pestaña de factura", EnumMessageType.Error);
    }
  }
  
  onClickTab(invoiceId: number): void {    
    this.selectedInvoiceId = invoiceId;
  }
  
  private _closeInvoice(invoiceId: number): void {
    const index = this.openedInvoicesId.indexOf(invoiceId);
    if (index !== -1) {
      this.openedInvoicesId.splice(index, 1);
      this._openedInvoices.splice(index, 1);
      
      if (this.openedInvoicesId.length > 0) {
        this.selectedInvoiceId = this.openedInvoicesId[Math.max(index - 1, 0)];
      } else {
        this.selectedInvoiceId = null;
      }
    }
  }

  getInvoiceById(invoiceId: number): Invoice | undefined {
    const index = this.openedInvoicesId.indexOf(invoiceId);
    return index !== -1 ? this._openedInvoices[index] : undefined;
  }

  private _deleteInvoice(invoice: InvoiceGrid): void {
    try {
      this._invoiceService.deleteInvoice(invoice.invoiceId)
        .pipe(takeUntilDestroyed(this._destroyRef))
        .subscribe(() => {
          this._messagesService.addMessage("MESSAGE.successDelete", EnumMessageType.Info);
          this.loadInvoices(this._pageFilter, this.filterParameters);
        });
    } catch (error) {
      throw error;
    }
  }

  private _loadSecurityActions(): void {
    const actions: Action[] = [
      new Action('BUTTON.home', EnumActionsType.openHome, 'home', false, EnumActionsViewType.view16x16),
      new Action('BUTTON.new', EnumActionsType.actionNew, 'add', false, EnumActionsViewType.view16x16, EnumActionsStyle.primary),
      new Action('BUTTON.logout', EnumActionsType.actionLogout, 'exit_to_app', false, EnumActionsViewType.view16x16, EnumActionsStyle.primary),
    ];
    this._actionService.setActions(actions);
  }

  private loadInvoices(pageFilter: PageFilter, filterParameters: InvoiceFilter) {
    this._invoiceService.getInvoices(pageFilter, filterParameters)
      .pipe(takeUntilDestroyed(this._destroyRef))
      .subscribe(response => {
        this._gridService.setData(response.data);
      });
  }

  private _createPageFilter() {
    this._pageFilter.page = 1;
    this._pageFilter.pageSize = 15;
    this._pageFilter.sortField = "invoiceId";
    this._pageFilter.sortDirection = "asc";
  }

  private _createFilterParameters() {
    this.filterParameters.invoiceId = undefined;
  }
}
