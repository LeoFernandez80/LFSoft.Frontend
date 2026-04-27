import { Component, OnInit, OnDestroy, DestroyRef, inject } from '@angular/core';
import { QuoteGridFilterComponent } from './quote-grid-filter/quote-grid-filter.component';
import { QuoteGridComponent } from './quote-grid/quote-grid.component';
import { QuoteFormComponent } from '../quote-form/quote-form.component';
import { QuoteGrid } from '../models/quote-grid.model';
import { Quote } from '../models/quote.model';
import { ActivatedRoute, Router } from '@angular/router';
import { MatTabsModule } from '@angular/material/tabs';
import { AsyncPipe, NgFor } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { QuoteFilter } from '../models/quote-filter.model';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { AuthService, UrlSecurityService } from '@lib/security';
import { TranslatePipe, GenericLayoutComponent, GenericMessageComponent, GenericActionsComponent, MessagesService, GridService, PageFilter, ActionService, ModalService, EnumMessageType, EnumActionsType, CONFIRM_DELETE, Action, EnumActionsViewType, EnumActionsStyle } from '@lib/shared';
import { QuoteService } from '../services/quote.service';
import { EnumActionsIcons } from 'libs/shared/src/lib/generic-actions/enums/actions-icons.enums';
import { UrlService } from 'libs/shared/src/lib/services/url.service';
import { EnumActions } from 'libs/common/src/lib/enums/actions.enum';


@Component({
  selector: 'lfsoft-sales-quotes-container',
  templateUrl: './quotes-container.component.html',
  styleUrls: ['./quotes-container.component.scss'],
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
    QuoteGridFilterComponent,
    QuoteGridComponent,
    QuoteFormComponent,
  ],
  providers: [Router, MessagesService, GridService]
})
export class QuotesContainerComponent implements OnInit, OnDestroy {
  openedQuotesId: number[] = [];
  selectedQuoteId: number | null = null;
  filterParameters: QuoteFilter = new QuoteFilter();  
  
  private _openedQuotes: Quote[] = [];
  private _pageFilter: PageFilter = new PageFilter();
  private readonly _destroyRef = inject(DestroyRef);

  constructor(
    private _router: Router, 
    private _quoteService: QuoteService, 
    private _gridService: GridService<QuoteGrid>, 
    private _messagesService: MessagesService, 
    private _actionService: ActionService,
    private _modalService: ModalService, 
    private _authService: AuthService,
    private _urlSecurityService: UrlSecurityService,
    private _urlService: UrlService
  ) {
    this._createPageFilter();
    this._createFilterParameters();
  }

  ngOnInit(): void {
    try {
      this._loadSecurityActions();
      this.loadQuotes(this._pageFilter, this.filterParameters);
    } catch (error) {
      this._messagesService.addMessage("Error al cargar la página", EnumMessageType.Error);
    }
  }

  ngOnDestroy(): void {
  }

  onPageChange(pageFilter: PageFilter): void {
    try {
      this._pageFilter = pageFilter;
      this.loadQuotes(this._pageFilter, this.filterParameters);
    } catch (error) {
      this._messagesService.addMessage("Error al cambiar página", EnumMessageType.Error);
    }
  }

  onFilterApplied(filter: QuoteFilter): void {
    try {
      this.filterParameters = filter;
      this.loadQuotes(this._pageFilter, this.filterParameters);
    } catch (error) {
      this._messagesService.addMessage("Error al aplicar filtro", EnumMessageType.Error);
    }
  }

  onAction(action: EnumActionsType | EnumActions): void {
    switch (action) {
      case EnumActionsType.actionNew:
        this._actionNewQuote();
        break;            
      case EnumActionsType.openHome:        
        this._openHome();       
        break;      
      case EnumActionsType.actionLogout:
        this._actionLogout();
        break;
    }
  }

  onEdit(quote: QuoteGrid): void {
    try {
      if (this.openedQuotesId.includes(quote.quoteId)) {
        this.selectedQuoteId = quote.quoteId;
        return;
      }
      
      this._quoteService.getQuote(quote.quoteId)
        .pipe(takeUntilDestroyed(this._destroyRef))
        .subscribe({
          next: (fullQuote) => {
            this.openedQuotesId.push(quote.quoteId);
            this._openedQuotes.push(fullQuote);
            this.selectedQuoteId = quote.quoteId;
          },
          error: () => {
            this._messagesService.addMessage("Error al cargar cotización", EnumMessageType.Error);
          }
        });
    } catch (error) {
      this._messagesService.addMessage("Error al editar cotización", EnumMessageType.Error);
    }
  }

  onDeleteQuote(quote: QuoteGrid): void {
    try { 
      this._modalService.showModal(CONFIRM_DELETE)
        .pipe(takeUntilDestroyed(this._destroyRef))
        .subscribe(action => {          
          if (action === EnumActionsType.actionAccept) {
            this._deleteQuote(quote);
          } 
        });      
    } catch (error) {
      this._messagesService.addMessage("Error al eliminar cotización", EnumMessageType.Error);
    }
  }
  
  onOpenQuote(quote: QuoteGrid): void {
    try {      
      this._openQuote(quote);
    } catch (error) {
      this._messagesService.addMessage("Error al abrir cotización en nueva pestaña", EnumMessageType.Error);
    }
  }  
  
  private _actionLogout(): void {
    this._urlService.openUrl(['logout']);
  }

  private _actionNewQuote(): void {
    try {
      const newQuote = new Quote();
      newQuote.quoteId = 0;
      newQuote.quoteDescription = 'Nueva Cotización';
      newQuote.customerName = 'Nuevo Cliente';
      
      this.openedQuotesId.push(0);
      this._openedQuotes.push(newQuote);
      this.selectedQuoteId = 0;
    } catch (error) {
      throw error;
    }
  }

  private _openHome(): void {
    this._urlService.openUrl(['home']);
  }

  private _openQuote(quote: QuoteGrid): void {
    try {
      const url = this._router.serializeUrl(
        this._router.createUrlTree(['quotes-module', 'quotes','open'], { queryParams: { id: quote.quoteId } })
      );
      window.open(url, '_blank');
    } catch (error) {
      this._messagesService.addMessage("Error al abrir cotización en nueva pestaña", EnumMessageType.Error);
    }
  }

  onSaveQuote(quote: Quote): void {
    const index = this.openedQuotesId.indexOf(quote.quoteId);
    if (index !== -1) {
      this._openedQuotes[index] = quote;
    }
    this._messagesService.addMessage('MESSAGE.successSave', EnumMessageType.Info);
    this.loadQuotes(this._pageFilter, this.filterParameters);
  }

  onCancelQuote(): void {
    try {      
      if (this.selectedQuoteId !== null) {
        this._closeQuote(this.selectedQuoteId);
      }
    } catch (error) {
      this._messagesService.addMessage("Error al cerrar pestaña de cotización", EnumMessageType.Error);
    }
  }

  onCloseTab(quoteId: number): void {
    try {
      this._closeQuote(quoteId);
    } catch (error) {
      this._messagesService.addMessage("Error al cerrar pestaña de cotización", EnumMessageType.Error);
    }
  }
  
  onClickTab(quoteId: number): void {    
    this.selectedQuoteId = quoteId;
  }
  
  private _closeQuote(quoteId: number): void {
    const index = this.openedQuotesId.indexOf(quoteId);
    if (index !== -1) {
      this.openedQuotesId.splice(index, 1);
      this._openedQuotes.splice(index, 1);
      
      if (this.openedQuotesId.length > 0) {
        this.selectedQuoteId = this.openedQuotesId[Math.max(index - 1, 0)];
      } else {
        this.selectedQuoteId = null;
      }
    }
  }

  getQuoteById(quoteId: number): Quote | undefined {
    const index = this.openedQuotesId.indexOf(quoteId);
    return index !== -1 ? this._openedQuotes[index] : undefined;
  }

  private _deleteQuote(quote: QuoteGrid): void {
    try {
      this._quoteService.deleteQuote(quote.quoteId)
        .pipe(takeUntilDestroyed(this._destroyRef))
        .subscribe(() => {
          this._messagesService.addMessage("MESSAGE.successDelete", EnumMessageType.Info);
          this.loadQuotes(this._pageFilter, this.filterParameters);
        });
    } catch (error) {
      throw error;
    }
  }

  private _loadSecurityActions(): void {
    const actions: Action[] = [
      new Action('BUTTON.home', EnumActionsType.openHome, EnumActionsIcons.openHome, false, EnumActionsViewType.view16x16),
      new Action('BUTTON.new', EnumActionsType.actionNew, EnumActionsIcons.actionNew, false, EnumActionsViewType.view16x16, EnumActionsStyle.primary),
      new Action('BUTTON.logout', EnumActionsType.actionLogout, EnumActionsIcons.actionLogout, false, EnumActionsViewType.view16x16, EnumActionsStyle.primary),
    ];
    this._actionService.setActions(actions);
  }

  private loadQuotes(pageFilter: PageFilter, filterParameters: QuoteFilter) {
    this._quoteService.getQuotes(pageFilter, filterParameters)
      .pipe(takeUntilDestroyed(this._destroyRef))
      .subscribe(response => {
        this._gridService.setData(response.data);
      });
  }

  private _createPageFilter() {
    this._pageFilter.page = 1;
    this._pageFilter.pageSize = 15;
    this._pageFilter.sortField = "quoteId";
    this._pageFilter.sortDirection = "asc";
  }

  private _createFilterParameters() {
    this.filterParameters.customerName = '';
  }
}
