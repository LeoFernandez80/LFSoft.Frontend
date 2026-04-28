import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { PersonsContainerComponent } from './persons-container/persons-container.component';
import { PersonsFormContainerComponent } from './persons-form-container/persons-form-container.component';

const routes: Routes = [
  { path: 'person/open', component: PersonsFormContainerComponent, data: { operation: 'open' } },
  { path: 'person', component: PersonsContainerComponent }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class PersonsModuleRoutingModule {}
