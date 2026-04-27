import { Component, DestroyRef, inject, OnInit } from '@angular/core';
import { Router, RouterOutlet } from '@angular/router';
import { NgFor } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatSelectModule } from '@angular/material/select';
import { ConfigurationsDrawerComponent } from '../configurations-drawer/configurations-drawer.component';
import { UserAvatarComponent } from '../user-avatar/user-avatar.component';
import { AuthService, EnumUserRole, UrlSecurityService } from '@lib/security';
import { Action, ActionService, DrawerService, EnumActionsIcons, EnumActionsStyle, EnumActionsType, EnumActionsViewType, EnumMessageType, GenericActionsComponent, GenericMessageComponent, GenericModalComponent, MessagesService, TranslationService, UrlService } from '@lib/shared';
import { Configuration, ConfigurationService, EnumActions } from '@lib/common';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { MenuesService } from 'libs/common/src/lib/services/menues.service';
import { UserPermissionsService } from 'libs/users/src/lib/permissions/services/user-permissions.service';
import { EnumLiteralKeys } from 'libs/common/src/lib/enums/literal-keys.enum';


@Component({
  selector: 'app-home-container',
  imports: [ RouterOutlet, NgFor, FormsModule,
      MatFormFieldModule,
      MatSelectModule,    
      MatIconModule,
      GenericMessageComponent,
      GenericActionsComponent,
      GenericModalComponent,
      ConfigurationsDrawerComponent,
      UserAvatarComponent],
  templateUrl: './home-container.component.html',
  styleUrl: './home-container.component.scss',
  providers: [TranslationService, MessagesService, ActionService, AuthService, UrlSecurityService],
  standalone: true
})
export class HomeContainerComponent  implements OnInit {

  config: Configuration = new Configuration();

  private readonly _destroyRef = inject(DestroyRef);

  constructor( private _router: Router,   
    private _actionService: ActionService, 
    private _drawerService: DrawerService, private _authService: AuthService,
    private _translationService: TranslationService,
    private _configurationService: ConfigurationService,
    private _menuesService: MenuesService,
    private _messagesService: MessagesService,
  private _permissionsUserService: UserPermissionsService) { 
      this._translationService.setLanguage('es');
      document.body.classList.add('theme-blue');
      //this._loadSecurityActions();    
      this._loadConfiguration();
      this._setSubscriptions();
  }

  ngOnInit(): void {
    this._securityApply();
  }

  changeTheme(theme: string) {
 
    // Cambia la clase en el body para que las variables sean globales
    document.body.classList.remove( 'theme-light', 'theme-blue-light', 'theme-dark', 'theme-blue');
    if (theme) {
      document.body.classList.add(theme);
    }
  }

  onAction(action: EnumActionsType | EnumActions): void {
    console.log("on acrtion", action);
    try {
      this._menuesService.openMenu(action);
    } catch (error) {
      this._messagesService.addMessage("Error al ejecutar acción", EnumMessageType.Error);
    }
  }
  
  // private _openConfiguration(): void {
  //   this._openDrawer();
  // }

  // private _openDrawer() {
  //   this._drawerService.show({
  //     width: '600px',
  //     position: 'right'
  //   })
  // }

  private _securityApply(): void {
    const actions = this._permissionsUserService.enabledActions(
      this._authService.getCurrentUser()?.role || EnumUserRole.EMPTY,
      EnumLiteralKeys.eModule_Home,
      this.makeConditions()
    );
    
    this._actionService.setActions(actions);
  }

  private makeConditions(): string {
    // Aquí puedes construir la cadena de condiciones según tus necesidades
    return '#|V|#'; // Ejemplo simple
  }
  


  private _loadConfiguration(): void {
    this._configurationService.loadUserConfiguration( this._authService.getCurrentUser()?.id! ).pipe(takeUntilDestroyed(this._destroyRef));
  }

  private _setSubscriptions(): void {
    this._configurationService.getConfiguration().pipe(takeUntilDestroyed(this._destroyRef))
      .subscribe(config => {
        if (config) {
          this.config = config;
        }
      });
  }
}
