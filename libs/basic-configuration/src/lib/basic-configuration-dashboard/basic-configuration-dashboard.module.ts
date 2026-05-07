import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { BasicConfigurationDashboardComponent } from './basic-configuration-dashboard.component';
import { BasicConfigurationDashboardRoutingModule } from './basic-configuration-dashboard-routing.module';

@NgModule({
  imports: [
    CommonModule,
    ReactiveFormsModule,
    BasicConfigurationDashboardRoutingModule,
  ],
  providers: [],
  declarations: [],
  exports: []
})
export class BasicConfigurationDashboardModule {
  constructor() {}
}
