# 08 Form Container And Form

## Objetivo
Definir el flujo de edicion principal de la entidad, separando claramente el contenedor de ventana independiente del formulario de negocio.

## Dependencias
- El servicio HTTP ya soporta `open`, `create`, `update` y `close`.
- El routing ya define `data.operation = 'open'`.
- El contenedor del listado ya sabe abrir tabs internas y ventanas nuevas.

## <Entity-plural>FormContainerComponent
### Archivo objetivo
- `<entity-plural>-form-container/<entity-plural>-form-container.component.ts`

### Responsabilidades
- Alojar el formulario cuando la entidad se abre en una ventana separada.
- Mostrar layout y mensajes.
- Responder a `save` y `cancel`.
- Cerrar la ventana cuando corresponda.

## <Entity-singular>FormComponent
### Archivo objetivo
- `<entity-singular>-form/<entity-singular>-form.component.ts`

### Responsabilidades
1. Recibir una entidad o un id via `@Input()`.
2. Resolver la operacion de ruta desde `ActivatedRoute`.
3. Validar el id recibido por query param usando `UrlSecurityService`.
4. Abrir la entidad mediante `open(id)` cuando corresponda.
5. Determinar `objectMode` segun seguridad o lock devuelto por backend.
6. Coordinar acciones `save` y `cancel`.
7. Emitir eventos al contenedor padre.

## Flujo de carga recomendado
1. Aplicar seguridad.
2. Leer parametros de ruta.
3. Si la operacion es `open`, validar `id`.
4. Si hay id, cargar la entidad por `open()`.
5. Si no hay id, preparar una nueva entidad.
6. Habilitar o deshabilitar acciones segun estado del formulario.

## Flujo de guardado recomendado
1. Verificar si el formulario fue modificado.
2. Construir `updatedEntity` mezclando modelo actual y valores del formulario.
3. Elegir `create` o `update` segun presencia del id.
4. Emitir `save` al completar exitosamente.

## Flujo de cancelacion recomendado
1. Si no hubo cambios, emitir `cancel` directo.
2. Si hubo cambios, abrir `CONFIRM_CANCEL`.
3. Si se acepta, invocar `closeEntity()` cuando aplique lock.
4. Emitir `cancel`.

## Herramientas y patrones a replicar
- `takeUntilDestroyed`
- `DestroyRef`
- `UrlSecurityService`
- `EnumObjectMode`
- `ActionService`
- `MessagesService`
- `ModalService`
- `CONFIRM_CANCEL`

## Riesgos comunes
- Validar tarde el `id` de query param.
- No contemplar el modo readonly al abrir una entidad lockeada.
- No cerrar el lock al cancelar.

## Archivos de referencia
- `<entity-plural>-form-container.component.ts`
- `<entity-singular>-form.component.ts`
- `http-services/<entity-singular>.service.ts`

## SCSS

### <Entity-plural>FormContainerComponent
El archivo `.scss` queda vacío (solo un comentario). No agrega estilos propios:

```scss
// Estilos para el componente <entity-plural>-form-container
```

### <Entity-singular>FormComponent
Importa los tokens de estilo compartidos y aplica `@extend`:

```scss
// Estilos para el componente <entity-singular>-form
@import 'styles/form.scss';

.<entity-singular>-form {
  @extend .form;
  @extend .form-container--full;
  &__label  { @extend .form-control-label; }
  &__control { @extend .form-control; }
  &__group  { @extend .form-group; }
}
```

**Regla**: el drawer también queda con solo un comentario y sin estilos propios.

## Checklist de salida
- El contenedor externo y el formulario tienen responsabilidades separadas.
- La carga por `open` esta documentada de forma segura.
- Los flujos de save y cancel estan resueltos.
- El manejo de lock y readonly esta contemplado.