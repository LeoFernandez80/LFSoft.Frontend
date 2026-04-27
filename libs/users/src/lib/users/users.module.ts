import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { UsersModuleRoutingModule } from './users-module-routing.module';
import { ConfigurationService } from '@lib/common';

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
