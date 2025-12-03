import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { ArticleFormComponent } from '../article-form/article-form.component';
import { GenericLayoutComponent } from '../../../generic/generic-layout/generic-layout.component';
import { GenericMessageComponent } from '../../../generic/generic-message/generic-message';
import { EnumLayoutType } from '../../../generic/generic-layout/enums/layout-type.enum';
import { NgIf } from '@angular/common';
import { MessagesService } from '../../../generic/generic-message/services/message.service';
import { EnumMessageType } from '../../../generic/generic-message/enums/message-type.model';

@Component({
  selector: 'app-articles-form-container',
  templateUrl: './articles-form-container.component.html',
  styleUrls: ['./articles-form-container.component.scss'],
  standalone: true,
  imports: [NgIf, GenericLayoutComponent,
    GenericMessageComponent, ArticleFormComponent],
  providers: [MessagesService]
})
export class ArticlesFormContainerComponent implements OnInit {

  constructor(private _messagesService: MessagesService) { }

  layoutTypes = EnumLayoutType
  ngOnInit(): void { }

  onSaveArticle(article: any): void {
    this._messagesService.addMessage('MESSAGE.successSave', EnumMessageType.Info);
  }

  onCancelArticle(): void {       
    window.close();
  } 
}
