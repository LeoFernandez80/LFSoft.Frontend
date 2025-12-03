import { Component } from '@angular/core';
import { Router, RouterOutlet } from '@angular/router';
import { EnumActionsType } from '../../../generic/generic-actions/enums/actions-type.enums';
import { EnumActionsViewType } from '../../../generic/generic-actions/enums/actions-view-type.enums';
import { ActionService } from '../../../generic/generic-actions/services/actions.service';
import { DrawerService } from '../../../generic/generic-drawer/services/drawer.service';
import { EnumMessageType } from '../../../generic/generic-message/enums/message-type.model';
import { MessagesService } from '../../../generic/generic-message/services/message.service';
import { AuthService } from '../../security/services/auth.service';
import { UrlSecurityService } from '../../security/services/url-security.service';
import { TranslationService } from '../../../generic/generic-translate/translation.service';
import { NgFor } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatSelectModule } from '@angular/material/select';
import { GenericActionsComponent } from '../../../generic/generic-actions/generic-actions.component';
import { GenericMessageComponent } from '../../../generic/generic-message/generic-message';
import { GenericModalComponent } from '../../../generic/generic-modal/generic-modal.component';
import { ConfigurationsDrawerComponent } from '../configurations-drawer/configurations-drawer.component';
import { Action } from '../../../generic/generic-actions/models/actions.model';
import { EnumActionsStyle } from '../../../generic/generic-actions/enums/actions-styles.enums';
import { EnumPermissionType } from '../../../components/security-module/models/enum-permission.type.model';

@Component({
  selector: 'app-home-container',
  imports: [ RouterOutlet, NgFor, FormsModule,
      MatFormFieldModule,
      MatSelectModule,    
      MatIconModule,
      GenericModalComponent,
      GenericMessageComponent,
      GenericActionsComponent,
      ConfigurationsDrawerComponent,],
  templateUrl: './home-container.component.html',
  styleUrl: './home-container.component.scss',
  providers: [TranslationService, MessagesService, DrawerService, ActionService, AuthService, UrlSecurityService]
})
export class HomeContainerComponent {

  constructor( private _router: Router,   
    private _messagesService: MessagesService, private _actionService: ActionService, 
    private _drawerService: DrawerService, private _authService: AuthService,
    private _urlSecurityService: UrlSecurityService, private _translationService: TranslationService) { 
          this._translationService.setLanguage('es');
    document.body.classList.add('theme-blue');
    this._loadSecurityActions();    
  }

  
  changeTheme(theme: string) {
 
    // Cambia la clase en el body para que las variables sean globales
    document.body.classList.remove( 'theme-light', 'theme-blue-light', 'theme-dark', 'theme-blue');
    if (theme) {
      document.body.classList.add(theme);
    }
  }

  onAction(action: EnumActionsType): void {
    switch (action) {
      case EnumActionsType.openConfig:
        this._openConfiguration();
        break;
      case EnumActionsType.openEntities:
        this._openEntities();      
        break;
      case EnumActionsType.openPersons:
          this._openPersons();       
        break;
      case EnumActionsType.openArticles:
        this._openArticles();        
        break;
        case EnumActionsType.openUsers:
          this._openUsers();          
        break;
      case EnumActionsType.openQuotes:
          this._openQuotes();        
        break;
      case EnumActionsType.openDocuments:
          this._openDocuments();        
        break;
      case EnumActionsType.openInvoices:
          this._openInvoices();       
        break;
      case EnumActionsType.openHome:        
          this._openHome();       
        break;      
      case EnumActionsType.actionLogout:
        this._actionLogout();
        break;
    }
  }
  private _actionLogout(): void {
    try {
      // Crear URL de forma segura
      const urlTree = this._router.createUrlTree(['login']);
      const url = this._router.serializeUrl(urlTree);
      
      // Validar URL antes de abrir
      if (!this._urlSecurityService.isSecureUrl(url)) {
        this._messagesService.addMessage("URL no segura detectada", EnumMessageType.Error);
        return;
      }
      
      // Abrir en nueva ventana
      const windowRef = window.open(url, '_self', 'noopener,noreferrer');
      if (!windowRef) {
        this._messagesService.addMessage("No se pudo abrir la ventana. Verifica la configuración del navegador.", EnumMessageType.Warning);
      }
      this._authService.logout();
    } catch (error) {
      console.error('Error opening homes:', error);
      this._messagesService.addMessage("Error al abrir citas en nueva pestaña", EnumMessageType.Error);
    }

  }

  private _openConfiguration(): void {
    this._openDrawer();
  }

  private _openEntities(): void {
    try {
      // Crear URL de forma segura
      const urlTree = this._router.createUrlTree(['entities-module', 'entities']);
      const url = this._router.serializeUrl(urlTree);
      
      // Validar URL antes de abrir
      if (!this._urlSecurityService.isSecureUrl(url)) {
        this._messagesService.addMessage("URL no segura detectada", EnumMessageType.Error);
        return;
      }
      
      // Abrir en nueva ventana
      const windowRef = window.open(url, '_self', 'noopener,noreferrer');
      if (!windowRef) {
        this._messagesService.addMessage("No se pudo abrir la ventana. Verifica la configuración del navegador.", EnumMessageType.Warning);
      }
    } catch (error) {
      console.error('Error opening entities:', error);
      this._messagesService.addMessage("Error al abrir entidades en nueva pestaña", EnumMessageType.Error);
    }
  }
  private _openPersons(): void {
    try {
      // Crear URL de forma segura
      const urlTree = this._router.createUrlTree(['persons-module', 'persons']);
      const url = this._router.serializeUrl(urlTree);
      
      // Validar URL antes de abrir
      if (!this._urlSecurityService.isSecureUrl(url)) {
        this._messagesService.addMessage("URL no segura detectada", EnumMessageType.Error);
        return;
      }
      
      // Abrir en nueva ventana
      const windowRef = window.open(url, '_self', 'noopener,noreferrer');
      if (!windowRef) {
        this._messagesService.addMessage("No se pudo abrir la ventana. Verifica la configuración del navegador.", EnumMessageType.Warning);
      }
    } catch (error) {
      console.error('Error opening persons:', error);
      this._messagesService.addMessage("Error al abrir personas en nueva pestaña", EnumMessageType.Error);
    }
  }

  private _openArticles(): void {
    try {
      // Crear URL de forma segura
      const urlTree = this._router.createUrlTree(['articles-module', 'articles']);
      const url = this._router.serializeUrl(urlTree);
      
      // Validar URL antes de abrir
      if (!this._urlSecurityService.isSecureUrl(url)) {
        this._messagesService.addMessage("URL no segura detectada", EnumMessageType.Error);
        return;
      }
      
      // Abrir en nueva ventana
      const windowRef = window.open(url, '_self', 'noopener,noreferrer');
      if (!windowRef) {
        this._messagesService.addMessage("No se pudo abrir la ventana. Verifica la configuración del navegador.", EnumMessageType.Warning);
      }
    } catch (error) {
      console.error('Error opening articles:', error);
      this._messagesService.addMessage("Error al abrir artículos en nueva pestaña", EnumMessageType.Error);
    }
  }

  private _openQuotes(): void {
    try {
      // Crear URL de forma segura
      const urlTree = this._router.createUrlTree(['quotes-module', 'quotes']);
      const url = this._router.serializeUrl(urlTree);
      
      // Validar URL antes de abrir
      if (!this._urlSecurityService.isSecureUrl(url)) {
        this._messagesService.addMessage("URL no segura detectada", EnumMessageType.Error);
        return;
      }
      
      // Abrir en nueva ventana
      const windowRef = window.open(url, '_self', 'noopener,noreferrer');
      if (!windowRef) {
        this._messagesService.addMessage("No se pudo abrir la ventana. Verifica la configuración del navegador.", EnumMessageType.Warning);
      }
    } catch (error) {
      console.error('Error opening quotes:', error);
      this._messagesService.addMessage("Error al abrir citas en nueva pestaña", EnumMessageType.Error);
    }
  }

  private _openDocuments(): void {
    try {
      // Crear URL de forma segura
      const urlTree = this._router.createUrlTree(['documents-module', 'documents']);
      const url = this._router.serializeUrl(urlTree);
      
      // Validar URL antes de abrir
      if (!this._urlSecurityService.isSecureUrl(url)) {
        this._messagesService.addMessage("URL no segura detectada", EnumMessageType.Error);
        return;
      }
      
      // Abrir en nueva ventana
      const windowRef = window.open(url, '_self', 'noopener,noreferrer');
      if (!windowRef) {
        this._messagesService.addMessage("No se pudo abrir la ventana. Verifica la configuración del navegador.", EnumMessageType.Warning);
      }
    } catch (error) {
      console.error('Error opening documents:', error);
      this._messagesService.addMessage("Error al abrir documentos en nueva pestaña", EnumMessageType.Error);
    }
  }

  private _openInvoices(): void {
    try {
      // Crear URL de forma segura
      const urlTree = this._router.createUrlTree(['invoices-module', 'invoices']);
      const url = this._router.serializeUrl(urlTree);
      
      // Validar URL antes de abrir
      if (!this._urlSecurityService.isSecureUrl(url)) {
        this._messagesService.addMessage("URL no segura detectada", EnumMessageType.Error);
        return;
      }
      
      // Abrir en nueva ventana
      const windowRef = window.open(url, '_self', 'noopener,noreferrer');
      if (!windowRef) {
        this._messagesService.addMessage("No se pudo abrir la ventana. Verifica la configuración del navegador.", EnumMessageType.Warning);
      }
    } catch (error) {
      console.error('Error opening invoices:', error);
      this._messagesService.addMessage("Error al abrir facturas en nueva pestaña", EnumMessageType.Error);
    }
  } 

  
  private _openUsers(): void {
    try {
      // Crear URL de forma segura
      const urlTree = this._router.createUrlTree(['users-module', 'users']);
      const url = this._router.serializeUrl(urlTree);
      
      // Validar URL antes de abrir
      if (!this._urlSecurityService.isSecureUrl(url)) {
        this._messagesService.addMessage("URL no segura detectada", EnumMessageType.Error);
        return;
      }
      
      // Abrir en nueva ventana
      const windowRef = window.open(url, '_self', 'noopener,noreferrer');
      if (!windowRef) {
        this._messagesService.addMessage("No se pudo abrir la ventana. Verifica la configuración del navegador.", EnumMessageType.Warning);
      }
    } catch (error) {
      console.error('Error opening users:', error);
      this._messagesService.addMessage("Error al abrir citas en nueva pestaña", EnumMessageType.Error);
    }
  }

  private _openHome(): void {
    try {
      // Crear URL de forma segura
      const urlTree = this._router.createUrlTree(['home']);
      const url = this._router.serializeUrl(urlTree);
      
      // Validar URL antes de abrir
      if (!this._urlSecurityService.isSecureUrl(url)) {
        this._messagesService.addMessage("URL no segura detectada", EnumMessageType.Error);
        return;
      }
      
      // Abrir en nueva ventana
      const windowRef = window.open(url, '_self', 'noopener,noreferrer');
      if (!windowRef) {
        this._messagesService.addMessage("No se pudo abrir la ventana. Verifica la configuración del navegador.", EnumMessageType.Warning);
      }
    } catch (error) {
      console.error('Error opening homes:', error);
      this._messagesService.addMessage("Error al abrir citas en nueva pestaña", EnumMessageType.Error);
    }
  }

  private _loadSecurityActions(): void {
    const actions: Action[] = [
      new Action('BUTTON.home', EnumActionsType.openHome, 'home', false,EnumActionsViewType.view16x16),
      new Action('BUTTON.entities', EnumActionsType.openEntities, 'data_object', false,EnumActionsViewType.view16x16, EnumActionsStyle.primary, [EnumPermissionType.VIEW_ENTITIES]),
      new Action('BUTTON.persons', EnumActionsType.openPersons, 'person', false,EnumActionsViewType.view16x16, EnumActionsStyle.primary, [EnumPermissionType.VIEW_PERSONS]),
      new Action('BUTTON.articles', EnumActionsType.openArticles, 'article', false,EnumActionsViewType.view16x16, EnumActionsStyle.primary, [EnumPermissionType.VIEW_ARTICLES]),
      new Action('BUTTON.documents', EnumActionsType.openDocuments, 'description', false,EnumActionsViewType.view16x16, EnumActionsStyle.primary, [EnumPermissionType.VIEW_PERSONS]),
      new Action('BUTTON.users', EnumActionsType.openUsers, 'group', false,EnumActionsViewType.view16x16, EnumActionsStyle.primary, [EnumPermissionType.VIEW_USERS]),
      new Action('BUTTON.invoices', EnumActionsType.openInvoices, 'date_range', false,EnumActionsViewType.view16x16, EnumActionsStyle.primary, [EnumPermissionType.VIEW_QUOTES]),
      new Action('BUTTON.config', EnumActionsType.openConfig, 'settings', false,EnumActionsViewType.view16x16, EnumActionsStyle.primary, [EnumPermissionType.VIEW_CONFIG]),
      new Action('BUTTON.logout', EnumActionsType.actionLogout, 'exit_to_app', false,EnumActionsViewType.view16x16, EnumActionsStyle.primary),

    ];
    this._actionService.setActions(actions);
  }
  
  private _openDrawer() {
    this._drawerService.show({
      width: '600px',
      position: 'right'
    })
  }
}
