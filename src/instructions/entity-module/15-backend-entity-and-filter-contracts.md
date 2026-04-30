# 15 Backend Entity And Filter Contracts

## Objetivo
Definir los contratos base de dominio (`entity`) y de busqueda (`filter`) siguiendo la convencion usada en `users`.

## Dependencias
- Paso 14 finalizado.

## Archivos objetivo
- `libs/<domain>/src/<entity-singular>/entities/<entity-singular>.entity.ts`
- `libs/<domain>/src/<entity-singular>/dto/<entity-singular>-filter.dto.ts`

## REGLA ESTRICTA — Naming
Todos los campos deben usar el prefijo `<entity-singular>_`. Ver regla completa en paso 13.

## Contrato de entidad
- Crear clase `<EntitySingular>` con los campos de lectura/escritura de negocio.
- **Todos los campos con prefijo `<entity-singular>_`**: `entity_id`, `entity_description`, `entity_isActive`, `entity_createdAt`, `entity_updatedAt`.
- Si la entidad tiene enums (como `Role` en users), tiparlos con enum compartido o de Prisma.
- Ejemplo minimo:
  ```typescript
  export class <EntitySingular> {
    <entity-singular>_id: number;
    <entity-singular>_description: string;
    <entity-singular>_isActive: boolean;
    <entity-singular>_createdAt: Date;
    <entity-singular>_updatedAt: Date;
  }
  ```

## Contrato de filtro
- Crear `<EntitySingular>FilterDto` con `class-validator` y `class-transformer`.
- **Todos los campos con prefijo `<entity-singular>_`**: `entity_id`, `entity_description`.
- Incluir solo campos filtrables reales.
- Reglas sugeridas:
  - `@IsOptional()` en todos los filtros.
  - `@Type(() => Number)` + `@IsNumber()` para ids numericos.
  - `@IsString()` para campos de texto.
- Ejemplo:
  ```typescript
  export class <EntitySingular>FilterDto {
    @IsOptional()
    @Type(() => Number)
    @IsNumber()
    <entity-singular>_id?: number;

    @IsOptional()
    @IsString()
    <entity-singular>_description?: string;
  }
  ```

## Modelo Prisma
- Nombrar los campos del modelo con prefijo y agregar `@map("columna")` para conservar el nombre real de la columna en DB:
  ```prisma
  model <EntitySingular> {
    <entity-singular>_id          Int      @id @default(autoincrement()) @map("id")
    <entity-singular>_description String   @map("description")
    <entity-singular>_isActive    Boolean  @default(true) @map("isActive")
    <entity-singular>_createdAt   DateTime @default(now()) @map("createdAt")
    <entity-singular>_updatedAt   DateTime @map("updatedAt")

    @@map("<entity-plural>")
  }
  ```
- Tras modificar el schema, ejecutar `npx prisma generate` (no requiere migracion si solo se cambian nombres de campo con `@map`).

## Criterios de filtro en service (a implementar en paso 18)
- Para texto: `contains` + `mode: 'insensitive'`.
- Para booleanos o enums: comparacion exacta, validando existencia previa.

## Riesgos comunes
- Mezclar nombres frontend con nombres backend.
- Exponer en filtro campos que no existen en base.
- No tipar correctamente ids numericos.

## Checklist de salida
- Existe la entidad tipada.
- Existe DTO de filtro con validaciones.
- Los campos del filtro coinciden con el contrato de listado.
