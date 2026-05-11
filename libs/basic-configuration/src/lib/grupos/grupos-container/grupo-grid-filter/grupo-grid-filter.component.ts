import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { MatTabsModule } from '@angular/material/tabs';
import { EnumActions } from '@lib/common';
import { Action, ActionService, EnumActionsType, GenericActionsComponent, GenericFormComponent, TranslatePipe } from '@lib/shared';
import { GrupoFilter } from '../../models/grupo-filter.model';

@Component({
  selector: 'app-grupo-grid-filter',
  templateUrl: './grupo-grid-filter.component.html',
  styleUrls: ['./grupo-grid-filter.component.scss'],
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, MatTabsModule, GenericFormComponent, GenericActionsComponent, TranslatePipe],
  providers: [ActionService]
})
export class GrupoGridFilterComponent implements OnInit {
  @Input() set filter(filter: GrupoFilter) {
    if (!filter) return;
    this._updateForm(filter);
  }
  @Output() apply = new EventEmitter<GrupoFilter>();

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

  private _createForm(): void {
    this.form = this.fb.group({
      grupo_codigo: [null],
      grupo_descripcion: [''],
      grupo_familiaCodigo: [null]
    });
  }

  private _apply(): void {
    const f = this.form.value;
    const filter = new GrupoFilter();
    filter.grupo_codigo = f.grupo_codigo ?? 0;
    filter.grupo_descripcion = f.grupo_descripcion ?? '';
    filter.grupo_familiaCodigo = f.grupo_familiaCodigo ?? 0;
    this.apply.emit(filter);
  }

  private _resetFilter(): void {
    this.form.reset({ grupo_codigo: null, grupo_descripcion: '', grupo_familiaCodigo: null });
    this._apply();
  }

  private _updateForm(filter: GrupoFilter): void {
    this.form.patchValue({
      grupo_codigo: filter.grupo_codigo || null,
      grupo_descripcion: filter.grupo_descripcion || '',
      grupo_familiaCodigo: filter.grupo_familiaCodigo || null
    });
  }
}
