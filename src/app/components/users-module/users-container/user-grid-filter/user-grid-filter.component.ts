import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { UserFilter } from '../../models/user-filter.model';
import { MatTabGroup, MatTab, MatTabsModule } from '@angular/material/tabs';
import { EnumActionsType } from '../../../../generic/generic-actions/enums/actions-type.enums';
import { GenericActionsComponent } from '../../../../generic/generic-actions/generic-actions.component';
import { ActionService } from '../../../../generic/generic-actions/services/actions.service';
import { GenericFormComponent } from '../../../../generic/generic-form/generic-form.component';
import { Action } from '../../../../generic/generic-actions/models/actions.model';
import { TranslatePipe } from '../../../../generic/generic-translate/translate.pipe';

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
  
  onAction(action: EnumActionsType): void {
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
      id: formData.id
    };
  }
  
  private _createForm() {
    this.form = this.fb.group({
      id: [null]
    });
  }

  private _updateForm(filter: UserFilter) {
    this.form.patchValue({
      id: filter.id
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
