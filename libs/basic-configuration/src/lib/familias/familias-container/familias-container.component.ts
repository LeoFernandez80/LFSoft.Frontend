import { NgFor } from '@angular/common';
import { Component, DestroyRef, OnDestroy, OnInit, inject } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { MatIconModule } from '@angular/material/icon';
import { MatTabsModule } from '@angular/material/tabs';
import { Router } from '@angular/router';
import { ConfigurationItem, ConfigurationService, EnumActions, EnumLiteralKeys, MenuesService } from '@lib/common';
import {
  ActionService, CONFIRM_DELETE, EnumActionsType, EnumMessageType,
  GenericActionsComponent, GenericLayoutComponent, GenericMessageComponent,
  GridService, MessagesService, ModalService, PageFilter, TranslatePipe
} from '@lib/shared';
import { AuthService, EnumUserRole, UserPermissionsService } from '@lib/security';
import { FamiliaFormComponent } from '../familia-form/familia-form.component';
import { HTTPServiceFamilia } from '../http-services/familia.service';
import { FamiliaFilter } from '../models/familia-filter.model';
import { FamiliaGrid } from '../models/familia-grid.model';
import { Familia } from '../models/familia.model';
import { FamiliaGridComponent } from './familia-grid/familia-grid.component';
import { FamiliaGridFilterComponent } from './familia-grid-filter/familia-grid-filter.component';
import { UnidadMedida, UnidadMedidaGrid } from '../../unidades-medida';

@Component({
  selector: 'app-familias-container',
  templateUrl: './familias-container.component.html',
  styleUrls: ['./familias-container.component.scss'],
  standalone: true,
  imports: [
    NgFor,
    MatTabsModule,
    MatIconModule,
    TranslatePipe,
    GenericLayoutComponent,
    GenericMessageComponent,
    GenericActionsComponent,
    FamiliaGridFilterComponent,
    FamiliaGridComponent,
    FamiliaFormComponent
  ],
  providers: [Router, GridService]
})
export class FamiliasContainerComponent implements OnInit, OnDestroy {
  openedFamiliasId: number[] = [];
  selectedFamiliaId: number = 0;
  selectedTabIndex: number = -1;
  filterParameters: FamiliaFilter = new FamiliaFilter();
  config: ConfigurationItem = new ConfigurationItem();

  private _dataLoaded: FamiliaGrid[] = [];
  private _openedFamilias: Familia[] = [];
  private _pageFilter: PageFilter = new PageFilter();
  private readonly _destroyRef = inject(DestroyRef);

  constructor(
    private _router: Router,
    private _familiaService: HTTPServiceFamilia,
    private _gridService: GridService<FamiliaGrid>,
    private _messagesService: MessagesService,
    private _actionService: ActionService,
    private _modalService: ModalService,
    private _authService: AuthService,
    private _permissionsUserService: UserPermissionsService,
    private _menuesService: MenuesService,
    private _configurationService: ConfigurationService
  ) {
    this._createPageFilter();
    this._createFilterParameters();
    this._setSubscriptions();
  }

  ngOnInit(): void {
    try {
      this._securityApply();
      this.loadFamilias(this._pageFilter, this.filterParameters);
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
    this.loadFamilias(this._pageFilter, this.filterParameters);
  }

  onLoadNextPage(): void {
    this._pageFilter.page += 1;
    this.loadFamilias(this._pageFilter, this.filterParameters);
  }

  onFilterApplied(filter: FamiliaFilter): void {
    this._dataLoaded = [];
    this._pageFilter.page = 1;
    this.filterParameters = filter;
    this.loadFamilias(this._pageFilter, this.filterParameters);
  }

  onAction(action: EnumActionsType | EnumActions): void {
    if (action === EnumActions.eAction_New) {
      this._actionNewFamilia();
      return;
    }
    this._menuesService.openMenu(action);
  }

  onEdit(familia: FamiliaGrid): void {
       try {
         if (this.openedFamiliasId.includes(familia.familia_codigo)) {
           this.selectedFamiliaId = familia.familia_codigo;
           this.selectedTabIndex = this.openedFamiliasId.indexOf(familia.familia_codigo);
           return;
         }      
         this.openedFamiliasId.push(familia.familia_codigo);
         this._openedFamilias.push(this._familiaGridToFamilia(familia));
         this.selectedFamiliaId = familia.familia_codigo;
         this.selectedTabIndex = this.openedFamiliasId.indexOf(familia.familia_codigo);
       } catch (error) {
         this._messagesService.addMessage("Error al editar familia", EnumMessageType.Error);
       }
  }

  onDelete(familia: FamiliaGrid): void {
    this._modalService.showModal(CONFIRM_DELETE).pipe(takeUntilDestroyed(this._destroyRef)).subscribe(action => {
      if (action === EnumActionsType.actionAccept) {
        this._deleteFamilia(familia);
      }
    });
  }

  onOpen(familia: FamiliaGrid): void {
    const url = this._router.serializeUrl(
      this._router.createUrlTree(['familias-module', 'familia', 'open'], { queryParams: { id: familia.familia_codigo } })
    );
    window.open(url, '_blank');
  }

  onSave(familia: Familia): void {
    const openedIndex = this.openedFamiliasId.indexOf(familia.familia_codigo);
    if (openedIndex !== -1) {
      this._openedFamilias[openedIndex] = familia;
      this.openedFamiliasId[openedIndex] = familia.familia_codigo;
    } else {
      this.openedFamiliasId.push(familia.familia_codigo);
      this._openedFamilias.push(familia);
    }

    const gridIndex = this._dataLoaded.findIndex(item => item.familia_codigo === familia.familia_codigo);
    if (gridIndex !== -1) {
      this._dataLoaded[gridIndex] = this._familiaToFamiliaGrid(familia);
    } else {
      this._dataLoaded = [this._familiaToFamiliaGrid(familia), ...this._dataLoaded];
    }

    this._gridService.setData(this._dataLoaded);
    this._messagesService.addMessage('MESSAGE.successSave', EnumMessageType.Info);
    this.selectedFamiliaId = familia.familia_codigo;
    this.selectedTabIndex = this.openedFamiliasId.indexOf(familia.familia_codigo);
  }

  onCancel(): void {
    if (this.selectedFamiliaId !== null) {
      this._closeFamilia(this.selectedFamiliaId);
    }
  }

  onCloseTab(familiaId: number): void {
    this._closeFamilia(familiaId);
  }

  onClickTab(familiaId: number): void {
    this.selectedFamiliaId = familiaId;
    this.selectedTabIndex = this.openedFamiliasId.indexOf(familiaId);
  }

  getFamiliaById(familiaId: number): Familia | undefined {
    const index = this.openedFamiliasId.indexOf(familiaId);
    return index !== -1 ? this._openedFamilias[index] : undefined;
  }

  loadFamilias(pageFilter: PageFilter, filterParameters: FamiliaFilter): void {
    this._familiaService.getFamilias(pageFilter, filterParameters)
      .pipe(takeUntilDestroyed(this._destroyRef))
      .subscribe({
        next: response => {
          this._dataLoaded = this._pageFilter.page === 1 ? response.data : [...this._dataLoaded, ...response.data];
          this._gridService.setData(this._dataLoaded);
        },
        error: () => this._messagesService.addMessage('Error al cargar familias', EnumMessageType.Error)
      });
  }

  private _actionNewFamilia(): void {
    const newFamilia = new Familia();
    this.openedFamiliasId.push(0);
    this._openedFamilias.push(newFamilia);
    this.selectedFamiliaId = 0;
    this.selectedTabIndex = this.openedFamiliasId.indexOf(0);
  }

  private _closeFamilia(familiaId: number): void {
    const index = this.openedFamiliasId.indexOf(familiaId);
    if (index !== -1) {
      this.openedFamiliasId.splice(index, 1);
      this._openedFamilias.splice(index, 1);
      this.selectedFamiliaId = this.openedFamiliasId.length > 0
        ? this.openedFamiliasId[Math.max(index - 1, 0)]
        : 0;
    }

    this.selectedTabIndex = this.selectedFamiliaId !== null
      ? this.openedFamiliasId.indexOf(this.selectedFamiliaId)
      : -1;
  }

  private _deleteFamilia(familia: FamiliaGrid): void {
    this._familiaService.deleteFamilia(familia.familia_codigo)
      .pipe(takeUntilDestroyed(this._destroyRef))
      .subscribe({
        next: () => {
          this._dataLoaded = this._dataLoaded.filter(item => item.familia_codigo !== familia.familia_codigo);
          this._gridService.setData(this._dataLoaded);
          this._closeFamilia(familia.familia_codigo);
          this._messagesService.addMessage('MESSAGE.successDelete', EnumMessageType.Info);
        },
        error: () => this._messagesService.addMessage('Error al eliminar familia', EnumMessageType.Error)
      });
  }

private _familiaGridToFamilia(familiaGrid: FamiliaGrid): Familia {    
    const familia = new Familia();
    familia.familia_codigo = familiaGrid.familia_codigo;
    familia.familia_descripcion = familiaGrid.familia_descripcion;
    return familia;
  }

  private _familiaToFamiliaGrid(familia: Familia): FamiliaGrid {
    const familiaGrid = new FamiliaGrid();
    familiaGrid.familia_codigo = familia.familia_codigo;
    familiaGrid.familia_descripcion = familia.familia_descripcion;
    return familiaGrid;
  }

  private _securityApply(): void {
    const actions = this._permissionsUserService.enabledActions(
      this._authService.getCurrentUser()?.role || EnumUserRole.VIEWER,
      EnumLiteralKeys.eModule_Familias,
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
          this.config = config.items.find(c => c.literalKey === EnumLiteralKeys.eModule_Familias) || new ConfigurationItem();
        }
      });
  }

  private _createPageFilter(): void {
    this._pageFilter.page = 1;
    this._pageFilter.pageSize = 15;
    this._pageFilter.sortField = 'familia_codigo';
    this._pageFilter.sortDirection = 'desc';
  }

  private _createFilterParameters(): void {
    this.filterParameters = new FamiliaFilter();
  }
}
