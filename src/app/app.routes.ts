import { Routes } from '@angular/router';
import { AuthGuard, PermissionGuard } from '@lib/security';
import { LoginContainerComponent } from './core/components/login/login-container/login-container.component';
import { LogoutComponent } from './core/components/logout/logout.component';
import { App } from './app';
import { EntitiesContainerComponent } from '@lib/utilities';
import { EnumActions } from 'libs/common/src/lib/enums/actions.enum';
import { LoginRegisterFormComponent } from './core/components/login/login-register-form/login-register-form.component';
import { EnumLiteralKeys } from 'libs/common/src/lib/enums/literal-keys.enum';

export const routes: Routes = [
  // Ruta principal del módulo de login
  {
    path: 'login',
    component: LoginContainerComponent
  },
  {
    path: 'logout',
    component: LogoutComponent
  },
  // Ruta principal del módulo principal
  {
    path: 'home',
    component: App
  },
  {
    path: 'register',
    component: LoginRegisterFormComponent
  },
  {
    path: '',
    component: App
  },
  // Ruta del módulo de entidades desde @lib/utilities
    {
    path: 'entities-module',
    canActivate: [AuthGuard, PermissionGuard],
    data: {literalKeyType: EnumLiteralKeys.eModule_Entities },
    loadChildren: () =>
      import('@lib/utilities').then(m => m.EntitiesModule)
  },

  // Módulos lazy cargados y protegidos
  {
    path: 'persons-module',
    canActivate: [AuthGuard, PermissionGuard],
    data: { literalKeyType: EnumLiteralKeys.eModule_Persons },
    loadChildren: () =>
      import('@lib/utilities').then(m => m.PersonsModule)
  },
  {
    path: 'quotes-module',
    canActivate: [AuthGuard, PermissionGuard],
    data: { literalKeyType: EnumLiteralKeys.eModule_Quotes },
    loadChildren: () =>
      import('@lib/sales').then(m => m.QuotesModule)
  },
  {
    path: 'articles-module',
    canActivate: [AuthGuard, PermissionGuard],
    data: { literalKeyType: EnumLiteralKeys.eModule_Articles },
    loadChildren: () =>
      import('@lib/articles').then(m => m.ArticlesModule)
  },
  {
    path: 'documents-module',
    canActivate: [AuthGuard, PermissionGuard],
    data: { literalKeyType: EnumLiteralKeys.eModule_Documents },
    loadChildren: () =>
      import('@lib/utilities').then(m => m.DocumentsModule)
  },
  {
    path: 'invoices-module',
    canActivate: [AuthGuard, PermissionGuard],
    data: { literalKeyType: EnumLiteralKeys.eModule_Invoices },
    loadChildren: () =>
      import('@lib/sales').then(m => m.InvoicesModule)
  },
  {
    path: 'customers-module',
    canActivate: [AuthGuard, PermissionGuard],
    data: { literalKeyType: EnumLiteralKeys.eModule_Customers },
    loadChildren: () =>
      import('@lib/sales').then(m => m.CustomersModule)
  },
  {
    path: 'users-module',
    canActivate: [AuthGuard, PermissionGuard],
    data: {literalKeyType: EnumLiteralKeys.eModule_Users },
    loadChildren: () =>
      import('@lib/users').then(m => m.UsersModule)
  }
];
