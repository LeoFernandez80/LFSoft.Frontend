import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Form, FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { GenericFormComponent } from '../../../generic/generic-form/generic-form.component';
import { QuoteFilterParameters } from '../models/interfaces/quote-filter-parameters.interface';
import { MatTab, MatTabGroup } from '@angular/material/tabs';

@Component({
  selector: 'app-quote-grid-filter',
  imports: [
    CommonModule, ReactiveFormsModule,
    FormsModule,
    MatButtonModule,
    MatTabGroup,
    MatTab,
    GenericFormComponent
  ],
  templateUrl: './quote-grid-filter.component.html',
  styleUrls: ['./quote-grid-filter.component.scss'],
  standalone: true,
})
export class QuoteGridFilterComponent {
  @Input() set filter(filter: QuoteFilterParameters) { 
    if (!filter) return;
    this._updateForm(filter);
   };
  @Output() apply = new EventEmitter<QuoteFilterParameters>();
    
  form: FormGroup = new FormGroup({});
  
  constructor(private fb: FormBuilder) { 
    this._createForm();
  }
  
  onApply(): void {
    const filter = this._mapToFilter();    
    this.apply.emit(filter);
  }

  private _mapToFilter(): QuoteFilterParameters {
     const formData = this.form.value as QuoteFilterParameters;     
    return {
      id: formData.id
    };
  }
  
  private _createForm() {
    this.form = this.fb.group({
      id: [null]
    });
  }

  private _updateForm(filter: QuoteFilterParameters) {
    this.form.patchValue({
      id: filter.id
    });
  }
}
