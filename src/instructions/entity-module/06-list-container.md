# 06 List Container

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
1. Declaraciones de estado:
   - ids abiertos
   - entidad seleccionada
   - indice de tab seleccionado
   - cache de entidades abiertas
   - `filterParameters`
   - `config`
   - `_dataLoaded`
   - `_pageFilter`
2. Constructor con servicios inyectados.
3. `ngOnInit()`.
4. Handlers publicos de sort, scroll, filtro, acciones, edit, delete, open, save, cancel, close tab, click tab.
5. Helpers privados para abrir, cerrar, mapear y cargar datos.
6. Bloque de seguridad.

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

## Logica critica a replicar
- Si una entidad ya esta abierta, solo cambiar la tab seleccionada.
- Si no esta abierta, agregarla a la coleccion local y seleccionar su tab.
- Al guardar, actualizar tambien el cache de grilla si la entidad ya estaba cargada.
- La apertura en nueva ventana debe construir una URL serializada y usar `window.open`.
- El borrado debe pasar por modal de confirmacion.

## Riesgos comunes
- Perder sincronizacion entre `openedEntitiesId` y el arreglo de entidades abiertas.
- No reiniciar pagina al aplicar filtro u ordenar.
- Abrir multiples tabs para la misma entidad.

## Archivos de referencia
- `<entity-plural>-container.component.ts`
- `http-services/<entity-plural>.service.ts`
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
- El contenedor tiene definido su estado principal.
- El flujo de tabs, carga, filtro y acciones esta documentado.
- La apertura en nueva ventana y el borrado tienen su comportamiento resuelto.
- El guardado contempla actualizar la grilla cargada.