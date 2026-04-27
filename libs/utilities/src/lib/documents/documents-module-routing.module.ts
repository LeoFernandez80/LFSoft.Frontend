import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { DocumentsContainerComponent } from './components/documents-container/documents-container.component';
import { DocumentFormComponent } from './components/document-form/document-form.component';

const routes: Routes = [
  {
    path: 'documents/open',
    component: DocumentFormComponent,
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
export class DocumentsModuleRoutingModule {}
