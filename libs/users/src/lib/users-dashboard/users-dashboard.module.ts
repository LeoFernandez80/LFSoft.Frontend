import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { UsersDashboardRoutingModule } from './users-dashboard-routing.module';

@NgModule({
  imports: [
    CommonModule,
    ReactiveFormsModule,
    UsersDashboardRoutingModule,
  ],
  providers: [],
  declarations: [],
  exports: []
})
export class UsersDashboardModule {
  constructor() {}
}
