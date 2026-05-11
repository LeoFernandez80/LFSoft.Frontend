import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { ActividadesContainerComponent } from './actividades-container/actividades-container.component';
import { ActividadesFormContainerComponent } from './actividades-form-container/actividades-form-container.component';

const routes: Routes = [
  {
    path: 'actividad/open',
    component: ActividadesFormContainerComponent,
    data: { operation: 'open' }
  },
  {
    path: 'actividades',
    component: ActividadesContainerComponent
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class ActividadesModuleRoutingModule {
  constructor() {}
}
