import { Component, EventEmitter, inject, Input, OnDestroy, OnInit, Output } from '@angular/core';
import { CommonModule, NgIf } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { EnumActionsType } from './enums/actions-type.enums';
import { Action } from './models/actions.model';
import { MatIconModule } from '@angular/material/icon';
import { ActionService } from './services/actions.service';
import { Subscription } from 'rxjs';
import { EnumActionsViewType } from './enums/actions-view-type.enums';
import { EnumActionsStyle } from './enums/actions-styles.enums';
import { TranslatePipe } from '../generic-translate/translate.pipe';
import { PERMISSION_SERVICE } from '../interfaces/permission-service.interface';
import { EnumActions } from 'libs/common/src/lib/enums/actions.enum';

@Component({
  selector: 'lfsoft-shared-actions',
  standalone: true,
  imports: [NgIf, CommonModule, MatButtonModule, MatIconModule, TranslatePipe],
  templateUrl: './generic-actions.component.html',
  styleUrls: ['./generic-actions.component.scss']
})
export class GenericActionsComponent implements OnInit, OnDestroy {
  @Input() primaryColor: string = 'red';
  @Output() action = new EventEmitter<EnumActionsType | EnumActions>();
  actions: Action[] = [];
  enumActionsViewType = EnumActionsViewType;
  
  getContainerClass(): string {   
    switch (this.actions[0]?.viewType) {
      case EnumActionsViewType.view16x16:        
        return 'actions-container__button-icon__content';
      case EnumActionsViewType.viewFooter:
        return 'actions-container__button__content';
      default:
        return 'actions-container__button__content';
    }
  }

  getButtonClass(style?: EnumActionsStyle): string {    
    switch (style) {
      case EnumActionsStyle.primary:
        return 'actions-container__button-primary';
      case EnumActionsStyle.secondary:
        return 'actions-container__button-secondary';
      case EnumActionsStyle.tertiary:
        return 'actions-container__button-tertiary';
      case EnumActionsStyle.outline:
        return 'actions-container__button-outline';
      default:
        return 'actions-container__button-primary';
    }
  }

  private _subscriptions: Subscription[] = [];
  private _permissionService = inject(PERMISSION_SERVICE, { optional: true });
  
  constructor(private _actionsService: ActionService) {
  }
  
  ngOnInit(): void { 
    this._subscriptions.push(this._actionsService.getActions().subscribe(actions => {      
      this.actions = actions.filter((action): action is Action => {
        if (!action) {
          return false;
        }
        if (!action.permisions || action.permisions.length === 0) {
          return true;
        }
        if (!this._permissionService) {
          return true; // Si no hay servicio de permisos, mostrar todas las acciones
        }
        return this._permissionService.hasAllPermissions(...action.permisions);
    });    
  }
    ));
  }
  
  ngOnDestroy(): void {
    this._actionsService.clearActions();
    this._subscriptions.forEach(sub => sub.unsubscribe());
  }

  onActionClick(action: Action): void {
    if (!action.disabled) {      
      this.action.emit(action.actionType);
    }
  }
}
