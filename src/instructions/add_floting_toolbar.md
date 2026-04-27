# Agregar Floating-Toolbar a un Container

## Resumen
Guía paso a paso para implementar una barra de herramientas flotante en un container específico, basándose en la implementación de `home-container`.

## Pre-requisitos
- El container debe estar creado como componente standalone
- Tener acceso a la librería `@lib/shared`

## Pasos de Implementación

### 1. Importar Dependencias en TypeScript

En el archivo del componente (ej: `your-container.component.ts`), agregar los imports necesarios:

```typescript
import { GenericActionsComponent, ActionService, Action, 
         EnumActionsType, EnumActionsViewType, EnumActionsStyle } 
from '@lib/shared';
```

### 2. Configurar el Componente

Modificar el decorator `@Component` para incluir:

```typescript
@Component({
  selector: 'your-selector',
  templateUrl: './your-container.component.html',
  styleUrls: ['./your-container.component.scss'],
  imports: [
    // ... otros imports existentes
    GenericActionsComponent
  ],
  providers: [ActionService]
})
```

### 3. Inyectar ActionService

En el constructor del componente:

```typescript
constructor(
  private _actionService: ActionService,
  // ... otros servicios
) { }
```

### 4. Crear Método de Carga de Acciones

Crear el método privado que define las acciones:

```typescript
private _loadSecurityActions(): void {
  const actions: Action[] = [
    new Action(
      'BUTTON.home',                    // Label (translation key)
      EnumActionsType.openHome,          // Action type
      'home',                            // Material icon
      false,                             // Disabled state
      EnumActionsViewType.view16x16      // View type (icon-only)
    ),
    new Action(
      'BUTTON.new',
      EnumActionsType.actionNew,
      'add',
      false,
      EnumActionsViewType.view16x16,
      EnumActionsStyle.primary           // Style (optional)
    ),
    new Action(
      'BUTTON.logout',
      EnumActionsType.actionLogout,
      'exit_to_app',
      false,
      EnumActionsViewType.view16x16
    ),
    // Agregar más acciones según necesidad
  ];
  
  this._actionService.setActions(actions);
}
```

### 5. Llamar al Método en ngOnInit

```typescript
ngOnInit(): void {
  this._loadSecurityActions();
  // ... otra inicialización
}
```

### 6. Implementar Manejador de Acciones

Crear el método público que maneja los eventos de las acciones:

```typescript
onAction(action: EnumActionsType): void {
  switch (action) {
    case EnumActionsType.openHome:
      this._navigateHome();
      break;
    case EnumActionsType.actionNew:
      this._createNew();
      break;
    case EnumActionsType.actionLogout:
      this._logout();
      break;
    // Agregar más casos según las acciones configuradas
  }
}

// Métodos privados para cada acción
private _navigateHome(): void {
  // Implementar lógica
}

private _createNew(): void {
  // Implementar lógica
}

private _logout(): void {
  // Implementar lógica
}
```

### 7. Agregar Template HTML

En el archivo HTML del componente:

```html
<div class="body">
  <div class="floating-toolbar">
    <lfsoft-shared-actions (action)="onAction($event)"></lfsoft-shared-actions>
  </div>
  
  <!-- Resto del contenido del container -->
  <router-outlet></router-outlet>
</div>
```

### 8. Importar Estilos SCSS

En el archivo SCSS del componente:

```scss
@import 'styles/floating-toolbar';

.body {
    height: 100vh;
    background: var(--container-primary-bg);
    position: relative;
}
```

## Tipos de Acciones Disponibles (EnumActionsType)

Valores comunes del enum:
- `actionNew = 1` - Crear nuevo
- `actionEdit = 2` - Editar
- `actionDelete = 3` - Eliminar
- `actionSave = 5` - Guardar
- `actionCancel = 6` - Cancelar
- `actionLogout = 16` - Cerrar sesión
- `openHome = 105` - Ir a inicio
- `openConfig = 100` - Abrir configuración
- `openUsers = 101` - Abrir usuarios
- `openEntities = 102` - Abrir entidades

Ver archivo completo: `libs/shared/src/lib/generic-actions/models/enum-actions-type.model.ts`

## Tipos de Vista (EnumActionsViewType)

- `viewFooter = 1` - Botón completo con icono y texto
- `view16x16 = 2` - Solo icono (16x16px) - **Recomendado para floating-toolbar**

## Estilos de Botón (EnumActionsStyle)

- `primary = 1` - Estilo primario
- `secondary = 2` - Estilo secundario
- `tertiary = 3` - Estilo terciario
- `outline = 4` - Estilo outlined

## Constructor de Action

```typescript
new Action(
  label: string,                      // Clave de traducción (ej: 'BUTTON.save')
  actionType: EnumActionsType,        // Tipo de acción
  icon?: string,                      // Nombre del icono Material (opcional)
  disabled?: boolean,                 // Estado deshabilitado (opcional, default: false)
  viewType?: EnumActionsViewType,     // Tipo de vista (opcional)
  style?: EnumActionsStyle,           // Estilo del botón (opcional)
  permisions?: string[]               // Permisos requeridos (opcional)
)
```

## Métodos Útiles de ActionService

- `setActions(actions: Action[])` - Establece las acciones
- `getActions(): Observable<Action[]>` - Obtiene observable de acciones
- `clearActions()` - Limpia todas las acciones
- `disableAction(actionType: EnumActionsType)` - Deshabilita una acción específica
- `enableAction(actionType: EnumActionsType)` - Habilita una acción específica
- `removeAction(actionType: EnumActionsType)` - Elimina una acción específica

## Ejemplo Completo: home-container

Ver implementación completa en:
- TypeScript: `src/app/core/components/home-container/home-container.component.ts`
- HTML: `src/app/core/components/home-container/home-container.component.html`
- SCSS: `src/app/core/components/home-container/home-container.component.scss`

## Notas Importantes

1. **ViewType para Floating-Toolbar**: Usar `EnumActionsViewType.view16x16` para iconos compactos
2. **Traducción**: Los labels deben ser claves de traducción definidas en los archivos i18n
3. **Permisos**: El sistema filtra automáticamente las acciones según los permisos del usuario
4. **Posicionamiento**: La toolbar es fija, centrada horizontalmente en la parte superior
5. **Efectos visuales**: Opacidad 0.5 por defecto, opacidad 1.0 y escala 1.05 en hover
6. **Z-index**: La toolbar tiene z-index 9999 para estar siempre visible

## Consideraciones

- **Responsividad**: La toolbar se adapta automáticamente al número de acciones
- **Iconos**: Usar nombres de Material Icons válidos
- **Orden**: El orden de las acciones en el array determina su orden visual
- **Performance**: El ActionService usa observables para actualizaciones reactivas
