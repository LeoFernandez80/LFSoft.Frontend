import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { DocumentsModuleRoutingModule } from './documents-module-routing.module';
import { DocumentsFormContainerComponent } from './documents-form-container/documents-form-container.component';

@NgModule({
  imports: [
    CommonModule,
    ReactiveFormsModule,
    DocumentsModuleRoutingModule
  ],
  declarations: [
    
  ],
  exports: []
})
export class DocumentsModule {
  constructor() {
  }
}
