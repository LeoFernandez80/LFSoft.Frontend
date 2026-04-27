import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { PersonFilter } from '../../models/person-filter.model';
import { MatTabsModule } from '@angular/material/tabs';
import { GenericFormComponent, GenericActionsComponent, TranslatePipe, ActionService, EnumActionsType } from '@lib/shared';
import { EnumActions } from 'libs/common/src/lib/enums/actions.enum';


@Component({
  selector: 'lfsoft-utilities-person-grid-filter',
  imports: [
    CommonModule, ReactiveFormsModule,
    FormsModule,
    MatButtonModule,
    MatTabsModule,
    GenericFormComponent,
    GenericActionsComponent,
    TranslatePipe
  ],
  templateUrl: './person-grid-filter.component.html',
  styleUrls: ['./person-grid-filter.component.scss'],
  standalone: true,
  providers: [ ActionService]
})
export class PersonGridFilterComponent implements OnInit {
  @Input() set filter(filter: PersonFilter) { 
    if (!filter) return;
    this._updateForm(filter);
  };
  @Output() apply = new EventEmitter<PersonFilter>();
    
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
    this.apply.emit(this.form.value as PersonFilter);
  }

  private _createForm(): void {
    this.form = this.fb.group({
      id: ['']
    });
  }

  private _updateForm(filter: PersonFilter): void {
    this.form.patchValue(filter);
  }

  private _loadSecurityActions(): void {
    // Implementar si es necesario
  }
}
