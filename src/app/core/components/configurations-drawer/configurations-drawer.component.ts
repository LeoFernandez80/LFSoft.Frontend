import { Component, EventEmitter, Input, OnDestroy, OnInit, Output } from '@angular/core';
import { CommonModule, NgFor } from '@angular/common';
import { DrawerService, MessagesService, EnumMessageType, EnumActionsType, GenericDrawerComponent, TranslatePipe } from '@lib/shared';
import { FormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { ConfigurationService } from 'libs/common/src/lib/services/configuration.service';
import { Configuration, ConfigurationItem } from '@lib/common';
import { AuthService } from 'libs/security/src/lib/services/auth.service';
import { EnumLiteralKeys } from 'libs/common/src/lib/enums/literal-keys.enum';

@Component({
  selector: 'app-configurations-drawer',
  templateUrl: './configurations-drawer.component.html',
  styleUrls: ['./configurations-drawer.component.scss'],
  standalone: true,
  imports: [CommonModule, NgFor, FormsModule,
    MatFormFieldModule,
    MatSelectModule,
    MatInputModule,
    MatButtonModule,
    MatCardModule,
    MatIconModule, TranslatePipe, GenericDrawerComponent]
})
export class ConfigurationsDrawerComponent implements OnInit {
  
  @Output() changeTheme = new EventEmitter<string>();

  configurations: Configuration = new Configuration();
  
  constructor(
    private _authService: AuthService, 
    private _messagesService: MessagesService,
    private p_drawerService: DrawerService, 
    private _configurationService: ConfigurationService
  ) {
    this._setSubscriptions();
  }

  selectedTheme = 'theme-blue';
  themes = [    
    { value: 'theme-light', label: 'Claro' },
    { value: 'theme-blue-light', label: 'Azul claro' },
    { value: 'theme-blue', label: 'Azul' },
    { value: 'theme-dark', label: 'Oscuro' },
  ];

  ngOnInit(): void { 
    // this._configurationService.loadUserConfiguration( this._authService.getCurrentUser()?.id! ).subscribe({
    //   next: (config) => {
    //     if (config) {
    //       this.configurations = config;
    //       this.selectedTheme = config.terminalName || 'theme-blue'; // Si guardas el tema en alguna propiedad
    //     }
    //   },
    //   error: (err) => {
    //     this._messagesService.addMessage('Error al cargar configuraciones', EnumMessageType.Error);
    //   }
    // });
  }

  changedTheme(theme: string) {
    this.selectedTheme = theme;
    this.changeTheme.emit(theme);
  }

  addConfigurationItem() {
    const newItem = new ConfigurationItem();
    newItem.literalKey = EnumLiteralKeys.eLiteralKey_Empty;
    newItem.color = 'RGB(255, 255, 255)';
    this.configurations.items.push(newItem);
  }

  removeConfigurationItem(index: number) {
    this.configurations.items.splice(index, 1);
  }

  onSave() {
    // Aquí se debería llamar a un método del servicio para guardar la configuración
    // this._configurationService.saveConfiguration(this.configurations).subscribe({
    //   next: () => {
    //     this._messagesService.addMessage('Configuración guardada exitosamente', EnumMessageType.Success);
    //     this.p_drawerService.hide(EnumActionsType.actionSave);
    //   },
    //   error: (err) => {
    //     this._messagesService.addMessage('Error al guardar configuraciones', EnumMessageType.Error);
    //   }
    // });
    this._configurationService.setConfiguration(this.configurations);
    this._messagesService.addMessage('Configuración guardada exitosamente', EnumMessageType.Success);
    this.p_drawerService.hide(EnumActionsType.actionSave);
  }

  onClose() {
    this.p_drawerService.hide( EnumActionsType.actionCancel);
  }

  private _setSubscriptions(): void {
    this._configurationService.getConfiguration().subscribe(config => {
      if (config) {
        this.configurations = config;
        this.selectedTheme = config.terminalName || 'theme-blue'; // Si guardas el tema en alguna propiedad
      }
    });
  }
}