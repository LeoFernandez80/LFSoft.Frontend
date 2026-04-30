import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { MatTabsModule } from '@angular/material/tabs';
import { EnumActions } from '@lib/common';
import { Action, ActionService, EnumActionsType, GenericActionsComponent, GenericFormComponent, TranslatePipe } from '@lib/shared';
import { EntityFilter } from '../../models/entity-filter.model';

@Component({
  selector: 'app-entity-grid-filter',
  templateUrl: './entity-grid-filter.component.html',
  styleUrls: ['./entity-grid-filter.component.scss'],
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, MatTabsModule, GenericFormComponent, GenericActionsComponent, TranslatePipe],
  providers: [ActionService]
})
export class EntityGridFilterComponent implements OnInit {
  @Input() set filter(filter: EntityFilter) {
    if (!filter) return;
    this._updateForm(filter);
  }
  @Output() apply = new EventEmitter<EntityFilter>();

  form: FormGroup = new FormGroup({});

  constructor(private fb: FormBuilder, private _actionService: ActionService) {
    this._createForm();
  }

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
      entity_id: [null],
      entity_description: ['']
    });
  }

  private _mapToFilter(): EntityFilter {
    const f = this.form.value;
    const filter = new EntityFilter();
    filter.entity_id = f.entity_id ?? 0;
    filter.entity_description = f.entity_description ?? '';
    return filter;
  }

  private _resetFilter(): void {
    this.form.reset({ entity_id: null, entity_description: '' });
    this._apply();
  }

  private _updateForm(filter: EntityFilter): void {
    this.form.patchValue({
      entity_id: filter.entity_id || null,
      entity_description: filter.entity_description || ''
    });
  }
}
