import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { MatTabsModule } from '@angular/material/tabs';
import { EnumActions } from '@lib/common';
import { Action, ActionService, EnumActionsType, GenericActionsComponent, GenericFormComponent, TranslatePipe } from '@lib/shared';
import { ActividadFilter } from '../../models/actividad-filter.model';

@Component({
  selector: 'app-actividad-grid-filter',
  templateUrl: './actividad-grid-filter.component.html',
  styleUrls: ['./actividad-grid-filter.component.scss'],
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, MatTabsModule, GenericFormComponent, GenericActionsComponent, TranslatePipe],
  providers: [ActionService]
})
export class ActividadGridFilterComponent implements OnInit {
  @Input() set filter(filter: ActividadFilter) {
    if (!filter) return;
    this._updateForm(filter);
  }
  @Output() apply = new EventEmitter<ActividadFilter>();

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

  private _createForm(): void {
    this.form = this.fb.group({
      actividad_codigo: [''],
      actividad_descripcion: ['']
    });
  }

  private _mapToFilter(): ActividadFilter {
    const f = this.form.value;
    const filter = new ActividadFilter();
    filter.actividad_codigo = f.actividad_codigo ?? '';
    filter.actividad_descripcion = f.actividad_descripcion ?? '';
    return filter;
  }

  private _resetFilter(): void {
    this.form.reset({ actividad_codigo: '', actividad_descripcion: '' });
    this._apply();
  }

  private _apply(): void {
    this.apply.emit(this._mapToFilter());
  }

  private _updateForm(filter: ActividadFilter): void {
    this.form.patchValue({
      actividad_codigo: filter.actividad_codigo || '',
      actividad_descripcion: filter.actividad_descripcion || ''
    });
  }

  private _loadSecurityActions(): void {
    this._actionService.setActions([
      new Action('BUTTON.filter', EnumActionsType.actionApply, 'filter_alt', false),
      new Action('BUTTON.clear', EnumActionsType.actionReset, 'restart_alt', false)
    ]);
  }
}
