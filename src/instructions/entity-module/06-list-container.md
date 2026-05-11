# 06 List Container

## Resumen ejecutivo

**Reglas criticas (OBLIGATORIAS):**
1. ✓ onEdit: Verificar si está abierta con `includes()` ANTES de agregar.
2. ✓ onEdit: Usar try-catch con mensaje de error.
3. ✓ onEdit: Usar conversor `_<entity>GridTo<EntitySingular>()`.
4. ✓ onSave: Actualizar primero pestañas, luego grilla.
5. ✓ onSave: Nuevas entidades al PRINCIPIO de la grilla con `[nuevo, ...existentes]`.
6. ✓ onSave: Usar conversor `_<entity>To<EntitySingular>Grid()`.
7. ✓ onSave: NO usar try-catch (errores en formulario hijo).
8. ✓ onSave: Llamar `GridService.setData()` ANTES del mensaje.
9. ✓ Conversores: Crear con `new`, mapear campo por campo.
10. ✓ Arrays sincronizados: `opened<EntityPlural>Id` y `_opened<EntityPlural>` SIEMPRE mismo length.

## Objetivo
Describir el contenedor principal del listado y su flujo completo de trabajo con un patron reutilizable para cualquier entidad.

## Dependencias
- El servicio HTTP ya esta definido.
- El routing del modulo ya existe.
- Los modelos `<Entity-singular>` y `<Entity-singular>Grid` ya estan cerrados.

## Archivo objetivo
- `<entity-plural>-container/<entity-plural>-container.component.ts`

## Responsabilidades del contenedor
1. Mantener el estado local de pestañas abiertas.
2. Mantener la entidad seleccionada.
3. Mantener filtro y paginacion.
4. Cargar datos iniciales.
5. Delegar vista de grilla y filtro a componentes hijos.
6. Orquestar acciones globales como nuevo, abrir, borrar o navegar a menus.
7. Coordinar el guardado y cierre de formularios embebidos.

## Orden recomendado del codigo
1. Declaraciones de estado (publicas):
   - `opened<EntityPlural>Id: number[]`
   - `selected<EntitySingular>Id: number`
   - `selectedTabIndex: number`
   - `filterParameters: <EntitySingular>Filter`
   - `config: ConfigurationItem`
2. Declaraciones privadas:
   - `_dataLoaded: <EntitySingular>Grid[]`
   - `_opened<EntityPlural>: <EntitySingular>[]`
   - `_pageFilter: PageFilter`
   - `_destroyRef = inject(DestroyRef)`
3. Constructor con servicios inyectados:
   - Llamar `_createPageFilter()`
   - Llamar `_createFilterParameters()`
   - Llamar `_setSubscriptions()`
4. Lifecycle hooks:
   - `ngOnInit()`: llamar `_securityApply()` y `load<EntityPlural>()`
   - `ngOnDestroy()`: vacio (cleanup automatico por `takeUntilDestroyed`)
5. Handlers publicos de eventos (en este orden):
   - `onSortChange(pageFilter)`
   - `onLoadNextPage()`
   - `onFilterApplied(filter)`
   - `onAction(action)`
   - `onEdit(itemGrid)` - **VER SECCION DE IMPLEMENTACION OBLIGATORIA**
   - `onDelete(itemGrid)`
   - `onOpen(itemGrid)`
   - `onSave(item)` - **VER SECCION DE IMPLEMENTACION OBLIGATORIA**
   - `onCancel()`
   - `onCloseTab(itemId)`
   - `onClickTab(itemId)`
6. Metodo publico de acceso:
   - `get<EntitySingular>ById(itemId)`
7. Metodo publico de carga:
   - `load<EntityPlural>(pageFilter, filterParameters)`
8. Helpers privados (en este orden):
   - `_actionNew<EntitySingular>()`
   - `_close<EntitySingular>(id)`
   - `_delete<EntitySingular>(itemGrid)`
   - `_<entity>GridTo<EntitySingular>(itemGrid)` - **Conversor Grid a Entity**
   - `_<entity>To<EntitySingular>Grid(item)` - **Conversor Entity a Grid**
9. Bloque de seguridad y configuracion:
   - `_securityApply()`
   - `makeConditions()`
   - `_setSubscriptions()`
10. Helpers de inicializacion:
   - `_createPageFilter()`
   - `_createFilterParameters()`

## Contrato de estado obligatorio
Definir y documentar explicitamente:
- ids abiertos: `opened<EntityPlural>Id: Array<number | string>`
- seleccionado actual: `selected<EntitySingular>Id`
- indice de tab: `selectedTabIndex`
- cache local de abiertos: `opened<EntityPlural>`
- filtro actual: `filterParameters`
- configuracion visual: `config`
- cache de grilla cargada: `_dataLoaded`
- paginacion/sort activo: `_pageFilter`

Regla estricta de literal key en contenedor:
- El contenedor debe resolver acciones con `EnumLiteralKeys.eModule_<EntityPlural>` en `_securityApply()`.
- `_securityApply()` debe invocar `UserPermissionsService.enabledActions(currentRole, EnumLiteralKeys.eModule_<EntityPlural>, this.makeConditions())` y luego `ActionService.setActions(actions)`.
- Queda prohibido construir manualmente `Action[]` dentro de `_securityApply()` aunque el modulo tenga pocas acciones.
- El contenedor debe inyectar `UserPermissionsService`, `AuthService` y `MenuesService` cuando aplique seguridad de acciones globales.
- `onAction(action)` debe resolver `EnumActions.eAction_New` con handler local y delegar el resto a `MenuesService.openMenu(action)`.
- El contenedor debe declarar `config: ConfigurationItem = new ConfigurationItem()`.
- El contenedor debe inyectar `ConfigurationService` y crear `_setSubscriptions()` con `getConfiguration().pipe(takeUntilDestroyed(this._destroyRef))`.
- En `_setSubscriptions()`, la configuracion del modulo debe buscarse por `config.items.find(c => c.literalKey === EnumLiteralKeys.eModule_<EntityPlural>)`.
- El constructor debe invocar `_setSubscriptions()`.
- El template del contenedor debe aplicar `config.color` en elementos visuales del modulo (por ejemplo toolbar flotante y/o borde de `mat-tab-group`).

## Contrato de metodos obligatorio
Documentar por metodo:
1. evento disparador
2. estado que modifica
3. servicios que invoca
4. errores esperados

### Documentacion de metodos clave

#### onEdit
- **Evento disparador**: Usuario hace clic en icono de editar en la grilla.
- **Estado que modifica**: `opened<EntityPlural>Id`, `_opened<EntityPlural>`, `selected<EntitySingular>Id`, `selectedTabIndex`.
- **Servicios que invoca**: `MessagesService` (solo en caso de error).
- **Errores esperados**: Excepcion al convertir o agregar entidad.
- **Flujo**: Verifica si ya está abierta → Si si, selecciona tab → Si no, agrega y selecciona → Maneja errores.

#### onSave
- **Evento disparador**: Formulario hijo emite evento de guardado exitoso con la entidad actualizada.
- **Estado que modifica**: `opened<EntityPlural>Id`, `_opened<EntityPlural>`, `_dataLoaded`, `selected<EntitySingular>Id`, `selectedTabIndex`.
- **Servicios que invoca**: `GridService.setData()`, `MessagesService.addMessage()`.
- **Errores esperados**: Ninguno (los errores de guardado se manejan en el formulario).
- **Flujo**: Actualiza tabs abiertas → Actualiza grilla → Notifica GridService → Muestra mensaje → Mantiene seleccion.

#### onDelete
- **Evento disparador**: Usuario hace clic en icono de eliminar y confirma la accion.
- **Estado que modifica**: `_dataLoaded`, `opened<EntityPlural>Id`, `_opened<EntityPlural>`, `selected<EntitySingular>Id`, `selectedTabIndex`.
- **Servicios que invoca**: `ModalService.showModal()`, `HTTPService<EntitySingular>.delete()`, `GridService.setData()`, `MessagesService.addMessage()`.
- **Errores esperados**: Error de servidor al eliminar.
- **Flujo**: Muestra modal → Confirma → Llama servicio → Actualiza grilla → Cierra tab si estaba abierta → Muestra mensaje.

#### onOpen
- **Evento disparador**: Usuario hace clic en icono de abrir en nueva ventana.
- **Estado que modifica**: Ninguno (abre nueva ventana del navegador).
- **Servicios que invoca**: `Router.serializeUrl()`, `Router.createUrlTree()`, `window.open()`.
- **Errores esperados**: Ninguno.
- **Flujo**: Crea URL con query params → Abre en nueva pestaña del navegador.

Metodos privados minimos esperados:
- `_open<EntitySingular>(itemGrid)` - OBSOLETO: la logica debe estar en `onEdit`
- `_close<EntitySingular>(id)`
- `_actionNew<EntitySingular>()`
- `_delete<EntitySingular>(itemGrid)`
- `_securityApply()`
- `makeConditions()`
- `_setSubscriptions()`
- `load<EntityPlural>(pageFilter, filterParameters)`
- `_createPageFilter()`
- `_createFilterParameters()`
- `_<entity>GridTo<EntitySingular>(itemGrid)` - **OBLIGATORIO**: Convertir Grid a entidad
- `_<entity>To<EntitySingular>Grid(item)` - **OBLIGATORIO**: Convertir entidad a Grid

## Handlers minimos esperados
- `onSortChange(pageFilter)`
- `onLoadNextPage()`
- `onFilterApplied(filter)`
- `onAction(action)`
- `onEdit(itemGrid)`
- `onDelete(itemGrid)`
- `onOpen(itemGrid)`
- `onSave(item)`
- `onCancel()`
- `onCloseTab(itemId)`
- `onClickTab(itemId)`

### Implementacion obligatoria de onEdit

El metodo `onEdit` debe seguir este patron exacto:

```typescript
onEdit(item: <EntitySingular>Grid): void {
  try {
    // 1. Verificar si la entidad ya está abierta
    if (this.opened<EntityPlural>Id.includes(item.<entity>_codigo)) {
      // Si ya está abierta, solo cambiar la pestaña seleccionada
      this.selected<EntitySingular>Id = item.<entity>_codigo;
      this.selectedTabIndex = this.opened<EntityPlural>Id.indexOf(item.<entity>_codigo);
      return;
    }
    
    // 2. Si no está abierta, agregarla a las colecciones
    this.opened<EntityPlural>Id.push(item.<entity>_codigo);
    this._opened<EntityPlural>.push(this._<entity>GridTo<EntitySingular>(item));
    
    // 3. Seleccionar la nueva pestaña
    this.selected<EntitySingular>Id = item.<entity>_codigo;
    this.selectedTabIndex = this.opened<EntityPlural>Id.indexOf(item.<entity>_codigo);
  } catch (error) {
    this._messagesService.addMessage("Error al editar <entity>", EnumMessageType.Error);
  }
}
```

**Reglas estrictas de onEdit:**
1. Siempre verificar primero si la entidad ya está abierta usando `includes()` sobre `opened<EntityPlural>Id`.
2. Si ya está abierta, SOLO actualizar `selected<EntitySingular>Id` y `selectedTabIndex`, luego retornar.
3. Si no está abierta, agregar el ID a `opened<EntityPlural>Id` y la entidad convertida a `_opened<EntityPlural>`.
4. Usar el metodo conversor `_<entity>GridTo<EntitySingular>(itemGrid)` para convertir de Grid a entidad completa.
5. Siempre actualizar `selected<EntitySingular>Id` y `selectedTabIndex` al final.
6. Envolver toda la logica en try-catch con mensaje de error apropiado.
7. NUNCA abrir la misma entidad dos veces en pestañas diferentes.

### Implementacion obligatoria de onSave

El metodo `onSave` debe seguir este patron exacto:

```typescript
onSave(item: <EntitySingular>): void {
  // 1. Actualizar o agregar en las colecciones de pestañas abiertas
  const openedIndex = this.opened<EntityPlural>Id.indexOf(item.<entity>_codigo);
  if (openedIndex !== -1) {
    // Si ya existe, actualizar en su posición
    this._opened<EntityPlural>[openedIndex] = item;
    this.opened<EntityPlural>Id[openedIndex] = item.<entity>_codigo;
  } else {
    // Si no existe, agregar al final
    this.opened<EntityPlural>Id.push(item.<entity>_codigo);
    this._opened<EntityPlural>.push(item);
  }

  // 2. Actualizar o agregar en la grilla cargada
  const gridIndex = this._dataLoaded.findIndex(gridItem => gridItem.<entity>_codigo === item.<entity>_codigo);
  if (gridIndex !== -1) {
    // Si ya existe en la grilla, actualizar en su posición
    this._dataLoaded[gridIndex] = this._<entity>To<EntitySingular>Grid(item);
  } else {
    // Si no existe en la grilla, agregar al principio del array
    this._dataLoaded = [this._<entity>To<EntitySingular>Grid(item), ...this._dataLoaded];
  }

  // 3. Notificar al GridService y al usuario
  this._gridService.setData(this._dataLoaded);
  this._messagesService.addMessage('MESSAGE.successSave', EnumMessageType.Info);
  
  // 4. Mantener seleccionada la pestaña actual
  this.selected<EntitySingular>Id = item.<entity>_codigo;
  this.selectedTabIndex = this.opened<EntityPlural>Id.indexOf(item.<entity>_codigo);
}
```

**Reglas estrictas de onSave:**
1. Primero, actualizar la coleccion de pestañas abiertas (`_opened<EntityPlural>` y `opened<EntityPlural>Id`).
2. Buscar el indice de la entidad abierta usando `indexOf()` sobre `opened<EntityPlural>Id`.
3. Si el indice existe (`!== -1`), actualizar en esa posicion en ambos arrays.
4. Si el indice no existe, agregar al final de ambos arrays usando `push()`.
5. Segundo, actualizar la grilla cargada (`_dataLoaded`).
6. Buscar el indice en la grilla usando `findIndex()` con comparacion del ID.
7. Si existe en la grilla, actualizar en esa posicion usando el conversor `_<entity>To<EntitySingular>Grid()`.
8. Si no existe en la grilla, agregar al PRINCIPIO del array usando spread operator: `[nuevo, ...existentes]`.
9. Notificar al `GridService` con `setData()` ANTES de mostrar el mensaje al usuario.
10. Mostrar mensaje de exito usando clave de traduccion `MESSAGE.successSave`.
11. Actualizar `selected<EntitySingular>Id` y `selectedTabIndex` para mantener la seleccion.
12. NUNCA usar `try-catch` en `onSave` - los errores deben manejarse en el formulario hijo.

### Metodos conversores obligatorios

Deben existir dos metodos privados de conversion:

```typescript
private _<entity>GridTo<EntitySingular>(itemGrid: <EntitySingular>Grid): <EntitySingular> {
  const item = new <EntitySingular>();
  item.<entity>_codigo = itemGrid.<entity>_codigo;
  item.<entity>_descripcion = itemGrid.<entity>_descripcion;
  // ... mapear todos los campos del Grid a la entidad
  return item;
}

private _<entity>To<EntitySingular>Grid(item: <EntitySingular>): <EntitySingular>Grid {
  const itemGrid = new <EntitySingular>Grid();
  itemGrid.<entity>_codigo = item.<entity>_codigo;
  itemGrid.<entity>_descripcion = item.<entity>_descripcion;
  // ... mapear todos los campos de la entidad al Grid
  return itemGrid;
}
```

**Reglas de conversores:**
1. Siempre crear una nueva instancia usando `new`.
2. Mapear campo por campo, nunca usar spread operator o Object.assign.
3. Nombres estrictos: `_<entity>GridTo<EntitySingular>` y `_<entity>To<EntitySingular>Grid`.
4. Deben ser metodos privados.
5. El Grid generalmente tiene menos campos que la entidad completa.

## Servicios que suelen intervenir
- `HTTPService<EntitySingular>`
- `GridService<<EntitySingular>Grid>`
- `MessagesService`
- `ActionService`
- `ModalService`
- `MenuesService`
- `ConfigurationService`
- `AuthService`
- Servicio de permisos del proyecto

## Flujo de sincronizacion de estado

El contenedor mantiene TRES colecciones que deben estar sincronizadas:

1. **`opened<EntityPlural>Id: number[]`**: Array de IDs de pestañas abiertas (incluye 0 para nuevos).
2. **`_opened<EntityPlural>: <EntitySingular>[]`**: Array de entidades completas abiertas (mismo orden que IDs).
3. **`_dataLoaded: <EntitySingular>Grid[]`**: Array de items de grilla cargados (puede no incluir todas las pestañas abiertas).

### Reglas de sincronizacion

**En onEdit:**
- Si el ID ya existe en `opened<EntityPlural>Id`, NO agregar nada, solo seleccionar.
- Si el ID no existe, agregar en paralelo: `push(id)` y `push(entity)`.
- Los arrays `opened<EntityPlural>Id` y `_opened<EntityPlural>` SIEMPRE deben tener el mismo length.
- El indice en ambos arrays es el mismo para la misma entidad.

**En onSave:**
- Buscar el indice en `opened<EntityPlural>Id` usando `indexOf(id)`.
- Si existe (`!== -1`), actualizar en ese indice en ambos arrays.
- Si no existe, agregar al final de ambos arrays.
- Buscar el indice en `_dataLoaded` usando `findIndex(item => item.id === id)`.
- Si existe en grilla, actualizar en ese indice.
- Si no existe en grilla, agregar al PRINCIPIO (entidades nuevas primero).
- SIEMPRE llamar `GridService.setData()` despues de modificar `_dataLoaded`.

**En onDelete:**
- Filtrar `_dataLoaded` para remover el item eliminado.
- Llamar `GridService.setData()` con el array filtrado.
- Llamar `_close<EntitySingular>(id)` para remover de las pestañas abiertas.

**En _close<EntitySingular>:**
- Buscar el indice con `indexOf(id)`.
- Hacer `splice(index, 1)` en AMBOS arrays: `opened<EntityPlural>Id` y `_opened<EntityPlural>`.
- Actualizar `selected<EntitySingular>Id` al anterior disponible o 0 si no hay mas.
- Actualizar `selectedTabIndex` usando `indexOf()` del nuevo seleccionado o -1 si no hay.

### Ejemplo de sincronizacion correcta

```
Estado inicial:
  opened<EntityPlural>Id = [1, 2, 3]
  _opened<EntityPlural> = [Entity1, Entity2, Entity3]
  _dataLoaded = [Grid1, Grid2, Grid3, Grid4, Grid5]

Usuario edita Entity6 (no abierta, no en grilla):
  onEdit(Grid6) →
    opened<EntityPlural>Id = [1, 2, 3, 6]
    _opened<EntityPlural> = [Entity1, Entity2, Entity3, Entity6]
    _dataLoaded = [Grid1, Grid2, Grid3, Grid4, Grid5]  // Sin cambios

Usuario guarda Entity6 modificada:
  onSave(Entity6) →
    opened<EntityPlural>Id = [1, 2, 3, 6]  // Ya existe en indice 3
    _opened<EntityPlural> = [Entity1, Entity2, Entity3, Entity6Updated]  // Actualizado en indice 3
    _dataLoaded = [Grid6, Grid1, Grid2, Grid3, Grid4, Grid5]  // Agregado al principio

Usuario borra Entity2:
  onDelete(Grid2) →
    _dataLoaded = [Grid6, Grid1, Grid3, Grid4, Grid5]  // Removido Grid2
    _close<EntitySingular>(2) →
      opened<EntityPlural>Id = [1, 3, 6]  // Removido ID 2
      _opened<EntityPlural> = [Entity1, Entity3, Entity6Updated]  // Removida Entity2
```

### Caso especial: Entidades nuevas (ID = 0)

Las entidades nuevas se crean con ID = 0 hasta que se guardan en el backend:

```typescript
// En _actionNew<EntitySingular>:
const newEntity = new <EntitySingular>();
this.opened<EntityPlural>Id.push(0);
this._opened<EntityPlural>.push(newEntity);
this.selected<EntitySingular>Id = 0;

// En onSave despues de guardar una nueva:
// El backend retorna la entidad con su ID real (ej: 7)
onSave(entityWithNewId: <EntitySingular>) {
  // entityWithNewId.<entity>_codigo = 7
  const openedIndex = this.opened<EntityPlural>Id.indexOf(0);  // Busca el 0
  if (openedIndex !== -1) {
    // Actualiza el ID de 0 a 7
    this.opened<EntityPlural>Id[openedIndex] = entityWithNewId.<entity>_codigo;
    this._opened<EntityPlural>[openedIndex] = entityWithNewId;
  }
  // ... resto del flujo de onSave
}
```

**Reglas para entidades nuevas:**
1. Antes de guardar, el ID es 0.
2. Al guardar, el formulario hijo debe llamar al backend y recibir el ID real.
3. El evento onSave recibe la entidad con el ID real asignado por el backend.
4. onSave actualiza el ID de 0 al ID real en `opened<EntityPlural>Id`.
5. Si hay multiples nuevos abiertos, todos tienen ID = 0 hasta que se guarden (se identifican por posicion).
6. Es responsabilidad del FORMULARIO HIJO obtener el ID real del backend antes de emitir el evento save.

## Ejemplo completo de implementacion

### Ejemplo de onEdit basado en FamiliasContainer

```typescript
onEdit(familia: FamiliaGrid): void {
  try {
    // 1. Verificar si ya está abierta
    if (this.openedFamiliasId.includes(familia.familia_codigo)) {
      // Solo cambiar la pestaña seleccionada
      this.selectedFamiliaId = familia.familia_codigo;
      this.selectedTabIndex = this.openedFamiliasId.indexOf(familia.familia_codigo);
      return;
    }
    
    // 2. Agregar a las colecciones
    this.openedFamiliasId.push(familia.familia_codigo);
    this._openedFamilias.push(this._familiaGridToFamilia(familia));
    
    // 3. Seleccionar la nueva pestaña
    this.selectedFamiliaId = familia.familia_codigo;
    this.selectedTabIndex = this.openedFamiliasId.indexOf(familia.familia_codigo);
  } catch (error) {
    this._messagesService.addMessage("Error al editar familia", EnumMessageType.Error);
  }
}
```

### Ejemplo de onSave basado en FamiliasContainer

```typescript
onSave(familia: Familia): void {
  // 1. Actualizar o agregar en pestañas abiertas
  const openedIndex = this.openedFamiliasId.indexOf(familia.familia_codigo);
  if (openedIndex !== -1) {
    // Ya existe, actualizar
    this._openedFamilias[openedIndex] = familia;
    this.openedFamiliasId[openedIndex] = familia.familia_codigo;
  } else {
    // No existe, agregar
    this.openedFamiliasId.push(familia.familia_codigo);
    this._openedFamilias.push(familia);
  }

  // 2. Actualizar o agregar en grilla
  const gridIndex = this._dataLoaded.findIndex(item => item.familia_codigo === familia.familia_codigo);
  if (gridIndex !== -1) {
    // Ya existe en grilla, actualizar
    this._dataLoaded[gridIndex] = this._familiaToFamiliaGrid(familia);
  } else {
    // No existe en grilla, agregar al principio
    this._dataLoaded = [this._familiaToFamiliaGrid(familia), ...this._dataLoaded];
  }

  // 3. Notificar y mostrar mensaje
  this._gridService.setData(this._dataLoaded);
  this._messagesService.addMessage('MESSAGE.successSave', EnumMessageType.Info);
  
  // 4. Mantener selección
  this.selectedFamiliaId = familia.familia_codigo;
  this.selectedTabIndex = this.openedFamiliasId.indexOf(familia.familia_codigo);
}
```

### Ejemplo de conversores

```typescript
private _familiaGridToFamilia(familiaGrid: FamiliaGrid): Familia {
  const familia = new Familia();
  familia.familia_codigo = familiaGrid.familia_codigo;
  familia.familia_descripcion = familiaGrid.familia_descripcion;
  // Agregar todos los campos que tenga el Grid
  return familia;
}

private _familiaToFamiliaGrid(familia: Familia): FamiliaGrid {
  const familiaGrid = new FamiliaGrid();
  familiaGrid.familia_codigo = familia.familia_codigo;
  familiaGrid.familia_descripcion = familia.familia_descripcion;
  // Agregar todos los campos que tenga el Grid
  return familiaGrid;
}
```

### Puntos clave de los ejemplos

1. **onEdit usa try-catch**, onSave no.
2. **onEdit retorna early** si la entidad ya está abierta.
3. **onSave actualiza dos veces**: pestañas y grilla.
4. **onSave usa indexOf** para pestañas, **findIndex** para grilla.
5. **onSave agrega al principio** de la grilla con spread operator.
6. **Conversores crean nuevas instancias** con `new`.
7. **Siempre actualizar selección** al final de ambos métodos.

## Logica critica a replicar
- **onEdit**: Si una entidad ya esta abierta, solo cambiar la tab seleccionada y retornar. Si no esta abierta, agregarla a las colecciones y seleccionar su tab. NUNCA abrir dos veces la misma entidad.
- **onSave**: Primero actualizar las colecciones de pestañas abiertas (actualizar si existe, agregar si no). Segundo, actualizar la grilla cargada (actualizar si existe, agregar al PRINCIPIO si es nueva). Tercero, notificar al GridService. Cuarto, mostrar mensaje de exito. Quinto, mantener la seleccion.
- **Conversores**: Siempre usar `_<entity>GridTo<EntitySingular>()` en onEdit y `_<entity>To<EntitySingular>Grid()` en onSave. Mapear campo por campo.
- La apertura en nueva ventana debe construir una URL serializada y usar `window.open`.
- El borrado debe pasar por modal de confirmacion.
- La seguridad del toolbar/listado no puede ser declarativa ni hardcodeada: debe salir del servicio de permisos del proyecto usando el rol actual y `makeConditions()`.

## Riesgos comunes
- **Abrir multiples tabs para la misma entidad**: onEdit DEBE verificar con `includes()` antes de agregar.
- **Perder sincronizacion entre openedEntitiesId y _openedEntities**: onSave debe actualizar ambos arrays en el mismo orden.
- **No actualizar la grilla al guardar**: onSave DEBE buscar en `_dataLoaded` y actualizar o agregar.
- **Agregar nuevas entidades al final de la grilla**: Las nuevas entidades deben agregarse al PRINCIPIO usando `[nuevo, ...existentes]`.
- **No convertir entre Grid y entidad**: onEdit usa `_gridToEntity()`, onSave usa `_entityToGrid()`.
- **No reiniciar pagina al aplicar filtro u ordenar**: `onFilterApplied` y `onSortChange` deben resetear `_dataLoaded` y `_pageFilter.page = 1`.
- **Hardcodear acciones del contenedor**: Siempre usar `enabledActions(...)` del servicio de permisos, nunca construir `Action[]` manualmente.
- **No mantener la seleccion al guardar**: onSave debe actualizar `selected<EntitySingular>Id` y `selectedTabIndex` al final.
- **Usar try-catch en onSave**: Los errores de guardado deben manejarse en el formulario hijo, no en el contenedor.

## Archivos de referencia
- `<entity-plural>-container.component.ts`
- `http-services/<entity-singular>.service.ts`
- `models/<entity-singular>-grid.model.ts`

## SCSS
El archivo `.scss` del contenedor **no usa CSS plano**. Importa los tokens de estilo compartidos y aplica `@extend` sobre las clases del sistema de diseño:

```scss
@import 'styles/container.scss';
@import 'styles/floating-toolbar';

.body {
    height: 100vh;
    background: var(--container-primary-bg);
    position: relative;
}

.<entity-plural>-container {
  display: flex;
  flex-direction: column;
  height: 100%;
  width: 100%;

  &__tab {
    @extend .container-tab-header;
    &-label { @extend .container-tab-header__label; }
    &-button { @extend .container-tab-header__button; }
  }

  &__content {
    flex: 1 1 auto;
    display: flex;
    flex-direction: column;
    gap: 1rem;
    padding: 1rem;
  }

  &__filter {
    flex: 0 0 auto;
    height: 500px;
    overflow-y: auto;
  }

  &__grid {
    flex: 1 1 auto;
    min-height: 0;
    height: 100%;
  }
}
```

**Regla**: nunca usar valores de color, borde o espaciado hardcodeados. Usar siempre las clases del sistema de diseño via `@extend`.

## Checklist de salida
- El contenedor tiene definido su estado principal con tipos exactos.
- El flujo de tabs, carga, filtro y acciones esta documentado.
- **onEdit verifica si la entidad ya está abierta antes de agregarla**.
- **onEdit usa `_<entity>GridTo<EntitySingular>()` para convertir Grid a entidad**.
- **onEdit actualiza `selected<EntitySingular>Id` y `selectedTabIndex` correctamente**.
- **onEdit tiene try-catch con mensaje de error apropiado**.
- **onSave actualiza primero las colecciones de pestañas abiertas**.
- **onSave actualiza segundo la grilla cargada (`_dataLoaded`)**.
- **onSave agrega nuevas entidades al PRINCIPIO de la grilla**.
- **onSave usa `_<entity>To<EntitySingular>Grid()` para convertir entidad a Grid**.
- **onSave notifica al GridService ANTES del mensaje de exito**.
- **onSave mantiene la seleccion al final**.
- **onSave NO tiene try-catch (errores manejados en el formulario)**.
- Existen los metodos conversores `_<entity>GridTo<EntitySingular>()` y `_<entity>To<EntitySingular>Grid()`.
- Los conversores mapean campo por campo usando `new` para crear instancias.
- La apertura en nueva ventana y el borrado tienen su comportamiento resuelto.
- El contenedor aplica seguridad con `eModule_<EntityPlural>` y no con literal keys genericas o hardcodeadas.
- `_securityApply()` usa `UserPermissionsService.enabledActions(...)` + `AuthService.getCurrentUser()?.role` + `ActionService.setActions(...)`.
- `onAction()` usa `EnumActions.eAction_New` para alta local y delega el resto a `MenuesService.openMenu(action)`; no se aceptan `switch` con navegacion hardcodeada.
- El contenedor lee configuracion por `ConfigurationService.getConfiguration()` y resuelve `config` con `eModule_<EntityPlural>`.
- El template aplica `config.color` en al menos un contenedor visual del modulo (recomendado: toolbar y tabs).