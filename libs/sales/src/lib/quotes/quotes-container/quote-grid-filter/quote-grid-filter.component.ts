import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { QuoteFilter } from '../../models/quote-filter.model';
import { MatTabsModule } from '@angular/material/tabs';
import { GenericFormComponent, GenericActionsComponent, TranslatePipe, ActionService, EnumActionsType, Action } from '@lib/shared';
import { EnumActions } from 'libs/common/src/lib/enums/actions.enum';

@Component({
  selector: 'lfsoft-sales-quote-grid-filter',
  imports: [
    CommonModule, ReactiveFormsModule,
    FormsModule,
    MatButtonModule,
    MatTabsModule,
    GenericFormComponent,
    GenericActionsComponent,
    TranslatePipe
  ],
  templateUrl: './quote-grid-filter.component.html',
  styleUrls: ['./quote-grid-filter.component.scss'],
  standalone: true,
  providers: [ ActionService]
})
export class QuoteGridFilterComponent implements OnInit {
  @Input() set filter(filter: QuoteFilter) { 
    if (!filter) return;
    this._updateForm(filter);
  };
  @Output() apply = new EventEmitter<QuoteFilter>();
    
  form: FormGroup = new FormGroup({});
  
  constructor(private fb: FormBuilder,  private _actionService: ActionService) { 
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
    const filter = this._mapToFilter();    
    this.apply.emit(filter);
  }

  private _mapToFilter(): QuoteFilter {
     const formData = this.form.value as QuoteFilter;     
    return {
      customerName: formData.customerName || '',
      quoteStateId: formData.quoteStateId || null,
      startDate: formData.startDate || null,
      endDate: formData.endDate || null
    };
  }
  
  private _createForm() {
    this.form = this.fb.group({
      customerName: [''],
      quoteStateId: [null],
      startDate: [null],
      endDate: [null]
    });
  }

  private _updateForm(filter: QuoteFilter) {
    this.form.patchValue({
      customerName: filter.customerName,
      quoteStateId: filter.quoteStateId,
      startDate: filter.startDate,
      endDate: filter.endDate
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
