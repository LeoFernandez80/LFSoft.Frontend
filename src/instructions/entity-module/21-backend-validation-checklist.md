# 21 Backend Validation Checklist

## Objetivo
Definir una validacion final del modulo backend para asegurar que el patron implementado sea consistente, reutilizable y listo para integrarse con frontend.

## Dependencias
- Pasos 13 al 20 implementados.

## Validacion funcional
1. `GET /<entity-plural>` devuelve paginacion correcta (`data + total`).
2. Filtros por texto aplican `contains` case-insensitive.
3. `GET /<entity-plural>/:id` devuelve la entidad esperada.
4. `GET /<entity-plural>/:id/open` abre y registra lock cuando corresponde.
5. `POST /<entity-plural>` crea entidad con contrato esperado.
6. `PUT /<entity-plural>/:id` actualiza solo campos enviados.
7. `DELETE /<entity-plural>/:id` respeta la estrategia definida (fisica o logica).
8. `POST /<entity-plural>/:id/close` libera lock sin errores bloqueantes.

## Validacion tecnica
1. Compila el backend sin errores TypeScript.
2. DTOs tienen decoradores de validacion coherentes.
3. Service no contiene logica de transporte HTTP.
4. Controller no contiene logica de persistencia.
5. Prisma se desconecta en `onModuleDestroy` cuando aplica.

## Validacion de naming (OBLIGATORIA)
1. Cada campo de la clase entity usa prefijo `<entity-singular>_`.
2. Cada campo del DTO principal usa prefijo `<entity-singular>_`.
3. Cada campo del filter DTO usa prefijo `<entity-singular>_`.
4. Los campos del modelo Prisma usan prefijo y tienen `@map("columna")` para preservar columnas DB.
5. Las clausulas `where`, `orderBy` y `data` en el service usan los nombres con prefijo del schema Prisma.
6. Ningun campo sin prefijo aparece en entidad, DTOs ni queries del service.
7. El `sortField` default en `findAll` usa el nombre prefijado (ej. `'<entity-singular>_createdAt'`).

## Validacion de seguridad
1. Endpoints protegidos usan `JwtAuthGuard`.
2. Los endpoints publicos estan explicitamente decorados.
3. El lock no permite estados inconsistentes por `objectKey`.

## Validacion de integracion
1. El modulo nuevo esta exportado en `libs/<domain>/src/index.ts`.
2. El modulo esta importado donde corresponde en el arbol Nest.
3. El frontend puede consumir contratos sin adaptadores extra.

## Definition of done
- Existe modulo backend completo, reusable y alineado al patron de users.
- El flujo CRUD + open/close esta implementado y validado.
- Los contratos estan estables para escalar a nuevas entidades.
