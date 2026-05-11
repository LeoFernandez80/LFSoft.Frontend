import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { EnumLiteralKeys, EnumObjectMode } from '@lib/common';
import { AuthService, EnumUserRole, UserPermissionsService } from '@lib/security';
import { ISectionForm, TranslatePipe } from '@lib/shared';
import { map, Observable, timer } from 'rxjs';
import { AlicuotaIva } from '../../models/alicuota-iva.model';

@Component({
  selector: 'app-alicuota-iva-data-form',
  templateUrl: './alicuota-iva-data-form.component.html',
  styleUrls: ['./alicuota-iva-data-form.component.scss'],
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, TranslatePipe]
})
export class AlicuotaIvaDataFormComponent implements OnInit, ISectionForm {
  @Output() dataChange = new EventEmitter<void>();

  @Input() set alicuotaIva(alicuotaIva: AlicuotaIva | undefined) {
    this._alicuotaIva = alicuotaIva;
    if (alicuotaIva) { this._updateAlicuotaIva(alicuotaIva); this.isLoading = false; }
  }
  @Input() isLoading: boolean = true;

  alicuotaIvaForm: FormGroup = new FormGroup({});
  hiddenFields: string[] = [];

  private _alicuotaIva: AlicuotaIva | undefined;

  get data(): AlicuotaIva { return this._formToAlicuotaIva(); }
  get modified(): boolean { return this.alicuotaIvaForm.dirty; }
  get valid(): boolean { return this.alicuotaIvaForm.valid; }
  get required(): boolean { return false; }

  constructor(
    private fb: FormBuilder,
    private _authService: AuthService,
    private _userPermissionsService: UserPermissionsService
  ) { this._createForm(); }

  ngOnInit(): void {
    this._loadHiddenFields().subscribe(() => {
      if (this._alicuotaIva) { this._updateAlicuotaIva(this._alicuotaIva); this.isLoading = false; }
    });
  }

  isHiddenField(fieldName: string): boolean { return this.hiddenFields.includes(fieldName); }

  private _loadHiddenFields(): Observable<null> {
    return timer(1).pipe(map(() => {
      const userRole = this._authService.getCurrentUser()?.role || EnumUserRole.EMPTY;
      this.hiddenFields = this._userPermissionsService.hideFields(userRole, EnumLiteralKeys.eForm_AlicuotaIva);
      return null;
    }));
  }

  private _createForm(): void {
    this.alicuotaIvaForm = this.fb.group({
      alicuotaIva_codigo: [null],
      alicuotaIva_descripcion: ['', [Validators.required, Validators.minLength(3)]],
      alicuotaIva_tasa: [0, [Validators.required, Validators.min(0)]]
    });
    this.alicuotaIvaForm.valueChanges.subscribe(() => { this.dataChange.emit(); });
  }

  private _formToAlicuotaIva(): AlicuotaIva {
    this._alicuotaIva = { ...this._alicuotaIva, ...this.alicuotaIvaForm.value } as AlicuotaIva;
    return this._alicuotaIva!;
  }

  private _updateAlicuotaIva(alicuotaIva: AlicuotaIva): void {
    this.alicuotaIvaForm.patchValue(alicuotaIva, { emitEvent: false });
    this.alicuotaIvaForm.disable();
    if (alicuotaIva.objectMode !== EnumObjectMode.READONLY) { this.alicuotaIvaForm.enable(); }
    this.alicuotaIvaForm.markAsPristine();
  }
}
