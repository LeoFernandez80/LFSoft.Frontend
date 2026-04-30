import { Component, EventEmitter, Input, OnDestroy, OnInit, Output } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { map } from 'rxjs/operators';
import { Observable, timer } from 'rxjs';
import { EnumLiteralKeys, EnumObjectMode } from '@lib/common';
import { FormValidationsDirective, GenericFormComponent, ISectionForm, SkeletonDirective, TranslatePipe } from '@lib/shared';
import { AuthService } from '../../../services/auth.service';
import { UserPermissionsService } from '../../../permissions/services/user-permissions.service';
import { EnumUserRole } from '../../../permissions/enums/user-role.enum';
import { UserRole } from '../../models/user-role.model';

@Component({
  selector: 'app-user-role-data-form',
  templateUrl: './user-role-data-form.component.html',
  styleUrls: ['./user-role-data-form.component.scss'],
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatInputModule,
    MatFormFieldModule,
    MatSelectModule,
    GenericFormComponent,
    FormValidationsDirective,
    TranslatePipe,
    SkeletonDirective,
    MatButtonModule
  ]
})
export class UserRoleDataFormComponent implements OnInit, OnDestroy, ISectionForm {
  @Output() dataChange = new EventEmitter<void>();

  @Input() set userRole(userRole: UserRole | undefined) {
    if (userRole) {
      this._userRole = userRole;
    }
  }

  @Input() isLoading: boolean = true;

  userRoleForm: FormGroup = new FormGroup({});
  userRoles: EnumUserRole[] = [];
  userRolHiddenFields: string[];

  private _userRole: UserRole | undefined;

  get data(): UserRole {
    return this._userRoleFormToUserRole();
  }

  get modified(): boolean {
    return this.userRoleForm.dirty;
  }

  get valid(): boolean {
    return this.userRoleForm.valid;
  }

  get required(): boolean {
    return false;
  }

  constructor(
    private fb: FormBuilder,
    private _authService: AuthService,
    private _userPermissionsService: UserPermissionsService
  ) {
    this.userRolHiddenFields = [];
    this._createForm();
  }

  ngOnInit(): void {
    this._loadData().subscribe(() => {
      if (this._userRole) {
        this._updateUserRole(this._userRole);
        this.isLoading = false;
      }
    });
  }

  ngOnDestroy(): void {}

  public isHiddenField(fieldName: string): boolean {
    return this.userRolHiddenFields.includes(fieldName);
  }

  private _loadData(): Observable<any> {
    return timer(1).pipe(
      map(() => {
        this.userRoles = Object.values(EnumUserRole).filter(role => role !== EnumUserRole.EMPTY);
        const userRole = this._authService.getCurrentUser()?.role || EnumUserRole.EMPTY;
        this.userRolHiddenFields = this._userPermissionsService.hideFields(userRole, EnumLiteralKeys.eForm_UserRole);
        return null;
      })
    );
  }

  private _createForm(): void {
    this.userRoleForm = this.fb.group({
      userRolId: [''],
      userRolName: ['', Validators.required],
      userRolType: [EnumUserRole.USER, Validators.required],
      userRolDescription: ['']
    });

    this.userRoleForm.valueChanges.subscribe(() => {
      this.dataChange.emit();
    });
  }

  private _updateUserRole(userRole: UserRole): void {
    this.userRoleForm.patchValue(userRole, { emitEvent: false });

    this.userRoleForm.disable();
    if (userRole.objectMode !== EnumObjectMode.READONLY) {
      this.userRoleForm.enable();
    }
  }

  private _userRoleFormToUserRole(): UserRole {
    const formValue = this.userRoleForm.value;
    this._userRole = { ...this._userRole, ...formValue } as UserRole;
    return this._userRole;
  }
}
