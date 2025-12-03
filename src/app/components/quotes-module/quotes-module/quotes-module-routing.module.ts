import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { QuotesModuleComponent } from './quotes-module.component';
import { QuoteFormComponent } from '../quote-form/quote-form.component';

const routes: Routes = [
  {
    path: 'create',
    component: QuoteFormComponent,
    data: { operation: 'create'},
   
  },
  {
    path: 'edit',
    component: QuoteFormComponent,
    data: { operation: 'edit' },
    
  },
  {
    path: 'quotes',
    component: QuotesModuleComponent    
  }
  
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class QuotesModuleRoutingModule {
  constructor() { }
}