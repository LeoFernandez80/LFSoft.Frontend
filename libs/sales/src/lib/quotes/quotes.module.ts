import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { QuotesModuleRoutingModule } from './quotes-module-routing.module';

@NgModule({
  imports: [
    CommonModule,
    ReactiveFormsModule,
    QuotesModuleRoutingModule
  ],
  declarations: [],
  exports: []
})
export class QuotesModule {
  constructor() {
  }
}
