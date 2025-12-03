import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { ArticleFormComponent } from './article-form/article-form.component';
import { ArticlesContainerComponent } from './articles-container/articles-container.component';
import { ArticlesFormContainerComponent } from './articles-form-container/articles-form-container.component';

const routes: Routes = [
  {
    path: 'articles/open',
    component: ArticlesFormContainerComponent,
    data: { operation: 'open' }
  },
  {
    path: 'articles',
    component: ArticlesContainerComponent
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class ArticlesModuleRoutingModule {
  constructor() { }
}
