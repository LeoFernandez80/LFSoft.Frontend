import { Routes } from '@angular/router';
import { AuthGuard, PermissionGuard } from './core/security/guards/auth.guard';
import { App } from './app';
import { LoginContainerComponent } from './components/login-module/login-container/login-container.component';
import { EnumPermissionType } from './components/security-module/models/enum-permission.type.model';

export const routes: Routes = [
  // Ruta principal del módulo de login
  {
    path: 'login',
    component: LoginContainerComponent
  },
  // Ruta principal del módulo principal
  {
    path: 'home',
    component: App
  },
  {
    path: '',
    component: App
  },

  // Módulos lazy cargados y protegidos
  {
    path: 'persons-module',
    canActivate: [AuthGuard, PermissionGuard],
    data: { requiredPermissions: [EnumPermissionType.VIEW_PERSONS] },
    loadChildren: () =>
      import('./components/persons-module/persons-module.module').then(m => m.PersonsModule)
  },
  {
    path: 'quotes-module',
    canActivate: [AuthGuard, PermissionGuard],
    data: { requiredPermissions: [EnumPermissionType.VIEW_QUOTES] },
    loadChildren: () =>
      import('./components/quotes-module/quotes-module/quotes-module.module').then(m => m.QuotesModuleModule)
  },
  {
    path: 'entities-module',
    canActivate: [AuthGuard, PermissionGuard],
    data: { requiredPermissions: [EnumPermissionType.VIEW_ENTITIES] },
    loadChildren: () =>
      import('./components/entities-module/entities-module.module').then(m => m.EntitiesModule)
  },
  {
    path: 'articles-module',
    canActivate: [AuthGuard, PermissionGuard],
    data: { requiredPermissions: [EnumPermissionType.VIEW_ARTICLES] },
    loadChildren: () =>
      import('./components/articles-module/articles-module.module').then(m => m.ArticlesModule)
  },
  {
    path: 'documents-module',
    canActivate: [AuthGuard, PermissionGuard],
    data: { requiredPermissions: [EnumPermissionType.VIEW_PERSONS] },
    loadChildren: () =>
      import('./components/documents-module/documents-module.module').then(m => m.DocumentsModule)
  },
  {
    path: 'invoices-module',
    canActivate: [AuthGuard, PermissionGuard],
    data: { requiredPermissions: [EnumPermissionType.VIEW_PERSONS] },
    loadChildren: () =>
      import('./components/invoices-module/invoices-module.module').then(m => m.InvoicesModule)
  },
  {
    path: 'users-module',
    canActivate: [AuthGuard, PermissionGuard],
    data: { requiredPermissions: [EnumPermissionType.VIEW_PERSONS] },
    loadChildren: () =>
      import('./components/users-module/users-module.module').then(m => m.UsersModule)
  }
];
