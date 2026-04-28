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

## Grilla
- Resolver que acciones estan disponibles segun rol y condiciones.
- Aplicar el resultado sobre `GridService.setActions(actions)`.

## Formulario principal
- Habilitar o deshabilitar `Save` segun:
  - modo readonly
  - validez de la seccion
  - si hubo modificaciones
- Resolver `objectMode` cuando `open()` devuelve `accessControl`.

## Secciones internas
- Ocultar campos por rol usando `hideFields(...)`.
- Deshabilitar el form cuando el modo es readonly.
- Usar `hideFields(role, <FORM_LITERAL_KEY>)` para la entidad actual.
- En cada bloque de campo, aplicar `class="... skeleton-field"`, `col-span="2"` y `*ngIf="!isHiddenField('entity_description')"` (adaptando el nombre del campo).

## Condiciones de negocio
- Mantener una funcion `makeConditions()` si la plataforma de permisos lo requiere.
- No hardcodear condiciones complejas dentro de handlers dispersos.

## Riesgos comunes
- Habilitar `Save` solo por validacion y olvidar el estado `modified`.

## Archivos de referencia
- `<entity-plural>-container.component.ts`
- `<entity-plural>-grid.component.ts`
- `<entity-singular>-form.component.ts`
- `<entity-singular>-data-form.component.ts`

## Checklist de salida
- La seguridad del listado esta definida.
- La seguridad de la grilla esta definida.
- La seguridad del formulario y de las secciones esta definida.
- El modo readonly por lock remoto queda contemplado.
- La visibilidad de campos se resuelve por permisos con la literal key de formulario de la entidad.
- Los campos de secciones aplican `skeleton-field`, `col-span="2"` y condicion `*ngIf` con `isHiddenField(...)`.