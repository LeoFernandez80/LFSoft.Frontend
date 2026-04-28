import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
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
export class EntitiesModule {}