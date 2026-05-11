import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { MatTabsModule } from '@angular/material/tabs';
import { EnumActions } from '@lib/common';
import {
  Action, ActionService, EnumActionsType,
  GenericActionsComponent, GenericFormComponent, TranslatePipe
} from '@lib/shared';
import { UnidadMedidaFilter } from '../../models/unidad-medida-filter.model';

@Component({
  selector: 'app-unidad-medida-grid-filter',
  templateUrl: './unidad-medida-grid-filter.component.html',
  styleUrls: ['./unidad-medida-grid-filter.component.scss'],
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, MatTabsModule, GenericFormComponent, GenericActionsComponent, TranslatePipe],
  providers: [ActionService]
})
export class UnidadMedidaGridFilterComponent implements OnInit {
  @Input() set filter(filter: UnidadMedidaFilter) {
    if (!filter) {
      return;
    }
    this._updateForm(filter);
  }

  @Output() apply = new EventEmitter<UnidadMedidaFilter>();

  form: FormGroup = new FormGroup({});

  constructor(
    private fb: FormBuilder,
    private _actionService: ActionService
  ) {
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

  private _loadSecurityActions(): void {
    const actions: Action[] = [
      new Action('BUTTON.filter', EnumActionsType.actionApply, 'filter_alt', false),
      new Action('BUTTON.clear', EnumActionsType.actionReset, 'restart_alt', false)
    ];

    this._actionService.setActions(actions);
  }

  private _createForm(): void {
    this.form = this.fb.group({
      unidadMedida_codigo: [null],
      unidadMedida_descripcion: [''],
      unidadMedida_abreviatura: ['']
    });
  }

  private _mapToFilter(): UnidadMedidaFilter {
    const values = this.form.value;
    const filter = new UnidadMedidaFilter();

    filter.unidadMedida_codigo = values.unidadMedida_codigo ? Number(values.unidadMedida_codigo) : undefined;
    filter.unidadMedida_descripcion = values.unidadMedida_descripcion || undefined;
    filter.unidadMedida_abreviatura = values.unidadMedida_abreviatura || undefined;

    return filter;
  }

  private _apply(): void {
    this.apply.emit(this._mapToFilter());
  }

  private _resetFilter(): void {
    this.form.reset();
    this._apply();
  }

  private _updateForm(filter: UnidadMedidaFilter): void {
    this.form.patchValue({
      unidadMedida_codigo: filter.unidadMedida_codigo || null,
      unidadMedida_descripcion: filter.unidadMedida_descripcion || '',
      unidadMedida_abreviatura: filter.unidadMedida_abreviatura || ''
    });
  }
}
