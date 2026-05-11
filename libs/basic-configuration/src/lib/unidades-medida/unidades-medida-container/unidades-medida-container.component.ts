import { Component, OnDestroy, OnInit, DestroyRef, inject } from '@angular/core';
import { NgFor } from '@angular/common';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { MatIconModule } from '@angular/material/icon';
import { MatTabsModule } from '@angular/material/tabs';
import { Router } from '@angular/router';
import {
  TranslatePipe, GenericLayoutComponent, GenericMessageComponent, GenericActionsComponent,
  GridService, ActionService, PageFilter, MessagesService, ModalService,
  EnumMessageType, EnumActionsType, CONFIRM_DELETE
} from '@lib/shared';
import { AuthService, EnumUserRole, UserPermissionsService } from '@lib/security';
import { ConfigurationItem, ConfigurationService, EnumActions, EnumLiteralKeys, MenuesService } from '@lib/common';
import { HTTPServiceUnidadMedida } from '../http-services/unidad-medida.service';
import { UnidadMedida } from '../models/unidad-medida.model';
import { UnidadMedidaFilter } from '../models/unidad-medida-filter.model';
import { UnidadMedidaGrid } from '../models/unidad-medida-grid.model';
import { UnidadMedidaFormComponent } from '../unidad-medida-form/unidad-medida-form.component';
import { UnidadMedidaGridComponent } from './unidad-medida-grid/unidad-medida-grid.component';
import { UnidadMedidaGridFilterComponent } from './unidad-medida-grid-filter/unidad-medida-grid-filter.component';
import { UserGrid } from 'libs/users/src/lib/users/models/user-grid.model';

@Component({
  selector: 'app-unidades-medida-container',
  templateUrl: './unidades-medida-container.component.html',
  styleUrls: ['./unidades-medida-container.component.scss'],
  standalone: true,
  imports: [
    NgFor,
    MatTabsModule,
    MatIconModule,
    TranslatePipe,
    GenericLayoutComponent,
    GenericMessageComponent,
    GenericActionsComponent,
    UnidadMedidaGridFilterComponent,
    UnidadMedidaGridComponent,
    UnidadMedidaFormComponent
  ],
  providers: [Router, GridService]
})
export class UnidadesMedidaContainerComponent implements OnInit, OnDestroy {
  openedUnidadesMedidaId: number[] = [];
  selectedUnidadMedidaId: number = 0;
  selectedTabIndex: number = -1;
  filterParameters: UnidadMedidaFilter = new UnidadMedidaFilter();
  config: ConfigurationItem = new ConfigurationItem();

  private _dataLoaded: UnidadMedidaGrid[] = [];
  private _openedUnidadesMedida: UnidadMedida[] = [];
  private _pageFilter: PageFilter = new PageFilter();
  private readonly _destroyRef = inject(DestroyRef);

  constructor(
    private _router: Router,
    private _unidadMedidaService: HTTPServiceUnidadMedida,
    private _gridService: GridService<UnidadMedidaGrid>,
    private _messagesService: MessagesService,
    private _actionService: ActionService,
    private _modalService: ModalService,
    private _permissionsUserService: UserPermissionsService,
    private _authService: AuthService,
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
      this.loadUnidadesMedida(this._pageFilter, this.filterParameters);
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
    this.loadUnidadesMedida(this._pageFilter, this.filterParameters);
  }

  onLoadNextPage(): void {
    this._pageFilter.page += 1;
    this.loadUnidadesMedida(this._pageFilter, this.filterParameters);
  }

  onFilterApplied(filter: UnidadMedidaFilter): void {
    this._dataLoaded = [];
    this._pageFilter.page = 1;
    this.filterParameters = filter;
    this.loadUnidadesMedida(this._pageFilter, this.filterParameters);
  }

  onAction(action: EnumActionsType | EnumActions): void {
    if (action === EnumActions.eAction_New) {
      this._actionNewUnidadMedida();
      return;
    }

    try {
      this._menuesService.openMenu(action);
    } catch (error) {
      this._messagesService.addMessage('ERROR.actionExecute', EnumMessageType.Error);
    }
  }

  onEdit(unidadMedidaGrid: UnidadMedidaGrid): void {
        try {
          if (this.openedUnidadesMedidaId.includes(unidadMedidaGrid.unidadMedida_codigo)) {
            this.selectedUnidadMedidaId = unidadMedidaGrid.unidadMedida_codigo;
            this.selectedTabIndex = this.openedUnidadesMedidaId.indexOf(unidadMedidaGrid.unidadMedida_codigo);
            return;
          }      
          this.openedUnidadesMedidaId.push(unidadMedidaGrid.unidadMedida_codigo);
          this._openedUnidadesMedida.push(this._unidadMedidaGridToUnidadMedida(unidadMedidaGrid));
          this.selectedUnidadMedidaId = unidadMedidaGrid.unidadMedida_codigo;
          this.selectedTabIndex = this.openedUnidadesMedidaId.indexOf(unidadMedidaGrid.unidadMedida_codigo);
        } catch (error) {
          this._messagesService.addMessage("Error al editar unidad de medida", EnumMessageType.Error);
        }
  }

  onDelete(unidadMedidaGrid: UnidadMedidaGrid): void {
    this._modalService.showModal(CONFIRM_DELETE)
      .pipe(takeUntilDestroyed(this._destroyRef))
      .subscribe(action => {
        if (action === EnumActionsType.actionAccept) {
          this._deleteUnidadMedida(unidadMedidaGrid);
        }
      });
  }

  onOpen(unidadMedidaGrid: UnidadMedidaGrid): void {
    const url = this._router.serializeUrl(
      this._router.createUrlTree(['unidades-medida-module', 'unidad-medida', 'open'], {
        queryParams: { id: unidadMedidaGrid.unidadMedida_codigo }
      })
    );
    window.open(url, '_blank');
  }

  onSave(unidadMedida: UnidadMedida): void {
    const openedIndex = this.openedUnidadesMedidaId.indexOf(unidadMedida.unidadMedida_codigo);
    if (openedIndex !== -1) {
      this._openedUnidadesMedida[openedIndex] = unidadMedida;
      this.openedUnidadesMedidaId[openedIndex] = unidadMedida.unidadMedida_codigo;
    } else {
      this.openedUnidadesMedidaId.push(unidadMedida.unidadMedida_codigo);
      this._openedUnidadesMedida.push(unidadMedida);
    }

    const gridIndex = this._dataLoaded.findIndex(item => item.unidadMedida_codigo === unidadMedida.unidadMedida_codigo);
    if (gridIndex !== -1) {
      this._dataLoaded[gridIndex] = this._unidadMedidaToUnidadMedidaGrid(unidadMedida);
    } else {
      this._dataLoaded = [this._unidadMedidaToUnidadMedidaGrid(unidadMedida), ...this._dataLoaded];
    }

    this._gridService.setData(this._dataLoaded);
    this._messagesService.addMessage('MESSAGE.successSave', EnumMessageType.Info);
    this.selectedUnidadMedidaId = unidadMedida.unidadMedida_codigo;
    this.selectedTabIndex = this.openedUnidadesMedidaId.indexOf(unidadMedida.unidadMedida_codigo);
  }

  onCancel(): void {
    if (this.selectedUnidadMedidaId !== 0) {
      this._closeUnidadMedida(this.selectedUnidadMedidaId);
    }
  }

  onCloseTab(itemId: number): void {
    this._closeUnidadMedida(itemId);
  }

  onClickTab(itemId: number): void {
    this.selectedUnidadMedidaId = itemId;
    this.selectedTabIndex = this.openedUnidadesMedidaId.indexOf(itemId);
  }

  getUnidadMedidaById(itemId: number): UnidadMedida | undefined {   
    const index = this.openedUnidadesMedidaId.indexOf(itemId);
    return index !== -1 ? this._openedUnidadesMedida[index] : undefined;
  }

  loadUnidadesMedida(pageFilter: PageFilter, filterParameters: UnidadMedidaFilter): void {
    this._unidadMedidaService.getUnidadesMedida(pageFilter, filterParameters)
      .pipe(takeUntilDestroyed(this._destroyRef))
      .subscribe({
        next: response => {
          this._dataLoaded = this._pageFilter.page === 1 ? response.data : [...this._dataLoaded, ...response.data];
          this._gridService.setData(this._dataLoaded);
        },
        error: () => {
          this._messagesService.addMessage('Error al cargar unidades de medida', EnumMessageType.Error);
        }
      });
  }

  private _actionNewUnidadMedida(): void {
    if (this.openedUnidadesMedidaId.includes(0)) {
      this.selectedUnidadMedidaId = 0;
      this.selectedTabIndex = this.openedUnidadesMedidaId.indexOf(0);
      return;
    }

    const newUnidadMedida = new UnidadMedida();
    newUnidadMedida.unidadMedida_codigo = 0;
    this.openedUnidadesMedidaId.push(0);
    this._openedUnidadesMedida.push(newUnidadMedida);
    this.selectedUnidadMedidaId = 0;
    this.selectedTabIndex = this.openedUnidadesMedidaId.indexOf(0);
  }

  private _closeUnidadMedida(itemId: number): void {
    const index = this.openedUnidadesMedidaId.indexOf(itemId);
    if (index !== -1) {
      this.openedUnidadesMedidaId.splice(index, 1);
      this._openedUnidadesMedida.splice(index, 1);
      this.selectedUnidadMedidaId = this.openedUnidadesMedidaId.length > 0
        ? this.openedUnidadesMedidaId[Math.max(index - 1, 0)]
        : 0;
      this.selectedTabIndex = this.selectedUnidadMedidaId !== 0
        ? this.openedUnidadesMedidaId.indexOf(this.selectedUnidadMedidaId)
        : -1;
    }
  }

  private _deleteUnidadMedida(unidadMedidaGrid: UnidadMedidaGrid): void {
    this._unidadMedidaService.deleteUnidadMedida(unidadMedidaGrid.unidadMedida_codigo)
      .pipe(takeUntilDestroyed(this._destroyRef))
      .subscribe({
        next: () => {
          this._dataLoaded = this._dataLoaded.filter(item => item.unidadMedida_codigo !== unidadMedidaGrid.unidadMedida_codigo);
          this._gridService.setData(this._dataLoaded);
          this._closeUnidadMedida(unidadMedidaGrid.unidadMedida_codigo);
          this._messagesService.addMessage('MESSAGE.successDelete', EnumMessageType.Info);
        },
        error: () => {
          this._messagesService.addMessage('Error al eliminar unidad de medida', EnumMessageType.Error);
        }
      });
  }

  private _securityApply(): void {
    const actions = this._permissionsUserService.enabledActions(
      this._authService.getCurrentUser()?.role || EnumUserRole.VIEWER,
      EnumLiteralKeys.eModule_UnidadesMedida,
      this.makeConditions()
    );

    this._actionService.setActions(actions);
  }

  makeConditions(): string {
    return '#|V|#';
  }

  private _setSubscriptions(): void {
    this._configurationService.getConfiguration()
      .pipe(takeUntilDestroyed(this._destroyRef))
      .subscribe(config => {
        if (config) {
          this.config = config.items.find(c => c.literalKey === EnumLiteralKeys.eModule_UnidadesMedida) || new ConfigurationItem();
        }
      });
  }

  private _createPageFilter(): void {
    this._pageFilter.page = 1;
    this._pageFilter.pageSize = 15;
    this._pageFilter.sortField = 'unidadMedida_codigo';
    this._pageFilter.sortDirection = 'asc';
  }

  private _createFilterParameters(): void {
    this.filterParameters.unidadMedida_codigo = undefined;
    this.filterParameters.unidadMedida_descripcion = undefined;
    this.filterParameters.unidadMedida_abreviatura = undefined;
  }

  private _unidadMedidaGridToUnidadMedida(unidadMedidaGrid: UnidadMedidaGrid): UnidadMedida {    
    const unidadMedida = new UnidadMedida();
    unidadMedida.unidadMedida_codigo = unidadMedidaGrid.unidadMedida_codigo;
    unidadMedida.unidadMedida_descripcion = unidadMedidaGrid.unidadMedida_descripcion;
    unidadMedida.unidadMedida_abreviatura = unidadMedidaGrid.unidadMedida_abreviatura;
    unidadMedida.unidadMedida_activo = unidadMedidaGrid.unidadMedida_activo;
    return unidadMedida;
  }

  private _unidadMedidaToUnidadMedidaGrid(unidadMedida: UnidadMedida): UnidadMedidaGrid {
    const unidadMedidaGrid = new UnidadMedidaGrid();
    unidadMedidaGrid.unidadMedida_codigo = unidadMedida.unidadMedida_codigo;
    unidadMedidaGrid.unidadMedida_descripcion = unidadMedida.unidadMedida_descripcion;
    unidadMedidaGrid.unidadMedida_abreviatura = unidadMedida.unidadMedida_abreviatura;
    unidadMedidaGrid.unidadMedida_activo = unidadMedida.unidadMedida_activo;
    return unidadMedidaGrid;
  }
}
