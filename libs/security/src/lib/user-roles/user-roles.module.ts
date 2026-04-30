import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { UserRolesModuleRoutingModule } from './user-roles-module-routing.module';

@NgModule({
  imports: [
    CommonModule,
    ReactiveFormsModule,
    UserRolesModuleRoutingModule
  ],
  declarations: [],
  exports: [],
})
export class UserRolesModule {}
