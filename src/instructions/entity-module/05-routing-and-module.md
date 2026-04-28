# 05 Routing And Module

## Objetivo
Definir el modulo Angular y el routing del nuevo modulo respetando el patron mixto de NgModule + componentes standalone del repositorio.

## Dependencias
- La estructura del modulo ya existe.
- Los nombres de contenedores y formulario ya estan acordados.

## <entity-plural>.module.ts
### Responsabilidad
- Importar `CommonModule`.
- Importar `ReactiveFormsModule`.
- Importar `<Entity-Plural>ModuleRoutingModule`.
- Declarar o exportar solo lo necesario segun el patron de la libreria.

### Regla clave
Aunque el modulo sea NgModule, los componentes concretos del flujo pueden seguir siendo standalone.

## <entity-plural>-module-routing.module.ts
### Rutas base a replicar
1. Ruta de apertura externa:
   - `path: '<entity-singular>/open'`
   - `component: <Entity-plural>FormContainerComponent`
   - `data: { operation: 'open' }`
2. Ruta principal del modulo:
   - `path: '<entity-singular>'`
   - `component: <Entity-plural>ContainerComponent`

## Criterios de implementacion
- Mantener `RouterModule.forChild(routes)`.
- Dejar `exports: [RouterModule]`.
- No sobrecargar el routing con resolvers o guards si no hay necesidad funcional real.
- Si la libreria cuelga de un prefijo mayor, respetar la estrategia del modulo padre.

## Decisiones que deben quedar cerradas
- Nombre singular de la ruta.
- Prefijo del modulo mayor, si existe.
- Componente que abre en nueva ventana.

## Riesgos comunes
- Usar una ruta plural donde el backend o la navegacion esperan singular.
- Olvidar `data.operation = 'open'` y romper la carga segura del formulario.
- Intentar declarar componentes standalone dentro de `declarations` sin revisar la estrategia del repo.

## Archivos de referencia
- `<entity-plural>.module.ts`
- `<entity-plural>-module-routing.module.ts`
- `<entity-plural>-container.component.ts`
- `<entity-plural>-form-container.component.ts`

## Checklist de salida
- El modulo Angular base esta definido.
- Las rutas `<entity-singular>` y `<entity-singular>/open` estan diseñadas.
- La operacion `open` queda resuelta por metadata de ruta.
- La mezcla NgModule + standalone queda explicitada y aceptada.