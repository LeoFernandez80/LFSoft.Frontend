import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { EnumLiteralKeys, EnumObjectMode } from '@lib/common';
import { AuthService, EnumUserRole, UserPermissionsService } from '@lib/security';
import { ISectionForm, TranslatePipe } from '@lib/shared';
import { map, Observable, timer } from 'rxjs';
import { Actividad } from '../../models/actividad.model';

@Component({
  selector: 'app-actividad-data-form',
  templateUrl: './actividad-data-form.component.html',
  styleUrls: ['./actividad-data-form.component.scss'],
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, TranslatePipe]
})
export class ActividadDataFormComponent implements OnInit, ISectionForm {
  @Output() dataChange = new EventEmitter<void>();

  @Input() set actividad(actividad: Actividad | undefined) {
    this._actividad = actividad;
    if (actividad) {
      this._updateActividad(actividad);
      this.isLoading = false;
    }
  }
  @Input() isLoading: boolean = true;

  actividadForm: FormGroup = new FormGroup({});
  hiddenFields: string[] = [];

  private _actividad: Actividad | undefined;

  get data(): Actividad { return this._actividadFormToActividad(); }
  get modified(): boolean { return this.actividadForm.dirty; }
  get valid(): boolean { return this.actividadForm.valid; }
  get required(): boolean { return false; }

  constructor(
    private fb: FormBuilder,
    private _authService: AuthService,
    private _userPermissionsService: UserPermissionsService
  ) {
    this._createForm();
  }

  ngOnInit(): void {
    this._loadHiddenFields().subscribe(() => {
      if (this._actividad) {
        this._updateActividad(this._actividad);
        this.isLoading = false;
      }
    });
  }

  isHiddenField(fieldName: string): boolean {
    return this.hiddenFields.includes(fieldName);
  }

  private _loadHiddenFields(): Observable<null> {
    return timer(1).pipe(map(() => {
      const userRole = this._authService.getCurrentUser()?.role || EnumUserRole.EMPTY;
      this.hiddenFields = this._userPermissionsService.hideFields(userRole, EnumLiteralKeys.eForm_Actividad);
      return null;
    }));
  }

  private _createForm(): void {
    this.actividadForm = this.fb.group({
      actividad_codigo: ['', [Validators.required, Validators.maxLength(6)]],
      actividad_descripcion: ['', [Validators.required, Validators.maxLength(120)]],
      actividad_colorHojaRGB: [0, [Validators.required, Validators.min(0)]]
    });

    this.actividadForm.valueChanges.subscribe(() => {
      this.dataChange.emit();
    });
  }

  private _actividadFormToActividad(): Actividad {
    this._actividad = { ...this._actividad, ...this.actividadForm.value } as Actividad;
    return this._actividad;
  }

  private _updateActividad(actividad: Actividad): void {
    this.actividadForm.patchValue(actividad, { emitEvent: false });
    this.actividadForm.disable();
    if (actividad.objectMode !== EnumObjectMode.READONLY) {
      this.actividadForm.enable();
    }
    this.actividadForm.markAsPristine();
  }
}
