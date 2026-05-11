import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { FamiliasContainerComponent } from './familias-container/familias-container.component';
import { FamiliasFormContainerComponent } from './familias-form-container/familias-form-container.component';

const routes: Routes = [
  { path: 'familia/open', component: FamiliasFormContainerComponent, data: { operation: 'open' } },
  { path: 'familias', component: FamiliasContainerComponent }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class FamiliasModuleRoutingModule {}
