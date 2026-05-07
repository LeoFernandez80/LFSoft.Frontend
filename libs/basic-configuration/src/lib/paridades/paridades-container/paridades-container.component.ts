import { Component, OnInit, OnDestroy, DestroyRef, inject } from '@angular/core';
import { NgFor } from '@angular/common';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { MatIconModule } from '@angular/material/icon';
import { MatTabsModule } from '@angular/material/tabs';
import { Router, ActivatedRoute } from '@angular/router';
import {
  TranslatePipe, GenericLayoutComponent, GenericMessageComponent, GenericActionsComponent,
  GridService, ActionService, PageFilter, MessagesService, ModalService,
  EnumMessageType, EnumActionsType, CONFIRM_DELETE
} from '@lib/shared';
import { AuthService, EnumUserRole, UserPermissionsService } from '@lib/security';
import { ConfigurationItem, ConfigurationService, EnumActions, EnumLiteralKeys, MenuesService } from '@lib/common';
import { ParidadFilter } from '../models/paridad-filter.model';
import { ParidadGrid } from '../models/paridad-grid.model';
import { Paridad } from '../models/paridad.model';
import { HTTPServiceParidad } from '../http-services/paridad.service';
import { ParidadGridFilterComponent } from './paridad-grid-filter/paridad-grid-filter.component';
import { ParidadGridComponent } from './paridad-grid/paridad-grid.component';
import { ParidadFormComponent } from '../paridad-form/paridad-form.component';

@Component({
  selector: 'app-paridades-container',
  templateUrl: './paridades-container.component.html',
  styleUrls: ['./paridades-container.component.scss'],
  standalone: true,
  imports: [
    NgFor,
    MatTabsModule,
    MatIconModule,
    TranslatePipe,
    GenericLayoutComponent,
    GenericMessageComponent,
    GenericActionsComponent,
    ParidadGridFilterComponent,
    ParidadGridComponent,
    ParidadFormComponent
  ],
  providers: [Router, GridService]
})
export class ParidadesContainerComponent implements OnInit, OnDestroy {
  openedParidasId: string[] = [];
  selectedParidadId: string | null = null;
  filterParameters: ParidadFilter = new ParidadFilter();
  config: ConfigurationItem = new ConfigurationItem();

  private _dataLoaded: ParidadGrid[] = [];
  private _openedParidades: Paridad[] = [];
  private _pageFilter: PageFilter = new PageFilter();
  private readonly _destroyRef = inject(DestroyRef);

  constructor(
    private _router: Router,
    private _route: ActivatedRoute,
    private _paridadService: HTTPServiceParidad,
    private _gridService: GridService<ParidadGrid>,
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
      this.loadParidades(this._pageFilter, this.filterParameters);
    } catch (error) {
      this._messagesService.addMessage('Error al cargar la página', EnumMessageType.Error);
    }
  }

  ngOnDestroy(): void {}

  onSortChange(pageFilter: PageFilter): void {
    try {
      this._pageFilter.sortField = pageFilter.sortField;
      this._pageFilter.sortDirection = pageFilter.sortDirection;
      this._pageFilter.page = 1;
      this._dataLoaded = [];
      this.loadParidades(this._pageFilter, this.filterParameters);
    } catch (error) {
      this._messagesService.addMessage('Error al ordenar', EnumMessageType.Error);
    }
  }

  onLoadNextPage(): void {
    try {
      this._pageFilter.page++;
      this.loadParidades(this._pageFilter, this.filterParameters);
    } catch (error) {
      this._messagesService.addMessage('Error al cargar más datos', EnumMessageType.Error);
    }
  }

  onFilterApplied(filter: ParidadFilter): void {
    try {
      this.filterParameters = filter;
      this._pageFilter.page = 1;
      this._dataLoaded = [];
      this.loadParidades(this._pageFilter, this.filterParameters);
    } catch (error) {
      this._messagesService.addMessage('Error al aplicar filtro', EnumMessageType.Error);
    }
  }

  onAction(action: EnumActionsType | EnumActions): void {
    switch (action) {
      case EnumActions.eAction_New:
        try {
          this._actionNewParidad();
        } catch (error) {
          this._messagesService.addMessage('Error al crear paridad', EnumMessageType.Error);
        }
        break;
      default:
        try {
          this._menuesService.openMenu(action);
        } catch (error) {
          this._messagesService.addMessage('ERROR.actionExecute', EnumMessageType.Error);
        }
        break;
    }
  }

  onEdit(item: ParidadGrid): void {
    try {
      if (this.openedParidasId.includes(item.paridad_fecha)) {
        this.selectedParidadId = item.paridad_fecha;
        return;
      }
      this._paridadService.getParidad(item.paridad_fecha)
        .pipe(takeUntilDestroyed(this._destroyRef))
        .subscribe({
          next: (response) => {
            this.openedParidasId.push(item.paridad_fecha);
            this._openedParidades.push(response.paridad);
            this.selectedParidadId = item.paridad_fecha;
          },
          error: () => {
            this._messagesService.addMessage('Error al cargar paridad', EnumMessageType.Error);
          }
        });
    } catch (error) {
      this._messagesService.addMessage('Error al editar paridad', EnumMessageType.Error);
    }
  }

  onDelete(item: ParidadGrid): void {
    try {
      this._modalService.showModal(CONFIRM_DELETE)
        .pipe(takeUntilDestroyed(this._destroyRef))
        .subscribe(action => {
          if (action === EnumActionsType.actionAccept) {
            this._deleteParidad(item);
          }
        });
    } catch (error) {
      this._messagesService.addMessage('Error al eliminar paridad', EnumMessageType.Error);
    }
  }

  onOpen(item: ParidadGrid): void {
    try {
      this._openParidad(item);
    } catch (error) {
      this._messagesService.addMessage('Error al abrir paridad en nueva pestaña', EnumMessageType.Error);
    }
  }

  onSave(paridad: Paridad): void {
    const index = this.openedParidasId.indexOf(paridad.paridad_fecha);
    if (index !== -1) {
      this._openedParidades[index] = paridad;
    }
    const indexData = this._dataLoaded.findIndex(p => p.paridad_fecha === paridad.paridad_fecha);
    if (indexData !== -1) {
      this._dataLoaded[indexData] = this._mapParidadToGrid(paridad);
    }
    this._gridService.setData(this._dataLoaded);
    this._messagesService.addMessage('MESSAGE.successSave', EnumMessageType.Info);
  }

  onCancel(): void {
    try {
      if (this.selectedParidadId !== null) {
        this._closeParidad(this.selectedParidadId);
      }
    } catch (error) {
      this._messagesService.addMessage('Error al cerrar pestaña', EnumMessageType.Error);
    }
  }

  onCloseTab(fecha: string): void {
    try {
      this._closeParidad(fecha);
    } catch (error) {
      this._messagesService.addMessage('Error al cerrar pestaña', EnumMessageType.Error);
    }
  }

  onClickTab(fecha: string): void {
    this.selectedParidadId = fecha;
  }

  getParidadByFecha(fecha: string): Paridad | undefined {
    const index = this.openedParidasId.indexOf(fecha);
    return index !== -1 ? this._openedParidades[index] : undefined;
  }

  loadParidades(pageFilter: PageFilter, filterParameters: ParidadFilter): void {
    this._paridadService.getParidades(pageFilter, filterParameters)
      .pipe(takeUntilDestroyed(this._destroyRef))
      .subscribe(response => {
        this._dataLoaded = [...this._dataLoaded, ...response.data];
        this._gridService.setData(this._dataLoaded);
      });
  }

  private _closeParidad(fecha: string): void {
    const index = this.openedParidasId.indexOf(fecha);
    if (index !== -1) {
      this.openedParidasId.splice(index, 1);
      this._openedParidades.splice(index, 1);
      if (this.openedParidasId.length > 0) {
        this.selectedParidadId = this.openedParidasId[Math.max(index - 1, 0)];
      } else {
        this.selectedParidadId = null;
      }
    }
  }

  private _actionNewParidad(): void {
    const newParidad = new Paridad();
    const today = new Date().toISOString().split('T')[0];
    newParidad.paridad_fecha = today;
    this.openedParidasId.push(today);
    this._openedParidades.push(newParidad);
    this.selectedParidadId = today;
  }

  private _deleteParidad(item: ParidadGrid): void {
    this._paridadService.deleteParidad(item.paridad_fecha)
      .pipe(takeUntilDestroyed(this._destroyRef))
      .subscribe({
        next: () => {
          this._messagesService.addMessage('MESSAGE.successDelete', EnumMessageType.Info);
          this._dataLoaded = [];
          this._pageFilter.page = 1;
          this.loadParidades(this._pageFilter, this.filterParameters);
        },
        error: (error) => {
          this._messagesService.addMessage(error, EnumMessageType.Error);
        }
      });
  }

  private _openParidad(item: ParidadGrid): void {
    const url = this._router.serializeUrl(
      this._router.createUrlTree(['paridades-module', 'paridad', 'open'], {
        queryParams: { id: item.paridad_fecha }
      })
    );
    window.open(url, '_blank');
  }

  private _securityApply(): void {
    const actions = this._permissionsUserService.enabledActions(
      this._authService.getCurrentUser()?.role || EnumUserRole.VIEWER,
      EnumLiteralKeys.eModule_Paridades,
      this.makeConditions()
    );

    this._actionService.setActions(actions);
  }

  private makeConditions(): string {
    return '#|V|#';
  }

  private _setSubscriptions(): void {
    this._configurationService.getConfiguration()
      .pipe(takeUntilDestroyed(this._destroyRef))
      .subscribe(config => {
        if (config) {
          this.config = config.items.find(c => c.literalKey === EnumLiteralKeys.eModule_Paridades) || new ConfigurationItem();
        }
      });
  }

  private _mapParidadToGrid(paridad: Paridad): ParidadGrid {
    const grid = new ParidadGrid();
    grid.paridad_fecha = paridad.paridad_fecha;
    grid.paridad_fechaCorrespondeA = paridad.paridad_fechaCorrespondeA;
    grid.paridad_dolar = paridad.paridad_dolar;
    grid.paridad_euro = paridad.paridad_euro;
    grid.paridad_dolarDivisa = paridad.paridad_dolarDivisa;
    grid.paridad_euroDivisa = paridad.paridad_euroDivisa;
    return grid;
  }

  private _createPageFilter(): void {
    this._pageFilter.page = 1;
    this._pageFilter.pageSize = 15;
    this._pageFilter.sortField = 'paridad_fecha';
    this._pageFilter.sortDirection = 'desc';
  }

  private _createFilterParameters(): void {
    this.filterParameters.paridad_fecha = undefined;
  }
}
