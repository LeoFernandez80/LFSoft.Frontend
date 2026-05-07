import { CommonModule } from '@angular/common';
import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { ReactiveFormsModule, FormsModule, FormGroup, FormBuilder } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatTabsModule } from '@angular/material/tabs';
import {
  GenericFormComponent, GenericActionsComponent, TranslatePipe,
  ActionService, EnumActionsType, Action
} from '@lib/shared';
import { EnumActions } from 'libs/common/src/lib/enums/actions.enum';
import { ParidadFilter } from '../../models/paridad-filter.model';

@Component({
  selector: 'app-paridad-grid-filter',
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
  templateUrl: './paridad-grid-filter.component.html',
  styleUrls: ['./paridad-grid-filter.component.scss'],
  standalone: true,
  providers: [ActionService]
})
export class ParidadGridFilterComponent implements OnInit {
  @Input() set filter(filter: ParidadFilter) {
    if (!filter) return;
    this._updateForm(filter);
  }
  @Output() apply = new EventEmitter<ParidadFilter>();

  form: FormGroup = new FormGroup({});

  constructor(private fb: FormBuilder, private _actionService: ActionService) {
    this._createForm();
  }

  ngOnInit(): void {
    this._securityApply();
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
    this.apply.emit(new ParidadFilter());
  }

  private _apply(): void {
    const filter = new ParidadFilter();
    filter.paridad_fecha = this.form.get('paridad_fecha')?.value || undefined;
    this.apply.emit(filter);
  }

  private _createForm(): void {
    this.form = this.fb.group({
      paridad_fecha: [null]
    });
  }

  private _updateForm(filter: ParidadFilter): void {
    this.form.patchValue({
      paridad_fecha: filter.paridad_fecha
    });
  }

  private _securityApply(): void {
    const actions: Action[] = [
      new Action('BUTTON.filter', EnumActionsType.actionApply, 'filter_alt', false),
      new Action('BUTTON.clear', EnumActionsType.actionReset, 'restart_alt', false)
    ];
    this._actionService.setActions(actions);
  }
}
