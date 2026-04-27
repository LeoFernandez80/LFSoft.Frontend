import { Component, DestroyRef, EventEmitter, OnDestroy, OnInit, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { Subscription } from 'rxjs';
import { AuthService } from '@lib/security';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { Action, ActionService, EnumActionsType, EnumMessageType, FormValidationsDirective, GenericActionsComponent, GenericFormComponent, MessagesService, TranslatePipe } from '@lib/shared';
import { EnumActions } from 'libs/common/src/lib/enums/actions.enum';

export class LoginUser {
  userName: string = '';
  password: string = '';
}

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
  @Output() register = new EventEmitter();

  loginForm: FormGroup = new FormGroup({});
  loguinUser: LoginUser  = new LoginUser();
  private _destroyRef: DestroyRef | undefined;

  constructor(private fb: FormBuilder, private _authService: AuthService,
    private _messagesService: MessagesService, private _actionService: ActionService) { 
        this._createForm();
  }

  isReadyToSave(): boolean {
    return this.loginForm.valid;
  }

  ngOnInit(): void {
    this._loadSecurityActions();
    this.loginForm.reset({
      username: 'diego.diaz@lfsoft.com',
      password: 'Password123!'
    }, { emitEvent: true });    
  }

  ngOnDestroy(): void {
    this._actionService.clearActions();
    this._subs.forEach(s => s.unsubscribe());
  }

  onAction(actionType: EnumActionsType | EnumActions) {   
    switch (actionType) {
      case EnumActionsType.actionLogin:
        this._onLogin();
        break;
      case EnumActionsType.actionReset:
        this._onReset();
        break;
      case EnumActionsType.actionRegister:
        this._onRegister();
        break;
    }
  }

  private _onLogin(): void {
    const loginUser = this.loginForm.value;
    
    // Usar directamente el servicio de autenticación que se conecta al backend
    this._authService.login(loginUser.username, loginUser.password).subscribe({
      next: (_loggedInUser: unknown) => {
        this._messagesService.addMessage('MESSAGE.welcome', EnumMessageType.Success, 3000);
        this.acept.emit();
      },
      error: (_err: unknown) => {
        this._messagesService.addMessage('MESSAGE.loginError', EnumMessageType.Error, 5000);
      }
    });
  }

  private _onReset(): void {
    this.loginForm.reset();    
  }

  private _onRegister(): void {
    this.register.emit();
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
      new Action('BUTTON.reset', EnumActionsType.actionReset, 'reset', false),
      new Action('BUTTON.register', EnumActionsType.actionRegister, 'register', false)

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
