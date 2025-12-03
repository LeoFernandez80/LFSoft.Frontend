# Patrón de Gestión de Acciones en Componentes

## Índice
1. [Descripción General](#descripción-general)
2. [Arquitectura del Sistema de Acciones](#arquitectura-del-sistema-de-acciones)
3. [Componentes del Sistema](#componentes-del-sistema)
4. [Modelos y Enumeraciones](#modelos-y-enumeraciones)
5. [Servicio ActionService](#servicio-actionservice)
6. [Componente GenericActionsComponent](#componente-genericactionscomponent)
7. [Patrones de Implementación](#patrones-de-implementación)
8. [Ejemplos de Uso](#ejemplos-de-uso)
9. [Integración con Seguridad](#integración-con-seguridad)
10. [Flujo de Datos](#flujo-de-datos)
11. [Mejores Prácticas](#mejores-prácticas)

---

## Descripción General

El sistema de gestión de acciones es un patrón arquitectónico centralizado que permite:
- **Gestión dinámica de botones y acciones** en componentes
- **Control de estado** (habilitado/deshabilitado) de acciones
- **Integración con permisos** de seguridad
- **Consistencia visual** en toda la aplicación
- **Separación de responsabilidades** entre lógica de negocio y presentación

### Principios de Diseño

1. **Single Responsibility**: Cada componente tiene una única responsabilidad
2. **Open/Closed**: Fácilmente extensible sin modificar código existente
3. **Dependency Injection**: Uso de servicios inyectables
4. **Reactive Programming**: Uso de RxJS para manejo de estado
5. **Type Safety**: Uso de TypeScript y enumeraciones tipadas

---

## Arquitectura del Sistema de Acciones

```
┌─────────────────────────────────────────────────────────────┐
│                    Componente Contenedor                     │
│              (PersonsContainer / EntitiesContainer)          │
│                                                              │
│  • Define las acciones necesarias                           │
│  • Llama a _loadSecurityActions()                           │
│  • Maneja eventos onAction(action)                          │
│  • Habilita/Deshabilita acciones dinámicamente              │
└──────────────────────────┬───────────────────────────────────┘
                           │
                           │ Inyecta
                           ▼
┌─────────────────────────────────────────────────────────────┐
│                     ActionService                            │
│                   (Gestión Centralizada)                     │
│                                                              │
│  • setActions(actions[])      - Define acciones             │
│  • getActions()               - Observable de acciones      │
│  • enable(actionType)         - Habilita acción             │
│  • disable(actionType)        - Deshabilita acción          │
│  • removeAction(actionType)   - Elimina acción              │
│  • clearActions()             - Limpia todas las acciones   │
└──────────────────────────┬───────────────────────────────────┘
                           │
                           │ Se suscribe
                           ▼
┌─────────────────────────────────────────────────────────────┐
│              GenericActionsComponent                         │
│                 (Presentación Visual)                        │
│                                                              │
│  • Renderiza botones dinámicamente                          │
│  • Aplica estilos según configuración                       │
│  • Filtra acciones por permisos                             │
│  • Emite eventos actionClick                                │
└──────────────────────────┬───────────────────────────────────┘
                           │
                           │ Emite eventos
                           ▼
┌─────────────────────────────────────────────────────────────┐
│                  Template del Componente                     │
│      <app-generic-actions                                    │
│        (actionClick)="onAction($event)">                     │
│      </app-generic-actions>                                  │
└─────────────────────────────────────────────────────────────┘
```

---

## Componentes del Sistema

### 1. **Action Model** (`actions.model.ts`)

Define la estructura de una acción.

**Ubicación**: `src/app/generic/generic-actions/models/actions.model.ts`

```typescript
export class Action {
  label: string;              // Texto visible en el botón (clave de traducción)
  actionType: EnumActionsType; // Identificador único de la acción
  icon?: string;              // Nombre del ícono Material (opcional)
  disabled?: boolean;         // Estado del botón (opcional, default: false)
  viewType?: EnumActionsViewType; // Tipo de vista (opcional, default: viewFooter)
  style?: EnumActionsStyle;   // Estilo visual (opcional, default: primary)
  permisions?: EnumPermissionType[]; // Permisos requeridos (opcional)

  constructor(
    label: string, 
    actionType: EnumActionsType, 
    icon?: string, 
    disabled?: boolean, 
    viewType?: EnumActionsViewType, 
    style?: EnumActionsStyle, 
    permisions?: EnumPermissionType[]
  ) {
    this.label = label; 
    this.actionType = actionType;
    this.icon = icon;
    this.disabled = disabled;
    this.viewType = viewType || EnumActionsViewType.viewFooter;
    this.style = style || EnumActionsStyle.primary;
    this.permisions = permisions;
  }
}
```

**Propiedades**:

| Propiedad | Tipo | Descripción | Obligatorio |
|-----------|------|-------------|-------------|
| `label` | `string` | Clave de traducción para el texto del botón | Sí |
| `actionType` | `EnumActionsType` | Identificador único de la acción | Sí |
| `icon` | `string` | Nombre del ícono de Material Icons | No |
| `disabled` | `boolean` | Si el botón está deshabilitado | No (default: false) |
| `viewType` | `EnumActionsViewType` | Tipo de visualización del botón | No (default: viewFooter) |
| `style` | `EnumActionsStyle` | Estilo visual del botón | No (default: primary) |
| `permisions` | `EnumPermissionType[]` | Permisos necesarios para mostrar la acción | No |

---

## Modelos y Enumeraciones

### EnumActionsType

Define todos los tipos de acciones disponibles en la aplicación.

**Ubicación**: `src/app/generic/generic-actions/enums/actions-type.enums.ts`

```typescript
export enum EnumActionsType {
    // Acciones básicas CRUD
    actionNone = 0,
    actionNew = 1,       // Crear nuevo registro
    actionEdit = 2,      // Editar registro existente
    actionDelete = 3,    // Eliminar registro
    actionView = 4,      // Ver detalles
    actionSave = 5,      // Guardar cambios
    actionCancel = 6,    // Cancelar operación
    
    // Acciones de búsqueda y filtrado
    actionSearch = 7,    // Buscar registros
    actionApply = 13,    // Aplicar filtros
    actionReset = 14,    // Resetear filtros
    
    // Acciones de exportación
    actionExport = 8,    // Exportar datos
    actionPrint = 9,     // Imprimir
    
    // Acciones de navegación
    actionClose = 10,    // Cerrar vista
    actionList = 11,     // Volver a lista
    actionOpen = 12,     // Abrir en nueva pestaña
    
    // Acciones de confirmación
    actionAcept = 15,    // Aceptar
    
    // Acciones de autenticación
    actionLogout = 16,   // Cerrar sesión
    actionLogin = 17,    // Iniciar sesión
    
    // Acciones de navegación a módulos (100+)
    openConfig = 100,    // Abrir configuración
    openEntities = 101,  // Abrir módulo de entidades
    openPersons = 102,   // Abrir módulo de personas
    openArticles = 103,  // Abrir módulo de artículos
    openUsers = 104,     // Abrir módulo de usuarios
    openHome = 105       // Ir a inicio
}
```

**Categorías de Acciones**:

| Rango | Categoría | Uso |
|-------|-----------|-----|
| 0-19 | Acciones básicas | CRUD, navegación, búsqueda |
| 100+ | Navegación entre módulos | Apertura de diferentes secciones |

### EnumActionsViewType

Define cómo se visualiza la acción.

**Ubicación**: `src/app/generic/generic-actions/enums/actions-view-type.enums.ts`

```typescript
export enum EnumActionsViewType {
    viewFooter = 1,  // Botón estándar en footer/barra de acciones
    view16x16 = 2    // Ícono pequeño 16x16 (solo ícono, sin texto)
}
```

**Uso según contexto**:

| ViewType | Contexto de uso | Ejemplo |
|----------|----------------|---------|
| `viewFooter` | Acciones principales en formularios | Botones Guardar/Cancelar |
| `view16x16` | Acciones rápidas en grillas | Iconos de Editar/Eliminar/Abrir |

### EnumActionsStyle

Define el estilo visual de los botones.

**Ubicación**: `src/app/generic/generic-actions/enums/actions-styles.enums.ts`

```typescript
export enum EnumActionsStyle {
    primary = 1,    // Botón principal (color primario)
    secondary = 2,  // Botón secundario
    tertiary = 3,   // Botón terciario
    outline = 4     // Botón con borde (outline)
}
```

**Jerarquía Visual**:

| Estilo | Uso recomendado | Ejemplo |
|--------|----------------|---------|
| `primary` | Acción principal/positiva | Guardar, Aceptar |
| `secondary` | Acción secundaria | Cancelar, Cerrar |
| `tertiary` | Acción menos importante | Ver detalles |
| `outline` | Acción alternativa | Resetear, Limpiar |

---

## Servicio ActionService

Servicio centralizado para gestionar el estado de las acciones.

**Ubicación**: `src/app/generic/generic-actions/services/actions.service.ts`

### Arquitectura Interna

```typescript
@Injectable({
  providedIn: 'root'
})
export class ActionService {
  private _actions$: BehaviorSubject<Action[]> = new BehaviorSubject<Action[]>([]);

  constructor() { }

  // ... métodos
}
```

El servicio utiliza un `BehaviorSubject` para mantener un estado reactivo de las acciones.

### Métodos del Servicio

#### 1. `setActions(actions: Action[]): void`

**Propósito**: Define el conjunto inicial de acciones para un componente.

**Cuándo usar**: 
- En el `ngOnInit()` del componente
- Dentro del método `_loadSecurityActions()`

**Ejemplo**:
```typescript
private _loadSecurityActions(): void {
  const actions: Action[] = [
    new Action('BUTTON.new', EnumActionsType.actionNew, 'add', false),
    new Action('BUTTON.save', EnumActionsType.actionSave, 'save', true),
    new Action('BUTTON.cancel', EnumActionsType.actionCancel, 'cancel', false)
  ];
  this._actionService.setActions(actions);
}
```

**Comportamiento**:
- Reemplaza completamente el conjunto actual de acciones
- Emite el nuevo array a todos los suscriptores
- Se ejecuta típicamente una vez al inicializar el componente

---

#### 2. `getActions(): Observable<Action[]>`

**Propósito**: Obtiene un Observable del array de acciones actual.

**Cuándo usar**: 
- En el `ngOnInit()` de `GenericActionsComponent`
- Para suscribirse a cambios en las acciones

**Ejemplo**:
```typescript
ngOnInit(): void { 
  this._subscriptions.push(
    this._actionsService.getActions().subscribe(actions => {      
      this.actions = actions.filter(action => {
        if (!action.permisions || action.permisions.length === 0) {
          return true;
        }
        return this._authService.hasAllPermissions(...action.permisions);
      });    
    })
  );
}
```

**Comportamiento**:
- Retorna un Observable que emite cada vez que el array cambia
- Permite reactividad automática en la UI
- Se debe desuscribir en `ngOnDestroy()`

---

#### 3. `enable(actionTypeId: EnumActionsType): void`

**Propósito**: Habilita una acción específica (disabled = false).

**Cuándo usar**: 
- Cuando se cumplen condiciones para permitir una acción
- Ejemplo: Habilitar botón "Guardar" cuando el formulario es válido

**Ejemplo**:
```typescript
private _enabledActions(): void {    
  if (this.isReadyToSave()) {
    this._actionService.enable(EnumActionsType.actionSave);
  } else {
    this._actionService.disable(EnumActionsType.actionSave);
  }
}
```

**Comportamiento**:
- Busca la acción por su `actionType`
- Cambia su propiedad `disabled` a `false`
- Emite el array actualizado
- El botón se vuelve clickeable en la UI

**Implementación interna**:
```typescript
enable(actionTypeId: EnumActionsType): void {
  const currentActions = this._actions$.getValue();
  const newActions = currentActions.map(action => {
    if (action.actionType == actionTypeId) {
      action.disabled = false;
    }
    return action;
  });
  this._actions$.next(newActions);
}
```

---

#### 4. `disable(actionTypeId: EnumActionsType): void`

**Propósito**: Deshabilita una acción específica (disabled = true).

**Cuándo usar**: 
- Cuando no se cumplen condiciones para permitir una acción
- Ejemplo: Deshabilitar botón "Guardar" cuando el formulario es inválido

**Ejemplo**:
```typescript
this.personForm.statusChanges
  .pipe(takeUntilDestroyed(this._destroyRef))
  .subscribe(() => {
    this._enabledActions(); // Evalúa y habilita/deshabilita
  });

private _enabledActions(): void {    
  if (this.isReadyToSave()) {
    this._actionService.enable(EnumActionsType.actionSave);
  } else {
    this._actionService.disable(EnumActionsType.actionSave);
  }
}
```

**Comportamiento**:
- Busca la acción por su `actionType`
- Cambia su propiedad `disabled` a `true`
- Emite el array actualizado
- El botón se muestra deshabilitado y no es clickeable

---

#### 5. `removeAction(actionTypeId: EnumActionsType): void`

**Propósito**: Elimina completamente una acción del conjunto.

**Cuándo usar**: 
- Cuando una acción ya no debe estar disponible
- Para cambios dinámicos en permisos
- Ejemplo: Ocultar botón "Editar" después de eliminar un registro

**Ejemplo**:
```typescript
onDeleteSuccess(): void {
  this._actionService.removeAction(EnumActionsType.actionEdit);
  this._actionService.removeAction(EnumActionsType.actionDelete);
}
```

**Comportamiento**:
- Filtra el array eliminando la acción especificada
- Emite el nuevo array sin esa acción
- El botón desaparece de la UI

**Implementación interna**:
```typescript
removeAction(actionTypeId: EnumActionsType): void {
  const currentActions = this._actions$.getValue();
  const newActions = currentActions.filter(
    action => action.actionType !== actionTypeId
  );
  this._actions$.next(newActions);
}
```

---

#### 6. `clearActions(): void`

**Propósito**: Limpia todas las acciones del servicio.

**Cuándo usar**: 
- En el `ngOnDestroy()` de componentes
- Al navegar a otra vista
- Para resetear completamente el estado

**Ejemplo**:
```typescript
ngOnDestroy(): void {
  this._actionsService.clearActions();
  this._subscriptions.forEach(sub => sub.unsubscribe());
}
```

**Comportamiento**:
- Emite un array vacío `[]`
- Todos los botones desaparecen de la UI
- Libera memoria y evita memory leaks

---

## Componente GenericActionsComponent

Componente reutilizable que renderiza las acciones visualmente.

**Ubicación**: `src/app/generic/generic-actions/generic-actions.component.ts`

### Arquitectura del Componente

```typescript
@Component({
  selector: 'app-generic-actions',
  standalone: true,
  imports: [NgIf, CommonModule, MatButtonModule, MatIconModule, TranslatePipe],
  templateUrl: './generic-actions.component.html',
  styleUrls: ['./generic-actions.component.scss']
})
export class GenericActionsComponent implements OnInit, OnDestroy {
  @Output() actionClick = new EventEmitter<EnumActionsType>();
  actions: Action[] = [];
  enumActionsViewType = EnumActionsViewType;
  private _subscriptions: Subscription[] = [];
  
  constructor(
    private _authService: AuthService, 
    private _actionsService: ActionService
  ) { }
  
  // ... métodos
}
```

### Métodos del Componente

#### 1. `ngOnInit(): void`

**Propósito**: Inicializa el componente y se suscribe a cambios en las acciones.

**Implementación**:
```typescript
ngOnInit(): void { 
  this._subscriptions.push(
    this._actionsService.getActions().subscribe(actions => {      
      this.actions = actions.filter(action => {
        // Si no tiene permisos definidos, se muestra
        if (!action.permisions || action.permisions.length === 0) {
          return true;
        }
        // Verifica que el usuario tenga todos los permisos requeridos
        return this._authService.hasAllPermissions(...action.permisions);
      });    
    })
  );
}
```

**Flujo de ejecución**:
1. Se suscribe al Observable de acciones
2. Filtra acciones según permisos del usuario
3. Actualiza la propiedad `actions` que usa el template
4. Guarda la suscripción para limpiarla después

---

#### 2. `ngOnDestroy(): void`

**Propósito**: Limpia recursos y previene memory leaks.

**Implementación**:
```typescript
ngOnDestroy(): void {
  this._actionsService.clearActions();
  this._subscriptions.forEach(sub => sub.unsubscribe());
}
```

**Importancia**:
- Evita memory leaks desuscribiendo Observables
- Limpia las acciones del servicio global
- Buena práctica de gestión de recursos

---

#### 3. `onActionClick(action: Action): void`

**Propósito**: Maneja el click en una acción y emite el evento al componente padre.

**Implementación**:
```typescript
onActionClick(action: Action): void {
  if (!action.disabled) {      
    this.actionClick.emit(action.actionType);
  }
}
```

**Comportamiento**:
- Verifica que la acción no esté deshabilitada
- Emite el `actionType` al componente padre
- El componente padre recibe el evento en `onAction($event)`

---

#### 4. `getContainerClass(): string`

**Propósito**: Determina la clase CSS del contenedor según el tipo de vista.

**Implementación**:
```typescript
getContainerClass(): string {   
  switch (this.actions[0]?.viewType) {
    case EnumActionsViewType.view16x16:        
      return 'actions-container__button-icon__content';
    case EnumActionsViewType.viewFooter:
      return 'actions-container__button__content';
    default:
      return 'actions-container__button__content';
  }
}
```

**Clases CSS**:
| Clase | Uso |
|-------|-----|
| `actions-container__button__content` | Botones estándar con texto |
| `actions-container__button-icon__content` | Iconos pequeños sin texto |

---

#### 5. `getButtonClass(style?: EnumActionsStyle): string`

**Propósito**: Determina la clase CSS del botón según su estilo.

**Implementación**:
```typescript
getButtonClass(style?: EnumActionsStyle): string {    
  switch (style) {
    case EnumActionsStyle.primary:
      return 'actions-container__button-primary';
    case EnumActionsStyle.secondary:
      return 'actions-container__button-secondary';
    case EnumActionsStyle.tertiary:
      return 'actions-container__button-tertiary';
    case EnumActionsStyle.outline:
      return 'actions-container__button-outline';
    default:
      return 'actions-container__button-primary';
  }
}
```

**Clases CSS aplicadas**:
- `actions-container__button-primary`: Botón con color primario
- `actions-container__button-secondary`: Botón con color secundario
- `actions-container__button-tertiary`: Botón con color terciario
- `actions-container__button-outline`: Botón con borde

---

### Template del Componente

**Ubicación**: `src/app/generic/generic-actions/generic-actions.component.html`

```html
<div class="actions-container">
  <div [ngClass]="getContainerClass()" *ngFor="let action of actions">
    
    @if (action.viewType === enumActionsViewType.view16x16){
      <!-- Vista de ícono pequeño (16x16) -->
      <mat-icon (click)="onActionClick(action)">{{ action.icon }}</mat-icon>
    } @else {
      <!-- Vista de botón estándar -->
      <button
        mat-button
        [ngClass]="getButtonClass(action.style)"
        [disabled]="action.disabled"
        (click)="onActionClick(action)"
      >
        <mat-icon *ngIf="action.icon">{{ action.icon }}</mat-icon>    
        <span *ngIf="action.label">{{ action.label | translate }}</span>
      </button>
    }
    
  </div>
</div>
```

**Características del template**:
- Renderiza dinámicamente según el tipo de vista
- Aplica clases CSS condicionales
- Usa pipe de traducción para internacionalización
- Muestra ícono y texto según configuración

---

## Patrones de Implementación

### Patrón 1: Container Component (Contenedor)

Este patrón se aplica en componentes contenedores como `PersonsContainerComponent`.

#### Estructura Estándar

```typescript
export class PersonsContainerComponent implements OnInit, OnDestroy {
  private readonly _destroyRef = inject(DestroyRef);

  constructor(
    private _actionService: ActionService,
    private _personService: PersonService,
    private _messagesService: MessagesService
  ) {
    // Inicializaciones en constructor
  }

  ngOnInit(): void {
    try {
      this._loadSecurityActions(); // Paso 1: Cargar acciones
      this.loadPersons(this._pageFilter, this.filterParameters);
    } catch (error) {
      this._messagesService.addMessage("Error al cargar la página", EnumMessageType.Error);
    }
  }

  ngOnDestroy(): void {
    // DestroyRef maneja las suscripciones automáticamente
  }

  // Paso 2: Manejar eventos de acciones
  onAction(action: EnumActionsType): void {
    switch (action) {
      case EnumActionsType.actionNew:
        this._createPerson();
        break;
      case EnumActionsType.actionList:
        this.personsOpened = [];
        break;
    }
  }

  // Paso 3: Definir acciones con seguridad
  private _loadSecurityActions(): void {
    const actions: Action[] = [
      new Action('BUTTON.new', EnumActionsType.actionNew, 'add', false),
      new Action('BUTTON.lists', EnumActionsType.actionList, 'list', false)
    ];
    this._actionService.setActions(actions);
  }
}
```

#### Flujo de Ejecución

```
1. ngOnInit()
   ↓
2. _loadSecurityActions()
   ↓
3. ActionService.setActions([...])
   ↓
4. GenericActionsComponent recibe acciones
   ↓
5. Usuario hace click en botón
   ↓
6. GenericActionsComponent.onActionClick()
   ↓
7. Emite actionClick event
   ↓
8. PersonsContainerComponent.onAction(actionType)
   ↓
9. Switch ejecuta método correspondiente
```

---

### Patrón 2: Form Component (Formulario)

Este patrón se aplica en componentes de formulario como `PersonFormComponent`.

#### Estructura Estándar

```typescript
export class PersonFormComponent implements OnInit, OnDestroy {
  @Input() personId: number = 0;
  @Output() save = new EventEmitter<Person>();
  @Output() cancel = new EventEmitter<void>();

  personForm: FormGroup = new FormGroup({});
  private readonly _destroyRef = inject(DestroyRef);

  constructor(
    private fb: FormBuilder,
    private _personService: PersonService,
    private _actionService: ActionService
  ) {
    this._createForm();
  }

  ngOnInit(): void {
    try {
      this._loadSecurityActions(); // Define acciones iniciales
      this._loadData();
    } catch (error) {
      // Manejo de errores
    }
  }

  // Validación para habilitar/deshabilitar Save
  isReadyToSave(): boolean {
    return this.personForm.valid && this.personForm.dirty;
  }

  // Manejo de eventos de acciones
  onAction(action: EnumActionsType): void {
    switch (action) {
      case EnumActionsType.actionSave:
        this._save();
        break;
      case EnumActionsType.actionCancel:
        this._cancel();
        break;
    }
  }

  private _createForm(): void {
    this.personForm = this.fb.group({
      firstName: ['', Validators.required],
      lastName: ['', [Validators.required, Validators.minLength(3)]],
      birthDate: ['', Validators.required]
    });

    // Escuchar cambios del formulario
    this.personForm.statusChanges
      .pipe(takeUntilDestroyed(this._destroyRef))
      .subscribe(() => {
        this._enabledActions(); // Actualizar estado de acciones
      });
  }

  private _loadSecurityActions(): void {
    const actions: Action[] = [
      new Action('BUTTON.save', EnumActionsType.actionSave, 'save', true), // Deshabilitado inicialmente
      new Action('BUTTON.cancel', EnumActionsType.actionCancel, 'cancel', false)
    ];
    this._actionService.setActions(actions);
  }

  // Habilitar/Deshabilitar Save dinámicamente
  private _enabledActions(): void {
    if (this.isReadyToSave()) {
      this._actionService.enable(EnumActionsType.actionSave);
    } else {
      this._actionService.disable(EnumActionsType.actionSave);
    }
  }

  private _save(): void {
    if (!this.personForm.dirty) return;

    const formData = this.personForm.value;
    const updatedPerson: Person = {
      ...this.person,
      ...formData
    };

    if (!updatedPerson.id) {
      this._personService.addPerson(updatedPerson);
    } else {
      this._personService.updatePerson(updatedPerson);
    }
    this.save.emit(updatedPerson);
  }
}
```

#### Características Clave

1. **Validación Reactiva**: Habilita/deshabilita acciones según estado del formulario
2. **Estado Inicial**: El botón "Guardar" inicia deshabilitado
3. **Dirty Check**: Verifica si hay cambios antes de guardar
4. **Event Emitters**: Comunica con componente padre mediante outputs

---

### Patrón 3: Grid Actions (Acciones en Grilla)

Para acciones rápidas en cada fila de la grilla.

#### Implementación

```typescript
// En el componente de grilla (person-grid.component.ts)
export class PersonGridComponent {
  @Output() edit = new EventEmitter<PersonGrid>();
  @Output() delete = new EventEmitter<PersonGrid>();
  @Output() open = new EventEmitter<PersonGrid>();

  onEdit(person: PersonGrid): void {
    this.edit.emit(person);
  }

  onDelete(person: PersonGrid): void {
    this.delete.emit(person);
  }

  onOpen(person: PersonGrid): void {
    this.open.emit(person);
  }

  // Configurar acciones de fila
  getRowActions(): Action[] {
    return [
      new Action('', EnumActionsType.actionEdit, 'edit', false, 
                 EnumActionsViewType.view16x16, EnumActionsStyle.primary),
      new Action('', EnumActionsType.actionDelete, 'delete', false, 
                 EnumActionsViewType.view16x16, EnumActionsStyle.secondary),
      new Action('', EnumActionsType.actionOpen, 'open_in_new', false, 
                 EnumActionsViewType.view16x16, EnumActionsStyle.tertiary)
    ];
  }
}
```

#### Template de Grilla

```html
<table>
  <tr *ngFor="let person of persons">
    <td>{{ person.firstName }}</td>
    <td>{{ person.lastName }}</td>
    <td>
      <!-- Acciones de fila -->
      <mat-icon (click)="onEdit(person)">edit</mat-icon>
      <mat-icon (click)="onDelete(person)">delete</mat-icon>
      <mat-icon (click)="onOpen(person)">open_in_new</mat-icon>
    </td>
  </tr>
</table>
```

---

## Ejemplos de Uso

### Ejemplo 1: Acciones Básicas en Container

```typescript
// persons-container.component.ts
private _loadSecurityActions(): void {
  const actions: Action[] = [
    new Action(
      'BUTTON.new',              // Label (clave de traducción)
      EnumActionsType.actionNew, // Tipo de acción
      'add',                     // Ícono Material
      false                      // No deshabilitado
    ),
    new Action(
      'BUTTON.lists',
      EnumActionsType.actionList,
      'list',
      false
    )
  ];
  this._actionService.setActions(actions);
}

onAction(action: EnumActionsType): void {
  switch (action) {
    case EnumActionsType.actionNew:
      this._createPerson();
      break;
    case EnumActionsType.actionList:
      this.personsOpened = [];
      this._messagesService.addMessage("Generando listado", EnumMessageType.Info);
      break;
  }
}
```

**Template**:
```html
<app-generic-layout>
  <app-generic-actions 
    (actionClick)="onAction($event)">
  </app-generic-actions>
  
  <!-- Resto del contenido -->
</app-generic-layout>
```

---

### Ejemplo 2: Acciones con Permisos

```typescript
private _loadSecurityActions(): void {
  const actions: Action[] = [
    new Action(
      'BUTTON.new',
      EnumActionsType.actionNew,
      'add',
      false,
      EnumActionsViewType.viewFooter,
      EnumActionsStyle.primary,
      [EnumPermissionType.CREATE_PERSON] // Requiere permiso
    ),
    new Action(
      'BUTTON.delete',
      EnumActionsType.actionDelete,
      'delete',
      false,
      EnumActionsViewType.viewFooter,
      EnumActionsStyle.secondary,
      [EnumPermissionType.DELETE_PERSON] // Requiere permiso
    )
  ];
  this._actionService.setActions(actions);
}
```

**Comportamiento**:
- Si el usuario NO tiene el permiso, el botón no se muestra
- El filtrado de permisos ocurre en `GenericActionsComponent`

---

### Ejemplo 3: Habilitar/Deshabilitar Dinámicamente

```typescript
// person-form.component.ts
private _createForm(): void {
  this.personForm = this.fb.group({
    firstName: ['', Validators.required],
    lastName: ['', [Validators.required, Validators.minLength(3)]],
    birthDate: ['', Validators.required]
  });

  // Suscribirse a cambios del formulario
  this.personForm.statusChanges
    .pipe(takeUntilDestroyed(this._destroyRef))
    .subscribe(() => {
      this._enabledActions();
    });
}

private _enabledActions(): void {
  if (this.isReadyToSave()) {
    this._actionService.enable(EnumActionsType.actionSave);
  } else {
    this._actionService.disable(EnumActionsType.actionSave);
  }
}

isReadyToSave(): boolean {
  return this.personForm.valid && this.personForm.dirty;
}
```

**Flujo**:
1. Usuario modifica el formulario
2. `statusChanges` emite evento
3. `_enabledActions()` evalúa condiciones
4. Llama a `enable()` o `disable()` según corresponda
5. UI se actualiza automáticamente

---

### Ejemplo 4: Estilos Personalizados

```typescript
private _loadSecurityActions(): void {
  const actions: Action[] = [
    new Action(
      'BUTTON.save',
      EnumActionsType.actionSave,
      'save',
      true,
      EnumActionsViewType.viewFooter,
      EnumActionsStyle.primary // Botón primario (verde/azul)
    ),
    new Action(
      'BUTTON.cancel',
      EnumActionsType.actionCancel,
      'cancel',
      false,
      EnumActionsViewType.viewFooter,
      EnumActionsStyle.outline // Botón con borde
    ),
    new Action(
      'BUTTON.reset',
      EnumActionsType.actionReset,
      'refresh',
      false,
      EnumActionsViewType.viewFooter,
      EnumActionsStyle.secondary // Botón secundario
    )
  ];
  this._actionService.setActions(actions);
}
```

---

## Integración con Seguridad

### Sistema de Permisos

El sistema de acciones se integra con el módulo de seguridad para controlar el acceso.

#### EnumPermissionType

```typescript
export enum EnumPermissionType {
  // Personas
  VIEW_PERSONS = 'VIEW_PERSONS',
  CREATE_PERSON = 'CREATE_PERSON',
  EDIT_PERSON = 'EDIT_PERSON',
  DELETE_PERSON = 'DELETE_PERSON',

  // Entidades
  VIEW_ENTITIES = 'VIEW_ENTITIES',
  CREATE_ENTITY = 'CREATE_ENTITY',
  EDIT_ENTITY = 'EDIT_ENTITY',
  DELETE_ENTITY = 'DELETE_ENTITY',

  // Artículos
  VIEW_ARTICLES = 'VIEW_ARTICLES',
  CREATE_ARTICLE = 'CREATE_ARTICLE',
  EDIT_ARTICLE = 'EDIT_ARTICLE',
  DELETE_ARTICLE = 'DELETE_ARTICLE',

  // Configuración
  VIEW_CONFIG = 'VIEW_CONFIG',
  EDIT_CONFIG = 'EDIT_CONFIG'
}
```

#### AuthService Integration

```typescript
// En GenericActionsComponent
ngOnInit(): void { 
  this._subscriptions.push(
    this._actionsService.getActions().subscribe(actions => {      
      this.actions = actions.filter(action => {
        if (!action.permisions || action.permisions.length === 0) {
          return true; // Sin permisos definidos, se muestra
        }
        return this._authService.hasAllPermissions(...action.permisions);
      });    
    })
  );
}
```

### Ejemplo Completo con Permisos

```typescript
private _loadSecurityActions(): void {
  const actions: Action[] = [
    new Action(
      'BUTTON.new',
      EnumActionsType.actionNew,
      'add',
      false,
      EnumActionsViewType.viewFooter,
      EnumActionsStyle.primary,
      [EnumPermissionType.CREATE_PERSON]
    ),
    new Action(
      'BUTTON.edit',
      EnumActionsType.actionEdit,
      'edit',
      false,
      EnumActionsViewType.view16x16,
      EnumActionsStyle.primary,
      [EnumPermissionType.EDIT_PERSON]
    ),
    new Action(
      'BUTTON.delete',
      EnumActionsType.actionDelete,
      'delete',
      false,
      EnumActionsViewType.view16x16,
      EnumActionsStyle.secondary,
      [EnumPermissionType.DELETE_PERSON]
    ),
    new Action(
      'BUTTON.export',
      EnumActionsType.actionExport,
      'download',
      false,
      EnumActionsViewType.viewFooter,
      EnumActionsStyle.outline,
      [EnumPermissionType.VIEW_PERSONS, EnumPermissionType.EDIT_PERSON] // Múltiples permisos
    )
  ];
  this._actionService.setActions(actions);
}
```

**Regla**: Si una acción tiene múltiples permisos, el usuario debe tener **TODOS** para ver la acción.

---

## Flujo de Datos

### Diagrama de Flujo Completo

```
┌─────────────────────────────────────────────────────────────────┐
│                    INICIALIZACIÓN                                │
└─────────────────────────────────────────────────────────────────┘
                             │
                             ▼
         ┌───────────────────────────────────────┐
         │  Component.ngOnInit()                 │
         │  └─> _loadSecurityActions()           │
         └───────────────────┬───────────────────┘
                             │
                             ▼
         ┌───────────────────────────────────────┐
         │  ActionService.setActions([...])      │
         │  • BehaviorSubject emite nuevo array  │
         └───────────────────┬───────────────────┘
                             │
                             ▼
         ┌───────────────────────────────────────┐
         │  GenericActionsComponent              │
         │  • Se suscribe a getActions()         │
         │  • Filtra por permisos                │
         │  • Actualiza UI                       │
         └───────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│                    INTERACCIÓN DEL USUARIO                       │
└─────────────────────────────────────────────────────────────────┘
                             │
                             ▼
         ┌───────────────────────────────────────┐
         │  Usuario modifica formulario          │
         └───────────────────┬───────────────────┘
                             │
                             ▼
         ┌───────────────────────────────────────┐
         │  FormGroup.statusChanges emite evento │
         └───────────────────┬───────────────────┘
                             │
                             ▼
         ┌───────────────────────────────────────┐
         │  Component._enabledActions()          │
         │  └─> Evalúa isReadyToSave()           │
         └───────────────────┬───────────────────┘
                             │
                    ┌────────┴────────┐
                    │                 │
                    ▼                 ▼
         ┌──────────────────┐  ┌──────────────────┐
         │ enable(actionSave│  │ disable(actionSave│
         └──────────┬───────┘  └──────────┬───────┘
                    │                     │
                    └──────────┬──────────┘
                               │
                               ▼
         ┌───────────────────────────────────────┐
         │  ActionService actualiza array        │
         │  • BehaviorSubject emite cambio       │
         └───────────────────┬───────────────────┘
                             │
                             ▼
         ┌───────────────────────────────────────┐
         │  GenericActionsComponent              │
         │  • Recibe nuevo array                 │
         │  • Actualiza botones en UI            │
         └───────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│                    CLICK EN ACCIÓN                               │
└─────────────────────────────────────────────────────────────────┘
                             │
                             ▼
         ┌───────────────────────────────────────┐
         │  Usuario hace click en botón          │
         └───────────────────┬───────────────────┘
                             │
                             ▼
         ┌───────────────────────────────────────┐
         │  GenericActionsComponent              │
         │  └─> onActionClick(action)            │
         │      • Verifica !disabled             │
         │      • Emite actionClick event        │
         └───────────────────┬───────────────────┘
                             │
                             ▼
         ┌───────────────────────────────────────┐
         │  Component.onAction(actionType)       │
         │  • Switch evalúa tipo de acción       │
         └───────────────────┬───────────────────┘
                             │
                    ┌────────┴────────┐
                    │                 │
                    ▼                 ▼
         ┌──────────────────┐  ┌──────────────────┐
         │  _save()         │  │  _cancel()       │
         │  • Valida datos  │  │  • Confirma      │
         │  • Llama service │  │  • Limpia form   │
         │  • Emite evento  │  │  • Emite evento  │
         └──────────────────┘  └──────────────────┘
```

---

## Mejores Prácticas

### 1. Inicialización de Acciones

✅ **CORRECTO**:
```typescript
ngOnInit(): void {
  try {
    this._loadSecurityActions(); // Primero cargar acciones
    this._loadData();
  } catch (error) {
    this._messagesService.addMessage("Error", EnumMessageType.Error);
  }
}

private _loadSecurityActions(): void {
  const actions: Action[] = [
    new Action('BUTTON.save', EnumActionsType.actionSave, 'save', true)
  ];
  this._actionService.setActions(actions);
}
```

❌ **INCORRECTO**:
```typescript
ngOnInit(): void {
  // No llamar a setActions en múltiples lugares
  this._actionService.setActions([...]);
  this._loadData();
  this._actionService.setActions([...]); // ❌ Duplicado
}
```

---

### 2. Gestión de Estado de Acciones

✅ **CORRECTO**:
```typescript
private _createForm(): void {
  this.personForm = this.fb.group({...});
  
  this.personForm.statusChanges
    .pipe(takeUntilDestroyed(this._destroyRef))
    .subscribe(() => {
      this._enabledActions(); // Método centralizado
    });
}

private _enabledActions(): void {
  if (this.isReadyToSave()) {
    this._actionService.enable(EnumActionsType.actionSave);
  } else {
    this._actionService.disable(EnumActionsType.actionSave);
  }
}
```

❌ **INCORRECTO**:
```typescript
// No manipular disabled directamente
onFormChange(): void {
  this.actions[0].disabled = true; // ❌ No hacer esto
}
```

---

### 3. Limpieza de Recursos

✅ **CORRECTO**:
```typescript
export class MyComponent implements OnDestroy {
  private readonly _destroyRef = inject(DestroyRef);

  constructor(private _actionService: ActionService) {}

  ngOnInit(): void {
    this.personForm.statusChanges
      .pipe(takeUntilDestroyed(this._destroyRef))
      .subscribe(() => {
        this._enabledActions();
      });
  }

  ngOnDestroy(): void {
    // DestroyRef maneja las suscripciones automáticamente
  }
}
```

❌ **INCORRECTO**:
```typescript
// No olvidar desuscribirse
ngOnInit(): void {
  this._actionService.getActions().subscribe(actions => {
    this.actions = actions; // ❌ Memory leak
  });
}
```

---

### 4. Nomenclatura de Métodos

✅ **CORRECTO**:
```typescript
private _loadSecurityActions(): void { }  // Carga de acciones
private _enabledActions(): void { }        // Habilitar/deshabilitar
private _save(): void { }                  // Operación privada
onAction(action: EnumActionsType): void { } // Handler público
```

❌ **INCORRECTO**:
```typescript
private loadActions(): void { }     // ❌ Falta prefijo _
public _handleClick(): void { }     // ❌ Público con _
private DoSomething(): void { }     // ❌ PascalCase en método
```

---

### 5. Switch con Try-Catch

✅ **CORRECTO**:
```typescript
onAction(action: EnumActionsType): void {
  try {
    switch (action) {
      case EnumActionsType.actionNew:
        this._createPerson();
        break;
      case EnumActionsType.actionList:
        this.personsOpened = [];
        break;
    }
  } catch (error) {
    this._messagesService.addMessage("Error", EnumMessageType.Error);
  }
}
```

❌ **INCORRECTO**:
```typescript
onAction(action: EnumActionsType): void {
  switch (action) {
    case EnumActionsType.actionNew:
      this._createPerson(); // ❌ Sin manejo de errores
      break;
  }
}
```

---

### 6. Uso de Permisos

✅ **CORRECTO**:
```typescript
new Action(
  'BUTTON.delete',
  EnumActionsType.actionDelete,
  'delete',
  false,
  EnumActionsViewType.viewFooter,
  EnumActionsStyle.secondary,
  [EnumPermissionType.DELETE_PERSON] // Array de permisos
)
```

❌ **INCORRECTO**:
```typescript
// No verificar permisos manualmente en el componente
if (this.hasPermission) {
  this._actionService.setActions([...]); // ❌ 
}
// GenericActionsComponent ya lo hace
```

---

### 7. Traducción de Labels

✅ **CORRECTO**:
```typescript
new Action(
  'BUTTON.save',  // Clave de traducción
  EnumActionsType.actionSave,
  'save',
  false
)

// En archivo de traducción (es.json)
{
  "BUTTON": {
    "save": "Guardar",
    "cancel": "Cancelar"
  }
}
```

❌ **INCORRECTO**:
```typescript
new Action(
  'Guardar',  // ❌ Texto hardcodeado
  EnumActionsType.actionSave,
  'save',
  false
)
```

---

### 8. Estado Inicial de Acciones

✅ **CORRECTO**:
```typescript
private _loadSecurityActions(): void {
  const actions: Action[] = [
    new Action('BUTTON.save', EnumActionsType.actionSave, 'save', true), // Deshabilitado al inicio
    new Action('BUTTON.cancel', EnumActionsType.actionCancel, 'cancel', false)
  ];
  this._actionService.setActions(actions);
}
```

**Razón**: El botón "Guardar" debe estar deshabilitado hasta que el formulario sea válido y tenga cambios.

---

## Resumen de Métodos

### ActionService

| Método | Propósito | Cuándo usar |
|--------|-----------|-------------|
| `setActions(actions[])` | Define acciones iniciales | `ngOnInit()` / `_loadSecurityActions()` |
| `getActions()` | Observable de acciones | Suscripción en `GenericActionsComponent` |
| `enable(actionType)` | Habilita una acción | Cuando se cumplen condiciones |
| `disable(actionType)` | Deshabilita una acción | Cuando no se cumplen condiciones |
| `removeAction(actionType)` | Elimina una acción | Cambios dinámicos en UI |
| `clearActions()` | Limpia todas las acciones | `ngOnDestroy()` |

### GenericActionsComponent

| Método | Propósito | Cuándo se ejecuta |
|--------|-----------|-------------------|
| `ngOnInit()` | Inicializa y suscribe | Al crear el componente |
| `ngOnDestroy()` | Limpia recursos | Al destruir el componente |
| `onActionClick(action)` | Maneja clicks | Usuario hace click |
| `getContainerClass()` | Determina clase CSS del contenedor | Al renderizar |
| `getButtonClass(style)` | Determina clase CSS del botón | Al renderizar |

### Componente que usa acciones

| Método | Propósito | Visibilidad |
|--------|-----------|-------------|
| `ngOnInit()` | Inicializa componente | `public` |
| `onAction(actionType)` | Maneja eventos de acciones | `public` |
| `_loadSecurityActions()` | Define acciones con permisos | `private` |
| `_enabledActions()` | Habilita/deshabilita dinámicamente | `private` |

---

## Conclusión

El patrón de gestión de acciones proporciona:

✅ **Consistencia**: Todas las acciones se gestionan de la misma manera  
✅ **Reusabilidad**: `GenericActionsComponent` se usa en toda la app  
✅ **Seguridad**: Integración automática con sistema de permisos  
✅ **Reactividad**: Actualización automática de UI mediante RxJS  
✅ **Mantenibilidad**: Código organizado y fácil de extender  
✅ **Type Safety**: Uso de enumeraciones y TypeScript  

Este patrón debe seguirse en **todos los módulos** de la aplicación para mantener coherencia y calidad del código.
