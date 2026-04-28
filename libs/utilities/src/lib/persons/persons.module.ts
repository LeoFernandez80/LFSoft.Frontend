import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { PersonsModuleRoutingModule } from './persons-module-routing.module';

@NgModule({
  imports: [CommonModule, ReactiveFormsModule, PersonsModuleRoutingModule],
  declarations: [],
  exports: []
})
export class PersonsModule {}
