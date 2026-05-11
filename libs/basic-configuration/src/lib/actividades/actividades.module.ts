import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { ActividadesModuleRoutingModule } from './actividades-module-routing.module';

@NgModule({
  imports: [
    CommonModule,
    ReactiveFormsModule,
    ActividadesModuleRoutingModule
  ],
  declarations: [],
  exports: []
})
export class ActividadesModule {
  constructor() {}
}
