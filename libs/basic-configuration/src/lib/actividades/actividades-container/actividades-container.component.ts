import { Component, OnInit, OnDestroy, DestroyRef, inject } from '@angular/core';
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
import { ActividadFilter } from '../models/actividad-filter.model';
import { ActividadGrid } from '../models/actividad-grid.model';
import { Actividad } from '../models/actividad.model';
import { HTTPServiceActividad } from '../http-services/actividad.service';
import { ActividadGridFilterComponent } from './actividad-grid-filter/actividad-grid-filter.component';
import { ActividadGridComponent } from './actividad-grid/actividad-grid.component';
import { ActividadFormComponent } from '../actividad-form/actividad-form.component';

@Component({
  selector: 'app-actividades-container',
  templateUrl: './actividades-container.component.html',
  styleUrls: ['./actividades-container.component.scss'],
  standalone: true,
  imports: [
    NgFor,
    MatTabsModule,
    MatIconModule,
    TranslatePipe,
    GenericLayoutComponent,
    GenericMessageComponent,
    GenericActionsComponent,
    ActividadGridFilterComponent,
    ActividadGridComponent,
    ActividadFormComponent
  ],
  providers: [Router, GridService]
})
export class ActividadesContainerComponent implements OnInit, OnDestroy {
  openedActividadesId: string[] = [];
  selectedActividadId: string = '';
  selectedTabIndex: number = -1;
  filterParameters: ActividadFilter = new ActividadFilter();
  config: ConfigurationItem = new ConfigurationItem();

  private _dataLoaded: ActividadGrid[] = [];
  private _openedActividades: Actividad[] = [];
  private _pageFilter: PageFilter = new PageFilter();
  private readonly _destroyRef = inject(DestroyRef);

  constructor(
    private _router: Router,
    private _actividadService: HTTPServiceActividad,
    private _gridService: GridService<ActividadGrid>,
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
      this.loadActividades(this._pageFilter, this.filterParameters);
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
    this.loadActividades(this._pageFilter, this.filterParameters);
  }

  onLoadNextPage(): void {
    this._pageFilter.page += 1;
    this.loadActividades(this._pageFilter, this.filterParameters);
  }

  onFilterApplied(filter: ActividadFilter): void {
    this._dataLoaded = [];
    this._pageFilter.page = 1;
    this.filterParameters = filter;
    this.loadActividades(this._pageFilter, this.filterParameters);
  }

  onAction(action: EnumActionsType | EnumActions): void {
    if (action === EnumActions.eAction_New) {
      this._actionNewActividad();
      return;
    }
    this._menuesService.openMenu(action);
  }

  onEdit(actividad: ActividadGrid): void {
    try {
      // 1. Verificar si ya está abierta
      if (this.openedActividadesId.includes(actividad.actividad_codigo)) {
        // Solo cambiar la pestaña seleccionada
        this.selectedActividadId = actividad.actividad_codigo;
        this.selectedTabIndex = this.openedActividadesId.indexOf(actividad.actividad_codigo);
        return;
      }
      
      // 2. Agregar a las colecciones
      this.openedActividadesId.push(actividad.actividad_codigo);
      this._openedActividades.push(this._actividadGridToActividad(actividad));
      
      // 3. Seleccionar la nueva pestaña
      this.selectedActividadId = actividad.actividad_codigo;
      this.selectedTabIndex = this.openedActividadesId.indexOf(actividad.actividad_codigo);
    } catch (error) {
      this._messagesService.addMessage('Error al editar actividad', EnumMessageType.Error);
    }
  }

  onDelete(actividad: ActividadGrid): void {
    this._modalService.showModal(CONFIRM_DELETE)
      .pipe(takeUntilDestroyed(this._destroyRef))
      .subscribe(action => {
        if (action === EnumActionsType.actionAccept) {
          this._deleteActividad(actividad);
        }
      });
  }

  onOpen(actividad: ActividadGrid): void {
    const url = this._router.serializeUrl(
      this._router.createUrlTree(['actividades-module', 'actividad', 'open'], {
        queryParams: { id: actividad.actividad_codigo }
      })
    );
    window.open(url, '_blank');
  }

  onSave(actividad: Actividad): void {
    // 1. Actualizar o agregar en pestañas abiertas
    const openedIndex = this.openedActividadesId.indexOf(actividad.actividad_codigo);
    if (openedIndex !== -1) {
      // Si ya existe, actualizar en su posición
      this._openedActividades[openedIndex] = actividad;
      this.openedActividadesId[openedIndex] = actividad.actividad_codigo;
    } else {
      // Si no existe, agregar al final
      this.openedActividadesId.push(actividad.actividad_codigo);
      this._openedActividades.push(actividad);
    }

    // 2. Actualizar o agregar en grilla
    const gridIndex = this._dataLoaded.findIndex(item => item.actividad_codigo === actividad.actividad_codigo);
    if (gridIndex !== -1) {
      // Si ya existe en grilla, actualizar en su posición
      this._dataLoaded[gridIndex] = this._actividadToActividadGrid(actividad);
    } else {
      // Si no existe en grilla, agregar al principio
      this._dataLoaded = [this._actividadToActividadGrid(actividad), ...this._dataLoaded];
    }

    // 3. Notificar al GridService y al usuario
    this._gridService.setData(this._dataLoaded);
    this._messagesService.addMessage('MESSAGE.successSave', EnumMessageType.Info);
    
    // 4. Mantener seleccionada la pestaña actual
    this.selectedActividadId = actividad.actividad_codigo;
    this.selectedTabIndex = this.openedActividadesId.indexOf(actividad.actividad_codigo);
  }

  onCancel(): void {
    if (this.selectedActividadId) {
      this._closeActividad(this.selectedActividadId);
    }
  }

  onCloseTab(codigo: string): void {
    this._closeActividad(codigo);
  }

  onClickTab(codigo: string): void {
    this.selectedActividadId = codigo;
    this.selectedTabIndex = this.openedActividadesId.indexOf(codigo);
  }

  getActividadByCodigo(codigo: string): Actividad | undefined {
    const index = this.openedActividadesId.indexOf(codigo);
    return index !== -1 ? this._openedActividades[index] : undefined;
  }

  loadActividades(pageFilter: PageFilter, filterParameters: ActividadFilter): void {
    this._actividadService.getActividades(pageFilter, filterParameters)
      .pipe(takeUntilDestroyed(this._destroyRef))
      .subscribe({
        next: response => {
          this._dataLoaded = this._pageFilter.page === 1 ? response.data : [...this._dataLoaded, ...response.data];
          this._gridService.setData(this._dataLoaded);
        },
        error: () => this._messagesService.addMessage('Error al cargar actividades', EnumMessageType.Error)
      });
  }

  private _actionNewActividad(): void {
    const draft = new Actividad();
    draft.actividad_codigo = `NEW_${Date.now()}`;
    this.openedActividadesId.push(draft.actividad_codigo);
    this._openedActividades.push(draft);
    this.selectedActividadId = draft.actividad_codigo;
    this.selectedTabIndex = this.openedActividadesId.indexOf(draft.actividad_codigo);
  }

  private _closeActividad(codigo: string): void {
    const index = this.openedActividadesId.indexOf(codigo);
    if (index !== -1) {
      this.openedActividadesId.splice(index, 1);
      this._openedActividades.splice(index, 1);
      this.selectedActividadId = this.openedActividadesId.length > 0
        ? this.openedActividadesId[Math.max(index - 1, 0)]
        : '';
    }

    this.selectedTabIndex = this.selectedActividadId !== ''
      ? this.openedActividadesId.indexOf(this.selectedActividadId)
      : -1;
  }

  private _deleteActividad(actividad: ActividadGrid): void {
    this._actividadService.deleteActividad(actividad.actividad_codigo)
      .pipe(takeUntilDestroyed(this._destroyRef))
      .subscribe({
        next: () => {
          this._dataLoaded = this._dataLoaded.filter(item => item.actividad_codigo !== actividad.actividad_codigo);
          this._gridService.setData(this._dataLoaded);
          this._closeActividad(actividad.actividad_codigo);
          this._messagesService.addMessage('MESSAGE.successDelete', EnumMessageType.Info);
        },
        error: () => this._messagesService.addMessage('Error al eliminar actividad', EnumMessageType.Error)
      });
  }

  private _actividadGridToActividad(itemGrid: ActividadGrid): Actividad {
    const item = new Actividad();
    item.actividad_codigo = itemGrid.actividad_codigo;
    item.actividad_descripcion = itemGrid.actividad_descripcion;
    item.actividad_colorHojaRGB = itemGrid.actividad_colorHojaRGB;
    return item;
  }

  private _actividadToActividadGrid(item: Actividad): ActividadGrid {
    const itemGrid = new ActividadGrid();
    itemGrid.actividad_codigo = item.actividad_codigo;
    itemGrid.actividad_descripcion = item.actividad_descripcion;
    itemGrid.actividad_colorHojaRGB = item.actividad_colorHojaRGB;
    return itemGrid;
  }

  private _securityApply(): void {
    const actions = this._permissionsUserService.enabledActions(
      this._authService.getCurrentUser()?.role || EnumUserRole.VIEWER,
      EnumLiteralKeys.eModule_Actividades,
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
          this.config = config.items.find(c => c.literalKey === EnumLiteralKeys.eModule_Actividades) || new ConfigurationItem();
        }
      });
  }

  private _createPageFilter(): void {
    this._pageFilter.page = 1;
    this._pageFilter.pageSize = 15;
    this._pageFilter.sortField = 'actividad_codigo';
    this._pageFilter.sortDirection = 'asc';
  }

  private _createFilterParameters(): void {
    this.filterParameters.actividad_codigo = undefined;
    this.filterParameters.actividad_descripcion = undefined;
  }
}
