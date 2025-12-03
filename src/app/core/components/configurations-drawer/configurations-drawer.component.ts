import { Component, EventEmitter, Input, OnDestroy, OnInit, Output } from '@angular/core';
import { CommonModule, NgFor } from '@angular/common';
import { DrawerService } from '../../../generic/generic-drawer/services/drawer.service';
import { MessagesService } from '../../../generic/generic-message/services/message.service';
import { EnumMessageType } from '../../../generic/generic-message/enums/message-type.model';
import { EnumActionsType } from '../../../generic/generic-actions/enums/actions-type.enums';
import { GenericDrawerComponent } from '../../../generic/generic-drawer/generic-drawer.component';
import { FormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatIconModule } from '@angular/material/icon';
import { TranslatePipe } from '../../../generic/generic-translate/translate.pipe';

@Component({
  selector: 'app-configurations-drawer',
  templateUrl: './configurations-drawer.component.html',
  styleUrls: ['./configurations-drawer.component.scss'],
  standalone: true,
  imports: [CommonModule, NgFor, FormsModule,
    MatFormFieldModule,
    MatSelectModule,    
    MatIconModule, TranslatePipe, GenericDrawerComponent]
})
export class ConfigurationsDrawerComponent implements OnInit {
  
  @Output() changeTheme = new EventEmitter<string>();

  constructor(private _messagesService: MessagesService,private p_drawerService: DrawerService) {}

  selectedTheme = 'theme-blue';
  themes = [    
    { value: 'theme-light', label: 'Claro' },
    { value: 'theme-blue-light', label: 'Azul claro' },
    { value: 'theme-blue', label: 'Azul' },
    { value: 'theme-dark', label: 'Oscuro' },
  ];

  ngOnInit(): void { }

  changedTheme(theme: string) {
    this.selectedTheme = theme;
    this.changeTheme.emit(theme);
  }

  onClose() {
    this.p_drawerService.hide( EnumActionsType.actionCancel);
  }
}