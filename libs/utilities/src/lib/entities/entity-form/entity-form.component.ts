import { Component, EventEmitter, Input, OnInit, Output, OnDestroy, DestroyRef, inject } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Entity } from '../models/entity.model';

import { ActivatedRoute } from '@angular/router';
import { map } from 'rxjs/operators';
import { Observable, of } from 'rxjs';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { MatButtonModule } from '@angular/material/button';
import { 
  EnumActionsType, 
  GenericActionsComponent, 
  ActionService, 
  GenericFormComponent, 
  Action, 
  MessagesService, 
  EnumMessageType, 
  TranslatePipe, 
  ModalService,
  CONFIRM_CANCEL,
  SkeletonDirective,
  FormValidationsDirective
} from '@lib/shared';
import { EntityService } from '../services/entity.service';
import { HttpErrorResponse } from '@angular/common/http';
import { UrlSecurityService } from '@lib/security';
import { EnumActions } from 'libs/common/src/lib/enums/actions.enum';

@Component({
  selector: 'lfsoft-utilities-entity-form',
  templateUrl: './entity-form.component.html',
  styleUrls: ['./entity-form.component.scss'],
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, GenericFormComponent, 
    GenericActionsComponent, TranslatePipe, MatButtonModule, 
    SkeletonDirective, FormValidationsDirective],
  providers: [ ActionService ]
})
export class EntityFormComponent implements OnInit, OnDestroy {
  @Input() entityId: number = 0;
  @Output() save = new EventEmitter<Entity>();
  @Output() cancel = new EventEmitter<void>();

  isLoading: boolean = true;
  entityForm: FormGroup = new FormGroup({});
  entity: Entity = new Entity();
  drawerOpen = false;
  private readonly _destroyRef = inject(DestroyRef);
  private _operation: any;

  constructor(private fb: FormBuilder, private _entityService: EntityService, private _route: ActivatedRoute, 
              private _actionService: ActionService, private _messagesService: MessagesService, 
              private _modalService: ModalService, private _urlSecurityService: UrlSecurityService ) {    
    this._createForm();
  }
  
  ngOnInit(): void {  
    try {     
      this._loadSecurityActions();
      this._loadData();   
    }
    catch (error) {
      this._messagesService.addMessage('Error loading entity data.', EnumMessageType.Error);
    }
  }

  ngOnDestroy(): void {
    // El DestroyRef se encarga automáticamente de cancelar todas las suscripciones
    // que usen takeUntilDestroyed()
  }

  isReadyToSave(): boolean {
    return this.entityForm.valid && this.entityForm.dirty;
  }

  onAction(action: EnumActionsType | EnumActions): void {
    try {
      switch (action) {
        case EnumActionsType.actionSave:
          this._save();
          break;
        case EnumActionsType.actionCancel:
          this._cancel();          
          break;
        }
    }
    catch (error) {
      this._messagesService.addMessage(error as HttpErrorResponse, EnumMessageType.Error);
    }
  }  

  private _createForm() {
    this.entityForm = this.fb.group({
      description: [null, [Validators.required, Validators.minLength(3)]]
    });
    this.entityForm.statusChanges
      .pipe(takeUntilDestroyed(this._destroyRef))
      .subscribe(() => {
        this._enabledActions();
      });
  }

  private _loadData() {
    this.isLoading = false;
    this._loadParams().subscribe(() => {    
      console.log("operation", this._operation);
                    
      switch (this._operation) {
        case 'open':          
          this._editEntity(this.entityId).subscribe(entity => {
            this._updateEntity(entity);
            this._enabledActions();
          });
          break;
        default: 
          if (this.entityId <= 0) {
            return;
          }
          this._editEntity(this.entityId).subscribe(entity => {                   
            this._updateEntity(entity);
            this._enabledActions();
          });          
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
          
          // Validar que el ID sea seguro
          if (!idParam || !this._urlSecurityService.isValidRouteId(idParam)) {
            console.warn('Security: Invalid entity ID detected:', idParam);
            this._messagesService.addMessage('ID de entidad inválido', EnumMessageType.Error);
            throw new Error('Invalid entity ID');
          }
          
          this.entityId = Number(idParam);          
          return;
        })
      );
    } else {
      return of(void 0);
    }
  }

  private _editEntity(id: number): Observable<Entity> {
    return this._entityService.getEntity(id);
  }

  private _updateEntity(entity: Entity): void {
    this.entity = entity;    
    this.entityForm.patchValue(this.entity, { emitEvent: false });
  }
  
  private _cancel(): void {
    if (!this.entityForm.dirty) {
      this.cancel.emit();   
      return;
    }
      
    this._modalService.showModal(CONFIRM_CANCEL)
      .pipe(takeUntilDestroyed(this._destroyRef))
      .subscribe(action => {          
        if (action === EnumActionsType.actionAccept) {
          this.cancel.emit();         
        } else if (action === EnumActionsType.actionCancel) {
          // Usuario canceló                  
        }
      });   
  }

  private _save(): void {
    try {
      if (!this.entityForm.dirty) {
        return;
      }

      const updatedEntity: Entity = this._mapFormToEntity();
      
      if (!updatedEntity.id) {
        this._entityService.addEntity(updatedEntity).pipe(
          takeUntilDestroyed(this._destroyRef)
        ).subscribe(createdEntity => {
          this.entityForm.markAsPristine();
          this._enabledActions();
          this.save.emit(createdEntity);
        });
      } else {
        this._entityService.updateEntity(updatedEntity).pipe(
          takeUntilDestroyed(this._destroyRef)
        ).subscribe(updatedEntity => {
          this.entityForm.markAsPristine();
          this._enabledActions();
          this.save.emit(updatedEntity);
        }, error => {          
          throw error;
        });
      }
    } catch (error) {      
      throw error;
    }
  }

  //#region Mapping
  private _mapFormToEntity(): Entity {
    const formValues = this.entityForm.value;
    const entity: Entity = {
      id: this.entity.id,
      description: formValues.description
    };
    return entity;
  }
  //#endregion

  //#region Security
  private _loadSecurityActions(): void {
    const actions: Action[] = [
      new Action('BUTTON.save', EnumActionsType.actionSave, 'save', false),
      new Action('BUTTON.cancel', EnumActionsType.actionCancel, 'cancel', false)
    ];
    this._actionService.setActions(actions);
  }
  
  private _enabledActions() {    
    if (this.isReadyToSave()) {
      this._actionService.enable(EnumActionsType.actionSave);
    } else {
      this._actionService.disable(EnumActionsType.actionSave);
    }
  }
  //#endregion
}
