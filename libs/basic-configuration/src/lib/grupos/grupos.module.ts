import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { GruposModuleRoutingModule } from './grupos-module-routing.module';

@NgModule({
  imports: [
    CommonModule,
    ReactiveFormsModule,
    GruposModuleRoutingModule
  ],
  declarations: [],
  exports: []
})
export class GruposModule {
  constructor() {}
}

