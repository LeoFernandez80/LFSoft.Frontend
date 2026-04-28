import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { EnumLiteralKeys, EnumObjectMode } from '@lib/common';
import { AuthService, EnumUserRole, UserPermissionsService } from '@lib/security';
import { ISectionForm, TranslatePipe } from '@lib/shared';
import { map, Observable, timer } from 'rxjs';
import { Entity } from '../../models/entity.model';

@Component({
  selector: 'app-entity-data-form',
  templateUrl: './entity-data-form.component.html',
  styleUrls: ['./entity-data-form.component.scss'],
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, TranslatePipe]
})
export class EntityDataFormComponent implements OnInit, ISectionForm {
  @Output() dataChange = new EventEmitter<void>();

  @Input() set entity(entity: Entity | undefined) {
    this._entity = entity;
    if (entity) {
      this._updateEntity(entity);
      this.isLoading = false;
    }
  }

  @Input() isLoading: boolean = true;

  entityForm: FormGroup = new FormGroup({});
  hiddenFields: string[] = [];

  private _entity: Entity | undefined;

  get data(): Entity {
    return this._entityFormToEntity();
  }

  get modified(): boolean {
    return this.entityForm.dirty;
  }

  get valid(): boolean {
    return this.entityForm.valid;
  }

  get required(): boolean {
    return false;
  }

  constructor(
    private fb: FormBuilder,
    private _authService: AuthService,
    private _userPermissionsService: UserPermissionsService
  ) {
    this._createForm();
  }

  ngOnInit(): void {
    this._loadHiddenFields().subscribe(() => {
      if (this._entity) {
        this._updateEntity(this._entity);
        this.isLoading = false;
      }
    });
  }

  public isHiddenField(fieldName: string): boolean {
    return this.hiddenFields.includes(fieldName);
  }

  private _loadHiddenFields(): Observable<null> {
    return timer(1).pipe(
      map(() => {
        const userRole = this._authService.getCurrentUser()?.role || EnumUserRole.EMPTY;
        this.hiddenFields = this._userPermissionsService.hideFields(userRole, EnumLiteralKeys.eForm_Entities);
        return null;
      })
    );
  }
    
  private _createForm(): void {
    this.entityForm = this.fb.group({
      entity_description: ['', [Validators.required, Validators.minLength(3)]],
      entity_active: [true]
    });

    this.entityForm.valueChanges.subscribe(() => {
      this.dataChange.emit();
    });
  }

  private _entityFormToEntity(): Entity {
    const formValue = this.entityForm.value;
    this._entity = { ...this._entity, ...formValue } as Entity;
    return this._entity;
  }

  private _updateEntity(entity: Entity): void {
    this.entityForm.patchValue(entity, { emitEvent: false });
    this.entityForm.disable();
    if (entity.objectMode !== EnumObjectMode.READONLY) {
      this.entityForm.enable();
    }
    this.entityForm.markAsPristine();
  }
}