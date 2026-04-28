# 02 Structure And Exports

## Objetivo
Definir el scaffolding minimo del modulo nuevo y dejar claro que exportaciones publicas deben existir cuando se implemente la libreria.

## Dependencias
- Haber leido `01-overview.md`.
- Tener definidos `<entity-singular>` y `<entity-plural>` para la entidad.

## Pasos
1. Crear la carpeta raiz del modulo dentro de la libreria correspondiente: `<entity-plural>/`.
2. Crear las subcarpetas base: `http-services`, `models`, `<entity-singular>-drawer`, `<entity-singular>-form`, `<entity-plural>-container`, `<entity-plural>-form-container`.
3. Crear los archivos estructurales vacios o iniciales:
   - `<entity-plural>.module.ts`
   - `<entity-plural>-module-routing.module.ts`
   - `http-services/<entity-singular>.service.ts`
   - `models/<entity-singular>.model.ts`
   - `models/<entity-singular>-grid.model.ts`
   - `models/<entity-singular>-filter.model.ts`
   - `models/<entity-singular>-response.model.ts`
   - `<entity-plural>-container/<entity-plural>-container.component.ts`
   - `<entity-plural>-container/<entity-singular>-grid/<entity-singular>-grid.component.ts`
   - `<entity-plural>-container/<entity-singular>-grid-filter/<entity-singular>-grid-filter.component.ts`
   - `<entity-singular>-form/<entity-singular>-form.component.ts`
   - `<entity-singular>-form/<entity-singular>-data-form/<entity-singular>-data-form.component.ts`
   - `<entity-plural>-form-container/<entity-plural>-form-container.component.ts`
4. Mantener el patron mixto definido para la arquitectura del repo:
   - `<entity-plural>.module.ts` y `<entity-plural>-module-routing.module.ts` siguen siendo NgModule.
   - Los componentes concretos siguen siendo standalone.
5. Preparar la public API de la libreria en su `index.ts` para exportar modulo, routing, servicio, modelos y componentes.

## Orden recomendado de creacion real
1. Carpetas.
2. Modelos.
3. Servicio HTTP.
4. Routing y modulo.
5. Listado.
6. Formulario.
7. Exportaciones.

## Exportaciones esperadas
- Modules.
- Services.
- Models.
- Components.

## Criterios de consistencia
- El nombre de carpetas y archivos debe reflejar singular o plural de la entidad elegida.
- Usar `<entity-plural>` para modulo, routing, contenedor principal y form container.
- Usar `<entity-singular>` para servicio, modelos, form, drawer y subformularios.
- El subformulario principal debe ir en singular bajo `<entity-singular>-form/<entity-singular>-data-form`.
- La ruta publica de exportacion debe seguir el mismo orden del `index.ts` de la libreria.

## Archivos de referencia
- `libs/<library>/src/index.ts`
- `<entity-plural>.module.ts`
- `<entity-plural>-module-routing.module.ts`

## Checklist de salida
- La estructura del modulo nuevo esta definida de punta a punta.
- El equipo sabe que archivos minimos debe crear primero.
- La estrategia de exportaciones publicas esta decidida.
- Se mantiene un patron estructural uniforme entre entidades.