# 13 Backend Overview

## Objetivo
Definir el plan de implementacion backend de un modulo de entidad siguiendo los patrones usados en `libs/users` (controller + service + dto + entity + module + export), pero en formato generico para cualquier dominio.

## Alcance incluido
- Estructura de carpetas y archivos del modulo backend.
- Contratos de DTOs para filtro, request y response.
- Endpoints estandar (`list`, `getById`, `open`, `create`, `update`, `delete`, `close`).
- Reglas de seguridad, lock y transacciones.

## Alcance excluido
- Cambios directos en Prisma schema o migraciones.
- Implementacion de seeds.
- Integracion de frontend (ya cubierta por los pasos 01-12).

## Plantillas de nombre
- `<domain>`: libreria destino (ejemplo: `articles`, `utilities`, `sales`).
- `<entity-plural>`: nombre del recurso en plural (ejemplo: `customers`).
- `<entity-singular>`: nombre de entidad en singular (ejemplo: `customer`).
- `<EntitySingular>`: clase de dominio (ejemplo: `Customer`).
- `<EntityPlural>`: nombre del modulo Nest (ejemplo: `Customers`).

## REGLA ESTRICTA — Naming de propiedades
**Todas las propiedades de entidades, DTOs y filtros deben usar el prefijo `<entity-singular>_`.**

| Propiedad generica | Ejemplo con `customer` |
| --- | --- |
| `<entity-singular>_id` | `customer_id` |
| `<entity-singular>_description` | `customer_description` |
| `<entity-singular>_isActive` | `customer_isActive` |
| `<entity-singular>_createdAt` | `customer_createdAt` |
| `<entity-singular>_updatedAt` | `customer_updatedAt` |

### Alcance de la regla
- Clase de entidad (`.entity.ts`).
- DTOs principales (`.dto.ts`).
- DTOs de filtro (`-filter.dto.ts`).
- DTOs de request (`-request.dto.ts`) — los campos anidados en `entity: ...`.
- Campos del modelo Prisma: usar nombres con prefijo y `@map("campo_sin_prefijo")` para conservar las columnas de DB existentes.
- Acceso en `service.ts`: campos Prisma con prefijo, no crear alias.

### Prohibido
- Usar nombres sin prefijo (ej. `id`, `description`, `isActive`) en entidad o DTOs.
- Usar nombres de columna DB directamente en el codigo TypeScript si no coinciden con la convencion.

## Estructura objetivo
```text
libs/<domain>/src/<entity-singular>/
  dto/
    <entity-singular>.dto.ts
    <entity-singular>-filter.dto.ts
    <entity-singular>-request.dto.ts
    <entity-singular>-response.dto.ts
  entities/
    <entity-singular>.entity.ts
    <entity-singular>-filter.dto.ts  (si el proyecto mantiene esta duplicidad por compatibilidad)
  <entity-plural>.controller.ts
  <entity-plural>.service.ts
  <entity-plural>.module.ts

libs/<domain>/src/index.ts
```

## Orden recomendado
1. Definir estructura y exportaciones.
2. Definir contratos (`entity`, `filter`, `dto`, `request`, `response`).
3. Implementar controller.
4. Implementar service (listado, open, create, update, delete, close).
5. Integrar modulo en la libreria.
6. Validar funcional y tecnicamente.

## Checklist de salida
- Existe un plan backend completo y ordenado.
- El plan es reutilizable para cualquier entidad.
- La convencion de `users` queda reflejada en formato generico.
