import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { UnidadesMedidaModuleRoutingModule } from './unidades-medida-module-routing.module';

@NgModule({
  imports: [
    CommonModule,
    ReactiveFormsModule,
    UnidadesMedidaModuleRoutingModule
  ],
  declarations: [],
  exports: []
})
export class UnidadesMedidaModule {
  constructor() {}
}
