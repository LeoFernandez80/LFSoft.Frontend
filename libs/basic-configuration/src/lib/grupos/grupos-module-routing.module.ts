import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { GruposContainerComponent } from './grupos-container/grupos-container.component';
import { GruposFormContainerComponent } from './grupos-form-container/grupos-form-container.component';

const routes: Routes = [
  {
    path: 'grupo/open',
    component: GruposFormContainerComponent,
    data: { operation: 'open' }
  },
  {
    path: 'grupos',
    component: GruposContainerComponent
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class GruposModuleRoutingModule {
  constructor() {}
}

