import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { LoginContainerComponent } from './login-container/login-container.component';
import { LoginFormComponent } from './login-form/login-form.component';
import { LoginSliderComponent } from './login-slider/login-slider.component';

@NgModule({
  // Los componentes son standalone; los importamos para que puedan usarse desde módulos tradicionales
  imports: [
    CommonModule,
    FormsModule,
    LoginContainerComponent,
    LoginFormComponent,
    LoginSliderComponent
  ],
  exports: [
    LoginContainerComponent
  ]
})
export class LoginModule { }
