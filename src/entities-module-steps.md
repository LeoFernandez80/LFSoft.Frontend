# Pasos para crear el módulo Entities siguiendo el estándar del módulo Persons

1. **Crear estructura de carpetas inicial**
   ```
   src/app/components/entities-module/
   ├── models/
   ├── services/
   ├── entity-drawer/
   ├── entity-form/
   ├── entities-container/
   │   ├── entity-grid/
   │   └── entity-grid-filter/
   └── entities-form-container/
   ```

2. **Crear modelos base** (en `/models/`)
   - `entity.model.ts` (modelo base con los campos id y description)
   - `entity-grid.model.ts` (modelo para la vista de grilla)
   - `entity-filter.model.ts` (modelo para los parámetros de filtro)

3. **Crear servicio** (en `/services/`)
   - `entity.service.ts` (servicio con operaciones CRUD y datos de prueba)

4. **Crear componente entity-grid-filter** (en `/entities-container/entity-grid-filter/`)
   - Componente de filtro usando `generic-form` y `generic-actions`
   - Integración con `entity-filter.model`
   - Implementar eventos de filtrado

5. **Crear componente entity-grid** (en `/entities-container/entity-grid/`)
   - Componente de grilla usando `generic-grid`
   - Integración con `entity-grid.model`
   - Implementar acciones de editar, eliminar y abrir

6. **Crear componente entity-drawer** (en `/entity-drawer/`)
   - Componente drawer usando `generic-drawer`
   - Integración con `entity-form`
   - Manejo de eventos save/cancel

7. **Crear componente entity-form** (en `/entity-form/`)
   - Formulario usando `generic-form`
   - Validaciones usando `generic-form-validations`
   - Integración con `entity.model`

8. **Crear componente entities-container** (en `/entities-container/`)
   - Contenedor principal usando `generic-layout`
   - Integración de grid y filter
   - Implementación de acciones principales y sistema de pestañas
   - **IMPORTANTE - Gestión optimizada de pestañas:**
     - Usar `openedEntitiesId: number[]` para almacenar solo los IDs de entidades abiertas
     - Usar `selectedEntityId: number | null` para el ID de la entidad seleccionada
     - Usar `private _openedEntities: Entity[]` para almacenar las entidades completas (privada)
     - En `onEdit()`: consultar el servicio con `getEntity(id)` para obtener la entidad completa
     - En `_createEntity()`: crear instancia de `Entity` (no `EntityGrid`) con ID 0
     - Crear método público `getEntityById(id: number): Entity | undefined` para uso en template
     - Métodos `_closeEntity()`, `onCloseTab()`, `onClickTab()` deben trabajar con IDs
     - Sincronizar ambos arrays (`openedEntitiesId` y `openedEntities`) en todas las operaciones
     - En el template: iterar sobre `openedEntitiesId` y usar `getEntityById()` para mostrar datos

9. **Crear componente entities-form-container** (en `/entities-form-container/`)
   - Contenedor de formulario usando `generic-layout`
   - Integración con entity-form
   - Manejo de mensajes y navegación

10. **Crear módulo y routing**
    - `entities-module.module.ts` con las importaciones necesarias
    - `entities-module-routing.module.ts` con las rutas:
      - `/entities` → EntitiesContainerComponent
      - `/entities/open` → EntitiesFormContainerComponent

11. **Actualizar app.routes.ts**
    - Agregar la ruta lazy loading para el módulo de entities:
      ```typescript
      {
        path: 'entities-module',
        loadChildren: () =>
          import('./components/entities-module/entities-module.module').then(m => m.EntitiesModule)
      }
      ```

12. **Agregar botón en la barra flotante del componente home**
    - Actualizar el componente `app.ts` (home) para agregar el botón del nuevo módulo
    - Implementar la lógica de navegación al hacer clic en el botón
    - Seguir el mismo patrón de los botones existentes (persons, quotes, entities, articles, users)

---

## Patrón de Gestión de Pestañas Optimizado

Este patrón debe aplicarse a todos los módulos con sistema de pestañas (entities, documents, persons, articles, quotes, etc.):

### Propiedades del Componente Container
```typescript
openedEntitiesId: number[] = [];          // IDs de entidades abiertas
selectedEntityId: number | null = null;   // ID de entidad seleccionada
private _openedEntities: Entity[] = [];   // Entidades completas (privada)
```

### Método onEdit() - Consultar Servicio
```typescript
onEdit(entity: EntityGrid): void {
  if (this.openedEntitiesId.includes(entity.id)) {
    this.selectedEntityId = entity.id;
    return;
  }
  
  this._entityService.getEntity(entity.id)
    .pipe(takeUntilDestroyed(this._destroyRef))
    .subscribe({
      next: (fullEntity) => {
        this.openedEntitiesId.push(entity.id);
        this._openedEntities.push(fullEntity);
        this.selectedEntityId = entity.id;
      },
      error: () => {
        this._messagesService.addMessage("Error al cargar entidad", EnumMessageType.Error);
      }
    });
}
```

### Método Auxiliar para Template
```typescript
getEntityById(entityId: number): Entity | undefined {
  const index = this.openedEntitiesId.indexOf(entityId);
  return index !== -1 ? this._openedEntities[index] : undefined;
}
```

### Template HTML
```html
<mat-tab *ngFor="let entityId of openedEntitiesId">
  <ng-template mat-tab-label>
    <div (click)="selectedEntityId = entityId">
      {{ getEntityById(entityId)?.description || 'Nueva Entidad' }}
      <button (click)="onCloseTab(entityId); $event.stopPropagation()">
        <mat-icon>close</mat-icon>
      </button>
    </div>
  </ng-template>
  <app-entity-form [entityId]="entityId" (save)="onSaveEntity($event)">
  </app-entity-form>
</mat-tab>
```

### Beneficios
- Separación clara entre IDs y datos completos
- Consulta al servicio garantiza datos actualizados
- Mejor rendimiento y sincronización
- Patrón reutilizable en todos los módulos

---

Cada paso replica exactamente la arquitectura, nomenclatura y uso de componentes genéricos del módulo persons, asegurando consistencia y mantenibilidad en la aplicación.

Detenete en cada paso para esperar confirmacion 


<!-- 
necesito que crees un modulo para documents siguiendo exactamente todos los estandares, patrones y criterios del modulo de persons. Tambien debes respetar todos los pasos definidos en el archivo entities-module-steps.md del contexto. el documento tiene los siguientes datos export class document {
    //grid
    documentId: number=0;
    //grid
    personName: string='';
    personId: number=0;
    personDocumentType: string='';
    personDocumentNumber: string=''
    //grid
    documentDescription: string='';
    //grid
    documentCreationDate: Date=new Date();
    documentSentDate: Date=new Date();
    documentStatus: EnumDocumentStatus=EnumDocumentStatus.inCreation;
    creationUserId: number=0;
}
Detenete en cada paso para esperar confirmacion -->