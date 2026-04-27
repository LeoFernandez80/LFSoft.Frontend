import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { CustomersContainerComponent } from './customers-container/customers-container.component';
import { CustomersFormContainerComponent } from './customers-form-container/customers-form-container.component';

const routes: Routes = [
   {
    path: 'customers/open',
    component: CustomersFormContainerComponent,
    data: { operation: 'open' }    
  },
  {
    path: 'customers',
    component: CustomersContainerComponent    
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class CustomersModuleRoutingModule {
  constructor() { }
}
