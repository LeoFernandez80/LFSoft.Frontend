import { NgIf } from '@angular/common';
import { Component, inject, OnInit, DestroyRef } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ActivatedRoute } from '@angular/router';
import { TranslatePipe, GenericLayoutComponent, GenericMessageComponent, EnumLayoutType, MessagesService, EnumMessageType } from '@lib/shared';
import { ArticleFormComponent } from '../article-form/article-form.component';
import { Article } from '@lib/articles';



@Component({
  selector: 'app-articles-form-container',
  templateUrl: './articles-form-container.component.html',
  styleUrls: ['./articles-form-container.component.scss'],
  standalone: true,
  imports: [NgIf,    TranslatePipe,
   GenericLayoutComponent, GenericMessageComponent, ArticleFormComponent]
})
export class ArticlesFormContainerComponent implements OnInit {
  articleId: number = 0;
  layoutTypes = EnumLayoutType;
  
  private readonly _destroyRef = inject(DestroyRef);
  private _route = inject(ActivatedRoute);
  private _messagesService = inject(MessagesService);

  ngOnInit(): void {
    this._route.queryParams
      .pipe(takeUntilDestroyed(this._destroyRef))
      .subscribe(params => {
        this.articleId = params['id'] ? +params['id'] : 0;
      });
  }

  onSaveArticle(article: Article): void {
    this._messagesService.addMessage('MESSAGE.successSave', EnumMessageType.Info);
  }

  onCancelArticle(): void {    
    window.close();
  }
}
