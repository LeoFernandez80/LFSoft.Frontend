# 01 Overview

## Objetivo
Definir el alcance de un modulo de entidad nuevo con una plantilla reutilizable para cualquier dominio (por ejemplo: `persons`) sin implementar codigo todavia. Este archivo fija nombres, responsabilidades y orden de lectura del instructivo.

## Contrato de documentacion obligatoria (alineado al patron users)
Cada archivo de instruccion del modulo debe dejar explicitado, sin ambiguedad:
- Variables de estado (publicas y privadas) esperadas por componente/servicio.
- Metodos publicos y privados con su responsabilidad.
- Inputs y Outputs con tipo y uso.
- Contratos request/response y reglas de serializacion.
- Reglas de mantenimiento cuando se agregan campos o endpoints.

Si una seccion no aplica (por ejemplo, un `NgModule` sin Inputs/Outputs), debe declararse explicitamente como "no aplica".

## Alcance incluido
- Estructura del modulo frontend.
- Modelos, servicio HTTP, routing, contenedores, grilla, filtro, formulario, secciones internas, seguridad, integracion y validacion.
- Convenciones de nombres y dependencias reutilizables entre entidades.

## Alcance excluido
- Escritura de codigo fuera de `src/instructions/entity-module`.
- Implementacion efectiva del nuevo modulo en `libs/...`.
- Cambios reales de backend, literales, permisos o menus.

## Convenciones base
- Usar `<entity-plural>` para nombres de carpeta de modulo (ejemplo: `persons`).
- Usar `<entity-singular>` para nombres de ruta singular (ejemplo: `person`).
- Usar `<EntitySingular>` para la clase principal del dominio (ejemplo: `Person`).
- Usar `<EntitySingular>Grid` para el modelo mostrado por la grilla (ejemplo: `PersonGrid`).
- Usar `<EntitySingular>Filter` para el modelo de filtro serializable (ejemplo: `PersonFilter`).
- Usar `<EntitySingular>Response` para respuestas tipadas de lectura u apertura.
- Usar `HTTPService<EntitySingular>` para el servicio HTTP (ejemplo: `HTTPServicePerson`).
- Mantener la separacion en carpetas `http-services`, `models`, `<entity-singular>-drawer`, `<entity-singular>-form`, `<entity-plural>-container`, `<entity-plural>-form-container`.


## Tabla de mapeo generica
| Plantilla | Ejemplo con persons |
| --- | --- |
| `<entity-plural>.module.ts` | `persons.module.ts` |
| `<entity-plural>-module-routing.module.ts` | `persons-module-routing.module.ts` |
| `HTTPService<EntitySingular>` | `HTTPServicePerson` |
| `<EntitySingular>` | `Person` |
| `<EntitySingular>Grid` | `PersonGrid` |
| `<EntitySingular>Filter` | `PersonFilter` |
| `<EntitySingular>Response` | `PersonResponse` |
| `<EntityPlural>ContainerComponent` | `PersonsContainerComponent` |
| `<EntitySingular>GridComponent` | `PersonGridComponent` |
| `<EntitySingular>GridFilterComponent` | `PersonGridFilterComponent` |
| `<EntitySingular>FormComponent` | `PersonFormComponent` |
| `<EntitySingular>DataFormComponent` | `PersonDataFormComponent` |
| `<EntityPlural>FormContainerComponent` | `PersonsFormContainerComponent` |

## Arbol objetivo
```text
libs/<library>/src/lib/<entity-plural>/
  http-services/
    <entity-singular>.service.ts
  models/
    <entity-singular>.model.ts
    <entity-singular>-grid.model.ts
    <entity-singular>-filter.model.ts
    <entity-singular>-response.model.ts
  <entity-singular>-drawer/
  <entity-singular>-form/
    <entity-singular>-form.component.ts
    <entity-singular>-data-form/
      <entity-singular>-data-form.component.ts
  <entity-plural>-container/
    <entity-plural>-container.component.ts
    <entity-singular>-grid/
      <entity-singular>-grid.component.ts
    <entity-singular>-grid-filter/
      <entity-singular>-grid-filter.component.ts
  <entity-plural>-form-container/
    <entity-plural>-form-container.component.ts
  <entity-plural>-module-routing.module.ts
  <entity-plural>.module.ts
```

## Orden de lectura del instructivo
1. Leer este overview.
2. Crear la estructura base y exportaciones.
3. Definir los modelos.
4. Implementar el servicio HTTP.
5. Configurar modulo y routing.
6. Construir listado, grilla y filtro.
7. Construir form container, form y secciones.
8. Aplicar seguridad e integraciones.
9. Ejecutar la validacion final.

## Criterio de calidad esperado
- Guia clara: indica que hacer, en que orden y por que.
- Guia legible: separa responsabilidades por archivo.
- Guia mantenible: define que actualizar cuando cambian campos/contratos.
- Guia no ambigua: evita "etc." sin lista concreta de miembros y metodos.

## Archivos de referencia
- El modulo equivalente ya existente dentro de la libreria destino.
- El `index.ts` publico de la libreria donde se integrara la entidad.

## Checklist de salida
- El nombre generico de la entidad ya esta decidido.
- La estructura objetivo del modulo esta acordada.
- El equipo entiende que la guia es agnostica y aplica a cualquier entidad.
- El resto de los archivos del instructivo puede ejecutarse en orden.