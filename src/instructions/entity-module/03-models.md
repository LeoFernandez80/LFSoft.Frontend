# 03 Models

## Objetivo
Documentar los modelos base necesarios para reproducir un patron consistente entre entidades y establecer que rol cumple cada uno.

## Dependencias
- Haber definido la estructura del modulo.
- Tener decidido el nombre real de la entidad y sus claves.

## Modelos a crear
1. `<entity-singular>.model.ts`
2. `<entity-singular>-grid.model.ts`
3. `<entity-singular>-filter.model.ts`
4. `<entity-singular>-response.model.ts`

## <entity-singular>.model.ts
### Responsabilidad
Representa la entidad completa usada por el formulario y por operaciones CRUD.

### Patron a replicar
- Heredar de `EntityObject`.
- Declarar las propiedades de negocio con valores por defecto simples.
- Implementar `objectType`.
- Implementar `objectKey` usando el identificador principal.

### Reglas
- Mantener nombres de campos alineados con el backend.
- No introducir transformaciones de UI en este modelo.
- Si existe `objectMode`, lo resolvera el flujo de apertura o seguridad, no el constructor.

## <entity-singular>-grid.model.ts
### Responsabilidad
Representa el shape reducido que consume la grilla.

### Patron a replicar
- Heredar de `GridObject`.
- Incluir solo campos visibles o utiles para acciones de listado.
- No mezclar validaciones del formulario.

## <entity-singular>-filter.model.ts
### Responsabilidad
Representa el filtro serializable a query string para busquedas del listado.

### Patron a replicar
- Heredar de `FilterObject`.
- Implementar `QueryParams`.
- Implementar `toString()` usando `URLSearchParams`.
- Omitir parametros vacios, nulos o valores por defecto que no deban viajar al backend.

### Reglas
- Cada propiedad del filtro debe mapear 1 a 1 con un query param esperado por el backend.
- Evitar enviar cadenas vacias.
- En campos numericos, revisar si `0` significa vacio o valor valido.

## <entity-singular>-response.model.ts
### Responsabilidad
Tipar respuestas enriquecidas que incluyan entidad, `accessControl`, validaciones y errores.

### Patron a replicar
- Exponer una propiedad principal con la entidad.
- Exponer `accessControl` nullable.
- Exponer arreglos `validations` y `errores`.

## Secuencia recomendada de implementacion real
1. Definir `<entity-singular>.model.ts`.
2. Definir `<entity-singular>-grid.model.ts`.
3. Definir `<entity-singular>-filter.model.ts`.
4. Definir `<entity-singular>-response.model.ts`.
5. Revisar imports compartidos usados por la libreria.

## Riesgos comunes
- Mezclar propiedades de grilla dentro del modelo completo.
- Serializar filtros con claves que el backend no reconoce.
- Construir `objectKey` con una propiedad distinta a la clave real.

## Archivos de referencia
- `models/<entity-singular>.model.ts`
- `models/<entity-singular>-grid.model.ts`
- `models/<entity-singular>-filter.model.ts`
- `models/<entity-singular>-response.model.ts`

## Checklist de salida
- Ya esta definida la entidad completa.
- La grilla tiene su modelo propio.
- El filtro implementa `toString()` de forma consistente.
- La respuesta enriquecida cubre acceso, validaciones y errores.