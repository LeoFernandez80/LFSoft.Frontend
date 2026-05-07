# 16 Backend Request Response Contracts

## Objetivo
Definir contratos de entrada y salida para operaciones de apertura y persistencia, siguiendo la forma estructural estandar del repositorio.

## Dependencias
- Paso 15 finalizado.

## Archivos objetivo
- `libs/<domain>/src/<entity-singular>/dto/<entity-singular>.dto.ts`
- `libs/<domain>/src/<entity-singular>/dto/<entity-singular>-request.dto.ts`
- `libs/<domain>/src/<entity-singular>/dto/<entity-singular>-response.dto.ts`

## REGLA ESTRICTA — Naming
Todos los campos del DTO principal deben usar el prefijo `<entity-singular>_`. Ver regla completa en paso 13.

## Contrato principal
1. `<EntitySingular>Dto`
   - Contiene campos editables con prefijo: `<entity-singular>_description`, `<entity-singular>_isActive`, etc.
   - Marcar opcionales cuando aplique para update parcial.
   - Ejemplo de `CreateEntityDto`: campo `<entity-singular>_description`.
2. `<EntitySingular>RequestDto`
   - Estructura recomendada:
     - `entity: <EntitySingular>Dto`  ← el campo envolvente se llama `entity`, no con prefijo
     - `terminal: TerminalDto`
   - Usar `@ValidateNested()` y `@Type(() => ...)`.
3. `<EntitySingular>ResponseDto`
   - Estructura recomendada:
     - `entity: <EntitySingular>` ← retorna la entidad completa con campos prefijados
     - `terminal: TerminalDto`
   - Agregar metadata adicional solo si la API la requiere (por ejemplo lock/acceso).

## Convenciones de validacion
- Aplicar `class-validator` en `dto.ts`.
- Evitar validaciones duplicadas entre DTOs.
- `request.dto.ts` debe validar al menos la presencia de `entity`.

## Checklist de salida
- Existe DTO principal de entidad.
- Existe request DTO con entidad + terminal.
- Existe response DTO consistente con `open`.
