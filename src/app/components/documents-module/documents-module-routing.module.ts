import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { DocumentFormComponent } from './document-form/document-form.component';
import { DocumentsContainerComponent } from './documents-container/documents-container.component';
import { DocumentsFormContainerComponent } from './documents-form-container/documents-form-container.component';
const routes: Routes = [
   {
    path: 'documents/open',
    component: DocumentsFormContainerComponent,
    data: { operation: 'open' }    
  },
  {
    path: 'documents',
    component: DocumentsContainerComponent    
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class DocumentsModuleRoutingModule {
  constructor() { }
}
