import { Component, OnInit, OnDestroy, DestroyRef, inject } from '@angular/core';
import { ArticleGridFilterComponent } from './article-grid-filter/article-grid-filter.component';
import { ArticleGridComponent } from './article-grid/article-grid.component';
import { ArticleFormComponent } from '../article-form/article-form.component';
import { ArticleGrid } from '../models/article-grid.model';
import { Article } from '../models/article.model';
import { ActivatedRoute, Router } from '@angular/router';
import { MatTabsModule } from '@angular/material/tabs';
import { AsyncPipe, NgFor } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { ArticleFilter } from '../models/article-filter.model';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

import { EnumActionsType } from '../../../generic/generic-actions/enums/actions-type.enums';
import { GenericActionsComponent } from '../../../generic/generic-actions/generic-actions.component';
import { ActionService } from '../../../generic/generic-actions/services/actions.service';
import { GridService } from '../../../generic/generic-grid/services/grid.service';
import { GenericLayoutComponent } from '../../../generic/generic-layout/generic-layout.component';
import { EnumMessageType } from '../../../generic/generic-message/enums/message-type.model';
import { GenericMessageComponent } from '../../../generic/generic-message/generic-message';
import { MessagesService } from '../../../generic/generic-message/services/message.service';
import { PageFilter } from '../../../generic/models/page-filter.model';
import { Action } from '../../../generic/generic-actions/models/actions.model';
import { ArticleService } from '../services/article.service';
import { ModalService } from '../../../generic/generic-modal/services/modal.service';
import { CONFIRM_DELETE } from '../../../generic/generic-modal/models/modal-messages';
import { TranslatePipe } from '../../../generic/generic-translate/translate.pipe';

@Component({
  selector: 'app-articles-container',
  templateUrl: './articles-container.component.html',
  styleUrls: ['./articles-container.component.scss'],
  standalone: true,
  imports: [
    NgFor,
    AsyncPipe,
    MatTabsModule,
    MatIconModule,
    TranslatePipe,
    GenericLayoutComponent,
    GenericMessageComponent,
    GenericActionsComponent,
    ArticleGridFilterComponent,
    ArticleGridComponent,
    ArticleFormComponent,
  ],
  providers: [Router,  GridService, ActionService]
})
export class ArticlesContainerComponent implements OnInit, OnDestroy {
  openedArticlesId: number[] = [];
  selectedArticleId: number | null = null;
  filterParameters: ArticleFilter = new ArticleFilter();
  
  private _dataLoaded: ArticleGrid[] = [];
  private _openedArticles: Article[] = [];
  private _pageFilter: PageFilter = new PageFilter();
  private readonly _destroyRef = inject(DestroyRef);

  constructor(private _router: Router, private _route: ActivatedRoute,
    private _articleService: ArticleService, private _gridService: GridService<ArticleGrid>,
    private _messagesService: MessagesService, private _actionService: ActionService,
    private _modalService: ModalService
  ) {
    this._createPageFilter();
    this._createFilterParameters();
  }

  ngOnInit(): void {
    try {
      this._loadSecurityActions();
      this.loadArticles(this._pageFilter, this.filterParameters);
    } catch (error) {
      this._messagesService.addMessage("Error al cargar la pagina", EnumMessageType.Error);
    }
  }

  ngOnDestroy(): void {
    // El DestroyRef se encarga automáticamente de cancelar todas las suscripciones
    // que usen takeUntilDestroyed()
  }

  onSortChange(pageFilter: PageFilter): void {
    try {
      this._pageFilter.sortField = pageFilter.sortField;
      this._pageFilter.sortDirection = pageFilter.sortDirection;
      this._pageFilter.page = 1;
      this._dataLoaded = [];
      this.loadArticles(this._pageFilter, this.filterParameters);
    } catch (error) {
      this._messagesService.addMessage("Error al ordenar", EnumMessageType.Error);
    }
  }

  onLoadNextPage(): void {
    try {
      this._pageFilter.page++;
      this.loadArticles(this._pageFilter, this.filterParameters);
    } catch (error) {
      this._messagesService.addMessage("Error al cargar más datos", EnumMessageType.Error);
    }
  }

  onPageChange(pageFilter: PageFilter): void {
    try {
      this._pageFilter = pageFilter;
      this.loadArticles(this._pageFilter, this.filterParameters);
    } catch (error) {
      this._messagesService.addMessage("Error al cambiar página", EnumMessageType.Error);
    }
  }

  onFilterApplied(filter: ArticleFilter): void {
    try {
      this.filterParameters = filter;
      this._pageFilter.page = 1;
      this._dataLoaded = [];
      this.loadArticles(this._pageFilter, this.filterParameters);
    } catch (error) {
      this._messagesService.addMessage("Error al aplicar filtro", EnumMessageType.Error);
    }
  }

  onAction(action: EnumActionsType): void {
    switch (action) {
      case EnumActionsType.actionNew:
        try {
          this._createArticle();
        } catch (error) {
          this._messagesService.addMessage("Error al crear artículo", EnumMessageType.Error);
        }
        break;
      case EnumActionsType.actionList:
        try {
          this.openedArticlesId = [];
          this.selectedArticleId = null;
          this._messagesService.addMessage("Generando listado", EnumMessageType.Error);
        } catch (error) {
          this._messagesService.addMessage("Error al cerrar pestañas", EnumMessageType.Error);
        }
    }
  }

  onEdit(article: ArticleGrid): void {
    try {
      // Verificar si el artículo ya está abierto
      if (this.openedArticlesId.includes(article.id)) {
        this.selectedArticleId = article.id;
        return;
      }
      
      // Obtener el artículo completo desde el servicio
      this._articleService.getArticle(article.id)
        .pipe(takeUntilDestroyed(this._destroyRef))
        .subscribe({
          next: (fullArticle) => {
            this.openedArticlesId.push(article.id);
            this._openedArticles.push(fullArticle);
            this.selectedArticleId = article.id;
          },
          error: () => {
            this._messagesService.addMessage("Error al cargar artículo", EnumMessageType.Error);
          }
        });
    } catch (error) {
      this._messagesService.addMessage("Error al editar artículo", EnumMessageType.Error);
    }
  }

  onDeleteArticle(article: ArticleGrid): void {
    try {
      this._modalService.showModal(CONFIRM_DELETE)
        .pipe(takeUntilDestroyed(this._destroyRef))
        .subscribe(action => {
          if (action === EnumActionsType.actionAccept) {
            this._deleteArticle(article);
          }
        });
    } catch (error) {
      this._messagesService.addMessage("Error al eliminar artículo", EnumMessageType.Error);
    }
  }

  onOpenArticle(article: ArticleGrid): void {
    try {
      this._openArticle(article);
    } catch (error) {
      this._messagesService.addMessage("Error al abrir artículo en nueva pestaña", EnumMessageType.Error);
    }
  }

  onSaveArticle(article: Article): void {
    // Actualizar en el array de artículos abiertos
    const index = this.openedArticlesId.indexOf(article.id);
    if (index !== -1) {
      this._openedArticles[index] = article;
    }
    
    // Actualizar en la grilla
    const indexData = this._dataLoaded.findIndex(a => a.id === article.id);
    if (indexData !== -1) {
      this._dataLoaded[indexData] = this._mapArticleToGrid(article);
    }
    
    this._gridService.setData(this._dataLoaded);
    this._messagesService.addMessage('MESSAGE.successSave', EnumMessageType.Info);
  }

  private _mapArticleToGrid(article: Article): ArticleGrid {
    const articleGrid = new ArticleGrid();
    articleGrid.id = article.id;
    articleGrid.codigoAsy = article.codigoAsy;
    articleGrid.description = article.description;
    articleGrid.listprice = article.listprice;
    return articleGrid;
  }

  onCancelArticle(): void {
    try {
      if (this.selectedArticleId !== null) {
        this._closeArticle(this.selectedArticleId);
      }
    } catch (error) {
      this._messagesService.addMessage("Error al cerrar pestaña de artículo", EnumMessageType.Error);
    }
  }

  onCloseTab(articleId: number): void {
    try {
      this._closeArticle(articleId);
    } catch (error) {
      this._messagesService.addMessage("Error al cerrar pestaña de artículo", EnumMessageType.Error);
    }
  }

  onClickTab(articleId: number): void {
    this.selectedArticleId = articleId;
  }

  private _closeArticle(articleId: number): void {
    const index = this.openedArticlesId.indexOf(articleId);
    if (index !== -1) {
      // Sincronizar ambos arrays
      this.openedArticlesId.splice(index, 1);
      this._openedArticles.splice(index, 1);
      
      // Seleccionar otra pestaña si quedan
      if (this.openedArticlesId.length > 0) {
        this.selectedArticleId = this.openedArticlesId[Math.max(index - 1, 0)];
      } else {
        this.selectedArticleId = null;
      }
    }
  }

  private _createArticle(): void {
    const newArticle = new Article();
    newArticle.id = 0;
    newArticle.codigoAsy = 'Nuevo';
    newArticle.description = 'Artículo';
    
    this.openedArticlesId.push(0);
    this._openedArticles.push(newArticle);
    this.selectedArticleId = 0;
  }

  getArticleById(articleId: number): Article | undefined {
    const index = this.openedArticlesId.indexOf(articleId);
    return index !== -1 ? this._openedArticles[index] : undefined;
  }

  private _deleteArticle(article: ArticleGrid): void {
    this._articleService.deleteArticle(article.id!)
      .pipe(takeUntilDestroyed(this._destroyRef))
      .subscribe({
        next: () => {
          this._messagesService.addMessage("MESSAGE.successDelete", EnumMessageType.Info);
          // Recargar la grilla
          this._dataLoaded = [];
          this._pageFilter.page = 1;
          this.loadArticles(this._pageFilter, this.filterParameters);
        },
        error: (error) => {
          this._messagesService.addMessage(error, EnumMessageType.Error);
        }
      });
  }

  private _openArticle(article: ArticleGrid): void {
    try {
      const url = this._router.serializeUrl(
        this._router.createUrlTree(['articles-module', 'articles', 'open'], { queryParams: { id: article.id } })
      );
      window.open(url, '_blank');
    } catch (error) {
      this._messagesService.addMessage("Error al abrir artículo en nueva pestaña", EnumMessageType.Error);
    }
  }

  private _loadSecurityActions(): void {
    const actions: Action[] = [
      new Action('BUTTON.new', EnumActionsType.actionNew, 'add', false),
      new Action('BUTTON.lists', EnumActionsType.actionList, 'list', false)
    ];
    this._actionService.setActions(actions);
  }

  private loadArticles(pageFilter: PageFilter, filterParameters: ArticleFilter) {
    this._articleService.getArticles(pageFilter, filterParameters)
      .pipe(takeUntilDestroyed(this._destroyRef))
      .subscribe(response => {        
        this._dataLoaded = [...this._dataLoaded, ...response.data];        
        console.log("Articulos", this._dataLoaded, response);
        this._gridService.setData(this._dataLoaded);
      });
  }

  private _createPageFilter() {
    this._pageFilter.page = 1;
    this._pageFilter.pageSize = 15;
    this._pageFilter.sortField = "id";
    this._pageFilter.sortDirection = "asc";
  }

  private _createFilterParameters() {
    this.filterParameters.id = undefined;
  }
}
