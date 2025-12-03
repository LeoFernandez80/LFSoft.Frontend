import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { InvoiceFormComponent } from './invoice-form/invoice-form.component';
import { InvoicesContainerComponent } from './invoices-container/invoices-container.component';
import { InvoicesFormContainerComponent } from './invoices-form-container/invoices-form-container.component';

const routes: Routes = [
   {
    path: 'invoices/open',
    component: InvoicesFormContainerComponent,
    data: { operation: 'open' }    
  },
  {
    path: 'invoices',
    component: InvoicesContainerComponent    
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class InvoicesModuleRoutingModule {
  constructor() { }
}
