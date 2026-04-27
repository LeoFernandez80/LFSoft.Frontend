import { Component, Input, OnInit, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { GenericDrawerComponent } from '../../generic-drawer/generic-drawer.component';
import { GenericFormComponent } from '../../generic-form/generic-form.component';
import { GenericActionsComponent } from '../../generic-actions/generic-actions.component';
import { DrawerService } from '../../generic-drawer/services/drawer.service';
import { MessagesService } from '../../generic-message/services/message.service';
import { GridConfigurationService } from '../services/grid-configuration.service';
import { GridConfiguration } from '../models/grid-configuration.model';
import { EnumMessageType } from '../../generic-message/enums/message-type.enum';
import { EnumActionsType } from '../../generic-actions/enums/actions-type.enums';
import { TranslatePipe } from '../../generic-translate/translate.pipe';
import { EnumActions } from '@lib/common';
import { GridConfigurationFormComponent } from './grid-configuration-form/grid-configuration-form.component';
import { MatIconModule } from '@angular/material/icon';
import { EnumLiteralKeys } from 'libs/common/src/lib/enums/literal-keys.enum';

@Component({
  selector: 'lfsoft-shared-grid-configurations-drawer',
  templateUrl: './grid-configurations-drawer.component.html',
  styleUrls: ['./grid-configurations-drawer.component.scss'],
  standalone: true,
  imports: [
    CommonModule,
    MatIconModule,
    GenericDrawerComponent,
    GenericFormComponent,
    GenericActionsComponent,
    GridConfigurationFormComponent,
    TranslatePipe
  ]
})
export class GridConfigurationsDrawerComponent implements OnInit {
  @Input() literalKey: EnumLiteralKeys = EnumLiteralKeys.eLiteralKey_Empty;
  @ViewChild(GridConfigurationFormComponent) formComponent!: GridConfigurationFormComponent;

  gridConfiguration?: GridConfiguration;

  constructor(
    private _messagesService: MessagesService,
    private _drawerService: DrawerService,
    private _gridConfigurationService: GridConfigurationService    
  ) {
    this._drawerService.getConfig().subscribe(config => {
      if (config && config.data && config.data.literalKey) {
        console.log("dsafsddasf", config);
        
        this.literalKey = config.data.literalKey;
      }
    });
  }

  ngOnInit(): void { 
    this._loadConfiguration();
  }

  onAction(action: EnumActionsType | EnumActions): void {
    if (action === EnumActions.eAction_Accept) {
      this.onSave();
    } else if (action === EnumActions.eAction_Cancel) {
      this.onCancel();
    }
  }

  onClose(): void {
    this._drawerService.hide();
  }
  
  onSave(): void {
    if (!this.formComponent || !this.formComponent.isValid()) {
      this.formComponent?.markAllAsTouched();
      this._messagesService.addMessage('MESSAGE.requiredFields', EnumMessageType.Warning);
      return;
    }

    try {
      const gridConfiguration = this.formComponent.getFormValue();
      gridConfiguration.gridTypeLiteralKey = this.literalKey;
      this._gridConfigurationService.saveUserGridConfiguration(gridConfiguration);
      this._messagesService.addMessage('MESSAGE.successSave', EnumMessageType.Info);
      this._drawerService.hide(EnumActionsType.actionSave as EnumActionsType);
    } catch (error) {
      this._messagesService.addMessage('MESSAGE.errorSave', EnumMessageType.Error);
    }
  }

  onCancel(): void {
    this._drawerService.hide(EnumActionsType.actionCancel as EnumActionsType);
  }

  private _loadConfiguration(): void {
    console.log("literalKey", this.literalKey);
    this._gridConfigurationService.getUserGridConfiguration(this.literalKey).subscribe(config => {
      if (config) {
        console.log("_loadConfiguration", config);
        
        this.gridConfiguration = config;        
      }
    });
  }
}
