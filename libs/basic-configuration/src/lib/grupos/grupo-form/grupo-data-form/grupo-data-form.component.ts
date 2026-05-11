import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { EnumLiteralKeys, EnumObjectMode } from '@lib/common';
import { AuthService, EnumUserRole, UserPermissionsService } from '@lib/security';
import { ISectionForm, TranslatePipe } from '@lib/shared';
import { map, Observable, timer } from 'rxjs';
import { Grupo } from '../../models/grupo.model';

@Component({
  selector: 'app-grupo-data-form',
  templateUrl: './grupo-data-form.component.html',
  styleUrls: ['./grupo-data-form.component.scss'],
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, TranslatePipe]
})
export class GrupoDataFormComponent implements OnInit, ISectionForm {
  @Output() dataChange = new EventEmitter<void>();

  @Input() set grupo(grupo: Grupo | undefined) {
    this._grupo = grupo;
    if (grupo) {
      this._updateGrupo(grupo);
      this.isLoading = false;
    }
  }

  @Input() isLoading: boolean = true;

  grupoForm: FormGroup = new FormGroup({});
  hiddenFields: string[] = [];

  private _grupo: Grupo | undefined;

  get data(): Grupo {
    return this._grupoFormToGrupo();
  }

  get modified(): boolean {
    return this.grupoForm.dirty;
  }

  get valid(): boolean {
    return this.grupoForm.valid;
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
      if (this._grupo) {
        this._updateGrupo(this._grupo);
        this.isLoading = false;
      }
    });
  }

  isHiddenField(fieldName: string): boolean {
    return this.hiddenFields.includes(fieldName);
  }

  private _loadHiddenFields(): Observable<null> {
    return timer(1).pipe(
      map(() => {
        const userRole = this._authService.getCurrentUser()?.role || EnumUserRole.EMPTY;
        this.hiddenFields = this._userPermissionsService.hideFields(userRole, EnumLiteralKeys.eForm_Grupo);
        return null;
      })
    );
  }

  private _createForm(): void {
    this.grupoForm = this.fb.group({
      grupo_codigo: [0],
      grupo_descripcion: ['', [Validators.required, Validators.maxLength(30)]],
      grupo_familiaCodigo: [0, [Validators.required, Validators.min(1)]],
      grupo_isActive: [true]
    });

    this.grupoForm.valueChanges.subscribe(() => {
      this.dataChange.emit();
    });
  }

  private _grupoFormToGrupo(): Grupo {
    this._grupo = { ...this._grupo, ...this.grupoForm.value } as Grupo;
    return this._grupo;
  }

  private _updateGrupo(grupo: Grupo): void {
    this.grupoForm.patchValue(grupo, { emitEvent: false });
    this.grupoForm.disable();

    if (grupo.objectMode !== EnumObjectMode.READONLY) {
      this.grupoForm.enable();
    }

    this.grupoForm.markAsPristine();
  }
}
