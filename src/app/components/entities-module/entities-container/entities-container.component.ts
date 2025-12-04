import { Component, OnInit, OnDestroy, DestroyRef, inject } from '@angular/core';
import { EntityGridFilterComponent } from './entity-grid-filter/entity-grid-filter.component';
import { EntityGridComponent } from './entity-grid/entity-grid.component';
import { EntityFormComponent } from '../entity-form/entity-form.component';
import { EntityGrid } from '../models/entity-grid.model';
import { Entity } from '../models/entity.model';
import { ActivatedRoute, Router } from '@angular/router';
import { MatTabsModule } from '@angular/material/tabs';
import { AsyncPipe, NgFor } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { EntityFilter } from '../models/entity-filter.model';
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
import { EntityService } from '../services/entity.service';
import { ModalService } from '../../../generic/generic-modal/services/modal.service';
import { CONFIRM_DELETE } from '../../../generic/generic-modal/models/modal-messages';
import { TranslatePipe } from '../../../generic/generic-translate/translate.pipe';

@Component({
  selector: 'app-entities-container',
  templateUrl: './entities-container.component.html',
  styleUrls: ['./entities-container.component.scss'],
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
    EntityGridFilterComponent,
    EntityGridComponent,
    EntityFormComponent,
  ],
  providers: [Router,  GridService, ActionService]
})
export class EntitiesContainerComponent implements OnInit, OnDestroy {
  openedEntitiesId: number[] = [];
  selectedEntityId: number | null = null;
  filterParameters: EntityFilter = new EntityFilter();
  
  private _dataLoaded: EntityGrid[] = [];
  private _openedEntities: Entity[] = [];
  private _pageFilter: PageFilter = new PageFilter();
  private readonly _destroyRef = inject(DestroyRef);

  constructor(private _router: Router, 
    private _entityService: EntityService, private _gridService: GridService<EntityGrid>, 
    private _messagesService: MessagesService, private _actionService: ActionService,
    private _modalService: ModalService
  ) {
    this._createPageFilter();
    this._createFilterParameters();
  }

  ngOnInit(): void {
    try {
      this._loadSecurityActions();
      this.loadEntities(this._pageFilter, this.filterParameters);
    } catch (error) {
      this._messagesService.addMessage("Error al cargar la página", EnumMessageType.Error);
    }
  }

  ngOnDestroy(): void {
    // El DestroyRef se encarga automáticamente de cancelar todas las suscripciones
    // que usen takeUntilDestroyed()
  }

  onFilterApplied(filter: EntityFilter): void {
    try {   
      this._dataLoaded = [];   
      this._pageFilter.page = 1;
      this.filterParameters = filter;
      this.loadEntities(this._pageFilter, this.filterParameters);
    } catch (error) {
      this._messagesService.addMessage("Error al aplicar filtro", EnumMessageType.Error);
    }
  }

  onSortChange(pageFilter: PageFilter): void {
    try {      
      this._pageFilter.sortDirection=pageFilter.sortDirection;
      this._pageFilter.sortField=pageFilter.sortField;
      this.loadEntities(this._pageFilter, this.filterParameters);
    } catch (error) {
      this._messagesService.addMessage("ERROR.", EnumMessageType.Error);
    }
  }

  onLoadNextPage(): void {
    try {
      this._pageFilter.page += 1;
      this.loadEntities(this._pageFilter, this.filterParameters);
    } catch (error) {
      this._messagesService.addMessage("Error al cargar la siguiente página", EnumMessageType.Error);
    }
  }

  onAction(action: EnumActionsType): void {
    switch (action) {
      case EnumActionsType.actionNew:
        try {
          this._createEntity();
        } catch (error) {
          this._messagesService.addMessage("Error al crear entidad", EnumMessageType.Error);
        }
        break;
      case EnumActionsType.actionList:
        try {
          this.openedEntitiesId = [];
          this._openedEntities = [];
          this.selectedEntityId = null;
          this._messagesService.addMessage("Generando listado", EnumMessageType.Error);
        } catch (error) {
          this._messagesService.addMessage("Error al cerrar pestañas", EnumMessageType.Error);
        }
    }
  }

  onEdit(entity: EntityGrid): void {
    try {
      if (this.openedEntitiesId.includes(entity.id)) {
        this.selectedEntityId = entity.id;
        return;
      }
      
      this._entityService.getEntity(entity.id)
        .pipe(takeUntilDestroyed(this._destroyRef))
        .subscribe({
          next: (fullEntity) => {
            this.openedEntitiesId.push(entity.id);
            this._openedEntities.push(fullEntity);
            this.selectedEntityId = entity.id;
          },
          error: () => {
            this._messagesService.addMessage("Error al cargar entidad", EnumMessageType.Error);
          }
        });
    } catch (error) {
      this._messagesService.addMessage("Error al editar entidad", EnumMessageType.Error);
    }
  }

  onDeleteEntity(entity: EntityGrid): void {
    try { 
      this._modalService.showModal(CONFIRM_DELETE)
        .pipe(takeUntilDestroyed(this._destroyRef))
        .subscribe(action => {          
          if (action === EnumActionsType.actionAccept) {
            this._deleteEntity(entity);
          } 
        });      
    } catch (error) {
      this._messagesService.addMessage("Error al eliminar entidad", EnumMessageType.Error);
    }
  }
  
  onOpenEntity(entity: EntityGrid): void {
    try {      
      this._openEntity(entity);
    } catch (error) {
      this._messagesService.addMessage("Error al abrir entidad en nueva pestaña", EnumMessageType.Error);
    }
  }

  onCloseTab(entityId: number): void {
    try {
      this._closeEntity(entityId);
    } catch (error) {
      this._messagesService.addMessage("Error al cerrar pestaña", EnumMessageType.Error);
    }
  }

  onSaveEntity(entity: Entity): void {
    try {
      const index = this.openedEntitiesId.indexOf(entity.id);
      if (index !== -1) {
        this._openedEntities[index] = entity;
      }
      const indexData = this._dataLoaded.findIndex(e => e.id === entity.id);
      if (indexData !== -1) {
        this._dataLoaded[indexData] = this._mapEntityToGrid(entity);
      }
      this._gridService.setData(this._dataLoaded);

      this._messagesService.addMessage("MESSAGE.successSave", EnumMessageType.Info);
      //this.loadEntities(this._pageFilter, this.filterParameters);
      //this.onCloseTab(entity.id);
    } catch (error) {
      this._messagesService.addMessage("Error al guardar entidad", EnumMessageType.Error);
    }
  }

  onCancelEntity(): void {
    try {
      if (this.selectedEntityId !== null) {
        this._closeEntity(this.selectedEntityId);
      }
    } catch (error) {
      this._messagesService.addMessage("Error al cancelar", EnumMessageType.Error);
    }
  }

  loadEntities(pageFilter: PageFilter, filterParameters: EntityFilter): void {
    this._entityService.getEntities(pageFilter, filterParameters)
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

  private _mapEntityToGrid(entity: Entity): EntityGrid {
    const entityGrid = new EntityGrid();
    entityGrid.id = entity.id;
    entityGrid.description = entity.description;
    return entityGrid;
  }

  private _closeEntity(entityId: number): void {
    const index = this.openedEntitiesId.indexOf(entityId);
    if (index !== -1) {
      this.openedEntitiesId.splice(index, 1);
      this._openedEntities.splice(index, 1);
      
      if (this.openedEntitiesId.length > 0) {
        this.selectedEntityId = this.openedEntitiesId[Math.max(index - 1, 0)];
      } else {
        this.selectedEntityId = null;
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
    this.filterParameters = new EntityFilter();
  }

  private _createEntity(): void {
    const entity = new Entity();
    entity.id = 0;
    entity.description = 'Nueva Entidad';
    
    this.openedEntitiesId.push(0);
    this._openedEntities.push(entity);
    this.selectedEntityId = 0;
  }

  getEntityById(entityId: number): Entity | undefined {
    const index = this.openedEntitiesId.indexOf(entityId);
    return index !== -1 ? this._openedEntities[index] : undefined;
  }

  private _deleteEntity(entity: EntityGrid): void {
    this._entityService.deleteEntity(entity.id)
      .pipe(takeUntilDestroyed(this._destroyRef))
      .subscribe({
        next: () => {
          this._messagesService.addMessage("MESSAGE.successDelete", EnumMessageType.Info);
          this.loadEntities(this._pageFilter, this.filterParameters);
        },
        error: (error) => {
          this._messagesService.addMessage(error, EnumMessageType.Error);
        }
      });
  }

  private _openEntity(entity: EntityGrid): void {
    try {
      const url = this._router.serializeUrl(
        this._router.createUrlTree(['entities-module', 'entities', 'open'], { queryParams: { id: entity.id } })
      );
      window.open(url, '_blank');
    } catch (error) {
      this._messagesService.addMessage("Error al abrir entidad en nueva pestaña", EnumMessageType.Error);
    }
  }

  private _loadSecurityActions(): void {
    const actions: Action[] = [
      new Action('BUTTON.new', EnumActionsType.actionNew, 'add', false),
      new Action('BUTTON.lists', EnumActionsType.actionList, 'list', false),
    ];
    this._actionService.setActions(actions);
  }
}