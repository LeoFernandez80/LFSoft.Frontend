import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { CompaniesContainerComponent } from './companies-container/companies-container.component';
import { CompaniesFormContainerComponent } from './companies-form-container/companies-form-container.component';

const routes: Routes = [
  { path: 'company/open', component: CompaniesFormContainerComponent, data: { operation: 'open' } },
  { path: 'companies', component: CompaniesContainerComponent }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class CompaniesModuleRoutingModule {}




