# 07 Grid And Filter

## Objetivo
Separar y documentar la implementacion de la grilla y del filtro del listado para que el modulo nuevo respete una distribucion de responsabilidades uniforme.

## Dependencias
- Los modelos `<Entity-singular>Grid` y `<Entity-singular>Filter` ya existen.
- El contenedor principal ya conoce el flujo general.

## Grid component
### Archivo objetivo
- `<entity-plural>-container/<entity-plural>-grid/<entity-plural>-grid.component.ts`

### Responsabilidades
- Definir columnas.
- Cargar configuracion de columnas por usuario cuando exista.
- Emitir eventos de editar, borrar, abrir, ordenar, paginar o scroll infinito.
- Aplicar seguridad sobre acciones de grilla.

### Eventos esperados
- `edit`
- `delete`
- `open`
- `sortChange`
- `scrollEndChange`
- `changePage`

### Columnas
- Definir un set inicial minimo en `_initializeColumns()`.
- Si existe configuracion de usuario, mapear `GridColumnConfiguration` a `GridColumn`.
- Mantener traducciones y estilos alineados al sistema de diseno del repositorio.

## Filter component
### Archivo objetivo
- `<entity-plural>-container/<entity-plural>-grid-filter/<entity-plural>-grid-filter.component.ts`

### Responsabilidades
- Construir un `FormGroup` simple y reactivo.
- Convertir el form en `<Entity-plural>Filter`.
- Exponer acciones `apply` y `reset`.
- Recibir el filtro actual por `@Input()` para sincronizar la UI.

### Acciones esperadas
- `actionApply`
- `actionReset`

## Reglas
- No cargar datos HTTP directamente desde la grilla ni desde el filtro.
- Todo pedido al backend debe seguir centralizado en el contenedor.
- La grilla emite intencion; el contenedor decide.
- El filtro emite un modelo, no una query string cruda.

## Riesgos comunes
- Duplicar logica de permisos en varios lugares sin centralizar criterios.
- Mezclar columnas visibles con columnas solo tecnicas.
- Hacer que el filtro conozca detalles del servicio HTTP.

## Archivos de referencia
- `<entity-plural>-grid.component.ts`
- `<entity-plural>-grid-filter.component.ts`

## SCSS

### Grid
No usar CSS plano. El contenedor de la grilla ocupa todo el espacio disponible:

```scss
// Estilos para el componente entity-grid
.<entity-singular>-grid__container {
  padding: 0;
  flex-direction: column;
  display: block;
  height: 100%;
  width: 100%;
}
```

### Filter
Importar los tokens de estilo compartidos y usar `@extend`:

```scss
// Estilos para el componente entity-grid-filter
@import 'styles/container.scss';
@import 'styles/form.scss';

.<entity-plural>-filter-tab {
  @extend .container-tab-header;
  &__label { @extend .container-tab-header__label; }
}

.<entity-plural>-filter {
  @extend .form;
  @extend .form-container--full;
  &__label  { @extend .form-control-label; }
  &__control { @extend .form-control; }
  &__group  { @extend .form-group; }
}
```

**Regla**: nunca hardcodear colores, bordes ni espaciado. Usar siempre `@extend` sobre las clases del sistema de diseño.

## Checklist de salida
- La grilla tiene definidos eventos, columnas y seguridad.
- El filtro tiene definido su formulario y sus acciones.
- La comunicacion con el contenedor esta desacoplada.
- La configuracion opcional de columnas por usuario esta contemplada.