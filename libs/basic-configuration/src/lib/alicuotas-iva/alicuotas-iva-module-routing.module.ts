import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AlicuotasIvaContainerComponent } from './alicuotas-iva-container/alicuotas-iva-container.component';
import { AlicuotasIvaFormContainerComponent } from './alicuotas-iva-form-container/alicuotas-iva-form-container.component';

const routes: Routes = [
  {
    path: 'alicuota-iva/open',
    component: AlicuotasIvaFormContainerComponent,
    data: { operation: 'open' }
  },
  {
    path: 'alicuotas-iva',
    component: AlicuotasIvaContainerComponent
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class AlicuotasIvaModuleRoutingModule {
  constructor() {}
}
