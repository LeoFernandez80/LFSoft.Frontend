import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { ParidadesModuleRoutingModule } from './paridades-module-routing.module';

@NgModule({
  imports: [
    CommonModule,
    ReactiveFormsModule,
    ParidadesModuleRoutingModule
  ],
  declarations: [],
  exports: []
})
export class ParidadesModule {
  constructor() {}
}
