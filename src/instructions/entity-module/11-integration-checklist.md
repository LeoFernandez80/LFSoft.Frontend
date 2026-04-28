# 11 Integration Checklist

## Objetivo
Listar todo lo que debe revisarse fuera del modulo local para que la implementacion real funcione end to end, sin escribir nada fuera de esta carpeta de instrucciones.

## Dependencias
- El diseño completo del modulo ya esta definido.

## Integracion frontend
1. Exportaciones en el `index.ts` de la libreria.
2. Registro del modulo en rutas superiores si existe un shell o modulo padre.
3. Literales y traducciones para labels, botones, mensajes y encabezados de grilla.
4. Claves `EnumLiteralKeys` para formulario y grilla.
5. Integracion con `MenuesService` si la pantalla se abre desde menu.
6. Integracion con configuracion de columnas si la plataforma la soporta.

## Integracion de seguridad
1. Alta de permisos para pantalla, grilla y acciones.
2. Definicion de campos ocultos por rol.
3. Reglas para `enabledActions(...)`.
4. Reglas para modo readonly cuando una entidad esta lockeada.
5. Convencion de template en secciones: `skeleton-field`, `col-span="2"` y `*ngIf="!isHiddenField('entity_description')"` (ajustado por campo).

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

## Preguntas que deben quedar cerradas antes de implementar
- La entidad usa lock con `open` y `close`?
- La ruta del recurso es singular o plural?
- El backend devuelve una respuesta enriquecida con `accessControl`?
- La grilla necesita configuracion persistida por usuario?
- Hay mas de una seccion de formulario?

## Archivos de referencia
- `libs/<library>/src/index.ts`
- `http-services/<entity-plural>.service.ts`
- `<entity-plural>-grid.component.ts`
- `<entity-singular>-form.component.ts`

## Checklist de salida
- Ya estan identificados todos los puntos de integracion externos al modulo.
- Quedo separado que depende de frontend, seguridad y backend.
- No hay supuestos silenciosos sobre rutas, permisos o locks.
- El equipo puede implementar sin descubrir integraciones tarde.
- La convencion de campos en secciones de formulario queda explicitamente validada.