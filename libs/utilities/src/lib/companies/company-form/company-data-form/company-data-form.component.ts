import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { EnumLiteralKeys, EnumObjectMode } from '@lib/common';
import { AuthService, EnumUserRole, UserPermissionsService } from '@lib/security';
import { ISectionForm, TranslatePipe } from '@lib/shared';
import { map, Observable, timer } from 'rxjs';
import { Company } from '../../models/company.model';

@Component({
  selector: 'app-company-data-form',
  templateUrl: './company-data-form.component.html',
  styleUrls: ['./company-data-form.component.scss'],
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, TranslatePipe]
})
export class CompanyDataFormComponent implements OnInit, ISectionForm {
  @Output() dataChange = new EventEmitter<void>();

  @Input() set company(company: Company | undefined) {
    this._company = company;
    if (company) { this._updateCompany(company); this.isLoading = false; }
  }
  @Input() isLoading: boolean = true;

  companyForm: FormGroup = new FormGroup({});
  hiddenFields: string[] = [];

  private _company: Company | undefined;

  get data(): Company { return this._companyFormToCompany(); }
  get modified(): boolean { return this.companyForm.dirty; }
  get valid(): boolean { return this.companyForm.valid; }
  get required(): boolean { return false; }

  constructor(
    private fb: FormBuilder,
    private _authService: AuthService,
    private _userPermissionsService: UserPermissionsService
  ) { this._createForm(); }

  ngOnInit(): void {
    this._loadHiddenFields().subscribe(() => {
      if (this._company) { this._updateCompany(this._company); this.isLoading = false; }
    });
  }

  isHiddenField(fieldName: string): boolean { return this.hiddenFields.includes(fieldName); }

  private _loadHiddenFields(): Observable<null> {
    return timer(1).pipe(map(() => {
      const userRole = this._authService.getCurrentUser()?.role || EnumUserRole.EMPTY;
      this.hiddenFields = this._userPermissionsService.hideFields(userRole, EnumLiteralKeys.eForm_Companies);
      return null;
    }));
  }

  private _createForm(): void {
    this.companyForm = this.fb.group({
      company_id: [null],
      company_razonSocial: ['', [Validators.required, Validators.minLength(3)]],
      company_tipo: ['', [Validators.required]],
      company_estado: ['', [Validators.required]],
      company_observacion: ['']
    });
    this.companyForm.valueChanges.subscribe(() => { this.dataChange.emit(); });
  }

  private _companyFormToCompany(): Company {
    this._company = { ...this._company, ...this.companyForm.value } as Company;
    return this._company!;
  }

  private _updateCompany(company: Company): void {
    this.companyForm.patchValue(company, { emitEvent: false });
    this.companyForm.disable();
    if (company.objectMode !== EnumObjectMode.READONLY) { this.companyForm.enable(); }
    this.companyForm.markAsPristine();
  }
}




