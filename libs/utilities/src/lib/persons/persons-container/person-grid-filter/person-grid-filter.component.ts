import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { MatTabsModule } from '@angular/material/tabs';
import { EnumActions } from '@lib/common';
import { Action, ActionService, EnumActionsType, GenericActionsComponent, GenericFormComponent, TranslatePipe } from '@lib/shared';
import { PersonFilter } from '../../models/person-filter.model';

@Component({
  selector: 'app-person-grid-filter',
  templateUrl: './person-grid-filter.component.html',
  styleUrls: ['./person-grid-filter.component.scss'],
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, MatTabsModule, GenericFormComponent, GenericActionsComponent, TranslatePipe],
  providers: [ActionService]
})
export class PersonGridFilterComponent implements OnInit {
  @Input() set filter(filter: PersonFilter) { if (!filter) return; this._updateForm(filter); }
  @Output() apply = new EventEmitter<PersonFilter>();

  form: FormGroup = new FormGroup({});

  constructor(private fb: FormBuilder, private _actionService: ActionService) { this._createForm(); }

  ngOnInit(): void {
    this._actionService.setActions([
      new Action('BUTTON.filter', EnumActionsType.actionApply, 'filter_alt', false),
      new Action('BUTTON.clear', EnumActionsType.actionReset, 'restart_alt', false)
    ]);
  }

  onAction(action: EnumActionsType | EnumActions): void {
    switch (action) {
      case EnumActionsType.actionApply: this._apply(); break;
      case EnumActionsType.actionReset: this._resetFilter(); break;
    }
  }

  private _apply(): void { this.apply.emit(this._mapToFilter()); }

  private _createForm(): void {
    this.form = this.fb.group({
      person_id: [null],
      person_name: [''],
      person_lastName: ['']
    });
  }

  private _mapToFilter(): PersonFilter {
    const f = this.form.value;
    const filter = new PersonFilter();
    filter.person_id = f.person_id ?? 0;
    filter.person_name = f.person_name ?? '';
    filter.person_lastName = f.person_lastName ?? '';
    return filter;
  }

  private _resetFilter(): void {
    this.form.reset({ person_id: null, person_name: '', person_lastName: '' });
    this._apply();
  }

  private _updateForm(filter: PersonFilter): void {
    this.form.patchValue({
      person_id: filter.person_id || null,
      person_name: filter.person_name || '',
      person_lastName: filter.person_lastName || ''
    });
  }
}
