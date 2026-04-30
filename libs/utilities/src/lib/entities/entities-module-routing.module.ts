import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { EntitiesContainerComponent } from './entities-container/entities-container.component';
import { EntitiesFormContainerComponent } from './entities-form-container/entities-form-container.component';

const routes: Routes = [
  { path: 'entity/open', component: EntitiesFormContainerComponent, data: { operation: 'open' } },
  { path: 'entities', component: EntitiesContainerComponent }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class EntitiesModuleRoutingModule {}
