import { CommonModule } from "@angular/common";
import { Component, OnInit, Input, Output, EventEmitter } from "@angular/core";
import { ReactiveFormsModule, FormsModule, FormGroup, FormBuilder } from "@angular/forms";
import { MatButtonModule } from "@angular/material/button";
import { MatTabsModule } from "@angular/material/tabs";
import { GenericFormComponent, GenericActionsComponent, TranslatePipe, ActionService, EnumActionsType, Action } from "@lib/shared";
import { ArticleFilter } from "../../models/article-filter.model";
import { EnumActions } from "libs/common/src/lib/enums/actions.enum";


@Component({
  selector: 'app-article-grid-filter',
  imports: [
    CommonModule, ReactiveFormsModule,
    FormsModule,
    MatButtonModule,
    MatTabsModule,
    GenericFormComponent,
    GenericActionsComponent,
    TranslatePipe
  ],
  templateUrl: './article-grid-filter.component.html',
  styleUrls: ['./article-grid-filter.component.scss'],
  standalone: true,
  providers: [ActionService]
})
export class ArticleGridFilterComponent implements OnInit {
  @Input() set filter(filter: ArticleFilter) {
    if (!filter) return;
    this._updateForm(filter);
  };
  @Output() apply = new EventEmitter<ArticleFilter>();

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
    this.apply.emit(new ArticleFilter());
  }

  private _apply(): void {
    const filter = new ArticleFilter();
    filter.id = this.form.get('id')?.value;
    filter.codigoAsy = this.form.get('codigoAsy')?.value;
    filter.description = this.form.get('description')?.value;
    this.apply.emit(filter);
  }

  private _createForm() {
    this.form = this.fb.group({
      id: [null],
      codigoAsy: [null],
      description: [null]
    });
  }

  private _updateForm(filter: ArticleFilter): void {
    this.form.patchValue({
      id: filter.id,
      codigoAsy: filter.codigoAsy,
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
