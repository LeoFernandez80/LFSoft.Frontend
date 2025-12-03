import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { UsersModuleRoutingModule } from './users-module-routing.module';
import { UsersFormContainerComponent } from './users-form-container/users-form-container.component';

@NgModule({
  imports: [
    CommonModule,
    ReactiveFormsModule,
    UsersModuleRoutingModule
  ],
  declarations: [
    
  ],
  exports: []
})
export class UsersModule {
  constructor() {
  }
}
