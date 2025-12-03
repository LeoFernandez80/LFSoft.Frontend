# Mejora: Gestión de Pestañas con IDs y Documentos Completos

## Objetivo
Optimizar la gestión de documentos abiertos en pestañas separando los IDs de los documentos completos y cargando los datos mediante el servicio.

## Problema Original
- Se almacenaba `DocumentGrid[]` con información limitada
- El documento seleccionado era de tipo `DocumentGrid`
- No se consultaba el servicio para obtener el documento completo al editar

## Solución Implementada

### 1. Modificar las propiedades del componente

**Antes:**
```typescript
documentsOpened: DocumentGrid[] = [];
selectedDocument: DocumentGrid = new DocumentGrid();
```

**Después:**
```typescript
openedDocumentsId: number[] = [];
selectedDocumentId: number | null = null;
private openedDocuments: Document[] = [];
```

**Explicación:**
- `openedDocumentsId`: Array que almacena solo los IDs de documentos abiertos
- `selectedDocumentId`: ID del documento actualmente seleccionado (puede ser null)
- `openedDocuments`: Array privado con los documentos completos obtenidos del servicio

---

### 2. Agregar import del modelo Document

```typescript
import { Document } from '../models/document.model';
```

---

### 3. Actualizar el método `onEdit()`

**Antes:**
```typescript
onEdit(document: DocumentGrid): void {
  try {
    this._editDocument(document);
  } catch (error) {
    this._messagesService.addMessage("Error al editar documento", EnumMessageType.Error);
  }
}
```

**Después:**
```typescript
onEdit(document: DocumentGrid): void {
  try {
    // Verificar si el documento ya está abierto
    if (this.openedDocumentsId.includes(document.documentId)) {
      this.selectedDocumentId = document.documentId;
      return;
    }
    
    // Obtener el documento completo desde el servicio
    this._documentService.getDocument(document.documentId)
      .pipe(takeUntilDestroyed(this._destroyRef))
      .subscribe({
        next: (fullDocument) => {
          this.openedDocumentsId.push(document.documentId);
          this.openedDocuments.push(fullDocument);
          this.selectedDocumentId = document.documentId;
        },
        error: () => {
          this._messagesService.addMessage("Error al cargar documento", EnumMessageType.Error);
        }
      });
  } catch (error) {
    this._messagesService.addMessage("Error al editar documento", EnumMessageType.Error);
  }
}
```

**Explicación:**
- Primero verifica si el documento ya está abierto
- Si está abierto, solo cambia la selección
- Si no está abierto, consulta al servicio para obtener el documento completo
- Agrega el ID a `openedDocumentsId` y el documento completo a `openedDocuments`

---

### 4. Modificar el método `_createDocument()`

**Antes:**
```typescript
private _createDocument(): void {
  try {
    const newDocument = new DocumentGrid();
    newDocument.documentDescription = 'Nuevo Documento';
    newDocument.personName = 'Nueva Persona';
    this.documentsOpened.push(newDocument);
    this.selectedDocument = newDocument;
  } catch (error) {
    throw error;
  }
}
```

**Después:**
```typescript
private _createDocument(): void {
  try {
    const newDocument = new Document();
    newDocument.documentId = 0;
    newDocument.documentDescription = 'Nuevo Documento';
    newDocument.personName = 'Nueva Persona';
    
    this.openedDocumentsId.push(0);
    this.openedDocuments.push(newDocument);
    this.selectedDocumentId = 0;
  } catch (error) {
    throw error;
  }
}
```

**Explicación:**
- Crea una instancia de `Document` (no `DocumentGrid`)
- Usa ID 0 para documentos nuevos
- Agrega a ambas listas sincronizadas

---

### 5. Actualizar el método `onCancelDocument()`

**Antes:**
```typescript
onCancelDocument(): void {
  try {      
    const document = this.selectedDocument;
    this._closeDocument(document);
  } catch (error) {
    this._messagesService.addMessage("Error al cerrar pestaña de documento", EnumMessageType.Error);
  }
}
```

**Después:**
```typescript
onCancelDocument(): void {
  try {      
    if (this.selectedDocumentId !== null) {
      this._closeDocument(this.selectedDocumentId);
    }
  } catch (error) {
    this._messagesService.addMessage("Error al cerrar pestaña de documento", EnumMessageType.Error);
  }
}
```

---

### 6. Actualizar el método `onCloseTab()`

**Antes:**
```typescript
onCloseTab(document: DocumentGrid): void {
  try {
    this._closeDocument(document);
  } catch (error) {
    this._messagesService.addMessage("Error al cerrar pestaña de documento", EnumMessageType.Error);
  }
}
```

**Después:**
```typescript
onCloseTab(documentId: number): void {
  try {
    this._closeDocument(documentId);
  } catch (error) {
    this._messagesService.addMessage("Error al cerrar pestaña de documento", EnumMessageType.Error);
  }
}
```

---

### 7. Modificar el método `onClickTab()`

**Antes:**
```typescript
onClickTab(document: DocumentGrid): void {    
  this.selectedDocument = document;
}
```

**Después:**
```typescript
onClickTab(documentId: number): void {    
  this.selectedDocumentId = documentId;
}
```

---

### 8. Refactorizar el método `_closeDocument()`

**Antes:**
```typescript
private _closeDocument(document: DocumentGrid): void {
  const index = this.documentsOpened.indexOf(document);
  if (index !== -1) {
    this.documentsOpened.splice(index, 1);
  }
  if (index !== -1) {
    this.selectedDocument = this.documentsOpened[Math.max(index - 1, 0)];
  }
}
```

**Después:**
```typescript
private _closeDocument(documentId: number): void {
  const index = this.openedDocumentsId.indexOf(documentId);
  if (index !== -1) {
    this.openedDocumentsId.splice(index, 1);
    this.openedDocuments.splice(index, 1);
    
    if (this.openedDocumentsId.length > 0) {
      this.selectedDocumentId = this.openedDocumentsId[Math.max(index - 1, 0)];
    } else {
      this.selectedDocumentId = null;
    }
  }
}
```

**Explicación:**
- Busca el índice por ID
- Elimina de ambas listas simultáneamente
- Selecciona el documento anterior o establece null si no hay más

---

### 9. Eliminar método `_editDocument()` y crear método auxiliar `getDocumentById()`

**Eliminar:**
```typescript
private _editDocument(document: DocumentGrid): void {
  try {
    if (this.documentsOpened.includes(document)) {
      return;
    }      
    this.documentsOpened.push(document);
    this.selectedDocument = document;
  } catch (error) {
    throw error;
  }
}
```

**Agregar:**
```typescript
getDocumentById(documentId: number): Document | undefined {
  const index = this.openedDocumentsId.indexOf(documentId);
  return index !== -1 ? this.openedDocuments[index] : undefined;
}
```

**Explicación:**
- Método público para acceder desde el template
- Busca el documento en `openedDocuments` usando el ID
- Retorna `undefined` si no se encuentra

---

### 10. Actualizar el método `onSaveDocument()`

**Antes:**
```typescript
onSaveDocument(document: Document): void {
  this._messagesService.addMessage('MESSAGE.successSave', EnumMessageType.Info);
  this.loadDocuments(this._pageFilter, this.filterParameters);
}
```

**Después:**
```typescript
onSaveDocument(document: Document): void {
  const index = this.openedDocumentsId.indexOf(document.documentId);
  if (index !== -1) {
    this.openedDocuments[index] = document;
  }
  this._messagesService.addMessage('MESSAGE.successSave', EnumMessageType.Info);
  this.loadDocuments(this._pageFilter, this.filterParameters);
}
```

**Explicación:**
- Actualiza el documento en `openedDocuments` después de guardar
- Mantiene la sincronización de datos

---

### 11. Actualizar el template HTML

**Antes:**
```html
<mat-tab *ngFor="let document of documentsOpened; let i = index" >
  <ng-template mat-tab-label >
    <div class="documents-container__tab" (click)="onClickTab(document)">
      <div class="documents-container__tab-label">
        {{ document.personName + ' - ' + document.documentDescription }} 
      </div>
      <button mat-icon-button class="documents-container__tab-button" (click)="onCloseTab(document)">
        <mat-icon>close</mat-icon>
      </button>
    </div>
  </ng-template>
  <app-document-form 
    formContent
    [documentId]="selectedDocument.documentId"
    (save)="onSaveDocument($event)" 
    (cancel)="onCancelDocument()">
  </app-document-form>
</mat-tab>
```

**Después:**
```html
<mat-tab *ngFor="let documentId of openedDocumentsId; let i = index" >
  <ng-template mat-tab-label >
    <div class="documents-container__tab" (click)="onClickTab(documentId)">
      <div class="documents-container__tab-label">
        {{ (getDocumentById(documentId)?.personName || 'Documento') + ' - ' + (getDocumentById(documentId)?.documentDescription || '') }} 
      </div>
      <button mat-icon-button class="documents-container__tab-button" (click)="onCloseTab(documentId); $event.stopPropagation()">
        <mat-icon>close</mat-icon>
      </button>
    </div>
  </ng-template>
  <app-document-form 
    formContent
    [documentId]="documentId"
    (save)="onSaveDocument($event)" 
    (cancel)="onCancelDocument()">
  </app-document-form>
</mat-tab>
```

**Cambios clave:**
- Itera sobre `openedDocumentsId` en lugar de `documentsOpened`
- Usa `getDocumentById(documentId)` para obtener los datos del documento
- Agrega `$event.stopPropagation()` al botón close para evitar que active el click del tab
- Pasa `documentId` directamente al componente hijo

---

## Beneficios de esta Mejora

1. **Separación de responsabilidades**: Los IDs se manejan de forma independiente de los datos completos
2. **Consulta al servicio**: Siempre se obtiene el documento completo actualizado
3. **Mejor rendimiento**: Solo se almacena lo necesario en cada lista
4. **Sincronización garantizada**: Las dos listas se actualizan siempre juntas
5. **Tipo más estricto**: `selectedDocumentId` puede ser `null` cuando no hay selección
6. **Reutilizable**: El patrón se puede aplicar a otros módulos (persons, entities, quotes, etc.)

---

## Aplicación a Otros Módulos

Para aplicar esta mejora a otros módulos (persons, entities, articles, etc.), seguir estos pasos:

### Paso 1: Identificar los archivos
- `{module}-container.component.ts`
- `{module}-container.component.html`
- Verificar que exista `{module}.service.ts` con método `get{Module}(id: number)`

### Paso 2: Realizar los cambios en el componente TypeScript
Seguir los pasos 1-10 adaptando los nombres:
- `documentsOpened` → `{module}sOpened` → `opened{Module}sId`
- `selectedDocument` → `selected{Module}Id`
- `openedDocuments` → `opened{Module}s`
- `DocumentGrid` → `{Module}Grid`
- `Document` → `{Module}`

### Paso 3: Actualizar el template HTML
Seguir el paso 11 con los nombres correspondientes

### Paso 4: Verificar errores
Ejecutar `ng serve` o revisar errores de TypeScript en VS Code

---

## Checklist de Implementación

- [ ] Importar el modelo completo (ej: `Document`)
- [ ] Cambiar propiedades: IDs array, selectedId, documentos completos array
- [ ] Modificar `onEdit()` para consultar el servicio
- [ ] Actualizar `_create{Module}()` para usar modelo completo
- [ ] Ajustar `onCancel{Module}()` para usar ID
- [ ] Modificar `onCloseTab()` para recibir ID
- [ ] Actualizar `onClickTab()` para recibir ID
- [ ] Refactorizar `_close{Module}()` para trabajar con IDs
- [ ] Eliminar `_edit{Module}()` y crear `get{Module}ById()`
- [ ] Actualizar `onSave{Module}()` para sincronizar arrays
- [ ] Modificar template HTML para iterar sobre IDs
- [ ] Agregar `$event.stopPropagation()` al botón close
- [ ] Probar funcionalidad completa

---

## Fecha de Implementación
17 de noviembre de 2025

## Módulo Original
`documents-module`

## Archivos Modificados
- `documents-container.component.ts`
- `documents-container.component.html`
