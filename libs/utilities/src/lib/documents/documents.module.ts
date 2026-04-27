import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { DocumentService } from './services/document.service';
import { DocumentsModuleRoutingModule } from './documents-module-routing.module';

@NgModule({
  imports: [CommonModule, ReactiveFormsModule, DocumentsModuleRoutingModule],
  providers: [DocumentService],
  declarations: [],
  exports: []
})
export class DocumentsModule {}
