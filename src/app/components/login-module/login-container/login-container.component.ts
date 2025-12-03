import { Component } from '@angular/core';
import { LoginSliderComponent } from '../login-slider/login-slider.component';
import { LoginFormComponent } from '../login-form/login-form.component';
import { NgIf } from '@angular/common';
import { Router } from '@angular/router';
import { AuthService } from '../../../core/security/services/auth.service';
import { UrlSecurityService } from '../../../core/security/services/url-security.service';
import { EnumMessageType } from '../../../generic/generic-message/enums/message-type.model';
import { MessagesService } from '../../../generic/generic-message/services/message.service';

@Component({
  selector: 'app-login-container',
  standalone: true,
  imports: [NgIf,LoginSliderComponent, LoginFormComponent],
  templateUrl: './login-container.component.html',
  styleUrls: ['./login-container.component.scss']
})
export class LoginContainerComponent {
  // Lista de rutas de imágenes (se pueden reemplazar o inyectar desde arriba)
  images: string[] = [
    'images/_DSC0092.jpg',
    'images/_DSC0093.jpg',
    'images/_DSC0114.jpg',
    'images/_DSC0115.jpg'
  ];

  constructor(private _router: Router,private _authService: AuthService, private _messagesService: MessagesService,private _urlSecurityService: UrlSecurityService ) { }
  onLoginSuccess(user: any): void {
    // El usuario ya fue autenticado por LoginFormComponent (AuthService.login)
    // Navegar a la ruta /home dentro de la SPA
    this._router.navigate(['home']).catch(err => {
      console.error('Navigation error after login:', err);
      this._messagesService.addMessage('Error al navegar después del login', EnumMessageType.Error);
    });
  }

  onCancel(): void {
    // Acción de cancelar - limpiar campos o navegar.
    console.log('Login cancelado');
  }
}
