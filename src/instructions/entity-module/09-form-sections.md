# 09 Form Sections

## Objetivo
Documentar como construir secciones internas del formulario siguiendo un patron modular, sin convertir el formulario principal en un componente monolitico.

## Dependencias
- El `<Entity-singular>FormComponent` ya existe en diseño.
- La entidad principal y sus validaciones ya estan definidas.

## Archivo objetivo inicial
- `<entity-singular>-form/<entity-singular>-data-form/<entity-singular>-data-form.component.ts`

## Responsabilidades de una seccion
- Implementar `ISectionForm`.
- Exponer `data`.
- Exponer `modified`.
- Exponer `valid`.
- Exponer `required` cuando la UI lo necesite.
- Emitir `dataChange` al cambiar el formulario.

## Contrato obligatorio de miembros
Cada seccion principal debe declarar explicitamente:
- `@Input() <entity-singular>: <EntitySingular> | undefined`
- `@Input() isLoading: boolean`
- `@Output() dataChange: EventEmitter<void>`
- `FormGroup` principal
- colecciones auxiliares (roles/catalogos) cuando aplica
- arreglo de campos ocultos por permisos

Getters `ISectionForm` obligatorios:
- `get data(): <EntitySingular>`
- `get modified(): boolean`
- `get valid(): boolean`
- `get required(): boolean`

## Estructura recomendada
1. `@Input()` para recibir la entidad o fragmento correspondiente.
2. `@Input()` para estado de carga si la vista usa skeleton.
3. `FormGroup` construido con `FormBuilder`.
4. `valueChanges` conectado a `dataChange`.
5. Metodo privado para cargar catálogos o permisos.
6. Metodo privado para aplicar valores al formulario.
7. Metodo privado para reconstruir la entidad desde el formulario.

## Reglas de implementacion
- La seccion no debe hacer save por si sola.
- La seccion puede cargar datos auxiliares livianos si son necesarios para selects o visibilidad.
- Las validaciones deben vivir en el `FormGroup`.
- El modo readonly debe resolverse habilitando o deshabilitando el form.
- Si hay campos ocultos por permisos, usar el servicio de permisos en esta capa.
- Cada bloque de campo en el template debe usar la clase `skeleton-field` y `col-span="2"`.

## Campos ocultos por rol (obligatorio)
Para `<Entity-singular>DataFormComponent` se debe mantener un patron comun:
1. Inyectar `AuthService` y el servicio de permisos del proyecto.
2. Resolver el rol actual en `ngOnInit`.
3. Cargar campos ocultos con `hideFields(role, <FORM_LITERAL_KEY>)`.
4. Exponer `isHiddenField(fieldName)`.
5. Aplicar `*ngIf="!isHiddenField('entity_description')"` (ajustando el nombre segun el campo real) en cada bloque de campo.
6. En cada bloque de campo, mantener `class="... skeleton-field"` y `col-span="2"`.

Campos esperados:
- Los campos del formulario principal de la entidad elegida.
- Ejemplo para `persons`: `person_name`, `person_active`.

Clave de permisos requerida:
- `EnumLiteralKeys` correspondiente al formulario de la entidad (ejemplo: `eForm_Persons`).

## Cuando dividir en varias secciones
- Cuando la entidad tiene grupos de datos claramente separados.
- Cuando hay subformularios opcionales o pestañas.
- Cuando la visibilidad por rol cambia por bloque funcional.

## Riesgos comunes
- Hacer que la seccion conozca demasiado del contenedor.
- Duplicar validaciones que ya viven en otra capa.
- No sincronizar bien `patchValue` y `emitEvent`.

## Archivos de referencia
- `<entity-singular>-data-form.component.ts`
- `<entity-singular>-form.component.ts`

## SCSS
Cada sección del formulario importa los tokens de estilo compartidos y aplica `@extend`. Nunca CSS plano:

```scss
@import 'styles/form.scss';

.entity-data-form {
  @extend .form;
  @extend .form-container--full;
  &__label  { @extend .form-control-label; }
  &__control { @extend .form-control; }
  &__group  { @extend .form-group; }
}
```

**Regla**: el nombre de la clase BEM raiz debe coincidir con el nombre del componente (`.<entity-singular>-data-form`).

## Checklist de salida
- La seccion principal del formulario esta definida.
- La implementacion de `ISectionForm` esta documentada.
- El manejo de readonly, validaciones y `dataChange` esta contemplado.
- El formulario principal puede componer una o mas secciones sin duplicar logica.
- Cada campo de seccion cumple `skeleton-field`, `col-span="2"` y `*ngIf` con `isHiddenField(...)`.