import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatTabsModule } from '@angular/material/tabs';
import { GenericFormComponent, GenericActionsComponent, TranslatePipe, ActionService, EnumActionsType, Action } from '@lib/shared';
import { EnumActions } from '@lib/common';
import { UserRoleFilter } from '../../models/user-role-filter.model';

@Component({
  selector: 'app-user-role-grid-filter',
  imports: [
    CommonModule,
    ReactiveFormsModule,
    FormsModule,
    MatButtonModule,
    MatTabsModule,
    GenericFormComponent,
    GenericActionsComponent,
    TranslatePipe
  ],
  templateUrl: './user-role-grid-filter.component.html',
  styleUrls: ['./user-role-grid-filter.component.scss'],
  standalone: true,
  providers: [ActionService]
})
export class UserRoleGridFilterComponent implements OnInit {
  @Input() set filter(filter: UserRoleFilter) {
    if (!filter) {
      return;
    }
    this._updateForm(filter);
  }

  @Output() apply = new EventEmitter<UserRoleFilter>();
  form: FormGroup = new FormGroup({});

  constructor(private fb: FormBuilder, private _actionService: ActionService) {
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
    this.apply.emit(this._mapToFilter());
  }

  private _mapToFilter(): UserRoleFilter {
    const formData = this.form.value as UserRoleFilter;
    return {
      userRolId: formData.userRolId,
      userRolName: formData.userRolName,
      userRolType: formData.userRolType
    };
  }

  private _createForm(): void {
    this.form = this.fb.group({
      userRolId: [null],
      userRolName: [''],
      userRolType: ['']
    });
  }

  private _updateForm(filter: UserRoleFilter): void {
    this.form.patchValue({
      userRolId: filter.userRolId,
      userRolName: filter.userRolName,
      userRolType: filter.userRolType
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
