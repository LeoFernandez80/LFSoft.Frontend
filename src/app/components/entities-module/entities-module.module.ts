import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { EntitiesModuleRoutingModule } from './entities-module-routing.module';
import { EntitiesFormContainerComponent } from './entities-form-container/entities-form-container.component';

@NgModule({
  imports: [
    CommonModule,
    ReactiveFormsModule,
    EntitiesModuleRoutingModule
  ],
  declarations: [
    
  ],
  exports: []
})
export class EntitiesModule {
  constructor() {
  }
}