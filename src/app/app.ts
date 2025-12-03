import { Component, ElementRef, Renderer2, signal } from '@angular/core';
import { Router, RouterOutlet } from '@angular/router';
import { TranslatePipe } from './generic/generic-translate/translate.pipe';
import { TranslationService } from './generic/generic-translate/translation.service';
import { FormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { NgFor, NgIf } from '@angular/common';
import { GenericModalComponent } from './generic/generic-modal/generic-modal.component';
import { GenericMessageComponent } from './generic/generic-message/generic-message';
import { ConfigurationsDrawerComponent } from './core/components/configurations-drawer/configurations-drawer.component';
import { DrawerService } from './generic/generic-drawer/services/drawer.service';
import { MatIconModule } from '@angular/material/icon';
import { ActionService } from './generic/generic-actions/services/actions.service';
import { GenericActionsComponent } from './generic/generic-actions/generic-actions.component';
import { MessagesService } from './generic/generic-message/services/message.service';
import { AuthService } from './core/security/services/auth.service';
import { UrlSecurityService } from './core/security/services/url-security.service';
import { HomeContainerComponent } from './core/components/home-container/home-container.component';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, NgIf, NgFor, FormsModule,
      MatFormFieldModule,
      MatSelectModule,    
      MatIconModule,
      GenericModalComponent,
      GenericMessageComponent,
      GenericActionsComponent,
      ConfigurationsDrawerComponent,
      GenericMessageComponent,
    HomeContainerComponent],
  templateUrl: './app.html',
  styleUrl: './app.scss',
  providers: [TranslationService, MessagesService, DrawerService, ActionService, AuthService, UrlSecurityService]
})
export class App {
  protected readonly title = signal('BDCSoft Application');
  
  constructor(private _authService: AuthService,
     private _translationService: TranslationService) {
    this._translationService.setLanguage('es');
    document.body.classList.add('theme-blue');
    // No forzamos login automático aquí: permitimos que la pantalla de login se muestre al inicio
    // Si necesitás el mock-login por defecto, revertir esta línea.
    
  }

  isAuthenticated(): boolean {       
    return this._authService.isAuthenticated();
  }
  
  
  
  changeTheme(theme: string) {
 
    // Cambia la clase en el body para que las variables sean globales
    document.body.classList.remove( 'theme-light', 'theme-blue-light', 'theme-dark', 'theme-blue');
    if (theme) {
      document.body.classList.add(theme);
    }
  }

  // onAction(action: EnumActionsType): void {
  //   switch (action) {
  //     case EnumActionsType.openConfig:
  //       this._openConfiguration();
  //       break;
  //     case EnumActionsType.openEntities:
  //       // Verificar permiso antes de abrir
  //       if (this._authService.hasPermission(PermissionType.VIEW_ENTITIES)) {
  //         this._openEntities();
  //       } else {
  //         this._messagesService.addMessage("No tiene permisos para ver entidades", EnumMessageType.Error);
  //       }
  //       break;
  //     case EnumActionsType.openPersons:
  //       // Verificar permiso antes de abrir
  //         this._openPersons();
       
  //       break;
  //     case EnumActionsType.openArticles:
  //       // Verificar permiso antes de abrir
  //       if (this._authService.hasPermission(PermissionType.VIEW_ARTICLES)) {
  //         this._openArticles();
  //       } else {
  //         this._messagesService.addMessage("No tiene permisos para ver artículos", EnumMessageType.Error);
  //       }
  //       break;
  //     case EnumActionsType.openUsers:
  //       // Verificar permiso antes de abrir
  //       if (this._authService.hasPermission(PermissionType.VIEW_QUOTES)) {
  //         this._openUsers();
  //       } else {
  //         this._messagesService.addMessage("No tiene permisos para ver citas", EnumMessageType.Error);
  //       }
  //       break;
  //     case EnumActionsType.openHome:
        
  //         this._openHome();
       
  //       break;// Verificar permiso antes de abrir
      
  //     case EnumActionsType.actionLogout:
  //       this._actionLogout();
  //       break;
  //   }
  // }
  // private _actionLogout(): void {
  //   try {
  //     // Crear URL de forma segura
  //     const urlTree = this._router.createUrlTree(['login']);
  //     const url = this._router.serializeUrl(urlTree);
      
  //     // Validar URL antes de abrir
  //     if (!this._urlSecurityService.isSecureUrl(url)) {
  //       this._messagesService.addMessage("URL no segura detectada", EnumMessageType.Error);
  //       return;
  //     }
      
  //     // Abrir en nueva ventana
  //     const windowRef = window.open(url, '_self', 'noopener,noreferrer');
  //     if (!windowRef) {
  //       this._messagesService.addMessage("No se pudo abrir la ventana. Verifica la configuración del navegador.", EnumMessageType.Warning);
  //     }
  //     this._authService.logout();
  //   } catch (error) {
  //     console.error('Error opening homes:', error);
  //     this._messagesService.addMessage("Error al abrir citas en nueva pestaña", EnumMessageType.Error);
  //   }

  // }

  // private _openConfiguration(): void {
  //   this._openDrawer();
  // }

  // private _openEntities(): void {
  //   try {
  //     // Crear URL de forma segura
  //     const urlTree = this._router.createUrlTree(['entities-module', 'entities']);
  //     const url = this._router.serializeUrl(urlTree);
      
  //     // Validar URL antes de abrir
  //     if (!this._urlSecurityService.isSecureUrl(url)) {
  //       this._messagesService.addMessage("URL no segura detectada", EnumMessageType.Error);
  //       return;
  //     }
      
  //     // Abrir en nueva ventana
  //     const windowRef = window.open(url, '_self', 'noopener,noreferrer');
  //     if (!windowRef) {
  //       this._messagesService.addMessage("No se pudo abrir la ventana. Verifica la configuración del navegador.", EnumMessageType.Warning);
  //     }
  //   } catch (error) {
  //     console.error('Error opening entities:', error);
  //     this._messagesService.addMessage("Error al abrir entidades en nueva pestaña", EnumMessageType.Error);
  //   }
  // }
  // private _openPersons(): void {
  //   try {
  //     // Crear URL de forma segura
  //     const urlTree = this._router.createUrlTree(['persons-module', 'persons']);
  //     const url = this._router.serializeUrl(urlTree);
      
  //     // Validar URL antes de abrir
  //     if (!this._urlSecurityService.isSecureUrl(url)) {
  //       this._messagesService.addMessage("URL no segura detectada", EnumMessageType.Error);
  //       return;
  //     }
      
  //     // Abrir en nueva ventana
  //     const windowRef = window.open(url, '_self', 'noopener,noreferrer');
  //     if (!windowRef) {
  //       this._messagesService.addMessage("No se pudo abrir la ventana. Verifica la configuración del navegador.", EnumMessageType.Warning);
  //     }
  //   } catch (error) {
  //     console.error('Error opening persons:', error);
  //     this._messagesService.addMessage("Error al abrir personas en nueva pestaña", EnumMessageType.Error);
  //   }
  // }

  // private _openArticles(): void {
  //   try {
  //     // Crear URL de forma segura
  //     const urlTree = this._router.createUrlTree(['articles-module', 'articles']);
  //     const url = this._router.serializeUrl(urlTree);
      
  //     // Validar URL antes de abrir
  //     if (!this._urlSecurityService.isSecureUrl(url)) {
  //       this._messagesService.addMessage("URL no segura detectada", EnumMessageType.Error);
  //       return;
  //     }
      
  //     // Abrir en nueva ventana
  //     const windowRef = window.open(url, '_self', 'noopener,noreferrer');
  //     if (!windowRef) {
  //       this._messagesService.addMessage("No se pudo abrir la ventana. Verifica la configuración del navegador.", EnumMessageType.Warning);
  //     }
  //   } catch (error) {
  //     console.error('Error opening articles:', error);
  //     this._messagesService.addMessage("Error al abrir artículos en nueva pestaña", EnumMessageType.Error);
  //   }
  // }

  
  // private _openUsers(): void {
  //   try {
  //     // Crear URL de forma segura
  //     const urlTree = this._router.createUrlTree(['users-module', 'users']);
  //     const url = this._router.serializeUrl(urlTree);
      
  //     // Validar URL antes de abrir
  //     if (!this._urlSecurityService.isSecureUrl(url)) {
  //       this._messagesService.addMessage("URL no segura detectada", EnumMessageType.Error);
  //       return;
  //     }
      
  //     // Abrir en nueva ventana
  //     const windowRef = window.open(url, '_self', 'noopener,noreferrer');
  //     if (!windowRef) {
  //       this._messagesService.addMessage("No se pudo abrir la ventana. Verifica la configuración del navegador.", EnumMessageType.Warning);
  //     }
  //   } catch (error) {
  //     console.error('Error opening users:', error);
  //     this._messagesService.addMessage("Error al abrir citas en nueva pestaña", EnumMessageType.Error);
  //   }
  // }

  // private _openHome(): void {
  //   try {
  //     // Crear URL de forma segura
  //     const urlTree = this._router.createUrlTree(['home']);
  //     const url = this._router.serializeUrl(urlTree);
      
  //     // Validar URL antes de abrir
  //     if (!this._urlSecurityService.isSecureUrl(url)) {
  //       this._messagesService.addMessage("URL no segura detectada", EnumMessageType.Error);
  //       return;
  //     }
      
  //     // Abrir en nueva ventana
  //     const windowRef = window.open(url, '_self', 'noopener,noreferrer');
  //     if (!windowRef) {
  //       this._messagesService.addMessage("No se pudo abrir la ventana. Verifica la configuración del navegador.", EnumMessageType.Warning);
  //     }
  //   } catch (error) {
  //     console.error('Error opening homes:', error);
  //     this._messagesService.addMessage("Error al abrir citas en nueva pestaña", EnumMessageType.Error);
  //   }
  // }

  // private _loadSecurityActions(): void {
  //   const actions: Action[] = [
  //     new Action('BUTTON.home', EnumActionsType.openHome, 'home', false,EnumActionsViewType.view16x16),
  //     new Action('BUTTON.entities', EnumActionsType.openEntities, 'data_object', false,EnumActionsViewType.view16x16),
  //     new Action('BUTTON.persons', EnumActionsType.openPersons, 'person', false,EnumActionsViewType.view16x16),
  //     new Action('BUTTON.articles', EnumActionsType.openArticles, 'article', false,EnumActionsViewType.view16x16),
  //     new Action('BUTTON.users', EnumActionsType.openUsers, 'group', false,EnumActionsViewType.view16x16),
  //     new Action('BUTTON.config', EnumActionsType.openConfig, 'settings', false,EnumActionsViewType.view16x16),
  //     new Action('BUTTON.logout', EnumActionsType.actionLogout, 'exit_to_app', false,EnumActionsViewType.view16x16),

  //   ];
  //   this._actionService.setActions(actions);
  // }
  
  // private _openDrawer() {
  //   this._drawerService.show({
  //     width: '600px',
  //     position: 'right'
  //   })
  // }
  
}
