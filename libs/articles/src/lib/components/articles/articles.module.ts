import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { ArticleService } from './services/article.service';
import { ArticlesModuleRoutingModule } from './articles-module-routing.module';

@NgModule({
  imports: [
    CommonModule,
    ReactiveFormsModule,
    ArticlesModuleRoutingModule
  ],
  providers: [ArticleService],
  declarations: [],
  exports: []
})
export class ArticlesModule {
  constructor() {}
}
