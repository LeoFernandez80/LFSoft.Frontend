import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { MatTabsModule } from '@angular/material/tabs';
import { EnumActions } from '@lib/common';
import { Action, ActionService, EnumActionsType, GenericActionsComponent, GenericFormComponent, TranslatePipe } from '@lib/shared';
import { FamiliaFilter } from '../../models/familia-filter.model';

@Component({
  selector: 'app-familia-grid-filter',
  templateUrl: './familia-grid-filter.component.html',
  styleUrls: ['./familia-grid-filter.component.scss'],
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, MatTabsModule, GenericFormComponent, GenericActionsComponent, TranslatePipe],
  providers: [ActionService]
})
export class FamiliaGridFilterComponent implements OnInit {
  @Input() set filter(filter: FamiliaFilter) {
    if (!filter) return;
    this._updateForm(filter);
  }
  @Output() apply = new EventEmitter<FamiliaFilter>();

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
      case EnumActionsType.actionApply:
        this._apply();
        break;
      case EnumActionsType.actionReset:
        this._resetFilter();
        break;
    }
  }

  private _apply(): void {
    const filter = new FamiliaFilter();
    filter.familia_codigo = this.form.get('familia_codigo')?.value || 0;
    filter.familia_descripcion = this.form.get('familia_descripcion')?.value || '';
    this.apply.emit(filter);
  }

  private _createForm(): void {
    this.form = this.fb.group({
      familia_codigo: [null],
      familia_descripcion: ['']
    });
  }

  private _resetFilter(): void {
    this.form.reset({ familia_codigo: null, familia_descripcion: '' });
    this._apply();
  }

  private _updateForm(filter: FamiliaFilter): void {
    this.form.patchValue({
      familia_codigo: filter.familia_codigo || null,
      familia_descripcion: filter.familia_descripcion || ''
    });
  }
}
