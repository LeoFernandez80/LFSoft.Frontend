import { AfterViewInit, Component, EventEmitter, Input, OnDestroy, OnInit, Output } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatCheckboxModule } from '@angular/material/checkbox';

import { User } from '../../models/user.model';
import { EnumObjectMode } from '@lib/common';
import { AuthService, EnumUserRole } from '@lib/security';
import { ISectionForm } from 'libs/shared/src/lib/interfaces/section-Form.interface';
import { SkeletonDirective } from 'libs/shared/src/lib/generic-skeleton/skeleton.directive';
import { MatButtonModule } from '@angular/material/button';
import { FormValidationsDirective, GenericFormComponent, TranslatePipe } from '@lib/shared';
import { Observable, timer } from 'rxjs';
import { map } from 'rxjs/operators';
import { UserPermissionsService } from '../../../../../../security/src/lib/permissions/services/user-permissions.service';
import { EnumLiteralKeys } from 'libs/common/src/lib/enums/literal-keys.enum';

@Component({
  selector: 'app-user-data-form',
  templateUrl: './user-data-form.component.html',
  styleUrls: ['./user-data-form.component.scss'],
  standalone: true,
  imports: [
    CommonModule, 
    ReactiveFormsModule,
    MatInputModule,
    MatFormFieldModule,
    MatSelectModule,
    MatCheckboxModule,
    GenericFormComponent,    
    FormValidationsDirective, TranslatePipe, 
    SkeletonDirective, MatButtonModule
  ]
})
export class UserDataFormComponent implements OnInit, OnDestroy, ISectionForm {
    @Output() dataChange = new EventEmitter<void>();
    @Input() set user(user: User | undefined) {        
        if (user) {
            this._user = user; 
        }
    }
    @Input() isLoading: boolean = true;
    
    userForm: FormGroup = new FormGroup({});
    userRoles : EnumUserRole[] = [];
    userRolHiddenFields: string[];
    
    private _user: User | undefined;
    
    get data(): User {        
        return this._userFormToUser();
    }
    get modified(): boolean {
        return this.userForm.dirty;
    }
    get valid(): boolean {
        return this.userForm.valid;
    }

    get required(): boolean {
        return false;
    }

    constructor(private fb: FormBuilder, private _authService: AuthService, private _userPermissionsService: UserPermissionsService) {
        this.userRolHiddenFields = [];
        this._createForm();
    }

    ngOnInit(): void {        
        this._loadData().subscribe(() => {
            if (this._user) {
                this._updateUser(this._user);
                this.isLoading = false;
            }
        });
    }

    ngOnDestroy(): void {  }

    public isHiddenField(fieldName: string): boolean {
        return this.userRolHiddenFields.includes(fieldName);
    }
    
    private _loadData(): Observable<any> {
        return timer(1).pipe(
            map(() => {
                this.userRoles = Object.values(EnumUserRole);

                const userRole = this._authService.getCurrentUser()?.role || EnumUserRole.EMPTY;
                this.userRolHiddenFields = this._userPermissionsService.hideFields(userRole, EnumLiteralKeys.eForm_Users);                
                
                return null;
            })
        );
    }
    
    private _createForm() {
        this.userForm = this.fb.group({
            user_username: [null, Validators.required],
            user_email: ['', [Validators.required, Validators.email]],
            user_firstName: ['', Validators.required],
            user_lastName: ['', Validators.required],
            user_role: [EnumUserRole.USER, Validators.required],
            personId: [0],
            user_active: [false]
        });   
        this.userForm.valueChanges.subscribe(() => {            
            this.dataChange.emit();
        });
    }

    private _updateUser(user: User): void {
        
        if (user) {
            if (!user.user_username) {
                user.user_username = user.user_firstName.toLowerCase() + '.' + user.user_lastName.toLowerCase();
                user.user_username = user.user_username.replace(/\s+/g, '');
            }
            this.userForm.patchValue( user, { emitEvent: false });
        }

        this.userForm.disable();
        if (user.objectMode !== EnumObjectMode.READONLY) {
          this.userForm.enable();
        }
    }

    private _userFormToUser(): User {
        const formValue = this.userForm.value;
        this._user = { ...this._user, ...formValue } as User;

        return this._user;
      }
}

