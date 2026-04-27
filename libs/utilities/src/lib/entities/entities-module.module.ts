import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { EntitiesModuleRoutingModule } from './entities-module-routing.module';

@NgModule({
  imports: [
    CommonModule,
    ReactiveFormsModule,
    EntitiesModuleRoutingModule
  ],
  declarations: [],
  exports: []
})
export class EntitiesModule {
  constructor() {
  }
}
