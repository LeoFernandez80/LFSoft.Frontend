import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { Sort } from '@angular/material/sort';
import { EnumActionsType } from '../../../../generic/generic-actions/enums/actions-type.enums';
import { EnumActionsViewType } from '../../../../generic/generic-actions/enums/actions-view-type.enums';
import { EnumActionsStyle } from '../../../../generic/generic-actions/enums/actions-styles.enums';
import { GenericActionsComponent } from '../../../../generic/generic-actions/generic-actions.component';
import { GenericGridComponent } from '../../../../generic/generic-grid/generic-grid.component';
import { GridColumn } from '../../../../generic/generic-grid/models/grid-column.model';
import { GridService } from '../../../../generic/generic-grid/services/grid.service';
import { PageFilter } from '../../../../generic/models/page-filter.model';
import { ArticleGrid } from '../../models/article-grid.model';
import { Action } from '../../../../generic/generic-actions/models/actions.model';
import { TranslationService } from '../../../../generic/generic-translate/translation.service';

@Component({
  selector: 'app-article-grid',
  templateUrl: './article-grid.component.html',
  styleUrls: ['./article-grid.component.scss'],
  standalone: true,
  imports: [GenericGridComponent, GenericActionsComponent],
  providers: []
})
export class ArticleGridComponent implements OnInit {
  @Output() edit = new EventEmitter<ArticleGrid>();
  @Output() delete = new EventEmitter<ArticleGrid>();
  @Output() open = new EventEmitter<ArticleGrid>();
  @Output() sortChange = new EventEmitter<PageFilter>();
  @Output() scrollEndChange = new EventEmitter<void>();

  columns: GridColumn<ArticleGrid>[] = [];

  constructor(private _gridService: GridService<ArticleGrid>, private _translationService: TranslationService) {
    this._inicializeColumns();
  }

  ngOnInit(): void {
    this._gridService.setColumns(this.columns);
    this._loadSecurityActions();
  }

  onSortChange(event: Sort) {
    const pageFilter = new PageFilter();
    pageFilter.sortField = event.active;
    pageFilter.sortDirection = event.direction;
    this.sortChange.emit(pageFilter);
  }

  onLoadNextPage() {
    this.scrollEndChange.emit();
  }

  onEdit(article: ArticleGrid) {
    this.edit.emit(article);
  }

  onDelete(article: ArticleGrid) {
    this.delete.emit(article);
  }

  onOpen(article: ArticleGrid) {
    this.open.emit(article);
  }

  private _inicializeColumns(): void {
    this.columns = [
      {
        field: 'id',
        header: 'LABEL.id',
        sortable: true,
        align: 'center',
        width: '80px'
      },
      {
        field: 'codigoAsy',
        header: 'LABEL.codigoAsy',
        sortable: true
      },
      {
        field: 'description',
        header: 'LABEL.description',
        sortable: true
      }
    ];
  }

  private _loadSecurityActions(): void {
    const actions: Action[] = [
      new Action('', EnumActionsType.actionEdit, 'edit', false, 
        EnumActionsViewType.view16x16, EnumActionsStyle.primary),
      new Action('', EnumActionsType.actionDelete, 'delete', false, 
        EnumActionsViewType.view16x16, EnumActionsStyle.primary),
      new Action('', EnumActionsType.actionOpen, 'open_in_new', false, 
        EnumActionsViewType.view16x16, EnumActionsStyle.primary),
    ];
    this._gridService.setActions(actions);
  }
}
