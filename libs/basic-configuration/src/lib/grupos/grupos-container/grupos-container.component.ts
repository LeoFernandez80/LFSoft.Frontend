import { Component, DestroyRef, OnDestroy, OnInit, inject } from '@angular/core';
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
import { GrupoFilter } from '../models/grupo-filter.model';
import { GrupoGrid } from '../models/grupo-grid.model';
import { Grupo } from '../models/grupo.model';
import { HTTPServiceGrupo } from '../http-services/grupo.service';
import { GrupoGridFilterComponent } from './grupo-grid-filter/grupo-grid-filter.component';
import { GrupoGridComponent } from './grupo-grid/grupo-grid.component';
import { GrupoFormComponent } from '../grupo-form/grupo-form.component';
import { FamiliaGrid } from '../../familias';

@Component({
  selector: 'app-grupos-container',
  templateUrl: './grupos-container.component.html',
  styleUrls: ['./grupos-container.component.scss'],
  standalone: true,
  imports: [
    NgFor,
    MatTabsModule,
    MatIconModule,
    TranslatePipe,
    GenericLayoutComponent,
    GenericMessageComponent,
    GenericActionsComponent,
    GrupoGridFilterComponent,
    GrupoGridComponent,
    GrupoFormComponent
  ],
  providers: [Router, GridService]
})
export class GruposContainerComponent implements OnInit, OnDestroy {
  openedGruposId: number[] = [];
  selectedGrupoId: number = 0;
  selectedTabIndex: number = -1;
  filterParameters: GrupoFilter = new GrupoFilter();
  config: ConfigurationItem = new ConfigurationItem();

  private _dataLoaded: GrupoGrid[] = [];
  private _openedGrupos: Grupo[] = [];
  private _pageFilter: PageFilter = new PageFilter();
  private readonly _destroyRef = inject(DestroyRef);

  constructor(
    private _router: Router,
    private _grupoService: HTTPServiceGrupo,
    private _gridService: GridService<GrupoGrid>,
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
      this.loadGrupos(this._pageFilter, this.filterParameters);
    } catch {
      this._messagesService.addMessage('Error al cargar la pagina', EnumMessageType.Error);
    }
  }

  ngOnDestroy(): void {}

  onSortChange(pageFilter: PageFilter): void {
    this._dataLoaded = [];
    this._pageFilter.page = 1;
    this._pageFilter.sortDirection = pageFilter.sortDirection;
    this._pageFilter.sortField = pageFilter.sortField;
    this.loadGrupos(this._pageFilter, this.filterParameters);
  }

  onLoadNextPage(): void {
    this._pageFilter.page += 1;
    this.loadGrupos(this._pageFilter, this.filterParameters);
  }

  onFilterApplied(filter: GrupoFilter): void {
    this._dataLoaded = [];
    this._pageFilter.page = 1;
    this.filterParameters = filter;
    this.loadGrupos(this._pageFilter, this.filterParameters);
  }

  onAction(action: EnumActionsType | EnumActions): void {
    if (action === EnumActions.eAction_New) {
      this._actionNewGrupo();
      return;
    }
    this._menuesService.openMenu(action);
  }

  onEdit(grupo: GrupoGrid): void {
    try {
      if (this.openedGruposId.includes(grupo.grupo_codigo)) {
        this.selectedGrupoId = grupo.grupo_codigo;
        this.selectedTabIndex = this.openedGruposId.indexOf(grupo.grupo_codigo);
        return;
      }      
      this.openedGruposId.push(grupo.grupo_codigo);
      this._openedGrupos.push(this._grupoGridToGrupo(grupo));
      this.selectedGrupoId = grupo.grupo_codigo;
      this.selectedTabIndex = this.openedGruposId.indexOf(grupo.grupo_codigo);
    } catch (error) {
      this._messagesService.addMessage("Error al editar grupo", EnumMessageType.Error);
    }
  }

  onDelete(grupo: GrupoGrid): void {
    this._modalService.showModal(CONFIRM_DELETE)
      .pipe(takeUntilDestroyed(this._destroyRef))
      .subscribe(action => {
        if (action === EnumActionsType.actionAccept) {
          this._deleteGrupo(grupo);
        }
      });
  }

  onOpen(grupo: GrupoGrid): void {
    const url = this._router.serializeUrl(
      this._router.createUrlTree(['grupos-module', 'grupo', 'open'], {
        queryParams: { id: grupo.grupo_codigo }
      })
    );
    window.open(url, '_blank');
  }

  onSave(grupo: Grupo): void {
    const openedIndex = this.openedGruposId.indexOf(grupo.grupo_codigo);
    if (openedIndex !== -1) {
      this._openedGrupos[openedIndex] = grupo;
    } else {
      this.openedGruposId.push(grupo.grupo_codigo);
      this._openedGrupos.push(grupo);
    }

    const gridIndex = this._dataLoaded.findIndex(item => item.grupo_codigo === grupo.grupo_codigo);
    const gridItem = this._grupoToGrupoGrid(grupo);

    if (gridIndex !== -1) {
      this._dataLoaded[gridIndex] = gridItem;
    } else {
      this._dataLoaded = [gridItem, ...this._dataLoaded];
    }

    this._gridService.setData(this._dataLoaded);
    this._messagesService.addMessage('MESSAGE.successSave', EnumMessageType.Info);
    this.selectedGrupoId = grupo.grupo_codigo;
    this.selectedTabIndex = this.openedGruposId.indexOf(grupo.grupo_codigo);
  }

  onCancel(): void {
    if (this.selectedGrupoId !== 0) {
      this._closeGrupo(this.selectedGrupoId);
    }
  }

  onCloseTab(grupoId: number): void {
    this._closeGrupo(grupoId);
  }

  onClickTab(grupoId: number): void {
    this.selectedGrupoId = grupoId;
    this.selectedTabIndex = this.openedGruposId.indexOf(grupoId);
  }

  getGrupoById(grupoId: number): Grupo | undefined {
    const index = this.openedGruposId.indexOf(grupoId);
    return index !== -1 ? this._openedGrupos[index] : undefined;
  }

  loadGrupos(pageFilter: PageFilter, filterParameters: GrupoFilter): void {
    this._grupoService.getGrupos(pageFilter, filterParameters)
      .pipe(takeUntilDestroyed(this._destroyRef))
      .subscribe({
        next: response => {
          this._dataLoaded = this._pageFilter.page === 1 ? response.data : [...this._dataLoaded, ...response.data];
          this._gridService.setData(this._dataLoaded);
        },
        error: () => {
          this._messagesService.addMessage('Error al cargar grupos', EnumMessageType.Error);
        }
      });
  }

  private _actionNewGrupo(): void {
    const newGrupo = new Grupo();
    newGrupo.grupo_codigo = 0;

    this.openedGruposId.push(0);
    this._openedGrupos.push(newGrupo);
    this.selectedGrupoId = 0;
    this.selectedTabIndex = this.openedGruposId.indexOf(0);
  }

  private _closeGrupo(grupoId: number): void {
    const index = this.openedGruposId.indexOf(grupoId);
    if (index !== -1) {
      this.openedGruposId.splice(index, 1);
      this._openedGrupos.splice(index, 1);
      this.selectedGrupoId = this.openedGruposId.length > 0
        ? this.openedGruposId[Math.max(index - 1, 0)]
        : 0;
    }

    this.selectedTabIndex = this.selectedGrupoId !== 0
      ? this.openedGruposId.indexOf(this.selectedGrupoId)
      : -1;
  }

  private _deleteGrupo(grupo: GrupoGrid): void {
    this._grupoService.deleteGrupo(grupo.grupo_codigo)
      .pipe(takeUntilDestroyed(this._destroyRef))
      .subscribe({
        next: () => {
          this._dataLoaded = this._dataLoaded.filter(item => item.grupo_codigo !== grupo.grupo_codigo);
          this._gridService.setData(this._dataLoaded);
          this._closeGrupo(grupo.grupo_codigo);
          this._messagesService.addMessage('MESSAGE.successDelete', EnumMessageType.Info);
        },
        error: () => {
          this._messagesService.addMessage('Error al eliminar grupo', EnumMessageType.Error);
        }
      });
  }

private _grupoGridToGrupo(grupoGrid: GrupoGrid): Grupo {    
    const grupo = new Grupo();
    grupo.grupo_codigo = grupoGrid.grupo_codigo;
    grupo.grupo_descripcion = grupoGrid.grupo_descripcion;
    grupo.grupo_familiaCodigo = grupoGrid.grupo_familiaCodigo;
    grupo.grupo_isActive = grupoGrid.grupo_isActive;
    return grupo;
  }

  private _grupoToGrupoGrid(grupo: Grupo): GrupoGrid {
    const grupoGrid = new GrupoGrid();
    grupoGrid.grupo_codigo = grupo.grupo_codigo;
    grupoGrid.grupo_descripcion = grupo.grupo_descripcion;
    grupoGrid.grupo_familiaCodigo = grupo.grupo_familiaCodigo;
    grupoGrid.grupo_isActive = grupo.grupo_isActive;
    return grupoGrid;
  }

  private _securityApply(): void {
    const actions = this._permissionsUserService.enabledActions(
      this._authService.getCurrentUser()?.role || EnumUserRole.VIEWER,
      EnumLiteralKeys.eModule_Grupos,
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
          this.config = config.items.find(c => c.literalKey === EnumLiteralKeys.eModule_Grupos) || new ConfigurationItem();
        }
      });
  }

  private _createPageFilter(): void {
    this._pageFilter.page = 1;
    this._pageFilter.pageSize = 15;
    this._pageFilter.sortField = 'grupo_createdAt';
    this._pageFilter.sortDirection = 'desc';
  }

  private _createFilterParameters(): void {
    this.filterParameters = new GrupoFilter();
  }
}
