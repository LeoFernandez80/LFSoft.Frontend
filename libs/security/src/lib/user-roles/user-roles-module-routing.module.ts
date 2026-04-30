import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { UserRolesContainerComponent } from './user-roles-container/user-roles-container.component';
import { UserRolesFormContainerComponent } from './user-roles-form-container/user-roles-form-container.component';

const routes: Routes = [
  {
    path: 'user-role/open',
    component: UserRolesFormContainerComponent,
    data: { operation: 'open' }
  },
  {
    path: 'user-role',
    component: UserRolesContainerComponent
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class UserRolesModuleRoutingModule {
  constructor() { }
}
