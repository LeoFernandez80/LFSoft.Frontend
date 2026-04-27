import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { CustomerFilter } from '../../models/customer-filter.model';
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
  selector: 'lfsoft-sales-customer-grid-filter',
  imports: [
    CommonModule, ReactiveFormsModule,
    FormsModule,
    MatButtonModule,
    MatTabsModule,
    GenericFormComponent,
    GenericActionsComponent,
    TranslatePipe
  ],
  templateUrl: './customer-grid-filter.component.html',
  styleUrls: ['./customer-grid-filter.component.scss'],
  standalone: true,
  providers: [ ActionService]
})
export class CustomerGridFilterComponent implements OnInit {
  @Input() set filter(filter: CustomerFilter) { 
    if (!filter) return;
    this._updateForm(filter);
  };
  @Output() apply = new EventEmitter<CustomerFilter>();
    
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

  private _mapToFilter(): CustomerFilter {
    const formData = this.form.value as CustomerFilter;     
    const filter = new CustomerFilter();
    filter.id = formData.id;
    filter.nombre = formData.nombre;
    filter.apellido = formData.apellido;
    filter.razonSocial = formData.razonSocial;
    filter.documento = formData.documento;
    filter.email = formData.email;
    filter.activo = formData.activo;

    return filter;
  }
  
  private _createForm() {
    this.form = this.fb.group({
      id: [null],
      nombre: [null],
      apellido: [null],
      razonSocial: [null],
      documento: [null],
      email: [null],
      activo: [null]
    });
  }

  private _updateForm(filter: CustomerFilter) {
    this.form.patchValue({
      id: filter.id,
      nombre: filter.nombre,
      apellido: filter.apellido,
      razonSocial: filter.razonSocial,
      documento: filter.documento,
      email: filter.email,
      activo: filter.activo
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
