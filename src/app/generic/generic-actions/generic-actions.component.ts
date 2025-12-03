import { Component, EventEmitter, input, Input, OnDestroy, OnInit, Output } from '@angular/core';
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
import { AuthService } from '../../core/security/services/auth.service';

@Component({
  selector: 'app-generic-actions',
  standalone: true,
  imports: [NgIf,CommonModule, MatButtonModule, MatIconModule, TranslatePipe],
  templateUrl: './generic-actions.component.html',
  styleUrls: ['./generic-actions.component.scss']
})
export class GenericActionsComponent implements OnInit, OnDestroy {
  @Output() actionClick = new EventEmitter<EnumActionsType>();
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
  
  constructor(private _authService: AuthService, private _actionsService: ActionService) {
  }
  
  ngOnInit(): void { 
    this._subscriptions.push(this._actionsService.getActions().subscribe(actions => {      
      this.actions = actions.filter(action => {
        if (!action.permisions || action.permisions.length === 0) {
          return true;
        }
        return this._authService.hasAllPermissions(...action.permisions);
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
      this.actionClick.emit(action.actionType);
    }
  }


}
