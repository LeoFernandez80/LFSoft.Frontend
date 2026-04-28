import { NgFor } from '@angular/common';
import { Component, DestroyRef, OnDestroy, OnInit, inject } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { MatIconModule } from '@angular/material/icon';
import { MatTabsModule } from '@angular/material/tabs';
import { Router } from '@angular/router';
import { EnumActions } from '@lib/common';
import {
  Action,
  ActionService,
  CONFIRM_DELETE,
  EnumActionsType,
  EnumMessageType,
  GenericActionsComponent,
  GenericLayoutComponent,
  GenericMessageComponent,
  GridService,
  MessagesService,
  ModalService,
  PageFilter,
  TranslatePipe
} from '@lib/shared';
import { EntityFormComponent } from '../entity-form/entity-form.component';
import { HTTPServiceEntity } from '../services/entity.service';
import { EntityFilter } from '../models/entity-filter.model';
import { EntityGrid } from '../models/entity-grid.model';
import { Entity } from '../models/entity.model';
import { EntityGridComponent } from './entity-grid/entity-grid.component';
import { EntityGridFilterComponent } from './entity-grid-filter/entity-grid-filter.component';

@Component({
  selector: 'app-entities-container',
  templateUrl: './entities-container.component.html',
  styleUrls: ['./entities-container.component.scss'],
  standalone: true,
  imports: [
    NgFor,
    MatTabsModule,
    MatIconModule,
    TranslatePipe,
    GenericLayoutComponent,
    GenericMessageComponent,
    GenericActionsComponent,
    EntityGridFilterComponent,
    EntityGridComponent,
    EntityFormComponent
  ],
  providers: [Router, MessagesService, GridService]
})
export class EntitiesContainerComponent implements OnInit, OnDestroy {
  openedEntitiesId: number[] = [];
  selectedEntityId: number = 0;
  selectedTabIndex: number = -1;
  filterParameters: EntityFilter = new EntityFilter();

  private _dataLoaded: EntityGrid[] = [];
  private _openedEntities: Entity[] = [];
  private _pageFilter: PageFilter = new PageFilter();
  private readonly _destroyRef = inject(DestroyRef);

  constructor(
    private _router: Router,
    private _entityService: HTTPServiceEntity,
    private _gridService: GridService<EntityGrid>,
    private _messagesService: MessagesService,
    private _actionService: ActionService,
    private _modalService: ModalService
  ) {
    this._createPageFilter();
    this._createFilterParameters();
    this._loadActions();
  }

  ngOnInit(): void {
    this.loadEntities(this._pageFilter, this.filterParameters);
  }

  ngOnDestroy(): void {}

  onSortChange(pageFilter: PageFilter): void {
    this._dataLoaded = [];
    this._pageFilter.page = 1;
    this._pageFilter.sortDirection = pageFilter.sortDirection;
    this._pageFilter.sortField = pageFilter.sortField;
    this.loadEntities(this._pageFilter, this.filterParameters);
  }

  onLoadNextPage(): void {
    this._pageFilter.page += 1;
    this.loadEntities(this._pageFilter, this.filterParameters);
  }

  onFilterApplied(filter: EntityFilter): void {
    this._dataLoaded = [];
    this._pageFilter.page = 1;
    this.filterParameters = filter;
    this.loadEntities(this._pageFilter, this.filterParameters);
  }

  onAction(action: EnumActionsType | EnumActions): void {
    if (action === EnumActions.eAction_New) {
      this._actionNewEntity();
    }
  }

  onEdit(entity: EntityGrid): void {
    if (this.openedEntitiesId.includes(entity.entity_id)) {
      this.selectedEntityId = entity.entity_id;
      this.selectedTabIndex = this.openedEntitiesId.indexOf(entity.entity_id);
      return;
    }

    this._entityService.getEntity(entity.entity_id)
      .pipe(takeUntilDestroyed(this._destroyRef))
      .subscribe({
        next: fullEntity => {
          this.openedEntitiesId.push(fullEntity.entity_id);
          this._openedEntities.push(fullEntity);
          this.selectedEntityId = fullEntity.entity_id;
          this.selectedTabIndex = this.openedEntitiesId.indexOf(fullEntity.entity_id);
        },
        error: () => {
          this._messagesService.addMessage('Error al cargar entidad', EnumMessageType.Error);
        }
      });
  }

  onDeleteEntity(entity: EntityGrid): void {
    this._modalService.showModal(CONFIRM_DELETE)
      .pipe(takeUntilDestroyed(this._destroyRef))
      .subscribe(action => {
        if (action === EnumActionsType.actionAccept) {
          this._deleteEntity(entity);
        }
      });
  }

  onOpenEntity(entity: EntityGrid): void {
    const url = this._router.serializeUrl(
      this._router.createUrlTree(['entities-module', 'entities', 'open'], { queryParams: { id: entity.entity_id } })
    );
    window.open(url, '_blank');
  }

  onSaveEntity(entity: Entity): void {
    const openedIndex = this.openedEntitiesId.indexOf(entity.entity_id);
    if (openedIndex !== -1) {
      this._openedEntities[openedIndex] = entity;
      this.openedEntitiesId[openedIndex] = entity.entity_id;
    } else {
      this.openedEntitiesId.push(entity.entity_id);
      this._openedEntities.push(entity);
    }

    const gridIndex = this._dataLoaded.findIndex(item => item.entity_id === entity.entity_id);
    if (gridIndex !== -1) {
      this._dataLoaded[gridIndex] = this._mapEntityToGrid(entity);
    } else {
      this._dataLoaded = [this._mapEntityToGrid(entity), ...this._dataLoaded];
    }

    this._gridService.setData(this._dataLoaded);
    this._messagesService.addMessage('MESSAGE.successSave', EnumMessageType.Info);
    this.selectedEntityId = entity.entity_id;
    this.selectedTabIndex = this.openedEntitiesId.indexOf(entity.entity_id);
  }

  onCancelEntity(): void {
    if (this.selectedEntityId !== null) {
      this._closeEntity(this.selectedEntityId);
    }
  }

  onCloseTab(entityId: number): void {
    this._closeEntity(entityId);
  }

  onClickTab(entityId: number): void {
    this.selectedEntityId = entityId;
    this.selectedTabIndex = this.openedEntitiesId.indexOf(entityId);
  }

  getEntityById(entityId: number): Entity | undefined {
    const index = this.openedEntitiesId.indexOf(entityId);
    return index !== -1 ? this._openedEntities[index] : undefined;
  }

  loadEntities(pageFilter: PageFilter, filterParameters: EntityFilter): void {
    this._entityService.getEntities(pageFilter, filterParameters)
      .pipe(takeUntilDestroyed(this._destroyRef))
      .subscribe({
        next: response => {
          this._dataLoaded = this._pageFilter.page === 1 ? response.data : [...this._dataLoaded, ...response.data];
          this._gridService.setData(this._dataLoaded);
        },
        error: () => {
          this._messagesService.addMessage('Error al cargar entidades', EnumMessageType.Error);
        }
      });
  }

  private _actionNewEntity(): void {
    const newEntity = new Entity();
    newEntity.entity_id = 0;
    newEntity.entity_description = 'Nueva entidad';

    this.openedEntitiesId.push(0);
    this._openedEntities.push(newEntity);
    this.selectedEntityId = 0;
    this.selectedTabIndex = this.openedEntitiesId.indexOf(0);
  }

  private _closeEntity(entityId: number): void {
    const index = this.openedEntitiesId.indexOf(entityId);
    if (index !== -1) {
      this.openedEntitiesId.splice(index, 1);
      this._openedEntities.splice(index, 1);

      if (this.openedEntitiesId.length > 0) {
        this.selectedEntityId = this.openedEntitiesId[Math.max(index - 1, 0)];
      } else {
        this.selectedEntityId = 0;
      }
    }

    this.selectedTabIndex = this.selectedEntityId !== null ? this.openedEntitiesId.indexOf(this.selectedEntityId) : -1;
  }

  private _deleteEntity(entity: EntityGrid): void {
    this._entityService.deleteEntity(entity.entity_id)
      .pipe(takeUntilDestroyed(this._destroyRef))
      .subscribe({
        next: () => {
          this._dataLoaded = this._dataLoaded.filter(item => item.entity_id !== entity.entity_id);
          this._gridService.setData(this._dataLoaded);
          this._closeEntity(entity.entity_id);
          this._messagesService.addMessage('MESSAGE.successDelete', EnumMessageType.Info);
        },
        error: () => {
          this._messagesService.addMessage('Error al eliminar entidad', EnumMessageType.Error);
        }
      });
  }

  private _createFilterParameters(): void {
    this.filterParameters = new EntityFilter();
  }

  private _createPageFilter(): void {
    this._pageFilter = new PageFilter();
  }

  private _loadActions(): void {
    this._actionService.setActions([
      new Action('BUTTON.new', EnumActions.eAction_New, 'add', false)
    ]);
  }

  private _mapEntityToGrid(entity: Entity): EntityGrid {
    const entityGrid = new EntityGrid();
    entityGrid.entity_id = entity.entity_id;
    entityGrid.entity_description = entity.entity_description;
    entityGrid.entity_active = entity.entity_active;
    return entityGrid;
  }
}