import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { FamiliasModuleRoutingModule } from './familias-module-routing.module';

@NgModule({
  imports: [CommonModule, ReactiveFormsModule, FamiliasModuleRoutingModule],
  declarations: [],
  exports: []
})
export class FamiliasModule {}
