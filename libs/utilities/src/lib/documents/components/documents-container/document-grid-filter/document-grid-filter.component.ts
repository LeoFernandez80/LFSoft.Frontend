import { CommonModule } from "@angular/common";
import { Component, OnInit, Input, Output, EventEmitter } from "@angular/core";
import { ReactiveFormsModule, FormsModule, FormGroup, FormBuilder } from "@angular/forms";
import { MatButtonModule } from "@angular/material/button";
import { MatTabsModule } from "@angular/material/tabs";
import { GenericFormComponent, GenericActionsComponent, TranslatePipe, ActionService, EnumActionsType, Action } from "@lib/shared";
import { DocumentFilter } from "../../../models/document-filter.model";
import { EnumActions } from "libs/common/src/lib/enums/actions.enum";

@Component({
  selector: 'app-document-grid-filter',
  imports: [
    CommonModule, ReactiveFormsModule,
    FormsModule,
    MatButtonModule,
    MatTabsModule,
    GenericFormComponent,
    GenericActionsComponent,
    TranslatePipe
  ],
  templateUrl: './document-grid-filter.component.html',
  styleUrls: ['./document-grid-filter.component.scss'],
  standalone: true,
  providers: [ ActionService]
})
export class DocumentGridFilterComponent implements OnInit {
  @Input() set filter(filter: DocumentFilter) { 
    if (!filter) return;
    this._updateForm(filter);
  };
  @Output() apply = new EventEmitter<DocumentFilter>();
    
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

  private _mapToFilter(): DocumentFilter {
    const formData = this.form.value as DocumentFilter;   
    
    const documentFilter = new DocumentFilter();
    documentFilter.documentId = formData.documentId;
    documentFilter.personName = formData.personName;
    documentFilter.documentDescription = formData.documentDescription;
    documentFilter.documentCreationDate = formData.documentCreationDate;
    return documentFilter;
  }
  
  private _createForm() {
    this.form = this.fb.group({
      documentId: [null],
      personName: [''],
      documentDescription: [''],
      documentCreationDate: [null]
    });
  }

  private _updateForm(filter: DocumentFilter) {
    this.form.patchValue({
      documentId: filter.documentId,
      personName: filter.personName,
      documentDescription: filter.documentDescription,
      documentCreationDate: filter.documentCreationDate
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
