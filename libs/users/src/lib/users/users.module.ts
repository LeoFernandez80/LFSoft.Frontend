import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { UsersModuleRoutingModule } from './users-module-routing.module';

@NgModule({
  imports: [
    CommonModule,
    ReactiveFormsModule,
    UsersModuleRoutingModule
  ],
  declarations: [   
  ],
  exports: [],
})
export class UsersModule {}
