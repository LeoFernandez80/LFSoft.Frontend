import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { ArticlesModuleRoutingModule } from './articles-module-routing.module';

@NgModule({
  imports: [
    CommonModule,
    ReactiveFormsModule,
    ArticlesModuleRoutingModule
  ],
  declarations: [],
  exports: []
})
export class ArticlesModule {
  constructor() {
  }
}
