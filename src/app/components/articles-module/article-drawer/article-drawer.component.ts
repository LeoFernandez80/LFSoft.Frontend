import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { GenericDrawerComponent } from '../../../generic/generic-drawer/generic-drawer.component';
import { DrawerService } from '../../../generic/generic-drawer/services/drawer.service';
import { MessagesService } from '../../../generic/generic-message/services/message.service';
import { EnumMessageType } from '../../../generic/generic-message/enums/message-type.model';
import { EnumActionsType } from '../../../generic/generic-actions/enums/actions-type.enums';
import { ArticleFormComponent } from '../article-form/article-form.component';

@Component({
  selector: 'app-article-drawer',
  templateUrl: './article-drawer.component.html',
  styleUrls: ['./article-drawer.component.scss'],
  standalone: true,
  imports: [CommonModule, GenericDrawerComponent, ArticleFormComponent]
})
export class ArticleDrawerComponent implements OnInit {
  @Input() set articleId(value: number | null) {
    if (!value) {
      return;
    }
    this._articleId = value;
  }
  get articleId(): number {
    return this._articleId;
  }

  private _articleId: number = 0;
  constructor(private _messagesService: MessagesService, private p_drawerService: DrawerService) {}

  ngOnInit(): void {}

  onCancelArticle(): void {
    this.p_drawerService.hide(EnumActionsType.actionCancel);
  }

  onSaveArticle(article: any): void {
    this.p_drawerService.hide(EnumActionsType.actionSave);
    this._messagesService.addMessage("MESSAGE.successSave", EnumMessageType.Info);
  }
}
