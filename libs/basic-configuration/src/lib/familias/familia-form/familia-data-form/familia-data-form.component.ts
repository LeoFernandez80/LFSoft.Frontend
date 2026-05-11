import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { EnumLiteralKeys, EnumObjectMode } from '@lib/common';
import { AuthService, EnumUserRole, UserPermissionsService } from '@lib/security';
import { ISectionForm, TranslatePipe } from '@lib/shared';
import { map, Observable, timer } from 'rxjs';
import { Familia } from '../../models/familia.model';

@Component({
  selector: 'app-familia-data-form',
  templateUrl: './familia-data-form.component.html',
  styleUrls: ['./familia-data-form.component.scss'],
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, TranslatePipe]
})
export class FamiliaDataFormComponent implements OnInit, ISectionForm {
  @Output() dataChange = new EventEmitter<void>();

  @Input() set familia(familia: Familia | undefined) {
    this._familia = familia;
    if (familia) {
      this._updateFamilia(familia);
      this.isLoading = false;
    }
  }

  @Input() isLoading: boolean = true;

  familiaForm: FormGroup = new FormGroup({});
  hiddenFields: string[] = [];

  private _familia: Familia | undefined;

  get data(): Familia { return this._familiaFormToFamilia(); }
  get modified(): boolean { return this.familiaForm.dirty; }
  get valid(): boolean { return this.familiaForm.valid; }
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
      if (this._familia) {
        this._updateFamilia(this._familia);
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
      this.hiddenFields = this._userPermissionsService.hideFields(userRole, EnumLiteralKeys.eForm_Familia);
      return null;
    }));
  }

  private _createForm(): void {
    this.familiaForm = this.fb.group({
      familia_codigo: [null],
      familia_descripcion: ['', [Validators.required, Validators.maxLength(50)]]
    });

    this.familiaForm.valueChanges.subscribe(() => {
      this.dataChange.emit();
    });
  }

  private _familiaFormToFamilia(): Familia {
    this._familia = { ...this._familia, ...this.familiaForm.value } as Familia;
    return this._familia!;
  }

  private _updateFamilia(familia: Familia): void {
    this.familiaForm.patchValue(familia, { emitEvent: false });
    this.familiaForm.disable();
    if (familia.objectMode !== EnumObjectMode.READONLY) {
      this.familiaForm.enable();
    }
    this.familiaForm.markAsPristine();
  }
}
