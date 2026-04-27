import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { CustomersModuleRoutingModule } from './customers-module-routing.module';

@NgModule({
  imports: [
    CommonModule,
    ReactiveFormsModule,
    CustomersModuleRoutingModule
  ],
  declarations: [],
  exports: []
})
export class CustomersModule {
  constructor() {
  }
}
