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

Metodos privados minimos esperados:
- `_open<EntitySingular>(itemGrid)`
- `_close<EntitySingular>(id)`
- `_actionNew<EntitySingular>()`
- `_delete<EntitySingular>(itemGrid)`
- `_securityApply()`
- `makeConditions()`
- `_setSubscriptions()`
- `load<EntityPlural>(pageFilter, filterParameters)`
- `_createPageFilter()`
- `_createFilterParameters()`

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
- La seguridad del toolbar/listado no puede ser declarativa ni hardcodeada: debe salir del servicio de permisos del proyecto usando el rol actual y `makeConditions()`.

## Riesgos comunes
- Perder sincronizacion entre `openedEntitiesId` y el arreglo de entidades abiertas.
- No reiniciar pagina al aplicar filtro u ordenar.
- Abrir multiples tabs para la misma entidad.
- Hardcodear acciones del contenedor y saltear `enabledActions(...)`, dejando permisos distintos entre modulos.

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
- El contenedor tiene definido su estado principal.
- El flujo de tabs, carga, filtro y acciones esta documentado.
- La apertura en nueva ventana y el borrado tienen su comportamiento resuelto.
- El guardado contempla actualizar la grilla cargada.
- El contenedor aplica seguridad con `eModule_<EntityPlural>` y no con literal keys genericas o hardcodeadas.
- `_securityApply()` usa `UserPermissionsService.enabledActions(...)` + `AuthService.getCurrentUser()?.role` + `ActionService.setActions(...)`.
- `onAction()` usa `EnumActions.eAction_New` para alta local y delega el resto a `MenuesService.openMenu(action)`; no se aceptan `switch` con navegacion hardcodeada.
- El contenedor lee configuracion por `ConfigurationService.getConfiguration()` y resuelve `config` con `eModule_<EntityPlural>`.
- El template aplica `config.color` en al menos un contenedor visual del modulo (recomendado: toolbar y tabs).