# 11 Integration Checklist

## Objetivo
Listar todo lo que debe revisarse fuera del modulo local para que la implementacion real funcione end to end, sin escribir nada fuera de esta carpeta de instrucciones.

## Dependencias
- El diseño completo del modulo ya esta definido.

## Integracion frontend
1. Exportaciones en el `index.ts` de la libreria.
2. Registro del modulo en rutas superiores si existe un shell o modulo padre.
3. Literales y traducciones para labels, botones, mensajes y encabezados de grilla.
4. Agregar en `EnumLiteralKeys` las siguientes claves del modulo:
   - `eModule_<EntityPlural>` — clave del modulo (pantalla / permiso de acceso)
   - `eGrid_<EntityPlural>` — clave de la grilla
   - `eForm_<EntitySingular>` — clave del formulario de datos
5. Agregar en `EnumActions` la accion de apertura del modulo:
   - `eAction_Open<EntityPlural> = 'eAction_Open<EntityPlural>'`
6. Registrar la accion en `PermisionsActionsService._loadActions()`:
   ```typescript
   this._actions.set(EnumActions.eAction_Open<EntityPlural>, new Action('BUTTON.<entity-plural>', EnumActions.eAction_Open<EntityPlural>, EnumActionsIcons.open<EntityPlural>, false, EnumActionsViewType.view16x16));
   ```
7. Registrar la ruta en `MenuesService._inicilizeMenues()`:
   ```typescript
   this._menues.set(EnumActions.eAction_Open<EntityPlural>, ['<entity-plural>-module', '<entity-plural>']);
   ```
8. Si el modulo debe mostrarse desde Home, agregar `eAction_Open<EntityPlural>` al permiso de `EnumLiteralKeys.eModule_Home` en `_inicializePermissionsUserMOCK()`.
9. Validar que `enabledActions(..., EnumLiteralKeys.eModule_Home, '#|V|#')` devuelva la accion y que `PermisionsActionsService.getAction(...)` no retorne `undefined`.
10. Registrar el path en `app.routes.ts`:
   ```typescript
   {
     path: '<entity-plural>-module',
     canActivate: [AuthGuard, PermissionGuard],
     data: { literalKeyType: EnumLiteralKeys.eModule_<EntityPlural> },
     loadChildren: () =>
       import('@lib/<library>').then(m => m.<EntityPlural>Module)
   }
   ```
11. Integracion con configuracion de columnas si la plataforma la soporta.
12. Integracion con configuracion visual del modulo:
   - El container declara `config: ConfigurationItem`.
   - El constructor ejecuta `_setSubscriptions()`.
   - `_setSubscriptions()` usa `ConfigurationService.getConfiguration()` y filtra por `EnumLiteralKeys.eModule_<EntityPlural>`.
   - El template aplica `config.color` en al menos un elemento visual del modulo.

## Integracion de seguridad
1. Alta de permisos para pantalla, grilla y acciones.
2. Agregar en `_inicializePermissionsUserMOCK()` de `UserPermissionsService` la entrada para ADMIN:
   ```typescript
   {
     userRolId: EnumUserRole.ADMIN,
     eTypeLiteralKey: EnumLiteralKeys.eModule_<EntityPlural>,
     permissionConditions: '#|V|#',
     permitionsActions: '',
     caseId: 2
   }
   ```
3. Agregar en `_inicializeUserRolFieldsMOCK()` las entradas de campos ocultos por rol:
   ```typescript
   { userRolId: EnumUserRole.ADMIN,   eTypeLiteralKey: EnumLiteralKeys.eForm_<EntitySingular>, hiddenFields: 'entity_id' },
   { userRolId: EnumUserRole.VIEWER,  eTypeLiteralKey: EnumLiteralKeys.eForm_<EntitySingular>, hiddenFields: 'entity_id' }
   ```
   El campo `entity_id` siempre debe ocultarse por defecto para todos los roles.
4. Reglas para `enabledActions(...)`.
5. Reglas para modo readonly cuando una entidad esta lockeada.
6. Convencion de template en secciones: `skeleton-field`, `col-span="2"` y `*ngIf="!isHiddenField('entity_description')"` (ajustado por campo).
7. Validar que el contenedor inyecte `UserPermissionsService`, `AuthService` y `MenuesService` y que `_securityApply()` no cree `Action[]` manuales.
8. Validar que `onAction(action)` use `EnumActions.eAction_New` para alta local y el resto por `MenuesService.openMenu(action)`.

## Integracion backend
1. Endpoint base del recurso.
2. Endpoint de listado paginado y filtrado.
3. Endpoint `GET by id`.
4. Endpoint `open`.
5. Endpoint `create`.
6. Endpoint `update`.
7. Endpoint `delete`.
8. Endpoint `close`.
9. Contratos request/response alineados con modelos del frontend.

## Integracion transversal
1. `environment.apiUrl` debe resolver correctamente el recurso.
2. `ConfigurationService.terminal` debe estar disponible si se usa lock.
3. Los mensajes de error deben ser compatibles con `MessagesService`.
4. El modulo debe compilar con la estrategia standalone + NgModule del repo.
5. La documentacion del modulo debe incluir matriz de Inputs/Outputs y contrato de metodos por componente.

## Preguntas que deben quedar cerradas antes de implementar
- La entidad usa lock con `open` y `close`?
- La ruta del recurso es singular o plural?
- El backend devuelve una respuesta enriquecida con `accessControl`?
- La grilla necesita configuracion persistida por usuario?
- Hay mas de una seccion de formulario?

## Archivos de referencia
- `libs/<library>/src/index.ts`
- `http-services/<entity-singular>.service.ts`
- `<entity-singular>-grid.component.ts`
- `<entity-singular>-form.component.ts`

## Checklist de salida
- Ya estan identificados todos los puntos de integracion externos al modulo.
- Quedo separado que depende de frontend, seguridad y backend.
- No hay supuestos silenciosos sobre rutas, permisos o locks.
- El equipo puede implementar sin descubrir integraciones tarde.
- La convencion de campos en secciones de formulario queda explicitamente validada.
- Las claves `eModule_`, `eGrid_`, `eForm_` y `eAction_Open` estan dadas de alta en los enums.
- La ruta del modulo esta registrada en `MenuesService`.
- ADMIN tiene permiso de acceso al modulo y el campo id esta oculto en todos los roles.
- Existe una matriz actualizada de variables, metodos, Inputs y Outputs por tipo de archivo del modulo.
- Si el modulo debe aparecer en Home, la accion de apertura esta dada de alta en permisos de Home y se renderiza en UI.
- El contenedor no hardcodea acciones ni navegacion.

## Regla de cierre obligatoria
No se considera completa la implementacion si falta cualquiera de estos puntos:
1. Alta de `EnumLiteralKeys` (`eModule_`, `eGrid_`, `eForm_`).
2. Alta de `EnumActions.eAction_Open<EntityPlural>`.
3. Registro en `PermisionsActionsService._loadActions()`.
4. Registro en `MenuesService._inicilizeMenues()`.
5. Permisos en `UserPermissionsService` para modulo, grilla y formulario.
6. Lectura y aplicacion de configuracion visual del modulo (`ConfigurationService` + `config.color` en template).
7. Seguridad del contenedor sin `new Action(...)` manuales ni navegacion hardcodeada por accion.