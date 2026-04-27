import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatTabsModule } from '@angular/material/tabs';
import { GenericFormComponent, GenericActionsComponent, TranslatePipe, ActionService, EnumActionsType, Action } from '@lib/shared';

import { UserFilter } from '../../models/user-filter.model';
import { EnumActions } from '@lib/common';
@Component({
  selector: 'app-user-grid-filter',
  imports: [
    CommonModule, ReactiveFormsModule,
    FormsModule,
    MatButtonModule,
    MatTabsModule,
    GenericFormComponent,
    GenericActionsComponent,
    TranslatePipe
  ],
  templateUrl: './user-grid-filter.component.html',
  styleUrls: ['./user-grid-filter.component.scss'],
  standalone: true,
  providers: [ ActionService]
})
export class UserGridFilterComponent implements OnInit {
  @Input() set filter(filter: UserFilter) { 
    if (!filter) return;
    this._updateForm(filter);
  };
  @Output() apply = new EventEmitter<UserFilter>();
    
  form: FormGroup = new FormGroup({});
  
  constructor(private fb: FormBuilder,  private _actionService: ActionService) { 
    this._createForm();    
  }

  ngOnInit(): void {
    this._loadSecurityActions();
  }
  
  onAction(action: EnumActionsType | EnumActions): void {
    switch (action) {
      case EnumActionsType.actionApply:
        this._apply();        
        break;
      case EnumActionsType.actionReset:
        this._resetFilter();
        break;
    }
  }

  private _resetFilter(): void {
    this.form.reset();
    this._apply();
  }

  private _apply(): void {
    const filter = this._mapToFilter();    
    this.apply.emit(filter);
  }

  private _mapToFilter(): UserFilter {
     const formData = this.form.value as UserFilter;     
    return {
      user_id: formData.user_id
    };
  }
  
  private _createForm() {
    this.form = this.fb.group({
      user_id: [null]
    });
  }

  private _updateForm(filter: UserFilter) {
    this.form.patchValue({
      user_id: filter.user_id
    });
  }

  private _loadSecurityActions(): void {
    const actions: Action[] = [
        new Action('BUTTON.filter', EnumActionsType.actionApply, 'filter_alt', false),
        new Action('BUTTON.clear', EnumActionsType.actionReset, 'restart_alt', false),
      ];
    this._actionService.setActions(actions);
  }


}
