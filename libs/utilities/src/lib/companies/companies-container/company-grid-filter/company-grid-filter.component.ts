import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { MatTabsModule } from '@angular/material/tabs';
import { EnumActions } from '@lib/common';
import { Action, ActionService, EnumActionsType, GenericActionsComponent, GenericFormComponent, TranslatePipe } from '@lib/shared';
import { CompanyFilter } from '../../models/company-filter.model';

@Component({
  selector: 'app-company-grid-filter',
  templateUrl: './company-grid-filter.component.html',
  styleUrls: ['./company-grid-filter.component.scss'],
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, MatTabsModule, GenericFormComponent, GenericActionsComponent, TranslatePipe],
  providers: [ActionService]
})
export class CompanyGridFilterComponent implements OnInit {
  @Input() set filter(filter: CompanyFilter) {
    if (!filter) return;
    this._updateForm(filter);
  }
  @Output() apply = new EventEmitter<CompanyFilter>();

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
      company_id: [null],
      company_razonSocial: [''],
      company_tipo: [''],
      company_estado: ['']
    });
  }

  private _mapToFilter(): CompanyFilter {
    const f = this.form.value;
    const filter = new CompanyFilter();
    filter.company_id = f.company_id ?? 0;
    filter.company_razonSocial = f.company_razonSocial ?? '';
    filter.company_tipo = f.company_tipo ?? '';
    filter.company_estado = f.company_estado ?? '';
    return filter;
  }

  private _resetFilter(): void {
    this.form.reset({ company_id: null, company_razonSocial: '', company_tipo: '', company_estado: '' });
    this._apply();
  }

  private _updateForm(filter: CompanyFilter): void {
    this.form.patchValue({
      company_id: filter.company_id || null,
      company_razonSocial: filter.company_razonSocial || '',
      company_tipo: filter.company_tipo || '',
      company_estado: filter.company_estado || ''
    });
  }
}




