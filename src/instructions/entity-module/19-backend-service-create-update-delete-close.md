# 19 Backend Service Create Update Delete Close

## Objetivo
Definir create, update, delete y close del service con las convenciones de robustez estandar del repositorio.

## Dependencias
- Paso 18 finalizado.

## Metodos a implementar
1. `create(entityDto, terminal)`
2. `update(id, entityDto)`
3. `delete(id)`
4. `close(id, terminal)`

## REGLA ESTRICTA — Naming en escrituras Prisma
Usar los nombres de campo con prefijo `<entity-singular>_` en toda clausula `data` y `where`. No usar nombres de columna DB.

## Reglas para `create`
- Envolver en `prisma.$transaction(...)` cuando haya mas de una escritura.
- Construir `data` de forma explicita con campos prefijados:
  ```typescript
  data: {
    <entity-singular>_description: dto.<entity-singular>_description,
    <entity-singular>_isActive: true,
    <entity-singular>_updatedAt: new Date(),
  }
  ```
- Si hay lock inicial, crear registro de access-control dentro de la misma transaccion.
- El `objectKey` del lock usa `entity.<entity-singular>_id` (campo prefijado del resultado de Prisma).

## Reglas para `update`
- Validar existencia previa con `findOne`.
- Construir `updateData` solo con campos definidos, usando nombres prefijados:
  ```typescript
  const updateData: any = { <entity-singular>_updatedAt: new Date() };
  if (dto.<entity-singular>_description !== undefined) updateData.<entity-singular>_description = dto.<entity-singular>_description;
  ```
- Ejecutar `prisma.entity.update({ where: { <entity-singular>_id: id }, data: updateData })`.

## Reglas para `delete`
- Definir si el borrado es fisico (`delete`) o logico (`update isActive=false`).
- Mantener una sola estrategia por entidad.

## Reglas para `close`
- Eliminar lock en access-control por clave compuesta.
- Manejar error de lock inexistente sin romper flujo principal (log controlado).

## Errores y observabilidad
- Registrar errores tecnicos con contexto minimo (`id`, `terminalId`).
- Evitar exponer detalles sensibles de DB en respuestas.

## Checklist de salida
- `create` y `update` mapean campos explicitamente.
- `delete` sigue estrategia definida.
- `close` libera lock de forma segura.
- Las transacciones cubren operaciones compuestas.
