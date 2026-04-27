import { Component, signal } from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';
import { MatIconRegistry } from '@angular/material/icon';
import { RouterOutlet } from '@angular/router';
import { TranslationService, GenericActionsComponent, ActionService, GenericMessageComponent } from '@lib/shared';
import { FormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { NgFor, NgIf } from '@angular/common';
import { ConfigurationsDrawerComponent } from './core/components/configurations-drawer/configurations-drawer.component';
import { MatIconModule } from '@angular/material/icon';
import { AuthService, UrlSecurityService } from '@lib/security';
import { HomeContainerComponent } from './core/components/home-container/home-container.component';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, NgIf, NgFor, FormsModule,
      MatFormFieldModule,
      MatSelectModule,    
      MatIconModule,
      GenericActionsComponent,
      GenericMessageComponent,
      ConfigurationsDrawerComponent,
      HomeContainerComponent],
  templateUrl: './app.html',
  styleUrl: './app.scss',
  providers: [TranslationService,  ActionService, AuthService, UrlSecurityService]

  //providers: [TranslationService, MessagesService, DrawerService, ActionService, AuthService, UrlSecurityService]
})
export class App {
  protected readonly title = signal('BDCSoft Application');
  
  constructor(
    private _authService: AuthService,
    private _translationService: TranslationService,
    private iconRegistry: MatIconRegistry,
    private sanitizer: DomSanitizer
  ) {
    this._translationService.setLanguage('es');
    document.body.classList.add('theme-blue');
    // Registrar el icono SVG docs
    this.iconRegistry.addSvgIcon(
      'docs',
      this.sanitizer.bypassSecurityTrustResourceUrl('/icons/docs.svg')
    );
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

}
