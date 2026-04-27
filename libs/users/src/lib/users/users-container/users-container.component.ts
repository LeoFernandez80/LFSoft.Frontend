import { Component, OnInit, OnDestroy, DestroyRef, inject } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { MatTabsModule } from '@angular/material/tabs';
import { AsyncPipe, NgFor } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { TranslatePipe, GenericLayoutComponent, GenericMessageComponent, GenericActionsComponent, MessagesService, GridService, ActionService, PageFilter, ModalService, EnumMessageType, EnumActionsType, CONFIRM_DELETE } from '@lib/shared';
import { AuthService, EnumUserRole, UserPermissionsService } from '@lib/security';
import { ConfigurationService, EnumActions, EnumLiteralKeys, MenuesService } from '@lib/common';
import { ConfigurationItem } from '@lib/common';

import { HTTPServiceUser } from '../http-services/user.service';
import { UserGridFilterComponent } from './user-grid-filter/user-grid-filter.component';
import { UserFilter } from '../models/user-filter.model';
import { UserGridComponent } from './user-grid/user-grid.component';
import { UserFormComponent } from '../user-form/user-form.component';
import { UserGrid } from '../models/user-grid.model';
import { User } from '../models/user.model';

@Component({
  selector: 'app-users-container',
  templateUrl: './users-container.component.html',
  styleUrls: ['./users-container.component.scss'],
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
    UserGridFilterComponent,
    UserGridComponent,
    UserFormComponent,
    
  ],
  providers: [Router, MessagesService, GridService]
})
export class UsersContainerComponent implements OnInit, OnDestroy {
  openedUsersId: number[] = [];
  selectedUserId: number = 0;
  selectedTabIndex: number = -1;
  private openedUsers: User[] = [];

  filterParameters: UserFilter = new UserFilter();
  config: ConfigurationItem = new ConfigurationItem();

  private _dataLoaded: UserGrid[] = [];
  private _pageFilter: PageFilter = new PageFilter();
  private readonly _destroyRef = inject(DestroyRef);

  constructor(private _router: Router, private _route: ActivatedRoute,
    private _userService: HTTPServiceUser, private _gridService: GridService<UserGrid>, 
    private _messagesService: MessagesService, private _actionService: ActionService,
    private _modalService: ModalService,
    private _permissionsUserService: UserPermissionsService, private _authService: AuthService,
    private _menuesService: MenuesService, private _configurationService: ConfigurationService    
) {
    this._createPageFilter();
    this._createFilterParameters();
    //this._loadConfiguration();
    this._setSubscriptions();
  }

  ngOnInit(): void {
    try {
      this._securityApply();
      this.loadUsers(this._pageFilter, this.filterParameters);

    } catch (error) {
      this._messagesService.addMessage("Error al cargar la pagina", EnumMessageType.Error);
    }
  }

  ngOnDestroy(): void {
    // El DestroyRef se encarga automáticamente de cancelar todas las suscripciones
    // que usen takeUntilDestroyed()
  }

  onSortChange(pageFilter: PageFilter): void {
    try {
      this._dataLoaded = [];
      this._pageFilter.page = 1;
      this._pageFilter.sortDirection = pageFilter.sortDirection;
      this._pageFilter.sortField = pageFilter.sortField;
      this.loadUsers(this._pageFilter, this.filterParameters);
    } catch (error) {
      this._messagesService.addMessage("ERROR.", EnumMessageType.Error);
    }
  }

  onLoadNextPage(): void {
    try {
      this._pageFilter.page += 1;
      this.loadUsers(this._pageFilter, this.filterParameters);
    } catch (error) {
      this._messagesService.addMessage("Error al cargar la siguiente página", EnumMessageType.Error);
    }
  }

  onFilterApplied(filter: UserFilter): void {
    try {
      this._dataLoaded = [];
      this._pageFilter.page = 1;
      this.filterParameters = filter;
      this.loadUsers(this._pageFilter, this.filterParameters);
    } catch (error) {
      this._messagesService.addMessage("Error al aplicar filtro", EnumMessageType.Error);
    }
  }

  onAction(action: EnumActionsType | EnumActions): void {
    switch (action) {
      case EnumActions.eAction_New:
        try {
          this._actionNewUser();
        } catch (error) {
          this._messagesService.addMessage("ERROR.userCreate", EnumMessageType.Error);
        }
        break;
      default:
        try {
          this._menuesService.openMenu(action);
        } catch (error) {
          this._messagesService.addMessage("ERROR.actionExecute", EnumMessageType.Error);
        }
        break;
    }
  }

  onEdit(user: UserGrid): void {    
    try {
      if (this.openedUsersId.includes(user.user_id)) {
        this.selectedUserId = user.user_id;
        this.selectedTabIndex = this.openedUsersId.indexOf(user.user_id);
        return;
      }      
      this.openedUsersId.push(user.user_id);
      this.openedUsers.push(this._userGridToUser(user));
      this.selectedUserId = user.user_id;
      this.selectedTabIndex = this.openedUsersId.indexOf(user.user_id);
    } catch (error) {
      this._messagesService.addMessage("Error al editar usuario", EnumMessageType.Error);
    }
  }

  onDeleteUser(user: UserGrid): void {
    try { 
      this._modalService.showModal(CONFIRM_DELETE)
        .pipe(takeUntilDestroyed(this._destroyRef))
        .subscribe(action => {          
          if (action === EnumActionsType.actionAccept) {
            this._deleteUser(user);
          } 
        });      
    } catch (error) {
      this._messagesService.addMessage("Error al editar usuario", EnumMessageType.Error);
    }
  }
  
  onOpenUser(user: UserGrid): void {
    try {      
      this._openUser(user);
    } catch (error) {
      this._messagesService.addMessage("Error al abrir usuario en nueva pestaña", EnumMessageType.Error);
    }
  }

  onSaveUser(user: User): void {
    try {
      const index = this.openedUsersId.indexOf(user.user_id);
      if (index !== -1) {
        this.openedUsers[index] = user;
      }
      
      // Actualizar en _dataLoaded si existe
      const indexData = this._dataLoaded.findIndex(u => u.user_id === user.user_id);
      if (indexData !== -1) {
        this._dataLoaded[indexData] = this._userToUserGrid(user);
        this._gridService.setData(this._dataLoaded);
      }
      
      this._messagesService.addMessage('MESSAGE.successSave', EnumMessageType.Info);
    } catch (error) {
      this._messagesService.addMessage("Error al guardar usuario", EnumMessageType.Error);
    }
  }

  onCancelUser(): void {
    try {      
      if (this.selectedUserId !== null) {
        this._closeUser(this.selectedUserId);
      }
    } catch (error) {
      this._messagesService.addMessage("Error al cerrar pestaña de usuario", EnumMessageType.Error);
    }
  }
  onCloseTab(userId: number): void {
    try {
      this._closeUser(userId);
    } catch (error) {
      this._messagesService.addMessage("Error al cerrar pestaña de usuario", EnumMessageType.Error);
    }
  }
  
  onClickTab(userId: number): void {    
    this.selectedUserId = userId;
    this.selectedTabIndex = this.openedUsersId.indexOf(userId);
  }

  private _openUser(user: UserGrid): void {
    try {
      const url = this._router.serializeUrl(
        this._router.createUrlTree(['users-module', 'users','open'], { queryParams: { id: user.user_id } })
      );
      window.open(url, '_blank');
    } catch (error) {
      this._messagesService.addMessage("Error al abrir usuario en nueva pestaña", EnumMessageType.Error);
    }
  }

  private _closeUser(userId: number): void {
   
          const index = this.openedUsersId.indexOf(userId);
          if (index !== -1) {
            this.openedUsersId.splice(index, 1);
            this.openedUsers.splice(index, 1);
            
        if (this.openedUsersId.length > 0) {
          this.selectedUserId = this.openedUsersId[Math.max(index - 1, 0)];
        } else {
           this.selectedUserId = 0;
        }
      }
      this.selectedTabIndex = this.selectedUserId !== null ? this.openedUsersId.indexOf(this.selectedUserId) : -1;
    
  }

  private _actionNewUser(): void {
    try {
      const newUser = new User();
      newUser.user_id = 0;
      newUser.user_username = 'Nuevo';
      newUser.user_role = EnumUserRole.USER;
      
      this.openedUsersId.push(0);
      this.openedUsers.push(newUser);
      this.selectedUserId = 0;
      this.selectedTabIndex = this.openedUsersId.indexOf(0);
    } catch (error) {
      throw error;
    }
  }

  getUserById(userId: number): User | undefined {
    const index = this.openedUsersId.indexOf(userId);
    return index !== -1 ? this.openedUsers[index] : undefined;
  }

  private _deleteUser(user: UserGrid): void {
    try {
      this._userService.deleteUser(user.user_id!)
        .pipe(takeUntilDestroyed(this._destroyRef))
        .subscribe(() => {
          this._messagesService.addMessage("MESSAGE.successDelete", EnumMessageType.Info);
        });
    } catch (error) {
      throw error;
    }
  }

  private _securityApply(): void {
    const actions = this._permissionsUserService.enabledActions(
      this._authService.getCurrentUser()?.role || EnumUserRole.VIEWER,
      EnumLiteralKeys.eModule_Users,
      this.makeConditions()
    );
    
    this._actionService.setActions(actions);
  }

  private makeConditions(): string {
    // Aquí puedes construir la cadena de condiciones según tus necesidades
    return '#|V|#'; // Ejemplo simple
  }

  private loadUsers(pageFilter: PageFilter, filterParameters: UserFilter) {
    this._userService.getUsers(pageFilter, filterParameters)
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

  private _createPageFilter() {
    this._pageFilter.page = 1;
    this._pageFilter.pageSize = 15;
    this._pageFilter.sortField = "user_email";
    this._pageFilter.sortDirection = "asc";
  }

  private _createFilterParameters() {
    this.filterParameters.user_id = undefined
  }

  // private _getConfigurationUsers(): void {
  //   const  configString = localStorage.getItem('config');
  //   if (configString) {
  //     const configUser = JSON.parse(configString) as Configuration;
  //     this.config = configUser.items.find(c => c.literalKey === 'eModule_Users') || new ConfigurationItem();
  //     console.log(this.config);
      
  //   }
  // }

  // private _loadConfiguration(): void {
  //   this._configurationService.loadUserConfiguration( this._authService.getCurrentUser()?.id! ).subscribe({
  //     next: (config) => {
  //       if (config) {
  //         this.config = config.items.find(c => c.literalKey === 'eModule_Users') || new ConfigurationItem();
  //         console.log("User config", this.config);
  //       }
  //     }
  //   });
  // }

  private _setSubscriptions(): void {
    this._configurationService.getConfiguration()
      .pipe(takeUntilDestroyed(this._destroyRef))
      .subscribe(config => {
        if (config) {  

          this.config = config.items.find(c => c.literalKey === 'eModule_Users') || new ConfigurationItem();
        }
      });
  }

  private _userGridToUser(userGrid: UserGrid): User {    
    const user = new User();
    user.user_id = userGrid.user_id;
    user.user_username = userGrid.user_email;
    user.user_role = userGrid.user_role as EnumUserRole;
    return user;
  }

  private _userToUserGrid(user: User): UserGrid {
    const userGrid = new UserGrid();
    userGrid.user_id = user.user_id;
    userGrid.user_email = user.user_username;
    userGrid.user_role = user.user_role;
    return userGrid;
  }

}