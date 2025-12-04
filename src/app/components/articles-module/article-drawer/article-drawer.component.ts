import { Component, Input, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { GenericDrawerComponent } from '../../../generic/generic-drawer/generic-drawer.component';
import { DrawerService } from '../../../generic/generic-drawer/services/drawer.service';
import { MessagesService } from '../../../generic/generic-message/services/message.service';
import { EnumMessageType } from '../../../generic/generic-message/enums/message-type.model';
import { EnumActionsType } from '../../../generic/generic-actions/enums/actions-type.enums';
import { ArticleFormComponent } from '../article-form/article-form.component';
import { Article } from '../models/article.model';

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
