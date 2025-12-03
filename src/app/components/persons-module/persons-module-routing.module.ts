import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { PersonFormComponent } from './person-form/person-form.component';
import { PersonsContainerComponent } from './persons-container/persons-container.component';
import { PersonsFormContainerComponent } from './persons-form-container/persons-form-container.component';
const routes: Routes = [
   {
    path: 'persons/open',
    component: PersonsFormContainerComponent,
    data: { operation: 'open' }    
  },
  {
    path: 'persons',
    component: PersonsContainerComponent    
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class PersonsModuleRoutingModule {
  constructor() { }
}