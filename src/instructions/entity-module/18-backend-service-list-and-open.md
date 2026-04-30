# 18 Backend Service List And Open

## Objetivo
Implementar la parte del service para listado, paginacion, filtros dinamicos y apertura (`open`) con control de lock.

## Dependencias
- Paso 17 finalizado.
- Acceso a Prisma y tabla de control de acceso disponible cuando corresponda.

## Archivo objetivo
- `libs/<domain>/src/<entity-singular>/<entity-plural>.service.ts`

## Estructura del service
- `@Injectable()`
- Implementar `OnModuleDestroy` para desconectar Prisma.
- Importar `PaginatedListDto` y `PageFilter`/`PageFilterDto` segun convencion del repo.

## REGLA ESTRICTA — Naming en queries Prisma
Usar los nombres de campo con prefijo `<entity-singular>_` en todas las clausulas `where`, `orderBy` y `data`, ya que el schema Prisma usa esos nombres. No usar nombres de columna DB directamente.

## Metodo `findAll(filters, pageFilter)`
1. Leer `page`, `pageSize`, `sortField`, `sortDirection` con defaults. El `sortField` default debe ser `'<entity-singular>_createdAt'`.
2. Construir `where` dinamico usando los nombres prefijados del schema Prisma:
   - `where.<entity-singular>_isActive = true` (condicion base)
   - `where.<entity-singular>_id = filters.<entity-singular>_id` (id exacto)
   - `where.<entity-singular>_description = { contains, mode: 'insensitive' }` (texto)
3. Ejecutar:
   - `count({ where })`
   - `findMany({ where, orderBy: { [sortField]: sortDirection }, skip, take })`
4. Retornar `new PaginatedListDto(data, total)`.

## Metodo `open(id, terminal)`
1. Buscar la entidad con `findUnique({ where: { <entity-singular>_id: id } })`.
2. Si no existe, lanzar `NotFoundException`.
3. Si la entidad usa lock:
   - Buscar lock existente por `terminalId + objectKey`.
   - Si no existe, crearlo.
4. Retornar la entidad.

## Convencion de objectKey
- Formato: `eObject_<EntitySingular>_<id>` (ejemplo: `eObject_Entity_42`).
- Mantener consistencia entre frontend y backend para evitar locks huerfanos.

## Checklist de salida
- Listado paginado y filtrado funcionando.
- Apertura con lock aplicada cuando corresponda.
- Ordenamiento dinamico soportado sin hardcode excesivo.
