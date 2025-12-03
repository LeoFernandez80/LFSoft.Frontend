import { Component, OnInit, OnDestroy, DestroyRef, inject } from '@angular/core';
import { UserGridFilterComponent } from './user-grid-filter/user-grid-filter.component';
import { UserGridComponent } from './user-grid/user-grid.component';
import { UserFormComponent } from '../user-form/user-form.component';
import { UserGrid } from '../models/user-grid.model';
import { User } from '../models/user.model';
import { ActivatedRoute, Router } from '@angular/router';
import { MatTabsModule } from '@angular/material/tabs';
import { AsyncPipe, NgFor } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { UserFilter } from '../models/user-filter.model';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

import { EnumActionsType } from '../../../generic/generic-actions/enums/actions-type.enums';
import { GenericActionsComponent } from '../../../generic/generic-actions/generic-actions.component';
import { ActionService } from '../../../generic/generic-actions/services/actions.service';
import { GridService } from '../../../generic/generic-grid/services/grid.service';
import { GenericLayoutComponent } from '../../../generic/generic-layout/generic-layout.component';
import { EnumMessageType } from '../../../generic/generic-message/enums/message-type.model';
import { GenericMessageComponent } from '../../../generic/generic-message/generic-message';
import { MessagesService } from '../../../generic/generic-message/services/message.service';
import { PageFilter } from '../../../generic/models/page-filter.model';
import { Action } from '../../../generic/generic-actions/models/actions.model';
import { UserService } from '../services/user.service';
import { ModalService } from '../../../generic/generic-modal/services/modal.service';
import { CONFIRM_DELETE } from '../../../generic/generic-modal/models/modal-messages';
import { TranslatePipe } from '../../../generic/generic-translate/translate.pipe';

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
  providers: [Router, MessagesService, GridService, ActionService]
})
export class UsersContainerComponent implements OnInit, OnDestroy {
  openedUsersId: number[] = [];
  selectedUserId: number | null = null;
  private openedUsers: User[] = [];

  filterParameters: UserFilter = new UserFilter();

  private _pageFilter: PageFilter = new PageFilter();
  private readonly _destroyRef = inject(DestroyRef);

  constructor(private _router: Router, private _route: ActivatedRoute, 
    private _userService: UserService, private _gridService: GridService<UserGrid>, 
    private _messagesService: MessagesService, private _actionService: ActionService,
    private _modalService: ModalService
) {
    this._createPageFilter();
    this._createFilterParameters();
  }

  ngOnInit(): void {
    try {
      this._loadSecurityActions();
      this.loadUsers(this._pageFilter, this.filterParameters);
    } catch (error) {
      this._messagesService.addMessage("Error al cargar la pagina", EnumMessageType.Error);
    }
  }

  ngOnDestroy(): void {
    // El DestroyRef se encarga automáticamente de cancelar todas las suscripciones
    // que usen takeUntilDestroyed()
  }

  onPageChange(pageFilter: PageFilter): void {
    try {
      this._pageFilter = pageFilter;
      this.loadUsers(this._pageFilter, this.filterParameters);
    } catch (error) {
      this._messagesService.addMessage("Error al cambiar página", EnumMessageType.Error);
    }
  }

  onFilterApplied(filter: UserFilter): void {
    try {
      this.filterParameters = filter;
      this.loadUsers(this._pageFilter, this.filterParameters);
    } catch (error) {
      this._messagesService.addMessage("Error al aplicar filtro", EnumMessageType.Error);
    }
  }

  onAction(action: EnumActionsType): void {
    switch (action) {
      case EnumActionsType.actionNew:
        try {
          this._createUser();
        } catch (error) {
          this._messagesService.addMessage("Error al crear usuario", EnumMessageType.Error);
        }
        break;
      case EnumActionsType.actionList:
        try {
          this.openedUsersId = [];
          this.openedUsers = [];
          this.selectedUserId = null;
          this._messagesService.addMessage("Generando listado", EnumMessageType.Error);
        } catch (error) {
          this._messagesService.addMessage("Error al cerrar pestañas", EnumMessageType.Error);
        }
    }
  }

  onEdit(user: UserGrid): void {
    try {
      // Verificar si el usuario ya está abierto
      if (this.openedUsersId.includes(user.id)) {
        this.selectedUserId = user.id;
        return;
      }
      
      // Obtener el usuario completo desde el servicio
      this._userService.getUser(user.id)
        .pipe(takeUntilDestroyed(this._destroyRef))
        .subscribe({
          next: (fullUser) => {
            this.openedUsersId.push(user.id);
            this.openedUsers.push(fullUser);
            this.selectedUserId = user.id;
          },
          error: () => {
            this._messagesService.addMessage("Error al cargar usuario", EnumMessageType.Error);
          }
        });
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

  private _openUser(user: UserGrid): void {
    try {
      const url = this._router.serializeUrl(
        this._router.createUrlTree(['users-module', 'users','open'], { queryParams: { id: user.id } })
      );
      window.open(url, '_blank');
    } catch (error) {
      this._messagesService.addMessage("Error al abrir usuario en nueva pestaña", EnumMessageType.Error);
    }
  }

  onSaveUser(user: User): void {
    const index = this.openedUsersId.indexOf(user.id);
    if (index !== -1) {
      this.openedUsers[index] = user;
    }
    this._messagesService.addMessage( 'MESSAGE.successSave', EnumMessageType.Info);
    this.loadUsers(this._pageFilter, this.filterParameters);
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
  }
  
  private _closeUser(userId: number): void {
    const index = this.openedUsersId.indexOf(userId);
    if (index !== -1) {
      this.openedUsersId.splice(index, 1);
      this.openedUsers.splice(index, 1);
      
      if (this.openedUsersId.length > 0) {
        this.selectedUserId = this.openedUsersId[Math.max(index - 1, 0)];
      } else {
        this.selectedUserId = null;
      }
    }
  }

  private _createUser(): void {
    try {
      const newUser = new User();
      newUser.id = 0;
      newUser.userName = 'Nuevo';
      newUser.role = 'User';
      
      this.openedUsersId.push(0);
      this.openedUsers.push(newUser);
      this.selectedUserId = 0;
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
      this._userService.deleteUser(user.id!)
        .pipe(takeUntilDestroyed(this._destroyRef))
        .subscribe(() => {
          this._messagesService.addMessage("MESSAGE.successDelete", EnumMessageType.Info);
        });
    } catch (error) {
      throw error;
    }
  }


  private _loadSecurityActions(): void {
    const actions: Action[] = [
      new Action('BUTTON.new', EnumActionsType.actionNew, 'add', false),
      new Action('BUTTON.lists', EnumActionsType.actionList, 'list', false)    ];
    this._actionService.setActions(actions);
  }

  private loadUsers(pageFilter: PageFilter, filterParameters: UserFilter) {
    this._userService.getUsers(pageFilter, filterParameters)
      .pipe(takeUntilDestroyed(this._destroyRef))
      .subscribe(response => {
        this._gridService.setData(response.data);
      });
  }

  private _createPageFilter() {
    this._pageFilter.page = 1;
    this._pageFilter.pageSize = 5;
    this._pageFilter.sortField = "id";
    this._pageFilter.sortDirection = "asc";
  }

  private _createFilterParameters() {
    this.filterParameters.id = undefined
  }
}
