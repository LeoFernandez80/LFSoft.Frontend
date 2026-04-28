import { CommonModule } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import { Component, DestroyRef, EventEmitter, Input, OnDestroy, OnInit, Output, ViewChild, inject } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { EnumActions, EnumObjectMode } from '@lib/common';
import {
  Action,
  ActionService,
  CONFIRM_CANCEL,
  EnumActionsType,
  EnumMessageType,
  GenericActionsComponent,
  GenericFormComponent,
  ISectionForm,
  MessagesService,
  ModalService,
  TranslatePipe
} from '@lib/shared';
import { UrlSecurityService } from '@lib/security';
import { Observable, map, of } from 'rxjs';
import { Entity } from '../models/entity.model';
import { HTTPServiceEntity } from '../services/entity.service';
import { EntityDataFormComponent } from './entity-data-form/entity-data-form.component';

@Component({
  selector: 'app-entity-form',
  templateUrl: './entity-form.component.html',
  styleUrls: ['./entity-form.component.scss'],
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    GenericFormComponent,
    GenericActionsComponent,
    TranslatePipe,
    EntityDataFormComponent
  ],
  providers: [ActionService]
})
export class EntityFormComponent implements OnInit, OnDestroy {
  @ViewChild('formEntityData') formEntityData!: ISectionForm;

  @Input() set entity(entity: number | Entity) {
    if (entity instanceof Entity) {
      this.entityData = entity;
    } else {
      this._entityId = entity;
    }
  }

  @Output() save = new EventEmitter<Entity>();
  @Output() cancel = new EventEmitter<void>();

  entityData: Entity | undefined = undefined;

  private _entityId: number = 0;
  private _operation: string | undefined;
  private readonly _destroyRef = inject(DestroyRef);

  constructor(
    private _entityService: HTTPServiceEntity,
    private _route: ActivatedRoute,
    private _actionService: ActionService,
    private _messagesService: MessagesService,
    private _modalService: ModalService,
    private _urlSecurityService: UrlSecurityService
  ) {}

  ngOnInit(): void {
    this._loadActions();
    this._loadData();
  }

  ngOnDestroy(): void {}

  isReadyToSave(): boolean {
    return !!this.entityData && this.entityData.objectMode !== EnumObjectMode.READONLY && this.formEntityData?.valid && this.formEntityData?.modified;
  }

  onEntityDataChange(): void {
    this._enabledActions();
  }

  onAction(action: EnumActionsType | EnumActions): void {
    try {
      switch (action) {
        case EnumActions.eAction_Save:
          this._save();
          break;
        case EnumActions.eAction_Cancel:
          this._cancel();
          break;
      }
    } catch (error) {
      this._messagesService.addMessage(error as HttpErrorResponse, EnumMessageType.Error);
    }
  }

  private _cancel(): void {
    if (!this.formEntityData?.modified) {
      this.cancel.emit();
      return;
    }

    this._modalService.showModal(CONFIRM_CANCEL)
      .pipe(takeUntilDestroyed(this._destroyRef))
      .subscribe(action => {
        if (action === EnumActionsType.actionAccept) {
          this.cancel.emit();
        }
      });
  }

  private _createEntityRequest(): Entity {
    const formValues = this.formEntityData.data as Entity;
    return { ...this.entityData, ...formValues } as Entity;
  }

  private _enabledActions(): void {
    if (this.isReadyToSave()) {
      this._actionService.enable(EnumActions.eAction_Save);
    } else {
      this._actionService.disable(EnumActions.eAction_Save);
    }
  }

  private _loadActions(): void {
    this._actionService.setActions([
      new Action('BUTTON.save', EnumActions.eAction_Save, 'save', true),
      new Action('BUTTON.cancel', EnumActions.eAction_Cancel, 'cancel', false)
    ]);
  }

  private _loadData(): void {
    this._loadParams().subscribe(() => {
      if (this._entityId) {
        this._entityService.getEntity(this._entityId)
          .pipe(takeUntilDestroyed(this._destroyRef))
          .subscribe({
            next: entity => {
              entity.objectMode = EnumObjectMode.EDITABLE;
              this.entityData = entity;
              this._enabledActions();
            },
            error: () => {
              this._messagesService.addMessage('Error al cargar entidad', EnumMessageType.Error);
            }
          });
      } else {
        const newEntity = new Entity();
        newEntity.objectMode = EnumObjectMode.NEW;
        this.entityData = newEntity;
        this._enabledActions();
      }
    });
  }

  private _loadParams(): Observable<void> {
    this._operation = this._route.snapshot.data['operation'];
    if (this._operation === 'open') {
      return this._route.queryParamMap.pipe(
        takeUntilDestroyed(this._destroyRef),
        map(params => {
          const idParam = params.get('id');
          if (!idParam || !this._urlSecurityService.isValidRouteId(idParam)) {
            this._messagesService.addMessage('ID de entidad inválido', EnumMessageType.Error);
            throw new Error('Invalid entity ID');
          }

          this._entityId = Number(idParam);
          return;
        })
      );
    }

    return of(void 0);
  }

  private _save(): void {
    if (!this.formEntityData?.modified) {
      return;
    }

    const updatedEntity = this._createEntityRequest();
    const saveOperation = !updatedEntity.entity_id
      ? this._entityService.createEntity(updatedEntity)
      : this._entityService.updateEntity(updatedEntity);

    saveOperation
      .pipe(takeUntilDestroyed(this._destroyRef))
      .subscribe({
        next: savedEntity => {
          savedEntity.objectMode = EnumObjectMode.EDITABLE;
          this.entityData = savedEntity;
          this.save.emit(savedEntity);
          this._enabledActions();
        },
        error: () => {
          this._messagesService.addMessage('Error al guardar entidad', EnumMessageType.Error);
        }
      });
  }
}