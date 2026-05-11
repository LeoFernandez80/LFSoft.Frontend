import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { EnumLiteralKeys, EnumObjectMode } from '@lib/common';
import { AuthService, EnumUserRole, UserPermissionsService } from '@lib/security';
import { ISectionForm, TranslatePipe } from '@lib/shared';
import { map, Observable, timer } from 'rxjs';
import { UnidadMedida } from '../../models/unidad-medida.model';

@Component({
  selector: 'app-unidad-medida-data-form',
  templateUrl: './unidad-medida-data-form.component.html',
  styleUrls: ['./unidad-medida-data-form.component.scss'],
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, TranslatePipe]
})
export class UnidadMedidaDataFormComponent implements OnInit, ISectionForm {
  @Output() dataChange = new EventEmitter<void>();

  @Input() set unidadMedida(unidadMedida: UnidadMedida | undefined) {
    this._unidadMedida = unidadMedida;
    if (unidadMedida) {
      console.log('UnidadMedidaDataFormComponent UnidadMedida:', unidadMedida);
      this._updateUnidadMedida(unidadMedida);
      this.isLoading = false;
    }
  }

  @Input() isLoading: boolean = true;

  unidadMedidaForm: FormGroup = new FormGroup({});
  hiddenFields: string[] = [];

  private _unidadMedida: UnidadMedida | undefined;

  get data(): UnidadMedida {
    return this._unidadMedidaFormToModel();
  }

  get modified(): boolean {
    return this.unidadMedidaForm.dirty;
  }

  get valid(): boolean {
    return this.unidadMedidaForm.valid;
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
      if (this._unidadMedida) {
        this._updateUnidadMedida(this._unidadMedida);
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
      this.hiddenFields = this._userPermissionsService.hideFields(userRole, EnumLiteralKeys.eForm_UnidadesMedida);
      return null;
    }));
  }

  private _createForm(): void {
    this.unidadMedidaForm = this.fb.group({
      unidadMedida_codigo: [null],
      unidadMedida_descripcion: ['', [Validators.required, Validators.minLength(2)]],
      unidadMedida_abreviatura: ['', [Validators.required, Validators.maxLength(10)]],
      unidadMedida_activo: [true]
    });

    this.unidadMedidaForm.valueChanges.subscribe(() => {
      this.dataChange.emit();
    });
  }

  private _unidadMedidaFormToModel(): UnidadMedida {
    this._unidadMedida = { ...this._unidadMedida, ...this.unidadMedidaForm.value } as UnidadMedida;
    return this._unidadMedida;
  }

  private _updateUnidadMedida(unidadMedida: UnidadMedida): void {
    this.unidadMedidaForm.patchValue(unidadMedida, { emitEvent: false });
    this.unidadMedidaForm.disable();

    if (unidadMedida.objectMode !== EnumObjectMode.READONLY) {
      this.unidadMedidaForm.enable();
    }

    this.unidadMedidaForm.markAsPristine();
  }
}
