import { Component, OnInit, OnDestroy, DestroyRef, inject } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { MatTabsModule } from '@angular/material/tabs';
import { AsyncPipe, NgFor } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import {
  TranslatePipe,
  GenericLayoutComponent,
  GenericMessageComponent,
  GenericActionsComponent,
  MessagesService,
  GridService,
  ActionService,
  PageFilter,
  ModalService,
  EnumMessageType,
  EnumActionsType,
  CONFIRM_DELETE
} from '@lib/shared';
import { ConfigurationService, ConfigurationItem, EnumActions, EnumLiteralKeys, MenuesService } from '@lib/common';
import { AuthService } from '../../services/auth.service';
import { UserPermissionsService } from '../../permissions/services/user-permissions.service';
import { EnumUserRole } from '../../permissions/enums/user-role.enum';
import { HTTPServiceUserRole } from '../http-services/user-role.service';
import { UserRoleGridFilterComponent } from './user-role-grid-filter/user-role-grid-filter.component';
import { UserRoleFilter } from '../models/user-role-filter.model';
import { UserRoleGridComponent } from './user-role-grid/user-role-grid.component';
import { UserRoleFormComponent } from '../user-role-form/user-role-form.component';
import { UserRoleGrid } from '../models/user-role-grid.model';
import { UserRole } from '../models/user-role.model';

@Component({
  selector: 'app-user-roles-container',
  templateUrl: './user-roles-container.component.html',
  styleUrls: ['./user-roles-container.component.scss'],
  standalone: true,
  imports: [
    NgFor,
    AsyncPipe,
    MatTabsModule,
    MatIconModule,
    TranslatePipe,
    GenericLayoutComponent,
    GenericMessageComponent,
    GenericActionsComponent,
    UserRoleGridFilterComponent,
    UserRoleGridComponent,
    UserRoleFormComponent,
  ],
  providers: [Router, MessagesService, GridService]
})
export class UserRolesContainerComponent implements OnInit, OnDestroy {
  openedUserRolesId: string[] = [];
  selectedUserRoleId: string = '';
  selectedTabIndex: number = -1;
  private openedUserRoles: UserRole[] = [];

  filterParameters: UserRoleFilter = new UserRoleFilter();
  config: ConfigurationItem = new ConfigurationItem();

  private _dataLoaded: UserRoleGrid[] = [];
  private _pageFilter: PageFilter = new PageFilter();
  private readonly _destroyRef = inject(DestroyRef);

  constructor(
    private _router: Router,
    private _route: ActivatedRoute,
    private _userRoleService: HTTPServiceUserRole,
    private _gridService: GridService<UserRoleGrid>,
    private _messagesService: MessagesService,
    private _actionService: ActionService,
    private _modalService: ModalService,
    private _permissionsUserService: UserPermissionsService,
    private _authService: AuthService,
    private _menuesService: MenuesService,
    private _configurationService: ConfigurationService
  ) {
    this._createPageFilter();
    this._createFilterParameters();
    this._setSubscriptions();
  }

  ngOnInit(): void {
    try {
      this._securityApply();
      this.loadUserRoles(this._pageFilter, this.filterParameters);
    } catch (error) {
      this._messagesService.addMessage('Error al cargar la pagina', EnumMessageType.Error);
    }
  }

  ngOnDestroy(): void {}

  onSortChange(pageFilter: PageFilter): void {
    this._dataLoaded = [];
    this._pageFilter.page = 1;
    this._pageFilter.sortDirection = pageFilter.sortDirection;
    this._pageFilter.sortField = pageFilter.sortField;
    this.loadUserRoles(this._pageFilter, this.filterParameters);
  }

  onLoadNextPage(): void {
    this._pageFilter.page += 1;
    this.loadUserRoles(this._pageFilter, this.filterParameters);
  }

  onFilterApplied(filter: UserRoleFilter): void {
    this._dataLoaded = [];
    this._pageFilter.page = 1;
    this.filterParameters = filter;
    this.loadUserRoles(this._pageFilter, this.filterParameters);
  }

  onAction(action: EnumActionsType | EnumActions): void {
    switch (action) {
      case EnumActions.eAction_New:
        this._actionNewUserRole();
        break;
      default:
        this._menuesService.openMenu(action);
        break;
    }
  }

  onEdit(userRole: UserRoleGrid): void {
    if (this.openedUserRolesId.includes(userRole.userRolId)) {
      this.selectedUserRoleId = userRole.userRolId;
      this.selectedTabIndex = this.openedUserRolesId.indexOf(userRole.userRolId);
      return;
    }

    this.openedUserRolesId.push(userRole.userRolId);
    this.openedUserRoles.push(this._userRoleGridToUserRole(userRole));
    this.selectedUserRoleId = userRole.userRolId;
    this.selectedTabIndex = this.openedUserRolesId.indexOf(userRole.userRolId);
  }

  onDeleteUserRole(userRole: UserRoleGrid): void {
    this._modalService.showModal(CONFIRM_DELETE)
      .pipe(takeUntilDestroyed(this._destroyRef))
      .subscribe(action => {
        if (action === EnumActionsType.actionAccept) {
          this._deleteUserRole(userRole);
        }
      });
  }

  onOpenUserRole(userRole: UserRoleGrid): void {
    this._openUserRole(userRole);
  }

  onSaveUserRole(userRole: UserRole): void {
    const index = this.openedUserRolesId.indexOf(userRole.userRolId);
    if (index !== -1) {
      this.openedUserRoles[index] = userRole;
    }

    const indexData = this._dataLoaded.findIndex(u => u.userRolId === userRole.userRolId);
    if (indexData !== -1) {
      this._dataLoaded[indexData] = this._userRoleToUserRoleGrid(userRole);
      this._gridService.setData(this._dataLoaded);
    }

    this._messagesService.addMessage('MESSAGE.successSave', EnumMessageType.Info);
  }

  onCancelUserRole(): void {
    if (this.selectedUserRoleId) {
      this._closeUserRole(this.selectedUserRoleId);
    }
  }

  onCloseTab(userRolId: string): void {
    this._closeUserRole(userRolId);
  }

  onClickTab(userRolId: string): void {
    this.selectedUserRoleId = userRolId;
    this.selectedTabIndex = this.openedUserRolesId.indexOf(userRolId);
  }

  getUserRoleById(userRolId: string): UserRole | undefined {
    const index = this.openedUserRolesId.indexOf(userRolId);
    return index !== -1 ? this.openedUserRoles[index] : undefined;
  }

  private _openUserRole(userRole: UserRoleGrid): void {
    const url = this._router.serializeUrl(
      this._router.createUrlTree(['user-roles-module', 'user-role', 'open'], { queryParams: { id: userRole.userRolId } })
    );
    window.open(url, '_blank');
  }

  private _closeUserRole(userRolId: string): void {
    const index = this.openedUserRolesId.indexOf(userRolId);
    if (index !== -1) {
      this.openedUserRolesId.splice(index, 1);
      this.openedUserRoles.splice(index, 1);

      if (this.openedUserRolesId.length > 0) {
        this.selectedUserRoleId = this.openedUserRolesId[Math.max(index - 1, 0)];
      } else {
        this.selectedUserRoleId = '';
      }
    }

    this.selectedTabIndex = this.selectedUserRoleId ? this.openedUserRolesId.indexOf(this.selectedUserRoleId) : -1;
  }

  private _actionNewUserRole(): void {
    const newUserRole = new UserRole();
    newUserRole.userRolId = '';
    newUserRole.userRolName = 'Nuevo rol';
    newUserRole.userRolType = EnumUserRole.USER;

    this.openedUserRolesId.push('');
    this.openedUserRoles.push(newUserRole);
    this.selectedUserRoleId = '';
    this.selectedTabIndex = this.openedUserRolesId.indexOf('');
  }

  private _deleteUserRole(userRole: UserRoleGrid): void {
    this._userRoleService.deleteUserRole(userRole.userRolId)
      .pipe(takeUntilDestroyed(this._destroyRef))
      .subscribe(() => {
        this._messagesService.addMessage('MESSAGE.successDelete', EnumMessageType.Info);
      });
  }

  private _securityApply(): void {
    const actions = this._permissionsUserService.enabledActions(
      this._authService.getCurrentUser()?.role || EnumUserRole.VIEWER,
      EnumLiteralKeys.eModule_UserRoles,
      this.makeConditions()
    );

    this._actionService.setActions(actions);
  }

  private makeConditions(): string {
    return '#|V|#';
  }

  private loadUserRoles(pageFilter: PageFilter, filterParameters: UserRoleFilter): void {
    this._userRoleService.getUserRoles(pageFilter, filterParameters)
      .pipe(takeUntilDestroyed(this._destroyRef))
      .subscribe({
        next: (response) => {
          this._dataLoaded = this._dataLoaded.concat(response.data);
          this._gridService.setData(this._dataLoaded);
        },
        error: (error) => {
          this._messagesService.addMessage(error, EnumMessageType.Error);
        }
      });
  }

  private _createPageFilter(): void {
    this._pageFilter.page = 1;
    this._pageFilter.pageSize = 15;
    this._pageFilter.sortField = 'userRolName';
    this._pageFilter.sortDirection = 'asc';
  }

  private _createFilterParameters(): void {
    this.filterParameters.userRolId = '';
    this.filterParameters.userRolName = '';
    this.filterParameters.userRolType = '';
  }

  private _setSubscriptions(): void {
    this._configurationService.getConfiguration()
      .pipe(takeUntilDestroyed(this._destroyRef))
      .subscribe(config => {
        if (config) {
          this.config = config.items.find(c => c.literalKey === EnumLiteralKeys.eModule_UserRoles) || new ConfigurationItem();
        }
      });
  }

  private _userRoleGridToUserRole(userRoleGrid: UserRoleGrid): UserRole {
    const userRole = new UserRole();
    userRole.userRolId = userRoleGrid.userRolId;
    userRole.userRolName = userRoleGrid.userRolName;
    userRole.userRolType = userRoleGrid.userRolType;
    return userRole;
  }

  private _userRoleToUserRoleGrid(userRole: UserRole): UserRoleGrid {
    const userRoleGrid = new UserRoleGrid();
    userRoleGrid.userRolId = userRole.userRolId;
    userRoleGrid.userRolName = userRole.userRolName;
    userRoleGrid.userRolType = userRole.userRolType;
    return userRoleGrid;
  }
}
