import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { QuotesContainerComponent } from './quotes-container/quotes-container.component';
import { QuotesFormContainerComponent } from './quotes-form-container/quotes-form-container.component';

const routes: Routes = [
   {
    path: 'quotes/open',
    component: QuotesFormContainerComponent,
    data: { operation: 'open' }    
  },
  {
    path: 'quotes',
    component: QuotesContainerComponent    
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class QuotesModuleRoutingModule {
  constructor() { }
}
