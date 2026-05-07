import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { ParidadesContainerComponent } from './paridades-container/paridades-container.component';
import { ParidadesFormContainerComponent } from './paridades-form-container/paridades-form-container.component';

const routes: Routes = [
  {
    path: 'paridad/open',
    component: ParidadesFormContainerComponent,
    data: { operation: 'open' }
  },
  {
    path: 'paridades',
    component: ParidadesContainerComponent
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class ParidadesModuleRoutingModule {
  constructor() {}
}
