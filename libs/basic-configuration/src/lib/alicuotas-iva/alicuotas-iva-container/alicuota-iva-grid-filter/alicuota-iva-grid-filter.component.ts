import { CommonModule } from '@angular/common';
import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { ReactiveFormsModule, FormsModule, FormGroup, FormBuilder } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatTabsModule } from '@angular/material/tabs';
import {
  GenericFormComponent, GenericActionsComponent, TranslatePipe,
  ActionService, EnumActionsType, Action
} from '@lib/shared';
import { EnumActions } from '@lib/common';
import { AlicuotaIvaFilter } from '../../models/alicuota-iva-filter.model';

@Component({
  selector: 'app-alicuota-iva-grid-filter',
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
  templateUrl: './alicuota-iva-grid-filter.component.html',
  styleUrls: ['./alicuota-iva-grid-filter.component.scss'],
  standalone: true,
  providers: [ActionService]
})
export class AlicuotaIvaGridFilterComponent implements OnInit {
  @Input() set filter(filter: AlicuotaIvaFilter) {
    if (!filter) return;
    this._updateForm(filter);
  }
  @Output() apply = new EventEmitter<AlicuotaIvaFilter>();

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
    this.apply.emit(new AlicuotaIvaFilter());
  }

  private _apply(): void {
    const filter = new AlicuotaIvaFilter();
    filter.alicuotaIva_codigo = Number(this.form.get('alicuotaIva_codigo')?.value) || undefined;
    filter.alicuotaIva_descripcion = this.form.get('alicuotaIva_descripcion')?.value || '';
    this.apply.emit(filter);
  }

  private _createForm(): void {
    this.form = this.fb.group({
      alicuotaIva_codigo: [null],
      alicuotaIva_descripcion: ['']
    });
  }

  private _updateForm(filter: AlicuotaIvaFilter): void {
    this.form.patchValue({
      alicuotaIva_codigo: filter.alicuotaIva_codigo || null,
      alicuotaIva_descripcion: filter.alicuotaIva_descripcion || ''
    });
  }

  private _loadSecurityActions(): void {
    const actions: Action[] = [
      new Action('BUTTON.filter', EnumActionsType.actionApply, 'filter_alt', false),
      new Action('BUTTON.clear', EnumActionsType.actionReset, 'restart_alt', false)
    ];
    this._actionService.setActions(actions);
  }
}
