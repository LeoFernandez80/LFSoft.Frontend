import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, FormArray, Validators } from '@angular/forms';
import { GridConfiguration } from '../../models/grid-configuration.model';
import { GridColumnConfiguration } from '../../models/grid-column-configuration.model';
import { TranslatePipe } from '../../../generic-translate/translate.pipe';
import { FormValidationsDirective } from '../../../generic-form-validations/form-validations.directive';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatTooltipModule } from '@angular/material/tooltip';
import { map, Observable, timer } from 'rxjs';

@Component({
  selector: 'grid-configuration-form',
  templateUrl: './grid-configuration-form.component.html',
  styleUrls: ['./grid-configuration-form.component.scss'],
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    TranslatePipe,
    FormValidationsDirective,
    MatIconModule,
    MatButtonModule,
    MatTooltipModule
  ]
})
export class GridConfigurationFormComponent implements OnInit {
  @Input() gridConfiguration?: GridConfiguration;
  @Output() dataChange = new EventEmitter<void>();

  configForm!: FormGroup;
  alignOptions = ['left', 'center', 'right'];
  expandedColumns: Set<number> = new Set();
  allExpanded = false;
  fieldsGridType: string[] = [];


  private _gridTypeFieldsMap: { [key: string]: string[] } = {
    'eGrid_Users': ['user_username', 'user_email', 'user_firstName', 'user_lastName', 'user_role', 'user_active'],
  };

  constructor(private _fb: FormBuilder) {
    this._createForm();
  }

  ngOnInit(): void {
    this._loadData().subscribe(() => {
      if (this.gridConfiguration) {
        this._modelToForm(this.gridConfiguration);
      }
    });
  }

  get columnsFormArray(): FormArray {
    return this.configForm.get('gridColumns') as FormArray;
  }

  getFormValue(): GridConfiguration {
    return this._formToModel();
  }

  isValid(): boolean {
    return this.configForm.valid;
  }

  markAllAsTouched(): void {
    this.configForm.markAllAsTouched();
  }

  addColumn(): void {
    const columnForm = this._createColumnFormGroup();
    columnForm.patchValue({
      gridColumnPosition: this.columnsFormArray.length
    });
    this.columnsFormArray.push(columnForm);
    this.dataChange.emit();
  }

  removeColumn(index: number): void {
    const columnForm = this.columnsFormArray.at(index);
    const isFixed = columnForm.get('gridColumnFixed')?.value;
    
    if (isFixed) {
      return; // No permitir eliminar columnas fijas
    }
    
    this.columnsFormArray.removeAt(index);
    // Reordenar posiciones
    this.columnsFormArray.controls.forEach((control, idx) => {
      control.patchValue({ gridColumnPosition: idx });
    });
    this.dataChange.emit();
  }

  moveColumnUp(index: number): void {
    if (index > 0) {
      const current = this.columnsFormArray.at(index);
      const previous = this.columnsFormArray.at(index - 1);
      
      this.columnsFormArray.setControl(index, previous);
      this.columnsFormArray.setControl(index - 1, current);
      
      // Actualizar posiciones
      this.columnsFormArray.at(index).patchValue({ gridColumnPosition: index });
      this.columnsFormArray.at(index - 1).patchValue({ gridColumnPosition: index - 1 });
      this.dataChange.emit();
    }
  }

  moveColumnDown(index: number): void {
    if (index < this.columnsFormArray.length - 1) {
      const current = this.columnsFormArray.at(index);
      const next = this.columnsFormArray.at(index + 1);
      
      this.columnsFormArray.setControl(index, next);
      this.columnsFormArray.setControl(index + 1, current);
      
      // Actualizar posiciones
      this.columnsFormArray.at(index).patchValue({ gridColumnPosition: index });
      this.columnsFormArray.at(index + 1).patchValue({ gridColumnPosition: index + 1 });
      this.dataChange.emit();
    }
  }

  toggleColumn(index: number): void {
    if (this.expandedColumns.has(index)) {
      this.expandedColumns.delete(index);
    } else {
      this.expandedColumns.add(index);
    }
  }

  isColumnExpanded(index: number): boolean {
    return this.expandedColumns.has(index);
  }

  toggleAll(): void {
    this.allExpanded = !this.allExpanded;
    if (this.allExpanded) {
      // Expandir todas
      this.columnsFormArray.controls.forEach((_, index) => {
        this.expandedColumns.add(index);
      });
    } else {
      // Colapsar todas
      this.expandedColumns.clear();
    }
  }

  private _loadData(): Observable<any> {
    return timer(1).pipe(
        map(() => {
          this.fieldsGridType =this._getFieldsGridType();
            return null;
        })
    );  
  }

  private _createForm(): void {
    this.configForm = this._fb.group({
      gridName: ['', Validators.required],
      gridHeaderBackgroundColor: ['', Validators.required],
      gridHeaderTextColor: ['', Validators.required],
      gridCellBackgroundColor: ['', Validators.required],
      gridCellTextColor: ['', Validators.required],
      gridHighlightColor: ['', Validators.required],
      gridMouseOverColor: ['', Validators.required],
      gridCellActionsBackgroundColor: ['', Validators.required],
      gridColumns: this._fb.array([])
    });

    // Emit change on form value changes
    this.configForm.valueChanges.subscribe(() => {
      this.dataChange.emit();
    });
  }

  private _createColumnFormGroup(column?: GridColumnConfiguration): FormGroup {
    return this._fb.group({
      gridColumnField: [column?.gridColumnField || '', Validators.required],
      gridColumnHeader: [column?.gridColumnHeader || '', Validators.required],
      gridColumnPosition: [column?.gridColumnPosition || 0, Validators.required],
      gridColumnWidth: [column?.gridColumnWidth || '100px', Validators.required],
      gridColumnAlign: [column?.gridColumnAlign || 'left', Validators.required],
      gridColumnVisible: [column?.gridColumnVisible ?? true],
      gridColumnSortable: [column?.gridColumnSortable ?? true],
      gridColumnFixed: [column?.gridColumnFixed ?? false],
      gridColumnDateFormat: [column?.gridColumnDateFormat ?? false],
      gridColumnHeaderBackgroundColor: [column?.gridColumnHeaderBackgroundColor || '', Validators.required],
      gridColumnHeaderTextColor: [column?.gridColumnHeaderTextColor || '', Validators.required],
      gridColumnCellBackgroundColor: [column?.gridColumnCellBackgroundColor || '', Validators.required],
      gridColumnCellTextColor: [column?.gridColumnCellTextColor || '', Validators.required]
    });
  }

  private _modelToForm(config: GridConfiguration): void {
    this.configForm.patchValue({
      gridName: config.gridName,
      gridHeaderBackgroundColor: config.gridHeaderBackgroundColor,
      gridHeaderTextColor: config.gridHeaderTextColor,
      gridCellBackgroundColor: config.gridCellBackgroundColor,
      gridCellTextColor: config.gridCellTextColor,
      gridHighlightColor: config.gridHighlightColor,
      gridMouseOverColor: config.gridMouseOverColor,
      gridCellActionsBackgroundColor: config.gridCellActionsBackgroundColor
    });

    // Limpiar el FormArray y agregar las columnas
    this.columnsFormArray.clear();
    config.gridColumns.forEach(column => {
      this.columnsFormArray.push(this._createColumnFormGroup(column));
    });
  }

  private _formToModel(): GridConfiguration {
    const formValue = this.configForm.value;
    const config = this.gridConfiguration ? this.gridConfiguration : new GridConfiguration();
    
    config.gridName = formValue.gridName;
    config.gridHeaderBackgroundColor = formValue.gridHeaderBackgroundColor;
    config.gridHeaderTextColor = formValue.gridHeaderTextColor;
    config.gridCellBackgroundColor = formValue.gridCellBackgroundColor;
    config.gridCellTextColor = formValue.gridCellTextColor;
    config.gridHighlightColor = formValue.gridHighlightColor;
    config.gridMouseOverColor = formValue.gridMouseOverColor;
    config.gridCellActionsBackgroundColor = formValue.gridCellActionsBackgroundColor;
    
    config.gridColumns = formValue.gridColumns.map((col: any) => {
      const column = new GridColumnConfiguration();
      Object.assign(column, col);
      return column;
    });
    
    return config;
  }

  private _getFieldsGridType(): string[] {
    console.log("literal", this.gridConfiguration?.gridTypeLiteralKey);
    
    return this._gridTypeFieldsMap[this.gridConfiguration?.gridTypeLiteralKey || ''] || [];
  }


}
