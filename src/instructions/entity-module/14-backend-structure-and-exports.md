# 14 Backend Structure And Exports

## Objetivo
Crear la estructura fisica del modulo backend y dejar definidas las exportaciones minimas para consumo desde la libreria.

## Dependencias
- Paso 13 leido.
- Libreria destino ya existente en `libs/<domain>`.

## Archivos a crear
1. `libs/<domain>/src/<entity-singular>/<entity-plural>.module.ts`
2. `libs/<domain>/src/<entity-singular>/<entity-plural>.controller.ts`
3. `libs/<domain>/src/<entity-singular>/<entity-plural>.service.ts`
4. `libs/<domain>/src/index.ts` (actualizar export)

## Convencion de modulo
- `@Module({ controllers: [...], providers: [...], exports: [...] })`
- Exportar siempre el service del modulo.

## Convencion de index
- En `libs/<domain>/src/index.ts`, exportar al menos:
  - `export * from './<entity-singular>/<entity-plural>.module';`

## Reglas de consistencia
- Nombre de ruta del controller en plural: `@Controller('<entity-plural>')`.
- Nombre de clase del controller: `<EntityPlural>Controller`.
- Nombre de clase del service: `<EntityPlural>Service`.
- Nombre de clase del module: `<EntityPlural>Module`.

## Checklist de salida
- La estructura base del modulo existe.
- El modulo exporta el service.
- El `index.ts` de la libreria expone el modulo nuevo.
