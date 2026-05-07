import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { BasicConfigurationDashboardComponent } from './basic-configuration-dashboard.component';

const routes: Routes = [
  {
    path: 'dashboard',
    component: BasicConfigurationDashboardComponent
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class BasicConfigurationDashboardRoutingModule {
  constructor() {}
}
