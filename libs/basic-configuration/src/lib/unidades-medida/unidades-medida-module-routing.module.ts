import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { UnidadesMedidaContainerComponent } from './unidades-medida-container/unidades-medida-container.component';
import { UnidadesMedidaFormContainerComponent } from './unidades-medida-form-container/unidades-medida-form-container.component';

const routes: Routes = [
  {
    path: 'unidad-medida/open',
    component: UnidadesMedidaFormContainerComponent,
    data: { operation: 'open' }
  },
  {
    path: 'unidades-medida',
    component: UnidadesMedidaContainerComponent
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class UnidadesMedidaModuleRoutingModule {
  constructor() {}
}
