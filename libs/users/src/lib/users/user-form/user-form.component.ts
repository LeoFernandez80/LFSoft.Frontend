import { Component, EventEmitter, Input, OnInit, Output, OnDestroy, DestroyRef, inject, ViewChild } from '@angular/core';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

import { ActivatedRoute, RouterOutlet } from '@angular/router';
import { map } from 'rxjs/operators';
import { Observable, of } from 'rxjs';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { MatButtonModule } from '@angular/material/button';
import { HttpErrorResponse } from '@angular/common/http';
import { AuthService, EnumUserRole, UrlSecurityService } from '@lib/security';
import { GenericFormComponent, GenericActionsComponent, TranslatePipe, ActionService, MessagesService, ModalService, EnumMessageType, EnumActionsType, CONFIRM_CANCEL } from '@lib/shared';
import { EnumActions, EnumObjectMode } from '@lib/common';

import { UserPermissionsService } from '../../permissions/services/user-permissions.service';
import { HTTPServiceUser } from '../http-services/user.service';
import { User } from '../models/user.model';
import { UserResponse } from '../models/user-response.model';
import { ISectionForm } from 'libs/shared/src/lib/interfaces/section-Form.interface';
import { UserDataFormComponent } from './user-data-form/user-data-form.component';
import { EnumLiteralKeys } from 'libs/common/src/lib/enums/literal-keys.enum';


@Component({
  selector: 'app-user-form',
  templateUrl: './user-form.component.html',
  styleUrls: ['./user-form.component.scss'],
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterOutlet, GenericFormComponent, 
    GenericActionsComponent, TranslatePipe, MatButtonModule, UserDataFormComponent],
  providers: [ ActionService ]
})
export class UserFormComponent implements OnInit, OnDestroy {
  @ViewChild('formUserData') formUserData!: ISectionForm;
  
  @Input() set user(user: number | User) {    
    if (user instanceof User) {       
      this.userData = user as User;
    }
    else {
      this._userId = user as number;
    }
  }

  public userData: User | undefined= undefined;
  
  @Output() save = new EventEmitter<User>();
  @Output() cancel = new EventEmitter<void>();

  //isLoading: boolean = true;
  personId: number = 0;
  
  private _userId: number = 0;
  private _operation: any;
  private readonly _destroyRef = inject(DestroyRef);


  constructor(private fb: FormBuilder, private _userService: HTTPServiceUser, private _route: ActivatedRoute, 
              private _actionService: ActionService,  private _messagesService: MessagesService, 
              private _modalService: ModalService, private _urlSecurityService: UrlSecurityService,
              private _permissionsUserService: UserPermissionsService, private _authService: AuthService) {    
    
  }
  
  ngOnInit(): void {  
    try {     
      this._securityApply();
      this._loadData();   
    }
    catch (error) {
      this._messagesService.addMessage( 'Error loading user data.', EnumMessageType.Error);
    }
  }

  ngOnDestroy(): void {
    // El DestroyRef se encarga automáticamente de cancelar todas las suscripciones
    // que usen takeUntilDestroyed()
  }

  isReadyToSave(): boolean {   
    return (this.userData?.objectMode !== EnumObjectMode.READONLY) && this.formUserData.valid && this.formUserData.modified;
  }

  onUserDataChange() {
    //this.userData = this.formUserData.data as User;
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
    }
    catch (error) {
      this._messagesService.addMessage( error as HttpErrorResponse, EnumMessageType.Error);
    }
  }  
  
  private _loadData() {
    //this.isLoading = false;
    this._loadParams().subscribe(() => {                  
      switch (this._operation) {
        case 'open':          
          this._openUser(this._userId).subscribe(user => {
            this.userData = user;
            this._enabledActions();
          });
          break;
        default: 
          if (this._userId) {              
            this._openUser(this._userId).subscribe(user => {                  
              this.userData = user;
              this._enabledActions();
            });          
          } else {
            this._enabledActions();
          }
      }
    });
  }

  private _openUser(id: number): Observable<User> {    
      return this._userService.open(id).pipe(
        takeUntilDestroyed(this._destroyRef),
        map((userRsp: UserResponse) => {
          if (userRsp.accessControl ) {
            userRsp.user.objectMode = EnumObjectMode.READONLY;
            this._messagesService.addMessage(`${userRsp.user.objectKey} access denied. Opened in ${userRsp.accessControl?.terminal?.terminalName} at ${userRsp.accessControl?.createdAt}`, EnumMessageType.Error);
          } else {
            userRsp.user.objectMode = this._authService.getCurrentUser()?.role === EnumUserRole.VIEWER ? EnumObjectMode.READONLY : EnumObjectMode.EDITABLE;
          }
          return userRsp.user;
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
          
          // Validar que el ID sea seguro
          if (!idParam || !this._urlSecurityService.isValidRouteId(idParam)) {
            console.warn('Security: Invalid user ID detected:', idParam);
            this._messagesService.addMessage('ID de usuario inválido', EnumMessageType.Error);
            throw new Error('Invalid user ID');
          }
          
          this._userId = Number(idParam);          
          return;
        })
      );
    } else {
      return of(void 0);
    }
  }
  
  private _cancel(): void {    
    if (!this.formUserData.modified) {
      this.cancel.emit();    
      return;
    }
      
    this._modalService.showModal(CONFIRM_CANCEL)
      .pipe(takeUntilDestroyed(this._destroyRef))
      .subscribe(action => {          
        if (action === EnumActionsType.actionAccept) {
           this._userService.closeUser(this.userData?.user_id)
            .pipe(takeUntilDestroyed(this._destroyRef))
            .subscribe(() => {
              this.cancel.emit();   
            });      
        } else if (action === EnumActionsType.actionCancel) {
          // Usuario canceló                  
          
        }
      });   
  }

  private _save(): void {
    try {
      if (!this.formUserData.modified) {
        return;
      }

      const updatedUser = this._createUserRequest();
      
      let savedUser: Observable<User>;
      if (!updatedUser.user_id){
        savedUser = this._userService.createUser(updatedUser);
      } else{
        savedUser = this._userService.updateUser(updatedUser);
      }
      savedUser
        .pipe(takeUntilDestroyed(this._destroyRef))
        .subscribe(() => {
          this.save.emit(updatedUser);
        });
    } catch (error) {
      throw error;
    }
  }

  private _createUserRequest(): User {
    const formValues = this.formUserData.data;
    const userRequest = {...this.userData, ...formValues} as User;
    
    return userRequest; 
  }

  //#region Security  
  private _securityApply(): void {

    const actions = this._permissionsUserService.enabledActions(
      this._authService.getCurrentUser()?.role || EnumUserRole.VIEWER,
      EnumLiteralKeys.eForm_Users,
      this.makeConditions()
    );    
    this._actionService.setActions(actions);
  }

  private makeConditions(): string {
    // Aquí puedes construir la cadena de condiciones según tus necesidades
    return '#|V|#'; // Ejemplo simple
  }

   private _enabledActions() {    
    if (this.isReadyToSave()) {
      this._actionService.enable(EnumActions.eAction_Save);
    } else {      
      this._actionService.disable(EnumActions.eAction_Save);
    }
  }
  //#endregion

}
