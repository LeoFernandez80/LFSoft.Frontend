import { Component, DestroyRef, inject, OnInit } from '@angular/core';
import { Router, RouterOutlet } from '@angular/router';
import { NgFor } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatSelectModule } from '@angular/material/select';
import { AuthService, EnumUserRole, UrlSecurityService } from '@lib/security';
import { ActionService, DrawerService, EnumActionsIcons, EnumActionsStyle, EnumActionsType, EnumActionsViewType, EnumMessageType, GenericActionsComponent, GenericMessageComponent, GenericModalComponent, MessagesService, TranslationService, UrlService } from '@lib/shared';
import { ConfigurationItem, ConfigurationService, EnumActions } from '@lib/common';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { MenuesService } from 'libs/common/src/lib/services/menues.service';
import { UserPermissionsService } from 'libs/security/src/lib/permissions/services/user-permissions.service';
import { EnumLiteralKeys } from 'libs/common/src/lib/enums/literal-keys.enum';


@Component({
  selector: 'app-basic-configuration-dashboard',
  imports: [ RouterOutlet, NgFor, FormsModule,
      MatFormFieldModule,
      MatSelectModule,    
      MatIconModule,
      GenericMessageComponent,
      GenericActionsComponent,
      GenericModalComponent
      ],
  templateUrl: './basic-configuration-dashboard.component.html',
  styleUrl: './basic-configuration-dashboard.component.scss',
  providers: [TranslationService, MessagesService, AuthService, UrlSecurityService],
  standalone: true
})
export class BasicConfigurationDashboardComponent  implements OnInit {

  config: ConfigurationItem = new ConfigurationItem();

  private readonly _destroyRef = inject(DestroyRef);

  constructor( private _router: Router,   
    private _actionService: ActionService, 
    private _authService: AuthService,
    private _configurationService: ConfigurationService,
    private _menuesService: MenuesService,
    private _messagesService: MessagesService,
    private _permissionsUserService: UserPermissionsService) { 
      this._setSubscriptions();
  }

  ngOnInit(): void {
    this._securityApply();
  }

  onAction(action: EnumActionsType | EnumActions): void {
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
      EnumLiteralKeys.eModule_BasicConfiguration,
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
          const item = config.items?.find(i => i.literalKey === EnumLiteralKeys.eModule_BasicConfiguration);
          if (item) this.config = item;
        }
      });
  }
}
