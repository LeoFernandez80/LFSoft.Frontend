import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { UserFormComponent } from './user-form/user-form.component';
import { UsersContainerComponent } from './users-container/users-container.component';
import { UsersFormContainerComponent } from './users-form-container/users-form-container.component';
const routes: Routes = [
   {
    path: 'users/open',
    component: UsersFormContainerComponent,
    data: { operation: 'open' }    
  },
  {
    path: 'users',
    component: UsersContainerComponent    
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class UsersModuleRoutingModule {
  constructor() { }
}
