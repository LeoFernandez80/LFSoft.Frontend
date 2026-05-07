import { NgFor } from '@angular/common';
import { Component, DestroyRef, OnDestroy, OnInit, inject } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { MatIconModule } from '@angular/material/icon';
import { MatTabsModule } from '@angular/material/tabs';
import { Router } from '@angular/router';
import { ConfigurationItem, ConfigurationService, EnumActions, EnumLiteralKeys } from '@lib/common';
import {
  ActionService, CONFIRM_DELETE, EnumActionsType, EnumMessageType,
  GenericActionsComponent, GenericLayoutComponent, GenericMessageComponent,
  GridService, MessagesService, ModalService, PageFilter, TranslatePipe
} from '@lib/shared';
import { AuthService, EnumUserRole, UserPermissionsService } from '@lib/security';
import { CompanyFormComponent } from '../company-form/company-form.component';
import { HTTPServiceCompany } from '../http-services/company.service';
import { CompanyFilter } from '../models/company-filter.model';
import { CompanyGrid } from '../models/company-grid.model';
import { Company } from '../models/company.model';
import { CompanyGridComponent } from './company-grid/company-grid.component';
import { CompanyGridFilterComponent } from './company-grid-filter/company-grid-filter.component';

@Component({
  selector: 'app-companies-container',
  templateUrl: './companies-container.component.html',
  styleUrls: ['./companies-container.component.scss'],
  standalone: true,
  imports: [
    NgFor, MatTabsModule, MatIconModule, TranslatePipe,
    GenericLayoutComponent, GenericMessageComponent, GenericActionsComponent,
    CompanyGridFilterComponent, CompanyGridComponent, CompanyFormComponent
  ],
  providers: [Router, MessagesService, GridService]
})
export class CompaniesContainerComponent implements OnInit, OnDestroy {
  openedCompaniesId: number[] = [];
  selectedCompanyId: number = 0;
  selectedTabIndex: number = -1;
  filterParameters: CompanyFilter = new CompanyFilter();
  config: ConfigurationItem = new ConfigurationItem();

  private _dataLoaded: CompanyGrid[] = [];
  private _openedCompanies: Company[] = [];
  private _pageFilter: PageFilter = new PageFilter();
  private readonly _destroyRef = inject(DestroyRef);

  constructor(
    private _router: Router,
    private _companyService: HTTPServiceCompany,
    private _gridService: GridService<CompanyGrid>,
    private _messagesService: MessagesService,
    private _actionService: ActionService,
    private _modalService: ModalService,
    private _authService: AuthService,
    private _permissionsUserService: UserPermissionsService,
    private _configurationService: ConfigurationService
  ) {
    this._createPageFilter();
    this._createFilterParameters();
    this._setSubscriptions();
  }

  ngOnInit(): void {
    try {
      this._securityApply();
      this.loadCompanies(this._pageFilter, this.filterParameters);
    } catch (error) {
      this._messagesService.addMessage('Error al cargar la pagina', EnumMessageType.Error);
    }
  }

  ngOnDestroy(): void {}

  onSortChange(pageFilter: PageFilter): void {
    this._dataLoaded = [];
    this._pageFilter.page = 1;
    this._pageFilter.sortDirection = pageFilter.sortDirection;
    this._pageFilter.sortField = pageFilter.sortField;
    this.loadCompanies(this._pageFilter, this.filterParameters);
  }

  onLoadNextPage(): void {
    this._pageFilter.page += 1;
    this.loadCompanies(this._pageFilter, this.filterParameters);
  }

  onFilterApplied(filter: CompanyFilter): void {
    this._dataLoaded = [];
    this._pageFilter.page = 1;
    this.filterParameters = filter;
    this.loadCompanies(this._pageFilter, this.filterParameters);
  }

  onAction(action: EnumActionsType | EnumActions): void {
    if (action === EnumActions.eAction_New) { this._actionNewCompany(); }
  }

  onEdit(company: CompanyGrid): void {
    try {
      if (this.openedCompaniesId.includes(company.company_id)) {
        this.selectedCompanyId = company.company_id;
        this.selectedTabIndex = this.openedCompaniesId.indexOf(company.company_id);
        return;
      }
      const fullCompany = this._companyGridToCompany(company);
      this.openedCompaniesId.push(fullCompany.company_id);
      this._openedCompanies.push(fullCompany);
      this.selectedCompanyId = fullCompany.company_id;
      this.selectedTabIndex = this.openedCompaniesId.indexOf(fullCompany.company_id);
    } catch (error) {
      this._messagesService.addMessage('Error al editar entidad', EnumMessageType.Error);
    }
  }

  onDeleteCompany(company: CompanyGrid): void {
    this._modalService.showModal(CONFIRM_DELETE).pipe(takeUntilDestroyed(this._destroyRef)).subscribe(action => {
      if (action === EnumActionsType.actionAccept) { this._deleteCompany(company); }
    });
  }

  onOpenCompany(company: CompanyGrid): void {
    const url = this._router.serializeUrl(
      this._router.createUrlTree(['companies-module', 'company', 'open'], { queryParams: { id: company.company_id } })
    );
    window.open(url, '_blank');
  }

  onSaveCompany(company: Company): void {
    const openedIndex = this.openedCompaniesId.indexOf(company.company_id);
    if (openedIndex !== -1) {
      this._openedCompanies[openedIndex] = company;
      this.openedCompaniesId[openedIndex] = company.company_id;
    } else {
      this.openedCompaniesId.push(company.company_id);
      this._openedCompanies.push(company);
    }

    const gridIndex = this._dataLoaded.findIndex(item => item.company_id === company.company_id);
    if (gridIndex !== -1) {
      this._dataLoaded[gridIndex] = this._mapCompanyToGrid(company);
    } else {
      this._dataLoaded = [this._mapCompanyToGrid(company), ...this._dataLoaded];
    }

    this._gridService.setData(this._dataLoaded);
    this._messagesService.addMessage('MESSAGE.successSave', EnumMessageType.Info);
    this.selectedCompanyId = company.company_id;
    this.selectedTabIndex = this.openedCompaniesId.indexOf(company.company_id);
  }

  onCancelCompany(): void {
    if (this.selectedCompanyId !== null) { this._closeCompany(this.selectedCompanyId); }
  }

  onCloseTab(companyId: number): void { this._closeCompany(companyId); }

  onClickTab(companyId: number): void {
    this.selectedCompanyId = companyId;
    this.selectedTabIndex = this.openedCompaniesId.indexOf(companyId);
  }

  getCompanyById(companyId: number): Company | undefined {
    const index = this.openedCompaniesId.indexOf(companyId);
    return index !== -1 ? this._openedCompanies[index] : undefined;
  }

  loadCompanies(pageFilter: PageFilter, filterParameters: CompanyFilter): void {
    this._companyService.getCompanies(pageFilter, filterParameters)
      .pipe(takeUntilDestroyed(this._destroyRef))
      .subscribe({
        next: response => {
          this._dataLoaded = this._pageFilter.page === 1 ? response.data : [...this._dataLoaded, ...response.data];
          this._gridService.setData(this._dataLoaded);
        },
        error: () => { this._messagesService.addMessage('Error al cargar entidades', EnumMessageType.Error); }
      });
  }

  private _actionNewCompany(): void {
    const newCompany = new Company();
    newCompany.company_id = 0;
    this.openedCompaniesId.push(0);
    this._openedCompanies.push(newCompany);
    this.selectedCompanyId = 0;
    this.selectedTabIndex = this.openedCompaniesId.indexOf(0);
  }

  private _closeCompany(companyId: number): void {
    const index = this.openedCompaniesId.indexOf(companyId);
    if (index !== -1) {
      this.openedCompaniesId.splice(index, 1);
      this._openedCompanies.splice(index, 1);
      this.selectedCompanyId = this.openedCompaniesId.length > 0
        ? this.openedCompaniesId[Math.max(index - 1, 0)]
        : 0;
    }
    this.selectedTabIndex = this.selectedCompanyId !== null ? this.openedCompaniesId.indexOf(this.selectedCompanyId) : -1;
  }

  private _deleteCompany(company: CompanyGrid): void {
    this._companyService.deleteCompany(company.company_id)
      .pipe(takeUntilDestroyed(this._destroyRef))
      .subscribe({
        next: () => {
          this._dataLoaded = this._dataLoaded.filter(item => item.company_id !== company.company_id);
          this._gridService.setData(this._dataLoaded);
          this._closeCompany(company.company_id);
          this._messagesService.addMessage('MESSAGE.successDelete', EnumMessageType.Info);
        },
        error: () => { this._messagesService.addMessage('Error al eliminar entidad', EnumMessageType.Error); }
      });
  }

  private _companyGridToCompany(companyGrid: CompanyGrid): Company {
    const company = new Company();
    company.company_id = companyGrid.company_id;
    company.company_razonSocial = companyGrid.company_razonSocial;
    company.company_tipo = companyGrid.company_tipo;
    company.company_estado = companyGrid.company_estado;
    company.company_observacion = companyGrid.company_observacion;
    return company;
  }

  private _mapCompanyToGrid(company: Company): CompanyGrid {
    const grid = new CompanyGrid();
    grid.company_id = company.company_id;
    grid.company_razonSocial = company.company_razonSocial;
    grid.company_tipo = company.company_tipo;
    grid.company_estado = company.company_estado;
    grid.company_observacion = company.company_observacion;
    return grid;
  }

  private _securityApply(): void {
    const actions = this._permissionsUserService.enabledActions(
      this._authService.getCurrentUser()?.role || EnumUserRole.VIEWER,
      EnumLiteralKeys.eModule_Companies,
      this.makeConditions()
    );
    this._actionService.setActions(actions);
  }

  makeConditions(): string { return '#|V|#'; }

  private _setSubscriptions(): void {
    this._configurationService.getConfiguration()
      .pipe(takeUntilDestroyed(this._destroyRef))
      .subscribe(config => {
        if (config) {
          this.config = config.items.find(c => c.literalKey === EnumLiteralKeys.eModule_Companies) || new ConfigurationItem();
        }
      });
  }

  private _createPageFilter(): void { this._pageFilter = new PageFilter(); }
  private _createFilterParameters(): void { this.filterParameters = new CompanyFilter(); }
}




