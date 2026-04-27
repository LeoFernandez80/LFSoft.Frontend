import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { InvoicesModuleRoutingModule } from './invoices-module-routing.module';

@NgModule({
  imports: [
    CommonModule,
    ReactiveFormsModule,
    InvoicesModuleRoutingModule
  ],
  declarations: [],
  exports: []
})
export class InvoicesModule {
  constructor() {
  }
}
