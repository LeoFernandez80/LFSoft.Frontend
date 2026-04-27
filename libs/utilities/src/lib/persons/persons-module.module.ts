import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { PersonsModuleRoutingModule } from './persons-module-routing.module';
import { PersonsFormContainerComponent } from './persons-form-container/persons-form-container.component';

@NgModule({
  imports: [
    CommonModule,
    ReactiveFormsModule,
    PersonsModuleRoutingModule
  ],
  declarations: [
    // Puedes agregar aquí los componentes si no son standalone
  ],
  exports: []
})
export class PersonsModule {
  constructor() {
  }
}
