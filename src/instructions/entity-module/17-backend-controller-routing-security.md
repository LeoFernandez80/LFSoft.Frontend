# 17 Backend Controller Routing Security

## Objetivo
Definir el controller del modulo con rutas y seguridad consistentes con el patron de `users`.

## Dependencias
- Pasos 14, 15 y 16 finalizados.
- `JwtAuthGuard` disponible en la libreria de seguridad.

## Archivo objetivo
- `libs/<domain>/src/<entity-singular>/<entity-plural>.controller.ts`

## Decoradores base
- `@Controller('<entity-plural>')`
- `@UseGuards(JwtAuthGuard)` a nivel clase.
- `@Public()` solo donde el negocio realmente lo permita.

## Endpoints recomendados
1. `GET /<entity-plural>`
   - Entrada: `@Query() pageFilter: PageFilterDto`, `@Query() filters: <EntitySingular>FilterDto`
   - Salida: listado paginado.
2. `GET /<entity-plural>/:id/open`
   - Entrada: `@Param('id')`, `@Query() terminal: TerminalDto`
   - Salida: `<EntitySingular>ResponseDto`.
3. `POST /<entity-plural>/:id/close`
   - Entrada: `@Body() terminal: TerminalDto`
   - Salida: `void` o estado de cierre.
4. `GET /<entity-plural>/:id`
   - Salida: entidad individual.
5. `POST /<entity-plural>`
   - Entrada: `<EntitySingular>RequestDto`.
6. `PUT /<entity-plural>/:id`
   - Entrada: `<EntitySingular>RequestDto` o DTO equivalente para update.
7. `DELETE /<entity-plural>/:id`
   - Salida: entidad eliminada o resultado de borrado.

## Reglas
- El controller no debe contener logica de persistencia.
- Delegar toda la logica al service.
- Mantener nombres de handlers claros: `findAll`, `open`, `close`, `findOne`, `create`, `update`, `delete`.

## Checklist de salida
- Controller con rutas estandar completas.
- Seguridad base aplicada por guard.
- Contratos de entrada/salida alineados con DTOs.
