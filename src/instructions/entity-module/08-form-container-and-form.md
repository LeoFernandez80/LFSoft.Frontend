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

### Contrato minimo esperado
- Propiedad `layoutTypes` para tipo de layout si aplica.
- Metodo `onSave<EntitySingular>(entity: any | <EntitySingular>)` para mensaje de exito.
- Metodo `onCancel<EntitySingular>()` para cerrar ventana externa.

## <Entity-singular>FormComponent
### Archivo objetivo
- `<entity-singular>-form/<entity-singular>-form.component.ts`

### Responsabilidades
1. Recibir una entidad o un id via `@Input()`.
2. Resolver la operacion de ruta desde `ActivatedRoute`.
3. Validar el id recibido por query param usando `UrlSecurityService`.
4. Abrir la entidad mediante `open(id)` tanto en modo `open` como en modo edicion con id.
5. Determinar `objectMode` exclusivamente a partir de la respuesta de `open(id)` segun seguridad o lock devuelto por backend.
6. Coordinar acciones `save` y `cancel`.
7. Emitir eventos al contenedor padre.

### Contrato obligatorio de Input/Output y estado
- `@Input() <entity-singular>: number | string | <EntitySingular>`
- `@Output() save: EventEmitter<<EntitySingular>>`
- `@Output() cancel: EventEmitter<void>`
- `@ViewChild` de la seccion principal (`ISectionForm`) para validar `valid/modified/data`.

Estado privado minimo esperado:
- `_<entity-singular>Id`
- `_initialized` o mecanismo equivalente para reaccionar a cambios tardios del `@Input()`
- `_operation`
- `_destroyRef`

## Flujo de carga recomendado
1. Aplicar seguridad.
2. Leer parametros de ruta.
3. Si la operacion es `open`, validar `id`.
4. Si hay id, cargar la entidad por un unico metodo privado que internamente use `open()`.
5. Si no hay id, preparar una nueva entidad.
6. Si el `@Input()` recibe un numero despues de `ngOnInit`, volver a disparar ese mismo flujo de carga en lugar de dejar el formulario en estado `NEW`.
7. Habilitar o deshabilitar acciones segun estado del formulario.

## Reglas obligatorias de implementacion
- No usar `get<Entity>()` o lecturas alternativas dentro del `FormComponent` para editar una entidad ya existente. El formulario debe resolver apertura y lock con `open(id)`.
- No duplicar la logica entre `_loadData()` y `_open<Entity>()`. `_loadData()` solo decide entre abrir existente o crear nuevo; `_open<Entity>()` concentra la transformacion de respuesta y `objectMode`.
- Si el contenedor pasa un `id` por binding asincrono, el `FormComponent` debe reaccionar al cambio posterior del `@Input()` o el contenedor debe diferir el render hasta tener el valor final.
- No dejar `console.log` de depuracion en la implementacion final.

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
- Cargar edicion con `get<Entity>()` y saltear el lock remoto o el calculo centralizado de `objectMode`.
- Crear el formulario en modo `NEW` antes de que llegue el `id` por `@Input()` y no recargarlo despues.
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
- La carga por `open` esta documentada de forma segura y reutilizada para cualquier edicion con id.
- Los flujos de save y cancel estan resueltos.
- El manejo de lock y readonly esta contemplado.
- El formulario sigue funcionando si el `id` llega despues de `ngOnInit`.