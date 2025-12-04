import { Component, inject, OnInit, DestroyRef } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { NgIf } from '@angular/common';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ArticleFormComponent } from '../article-form/article-form.component';
import { GenericLayoutComponent } from '../../../generic/generic-layout/generic-layout.component';
import { GenericMessageComponent } from '../../../generic/generic-message/generic-message';
import { EnumLayoutType } from '../../../generic/generic-layout/enums/layout-type.enum';
import { MessagesService } from '../../../generic/generic-message/services/message.service';
import { EnumMessageType } from '../../../generic/generic-message/enums/message-type.model';
import { Article } from '../models/article.model';
import { TranslatePipe } from '../../../generic/generic-translate/translate.pipe';

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
