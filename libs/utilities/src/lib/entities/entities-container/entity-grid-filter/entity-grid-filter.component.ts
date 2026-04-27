import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { EntityFilter } from '../../models/entity-filter.model';
import { MatTab, MatTabsModule } from '@angular/material/tabs';
import { 
  EnumActionsType, 
  GenericActionsComponent, 
  ActionService, 
  GenericFormComponent, 
  Action, 
  TranslatePipe 
} from '@lib/shared';
import { EnumActions } from 'libs/common/src/lib/enums/actions.enum';

@Component({
  selector: 'lfsoft-utilities-entity-grid-filter',
  imports: [
    CommonModule, ReactiveFormsModule,
    FormsModule,
    MatButtonModule,
    MatTabsModule,
    GenericFormComponent,
    GenericActionsComponent,
    TranslatePipe
  ],
  templateUrl: './entity-grid-filter.component.html',
  styleUrls: ['./entity-grid-filter.component.scss'],
  standalone: true,
  providers: [ ActionService]
})
export class EntityGridFilterComponent implements OnInit {
  @Input() set filter(filter: EntityFilter) { 
    if (!filter) return;
    this._updateForm(filter);
  };
  @Output() apply = new EventEmitter<EntityFilter>();
    
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
    this._apply();
  }

  private _apply(): void {
    const filter = this._mapToFilter();    
    this.apply.emit(filter);
  }

  private _mapToFilter(): EntityFilter {
    const formData = this.form.value as EntityFilter;     
    const filter = new EntityFilter();
    filter.id = formData.id;
    filter.description = formData.description;

    return filter;
  }
  
  private _createForm() {
    this.form = this.fb.group({
      id: [null],
      description: [null]
    });
  }

  private _updateForm(filter: EntityFilter) {
    this.form.patchValue({
      id: filter.id,
      description: filter.description
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
