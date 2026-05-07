# 10 Security And Actions

## Objetivo
Centralizar la capa transversal de permisos, acciones y bloqueos de edicion para que el modulo nuevo mantenga un comportamiento consistente entre entidades.

## Dependencias
- Ya estan definidos contenedor, grilla, formulario y secciones.
- Existen literales y claves funcionales para el nuevo modulo o al menos estan identificadas.

## Donde aplicar seguridad
1. En el contenedor principal.
2. En la grilla.
3. En el formulario principal.
4. En las secciones de formulario.

## Piezas a revisar
- `AuthService`
- Servicio de permisos de usuario del proyecto
- Enum de roles del proyecto
- `EnumLiteralKeys`
- `EnumActions`
- `EnumActionsType`
- `EnumObjectMode`
- `ActionService`
- `GridService`

## Contenedor principal
- Calcular acciones habilitadas para el listado.
- Usar la clave de literal correspondiente al modulo y/o grilla de la entidad.
- Enviar esas acciones a `ActionService` o `GridService`.

Implementacion obligatoria en contenedor:
```typescript
private _securityApply(): void {
  const actions = this._permissionsUserService.enabledActions(
    this._authService.getCurrentUser()?.role || EnumUserRole.VIEWER,
    EnumLiteralKeys.eModule_<EntityPlural>,
    this.makeConditions()
  );

  this._actionService.setActions(actions);
}
```

Reglas estrictas:
- Inyectar `UserPermissionsService`, `AuthService` y `MenuesService` en el contenedor.
- `makeConditions()` debe existir aunque inicialmente retorne `'#|V|#'`.
- `onAction(action)` debe manejar solo `EnumActions.eAction_New` como caso local y delegar cualquier otra accion a `MenuesService.openMenu(action)`.
- No construir `new Action(...)` manualmente en `_securityApply()`.
- No navegar con `UrlService`, `Router.navigate` o `switch` de acciones hardcodeadas cuando la accion ya existe en permisos + menus.

Metodos minimos:
- `_securityApply()`
- `makeConditions()`

## Grilla
- Resolver que acciones estan disponibles segun rol y condiciones.
- Aplicar el resultado sobre `GridService.setActions(actions)`.

Metodos minimos:
- `_securityApply()`
- `makeConditions()`

## Formulario principal
- Habilitar o deshabilitar `Save` segun:
  - modo readonly
  - validez de la seccion
  - si hubo modificaciones
- Resolver `objectMode` cuando `open()` devuelve `accessControl`.

Metodos minimos:
- `_securityApply()`
- `_enabledActions()`
- `isReadyToSave()`
- `makeConditions()`

## Secciones internas
- Ocultar campos por rol usando `hideFields(...)`.
- Deshabilitar el form cuando el modo es readonly.
- Usar `hideFields(role, <FORM_LITERAL_KEY>)` para la entidad actual.
- El campo `entity_id` (o el campo id de la entidad) siempre debe estar oculto para todos los roles. Registrar en `_inicializeUserRolFieldsMOCK()` con `hiddenFields: 'entity_id'`.
- En cada bloque de campo, aplicar `class="... skeleton-field"`, `col-span="2"` y `*ngIf="!isHiddenField('entity_description')"` (adaptando el nombre del campo).

## Condiciones de negocio
- Mantener una funcion `makeConditions()` si la plataforma de permisos lo requiere.
- No hardcodear condiciones complejas dentro de handlers dispersos.

## Riesgos comunes
- Habilitar `Save` solo por validacion y olvidar el estado `modified`.
- Resolver acciones del contenedor con arrays manuales en lugar de `enabledActions(...)`, produciendo permisos inconsistentes entre modulos.

## Archivos de referencia
- `<entity-plural>-container.component.ts`
- `<entity-singular>-grid.component.ts`
- `<entity-singular>-form.component.ts`
- `<entity-singular>-data-form.component.ts`

## Checklist de salida
- La seguridad del listado esta definida.
- La seguridad de la grilla esta definida.
- La seguridad del formulario y de las secciones esta definida.
- El modo readonly por lock remoto queda contemplado.
- La visibilidad de campos se resuelve por permisos con la literal key de formulario de la entidad.
- Los campos de secciones aplican `skeleton-field`, `col-span="2"` y condicion `*ngIf` con `isHiddenField(...)`.
- La seguridad del contenedor implementa: `enabledActions(...)`, rol actual desde `AuthService`, `makeConditions()`, `ActionService.setActions(...)` y dispatch restante por `MenuesService.openMenu(action)`.

## Regla de finalizacion
El modulo no puede marcarse como terminado si falta alguno de estos puntos:
1. `EnumLiteralKeys.eModule_<EntityPlural>` usado en seguridad del contenedor.
2. `EnumLiteralKeys.eGrid_<EntityPlural>` usado en seguridad de grilla y en `literalKey` del grid.
3. `EnumLiteralKeys.eForm_<EntitySingular>` usado en seguridad del formulario y `hideFields(...)`.
4. Alta de permisos para ADMIN en modulo, grilla y formulario.
5. `_securityApply()` del contenedor sin arrays manuales de `Action`, usando `enabledActions(...)` con el rol actual y `makeConditions()`.