import { Component, Input, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { GenericDrawerComponent, DrawerService, MessagesService, EnumMessageType, EnumActionsType } from '@lib/shared';
import { ArticleFormComponent } from '../article-form/article-form.component';
import { Article } from '@lib/articles';


@Component({
  selector: 'app-article-drawer',
  templateUrl: './article-drawer.component.html',
  styleUrls: ['./article-drawer.component.scss'],
  standalone: true,
  imports: [CommonModule, GenericDrawerComponent, ArticleFormComponent]
})
export class ArticleDrawerComponent {
  @Input() articleId: number = 0;
  
  private _drawerService = inject(DrawerService);
  private _messagesService = inject(MessagesService);

  onCancelArticle(): void {
    this._drawerService.hide(EnumActionsType.actionCancel);
  }

  onSaveArticle(article: Article): void {
    this._drawerService.hide(EnumActionsType.actionSave);
    this._messagesService.addMessage("MESSAGE.successSave", EnumMessageType.Info);
  }
}

