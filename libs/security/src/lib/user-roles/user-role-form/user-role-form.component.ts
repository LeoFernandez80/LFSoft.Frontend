import { Component, EventEmitter, Input, OnInit, Output, OnDestroy, DestroyRef, inject, ViewChild } from '@angular/core';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterOutlet } from '@angular/router';
import { map } from 'rxjs/operators';
import { Observable, of } from 'rxjs';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { MatButtonModule } from '@angular/material/button';
import { HttpErrorResponse } from '@angular/common/http';
import {
  GenericFormComponent,
  GenericActionsComponent,
  TranslatePipe,
  ActionService,
  MessagesService,
  ModalService,
  EnumMessageType,
  EnumActionsType,
  CONFIRM_CANCEL,
  ISectionForm
} from '@lib/shared';
import { EnumActions, EnumLiteralKeys, EnumObjectMode } from '@lib/common';
import { AuthService } from '../../services/auth.service';
import { UrlSecurityService } from '../../services/url-security.service';
import { UserPermissionsService } from '../../permissions/services/user-permissions.service';
import { EnumUserRole } from '../../permissions/enums/user-role.enum';
import { HTTPServiceUserRole } from '../http-services/user-role.service';
import { UserRole } from '../models/user-role.model';
import { UserRoleResponse } from '../models/user-role-response.model';
import { UserRoleDataFormComponent } from './user-role-data-form/user-role-data-form.component';

@Component({
  selector: 'app-user-role-form',
  templateUrl: './user-role-form.component.html',
  styleUrls: ['./user-role-form.component.scss'],
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterOutlet,
    GenericFormComponent,
    GenericActionsComponent,
    TranslatePipe,
    MatButtonModule,
    UserRoleDataFormComponent
  ],
  providers: [ActionService]
})
export class UserRoleFormComponent implements OnInit, OnDestroy {
  @ViewChild('formUserRoleData') formUserRoleData!: ISectionForm;

  @Input() set userRole(userRole: string | UserRole) {
    if (userRole instanceof UserRole) {
      this.userRoleData = userRole;
    } else {
      this._userRoleId = userRole;
    }
  }

  public userRoleData: UserRole | undefined = undefined;

  @Output() save = new EventEmitter<UserRole>();
  @Output() cancel = new EventEmitter<void>();

  private _userRoleId: string = '';
  private _operation: any;
  private readonly _destroyRef = inject(DestroyRef);

  constructor(
    private fb: FormBuilder,
    private _userRoleService: HTTPServiceUserRole,
    private _route: ActivatedRoute,
    private _actionService: ActionService,
    private _messagesService: MessagesService,
    private _modalService: ModalService,
    private _urlSecurityService: UrlSecurityService,
    private _permissionsUserService: UserPermissionsService,
    private _authService: AuthService
  ) {}

  ngOnInit(): void {
    try {
      this._securityApply();
      this._loadData();
    } catch (error) {
      this._messagesService.addMessage('Error loading user role data.', EnumMessageType.Error);
    }
  }

  ngOnDestroy(): void {}

  isReadyToSave(): boolean {
    return (this.userRoleData?.objectMode !== EnumObjectMode.READONLY) && this.formUserRoleData.valid && this.formUserRoleData.modified;
  }

  onUserRoleDataChange(): void {
    this._enabledActions();
  }

  onAction(action: EnumActionsType | EnumActions): void {
    try {
      switch (action) {
        case EnumActions.eAction_Save:
          this._save();
          break;
        case EnumActions.eAction_Cancel:
          this._cancel();
          break;
      }
    } catch (error) {
      this._messagesService.addMessage(error as HttpErrorResponse, EnumMessageType.Error);
    }
  }

  private _loadData(): void {
    this._loadParams().subscribe(() => {
      switch (this._operation) {
        case 'open':
          this._openUserRole(this._userRoleId).subscribe(userRole => {
            this.userRoleData = userRole;
            this._enabledActions();
          });
          break;
        default:
          if (this._userRoleId) {
            this._openUserRole(this._userRoleId).subscribe(userRole => {
              this.userRoleData = userRole;
              this._enabledActions();
            });
          } else {
            this.userRoleData = new UserRole();
            this._enabledActions();
          }
      }
    });
  }

  private _openUserRole(id: string): Observable<UserRole> {
    return this._userRoleService.open(id).pipe(
      takeUntilDestroyed(this._destroyRef),
      map((userRoleRsp: UserRoleResponse) => {
        if (userRoleRsp.accessControl) {
          userRoleRsp.userRole.objectMode = EnumObjectMode.READONLY;
          this._messagesService.addMessage(`${userRoleRsp.userRole.objectKey} access denied. Opened in ${userRoleRsp.accessControl?.terminal?.terminalName} at ${userRoleRsp.accessControl?.createdAt}`, EnumMessageType.Error);
        } else {
          userRoleRsp.userRole.objectMode = this._authService.getCurrentUser()?.role === EnumUserRole.VIEWER
            ? EnumObjectMode.READONLY
            : EnumObjectMode.EDITABLE;
        }
        return userRoleRsp.userRole;
      })
    );
  }

  private _loadParams(): Observable<void> {
    this._operation = this._route.snapshot.data['operation'];
    if (this._operation === 'open') {
      return this._route.queryParamMap.pipe(
        takeUntilDestroyed(this._destroyRef),
        map(params => {
          const idParam = params.get('id');
          if (!idParam || !this._urlSecurityService.isValidRouteId(idParam)) {
            this._messagesService.addMessage('ID de rol inválido', EnumMessageType.Error);
            throw new Error('Invalid role ID');
          }
          this._userRoleId = idParam;
          return;
        })
      );
    }
    return of(void 0);
  }

  private _cancel(): void {
    if (!this.formUserRoleData.modified) {
      this.cancel.emit();
      return;
    }

    this._modalService.showModal(CONFIRM_CANCEL)
      .pipe(takeUntilDestroyed(this._destroyRef))
      .subscribe(action => {
        if (action === EnumActionsType.actionAccept) {
          if (this.userRoleData?.userRolId) {
            this._userRoleService.closeUserRole(this.userRoleData.userRolId)
              .pipe(takeUntilDestroyed(this._destroyRef))
              .subscribe(() => this.cancel.emit());
            return;
          }
          this.cancel.emit();
        }
      });
  }

  private _save(): void {
    if (!this.formUserRoleData.modified) {
      return;
    }

    const updatedUserRole = this._createUserRoleRequest();
    let savedUserRole: Observable<UserRole>;
    if (!updatedUserRole.userRolId) {
      savedUserRole = this._userRoleService.createUserRole(updatedUserRole);
    } else {
      savedUserRole = this._userRoleService.updateUserRole(updatedUserRole);
    }

    savedUserRole
      .pipe(takeUntilDestroyed(this._destroyRef))
      .subscribe(() => {
        this.save.emit(updatedUserRole);
      });
  }

  private _createUserRoleRequest(): UserRole {
    const formValues = this.formUserRoleData.data;
    const userRoleRequest = { ...this.userRoleData, ...formValues } as UserRole;
    return userRoleRequest;
  }

  private _securityApply(): void {
    const actions = this._permissionsUserService.enabledActions(
      this._authService.getCurrentUser()?.role || EnumUserRole.VIEWER,
      EnumLiteralKeys.eForm_UserRole,
      this.makeConditions()
    );
    this._actionService.setActions(actions);
  }

  private makeConditions(): string {
    return '#|V|#';
  }

  private _enabledActions(): void {
    if (this.isReadyToSave()) {
      this._actionService.enable(EnumActions.eAction_Save);
    } else {
      this._actionService.disable(EnumActions.eAction_Save);
    }
  }
}
