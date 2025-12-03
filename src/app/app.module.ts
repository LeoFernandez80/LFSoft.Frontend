import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { TranslatePipe } from './generic/generic-translate/translate.pipe';

const routes: Routes = [
  // Ruta principal del módulo de personas
  // {
  //   path: 'persons-module',
  //   loadChildren: () =>
  //     import('./components/persons-module/persons-module.module').then(m => m.PersonsModuleModule)
  // },
  // {
  //   path: 'quotes-module',
  //   loadChildren: () =>
  //     import('./components/quotes-module/quotes-module/quotes-module.module').then(m => m.QuotesModuleModule)
  // },
  // // Redirigir al módulo de personas si entrás a la raíz
  // { path: '', redirectTo: 'persons-module', pathMatch: 'full' },
  // // Página 404
  // { path: '**', redirectTo: 'persons-module' }
];


@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule],
  providers: [TranslatePipe]
})
export class AppRoutingModule {}