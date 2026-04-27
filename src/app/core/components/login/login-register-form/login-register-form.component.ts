import { Component, DestroyRef, EventEmitter, inject, OnDestroy, OnInit, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { Subscription } from 'rxjs';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { Action, ActionService, EnumActionsType, EnumMessageType, FormValidationsDirective, GenericActionsComponent, GenericFormComponent, GenericMessageComponent, MessagesService, TranslatePipe } from '@lib/shared';
import { EnumActions } from 'libs/common/src/lib/enums/actions.enum';
import { AuthService, EnumUserRole } from '@lib/security';
import { HTTPServiceUser, User } from '@lib/users';
import { Router } from '@angular/router';

export class RegisterUser {
  user_mail: string = '';
  user_password: string = '';
  user_firstName: string = '';
  user_lastName: string = '';
  user_role: EnumUserRole = EnumUserRole.USER;
}

@Component({
  selector: 'app-login-register-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FormsModule, TranslatePipe, FormValidationsDirective, GenericActionsComponent, GenericFormComponent, GenericMessageComponent],
  templateUrl: './login-register-form.component.html',
  styleUrls: ['./login-register-form.component.scss']
})
export class LoginRegisterFormComponent implements OnInit, OnDestroy {

  private _subs: Subscription[] = [];

  @Output() register = new EventEmitter<RegisterUser>();
  @Output() cancel = new EventEmitter();

  registerForm: FormGroup = new FormGroup({});
  registerUser: RegisterUser = new RegisterUser();
  private readonly _destroyRef = inject(DestroyRef);

  constructor(
    private fb: FormBuilder,
    private _messagesService: MessagesService,
    private _actionService: ActionService,
    private _userService: HTTPServiceUser,
    private _router: Router
  ) {
    this._createForm();
  }

  isReadyToSave(): boolean {
    console.log(this.registerForm.valid,this.registerForm.dirty ); 
    return this.registerForm.valid && this.registerForm.dirty;
  }

  ngOnInit(): void {
    this._loadSecurityActions();
    this._enabledActions();
  }

  ngOnDestroy(): void {
    this._subs.forEach(sub => sub.unsubscribe());
  }

  onAction(action: EnumActionsType | EnumActions): void {
    switch (action) {
      case EnumActionsType.actionRegister:
        this._register();
        break;
      case EnumActionsType.actionCancel:
        this._cancel();
        break;
    }
  }

  private _createForm(): void {
    this.registerForm = this.fb.group({
      user_email: ['', [Validators.required, Validators.email]],
      user_firstName: ['', [Validators.required]],
      user_lastName: ['', [Validators.required]],
      user_password: ['', [Validators.required, Validators.minLength(6)]],
      confirmPassword: ['', [Validators.required]]
    }, {
      validators: this._passwordMatchValidator
    });

    this.registerForm.valueChanges
      .pipe(takeUntilDestroyed(this._destroyRef))
      .subscribe(() => {
        this._enabledActions();
      });
  }

  private _passwordMatchValidator(group: FormGroup): { [key: string]: boolean } | null {
    const password = group.get('user_password')?.value;
    const confirmPassword = group.get('confirmPassword')?.value;
    
    if (password !== confirmPassword) {
      return { passwordMismatch: true };
    }
    return null;
  }

  private _loadSecurityActions(): void {
    const actions: Action[] = [
      new Action('BUTTON.register', EnumActionsType.actionRegister, 'save', false),
      new Action('BUTTON.cancel', EnumActionsType.actionCancel, 'cancel', false)
    ];
    this._actionService.setActions(actions);
  }

  private _enabledActions(): void {
    if (this.isReadyToSave()) {
      this._actionService.enable(EnumActionsType.actionSave);
    } else {
      this._actionService.disable(EnumActionsType.actionSave);
    }
    this._actionService.enable(EnumActionsType.actionCancel);
  }

  private _register(): void {
    if (this.registerForm.valid) {
      const user: User = { ...this.registerForm.value, role: EnumUserRole.USER };

      this._userService.createUser(user).subscribe({
        next: (_registeredUser: User) => {
            this._messagesService.addMessage('MESSAGE.registrationSuccess', EnumMessageType.Success);
        },
        error: (_err: unknown) => {
          this._messagesService.addMessage('MESSAGE.registrationError', EnumMessageType.Error);
        }
      });
    
    } else {
      this._messagesService.addMessage(
        'Please fill all required fields correctly.',
        EnumMessageType.Error
      );
    }
  }

  private _cancel(): void {
    this._router.navigate(['/login']);
  }
}
