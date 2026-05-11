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
import { AlicuotaIvaFilter } from '../models/alicuota-iva-filter.model';
import { AlicuotaIvaGrid } from '../models/alicuota-iva-grid.model';
import { AlicuotaIva } from '../models/alicuota-iva.model';
import { HTTPServiceAlicuotaIva } from '../http-services/alicuota-iva.service';
import { AlicuotaIvaGridFilterComponent } from './alicuota-iva-grid-filter/alicuota-iva-grid-filter.component';
import { AlicuotaIvaGridComponent } from './alicuota-iva-grid/alicuota-iva-grid.component';
import { AlicuotaIvaFormComponent } from '../alicuota-iva-form/alicuota-iva-form.component';

@Component({
  selector: 'app-alicuotas-iva-container',
  templateUrl: './alicuotas-iva-container.component.html',
  styleUrls: ['./alicuotas-iva-container.component.scss'],
  standalone: true,
  imports: [
    NgFor,
    MatTabsModule,
    MatIconModule,
    TranslatePipe,
    GenericLayoutComponent,
    GenericMessageComponent,
    GenericActionsComponent,
    AlicuotaIvaGridFilterComponent,
    AlicuotaIvaGridComponent,
    AlicuotaIvaFormComponent
  ],
  providers: [Router, GridService]
})
export class AlicuotasIvaContainerComponent implements OnInit, OnDestroy {
  openedAlicuotasIvaId: number[] = [];
  selectedAlicuotaIvaId: number = 0;
  selectedTabIndex: number = -1;
  filterParameters: AlicuotaIvaFilter = new AlicuotaIvaFilter();
  config: ConfigurationItem = new ConfigurationItem();

  private _dataLoaded: AlicuotaIvaGrid[] = [];
  private _openedAlicuotasIva: AlicuotaIva[] = [];
  private _pageFilter: PageFilter = new PageFilter();
  private readonly _destroyRef = inject(DestroyRef);

  constructor(
    private _router: Router,
    private _alicuotaIvaService: HTTPServiceAlicuotaIva,
    private _gridService: GridService<AlicuotaIvaGrid>,
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
      this.loadAlicuotasIva(this._pageFilter, this.filterParameters);
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
      this.loadAlicuotasIva(this._pageFilter, this.filterParameters);
    } catch (error) {
      this._messagesService.addMessage('Error al ordenar', EnumMessageType.Error);
    }
  }

  onLoadNextPage(): void {
    try {
      this._pageFilter.page++;
      this.loadAlicuotasIva(this._pageFilter, this.filterParameters);
    } catch (error) {
      this._messagesService.addMessage('Error al cargar más datos', EnumMessageType.Error);
    }
  }

  onFilterApplied(filter: AlicuotaIvaFilter): void {
    try {
      this.filterParameters = filter;
      this._pageFilter.page = 1;
      this._dataLoaded = [];
      this.loadAlicuotasIva(this._pageFilter, this.filterParameters);
    } catch (error) {
      this._messagesService.addMessage('Error al aplicar filtro', EnumMessageType.Error);
    }
  }

  onAction(action: EnumActionsType | EnumActions): void {
    if (action === EnumActions.eAction_New) {
      this._actionNewAlicuotaIva();
      return;
    }
    this._menuesService.openMenu(action);
  }

  onEdit(item: AlicuotaIvaGrid): void {
    try {
      // 1. Verificar si ya está abierta
      if (this.openedAlicuotasIvaId.includes(item.alicuotaIva_codigo)) {
        // Solo cambiar la pestaña seleccionada
        this.selectedAlicuotaIvaId = item.alicuotaIva_codigo;
        this.selectedTabIndex = this.openedAlicuotasIvaId.indexOf(item.alicuotaIva_codigo);
        return;
      }
      
      // 2. Agregar a las colecciones
      this.openedAlicuotasIvaId.push(item.alicuotaIva_codigo);
      this._openedAlicuotasIva.push(this._alicuotaIvaGridToAlicuotaIva(item));
      
      // 3. Seleccionar la nueva pestaña
      this.selectedAlicuotaIvaId = item.alicuotaIva_codigo;
      this.selectedTabIndex = this.openedAlicuotasIvaId.indexOf(item.alicuotaIva_codigo);
    } catch (error) {
      this._messagesService.addMessage('Error al editar alicuota IVA', EnumMessageType.Error);
    }
  }

  onDelete(item: AlicuotaIvaGrid): void {
    try {
      this._modalService.showModal(CONFIRM_DELETE)
        .pipe(takeUntilDestroyed(this._destroyRef))
        .subscribe(action => {
          if (action === EnumActionsType.actionAccept) {
            this._deleteAlicuotaIva(item);
          }
        });
    } catch (error) {
      this._messagesService.addMessage('Error al eliminar AlicuotaIva', EnumMessageType.Error);
    }
  }

  onOpen(item: AlicuotaIvaGrid): void {
    try {
      this._openAlicuotaIva(item);
    } catch (error) {
      this._messagesService.addMessage('Error al abrir AlicuotaIva en nueva pestaña', EnumMessageType.Error);
    }
  }

  onSave(alicuotaIva: AlicuotaIva): void {
    // 1. Actualizar o agregar en pestañas abiertas
    const openedIndex = this.openedAlicuotasIvaId.indexOf(alicuotaIva.alicuotaIva_codigo);
    if (openedIndex !== -1) {
      // Si ya existe, actualizar en su posición
      this._openedAlicuotasIva[openedIndex] = alicuotaIva;
      this.openedAlicuotasIvaId[openedIndex] = alicuotaIva.alicuotaIva_codigo;
    } else {
      // Si no existe, agregar al final
      this.openedAlicuotasIvaId.push(alicuotaIva.alicuotaIva_codigo);
      this._openedAlicuotasIva.push(alicuotaIva);
    }

    // 2. Actualizar o agregar en grilla
    const gridIndex = this._dataLoaded.findIndex(item => item.alicuotaIva_codigo === alicuotaIva.alicuotaIva_codigo);
    if (gridIndex !== -1) {
      // Si ya existe en grilla, actualizar en su posición
      this._dataLoaded[gridIndex] = this._alicuotaIvaToAlicuotaIvaGrid(alicuotaIva);
    } else {
      // Si no existe en grilla, agregar al principio
      this._dataLoaded = [this._alicuotaIvaToAlicuotaIvaGrid(alicuotaIva), ...this._dataLoaded];
    }

    // 3. Notificar al GridService y al usuario
    this._gridService.setData(this._dataLoaded);
    this._messagesService.addMessage('MESSAGE.successSave', EnumMessageType.Info);
    
    // 4. Mantener seleccionada la pestaña actual
    this.selectedAlicuotaIvaId = alicuotaIva.alicuotaIva_codigo;
    this.selectedTabIndex = this.openedAlicuotasIvaId.indexOf(alicuotaIva.alicuotaIva_codigo);
  }

  onCancel(): void {
    try {
      if (this.selectedAlicuotaIvaId !== 0) {
        this._closeAlicuotaIva(this.selectedAlicuotaIvaId);
      }
    } catch (error) {
      this._messagesService.addMessage('Error al cerrar pestaña', EnumMessageType.Error);
    }
  }

  onCloseTab(codigo: number): void {
    try {
      this._closeAlicuotaIva(codigo);
    } catch (error) {
      this._messagesService.addMessage('Error al cerrar pestaña', EnumMessageType.Error);
    }
  }

  onClickTab(codigo: number): void {
    this.selectedAlicuotaIvaId = codigo;
    this.selectedTabIndex = this.openedAlicuotasIvaId.indexOf(codigo);
  }

  getAlicuotaIvaByCodigo(codigo: number): AlicuotaIva | undefined {
    const index = this.openedAlicuotasIvaId.indexOf(codigo);
    return index !== -1 ? this._openedAlicuotasIva[index] : undefined;
  }

  loadAlicuotasIva(pageFilter: PageFilter, filterParameters: AlicuotaIvaFilter): void {
    this._alicuotaIvaService.getAlicuotasIva(pageFilter, filterParameters)
      .pipe(takeUntilDestroyed(this._destroyRef))
      .subscribe({
        next: response => {
          this._dataLoaded = this._pageFilter.page === 1 ? response.data : [...this._dataLoaded, ...response.data];
          this._gridService.setData(this._dataLoaded);
        },
        error: () => {
          this._messagesService.addMessage('Error al cargar alicuotas IVA', EnumMessageType.Error);
        }
      });
  }

  private _actionNewAlicuotaIva(): void {
    const newAlicuotaIva = new AlicuotaIva();
    newAlicuotaIva.alicuotaIva_codigo = 0;
    this.openedAlicuotasIvaId.push(0);
    this._openedAlicuotasIva.push(newAlicuotaIva);
    this.selectedAlicuotaIvaId = 0;
    this.selectedTabIndex = this.openedAlicuotasIvaId.indexOf(0);
  }

  private _closeAlicuotaIva(codigo: number): void {
    const index = this.openedAlicuotasIvaId.indexOf(codigo);
    if (index !== -1) {
      this.openedAlicuotasIvaId.splice(index, 1);
      this._openedAlicuotasIva.splice(index, 1);
      this.selectedAlicuotaIvaId = this.openedAlicuotasIvaId.length > 0
        ? this.openedAlicuotasIvaId[Math.max(index - 1, 0)]
        : 0;
    }

    this.selectedTabIndex = this.selectedAlicuotaIvaId !== null
      ? this.openedAlicuotasIvaId.indexOf(this.selectedAlicuotaIvaId)
      : -1;
  }

  private _deleteAlicuotaIva(item: AlicuotaIvaGrid): void {
    this._alicuotaIvaService.deleteAlicuotaIva(item.alicuotaIva_codigo)
      .pipe(takeUntilDestroyed(this._destroyRef))
      .subscribe({
        next: () => {
          this._dataLoaded = this._dataLoaded.filter(gridItem => gridItem.alicuotaIva_codigo !== item.alicuotaIva_codigo);
          this._gridService.setData(this._dataLoaded);
          this._closeAlicuotaIva(item.alicuotaIva_codigo);
          this._messagesService.addMessage('MESSAGE.successDelete', EnumMessageType.Info);
        },
        error: (error) => {
          this._messagesService.addMessage(error, EnumMessageType.Error);
        }
      });
  }

  private _alicuotaIvaGridToAlicuotaIva(itemGrid: AlicuotaIvaGrid): AlicuotaIva {
    const item = new AlicuotaIva();
    item.alicuotaIva_codigo = itemGrid.alicuotaIva_codigo;
    item.alicuotaIva_descripcion = itemGrid.alicuotaIva_descripcion;
    item.alicuotaIva_tasa = itemGrid.alicuotaIva_tasa;
    return item;
  }

  private _alicuotaIvaToAlicuotaIvaGrid(item: AlicuotaIva): AlicuotaIvaGrid {
    const itemGrid = new AlicuotaIvaGrid();
    itemGrid.alicuotaIva_codigo = item.alicuotaIva_codigo;
    itemGrid.alicuotaIva_descripcion = item.alicuotaIva_descripcion;
    itemGrid.alicuotaIva_tasa = item.alicuotaIva_tasa;
    return itemGrid;
  }

  private _openAlicuotaIva(item: AlicuotaIvaGrid): void {
    const url = this._router.serializeUrl(
      this._router.createUrlTree(['alicuotas-iva-module', 'alicuota-iva', 'open'], {
        queryParams: { id: item.alicuotaIva_codigo }
      })
    );
    window.open(url, '_blank');
  }

  private _securityApply(): void {
    const actions = this._permissionsUserService.enabledActions(
      this._authService.getCurrentUser()?.role || EnumUserRole.VIEWER,
      EnumLiteralKeys.eModule_AlicuotasIva,
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
          this.config = config.items.find(c => c.literalKey === EnumLiteralKeys.eModule_AlicuotasIva) || new ConfigurationItem();
        }
      });
  }

  private _createPageFilter(): void {
    this._pageFilter.page = 1;
    this._pageFilter.pageSize = 15;
    this._pageFilter.sortField = 'alicuotaIva_codigo';
    this._pageFilter.sortDirection = 'desc';
  }

  private _createFilterParameters(): void {
    this.filterParameters.alicuotaIva_codigo = undefined;
    this.filterParameters.alicuotaIva_descripcion = '';
  }
}
