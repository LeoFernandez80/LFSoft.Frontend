import { Component, DestroyRef, EventEmitter, OnDestroy, OnInit, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { UserService } from '../../users-module/services/user.service';
import { Subscription } from 'rxjs';
import { ActionService } from '../../../generic/generic-actions/services/actions.service';
import { Action } from '../../../generic/generic-actions/models/actions.model';
import { EnumActionsType } from '../../../generic/generic-actions/enums/actions-type.enums';
import { GenericActionsComponent } from '../../../generic/generic-actions/generic-actions.component';
import { AuthService } from '../../../core/security/services/auth.service';
import { LoginUser } from '../models/login-user.model';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { GenericFormComponent } from '../../../generic/generic-form/generic-form.component';
import { TranslatePipe } from '../../../generic/generic-translate/translate.pipe';
import { FormValidationsDirective } from '../../../generic/generic-form-validations/form-validations.directive';
import { MessagesService } from '../../../generic/generic-message/services/message.service';
import { EnumMessageType } from '../../../generic/generic-message/enums/message-type.model';

@Component({
  selector: 'app-login-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FormsModule, TranslatePipe, FormValidationsDirective, GenericActionsComponent, GenericFormComponent],
  templateUrl: './login-form.component.html',
  styleUrls: ['./login-form.component.scss']
})
export class LoginFormComponent implements OnInit, OnDestroy {

  private _subs: Subscription[] = [];

  @Output() acept = new EventEmitter();

  loginForm: FormGroup = new FormGroup({});
  loguinUser: LoginUser  = new LoginUser();
  private _destroyRef: DestroyRef | undefined;

  constructor(private fb: FormBuilder, private _authService: AuthService, private _userService: UserService, 
    private _messagesService: MessagesService, private _actionService: ActionService) { 
        this._createForm();
  }

  isReadyToSave(): boolean {
    return this.loginForm.valid && this.loginForm.dirty;
  }

  ngOnInit(): void {
    this._loadSecurityActions();
    this.loginForm.reset({
      username: 'admin@lfsoft.com',
      password: 'admin123'
    });    
  }

  ngOnDestroy(): void {
    this._actionService.clearActions();
    this._subs.forEach(s => s.unsubscribe());
  }

  onAction(actionType: EnumActionsType) {    
    if (actionType === EnumActionsType.actionLogin) {
      this._onLogin();
    } else if (actionType === EnumActionsType.actionReset) {
      this._onReset();
    }
  }

  private _onLogin(): void {
    const loginUser = this.loginForm.value;
    
    // Usar directamente el servicio de autenticación que se conecta al backend
    this._authService.login(loginUser.username, loginUser.password).subscribe({
      next: (loggedInUser) => {
        this._messagesService.addMessage('Login exitoso', EnumMessageType.Success, 3000);
        this.acept.emit();
      },
      error: (err) => {
        console.error('Error during login', err);
        this._messagesService.addMessage('Error al iniciar sesión', EnumMessageType.Error, 5000);
      }
    });
  }

  private _onReset(): void {
    this.loginForm.reset();    
  }

  private _createForm() {
    this.loginForm = this.fb.group({
      username: [null, [Validators.required, Validators.email]],
      password: [null, [Validators.required, Validators.minLength(6)]]
    });
    this.loginForm.statusChanges
      .pipe(takeUntilDestroyed(this._destroyRef))
      .subscribe(() => {       
        this._enabledActions();
      });
  }

    private _loadSecurityActions(): void {
    const actions: Action[] = [
      new Action('BUTTON.login', EnumActionsType.actionLogin, 'logn', false),
      new Action('BUTTON.reset', EnumActionsType.actionReset, 'reset', false)
    ];
    this._actionService.setActions(actions);
  }
    private _enabledActions() {    
    if (this.isReadyToSave()) {
      this._actionService.enable(EnumActionsType.actionLogin);
    } else {
      this._actionService.disable(EnumActionsType.actionLogin);
    }
  }
}
