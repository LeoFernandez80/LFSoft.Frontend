# Sistema de Manejo de Fechas - Guía Rápida

## ✅ ¿Qué se implementó?

Un sistema completo para manejar fechas con:
- ✅ Soporte de zonas horarias (IANA timezone)
- ✅ Formatos de fecha personalizables
- ✅ Configuración global persistente
- ✅ Pipe standalone para usar en templates
- ✅ Servicio para cambiar configuración dinámicamente

## 🚀 Uso Rápido

### En Templates (HTML)

```html
<!-- Usar formato configurado globalmente -->
{{ fecha | customDate }}

<!-- Usar formato específico -->
{{ fecha | customDate:'dateTime' }}
{{ fecha | customDate:'short' }}
{{ fecha | customDate:'long' }}

<!-- Formato personalizado -->
{{ fecha | customDate:'dd/MM/yyyy HH:mm' }}

<!-- Con zona horaria específica -->
{{ fecha | customDate:'date':'America/New_York' }}
```

### En Componentes (TypeScript)

```typescript
import { CustomDatePipe } from './generic/pipes/custom-date.pipe';
import { DateConfigService } from './generic/services/date-config.service';
import { TIMEZONES, DATE_FORMATS } from './generic/models/date-config.model';

@Component({
  imports: [CustomDatePipe], // Importar el pipe
  // ...
})
export class MiComponente {
  constructor(private dateConfig: DateConfigService) {}
  
  cambiarZonaHoraria() {
    this.dateConfig.setTimezone(TIMEZONES.MADRID);
  }
  
  cambiarFormato() {
    this.dateConfig.setDateFormat(DATE_FORMATS.US);
  }
  
  usarZonaDelNavegador() {
    this.dateConfig.useBrowserTimezone();
  }
}
```

## 📁 Archivos Creados

```
src/
├── app/
│   ├── app.config.ts (ACTUALIZADO - inicializa configuración)
│   ├── generic/
│   │   ├── models/
│   │   │   └── date-config.model.ts (interfaces y constantes)
│   │   ├── services/
│   │   │   └── date-config.service.ts (servicio de configuración)
│   │   └── pipes/
│   │       ├── custom-date.pipe.ts (pipe principal)
│   │       ├── custom-date.pipe.spec.ts (tests)
│   │       ├── index.ts (exports)
│   │       └── README-DATE-HANDLING.md (documentación completa)
│   └── components/
│       └── date-config-example/ (componente de ejemplo)
│           ├── date-config-example.component.ts
│           ├── date-config-example.component.html
│           └── date-config-example.component.scss
└── environments/
    ├── environment.ts (ACTUALIZADO)
    └── environment.prod.ts (CREADO)
```

## ⚙️ Configuración

### Global (environment.ts)

```typescript
export const environment = {
  dateConfig: {
    timezone: TIMEZONES.BUENOS_AIRES,
    dateFormat: DATE_FORMATS.SPANISH,
    dateTimeFormat: DATE_FORMATS.SPANISH_DATETIME,
    timeFormat: DATE_FORMATS.TIME_24H
  }
};
```

### Dinámicamente (en runtime)

```typescript
// Cambiar zona horaria
dateConfigService.setTimezone('America/New_York');

// Cambiar formato
dateConfigService.setDateFormat('MM/dd/yyyy');

// Usar zona del navegador
dateConfigService.useBrowserTimezone();

// Restaurar valores por defecto
dateConfigService.resetToDefaults();
```

## 🌍 Zonas Horarias Disponibles

```typescript
TIMEZONES.BUENOS_AIRES  // Argentina
TIMEZONES.MEXICO_CITY   // México
TIMEZONES.NEW_YORK      // USA Este
TIMEZONES.LOS_ANGELES   // USA Oeste
TIMEZONES.MADRID        // España
TIMEZONES.LONDON        // Reino Unido
TIMEZONES.TOKYO         // Japón
TIMEZONES.UTC           // Universal
```

## 📅 Formatos Predefinidos

```typescript
// Fechas
DATE_FORMATS.SPANISH    // dd/MM/yyyy
DATE_FORMATS.US         // MM/dd/yyyy
DATE_FORMATS.ISO        // yyyy-MM-dd

// Fecha y Hora
DATE_FORMATS.SPANISH_DATETIME  // dd/MM/yyyy HH:mm:ss
DATE_FORMATS.US_DATETIME       // MM/dd/yyyy hh:mm a

// Hora
DATE_FORMATS.TIME_24H   // HH:mm:ss
DATE_FORMATS.TIME_12H   // hh:mm a
```

## 💾 Persistencia

La configuración se guarda automáticamente en `localStorage` y persiste entre sesiones.

## 🧪 Componente de Prueba

Usa el componente `DateConfigExampleComponent` para probar todas las funcionalidades:

```typescript
// En tu routing o donde necesites
import { DateConfigExampleComponent } from './components/date-config-example/date-config-example.component';

// En routes
{
  path: 'date-config',
  component: DateConfigExampleComponent
}
```

## 📚 Documentación Completa

Ver `src/app/generic/pipes/README-DATE-HANDLING.md` para documentación detallada.

## 🔄 Migrar Código Existente

```html
<!-- ANTES -->
{{ fecha | date:'dd/MM/yyyy' }}

<!-- DESPUÉS -->
{{ fecha | customDate }}
```

```typescript
// ANTES
import { DatePipe } from '@angular/common';

// DESPUÉS
import { CustomDatePipe } from './generic/pipes/custom-date.pipe';
```

## ⚡ Ventajas

1. **Centralizado**: Una sola configuración para toda la app
2. **Persistente**: Guarda preferencias del usuario
3. **Flexible**: Soporta cualquier zona horaria y formato
4. **Fácil de usar**: Pipe simple en templates
5. **Standalone**: No requiere módulos adicionales
6. **Type-safe**: TypeScript con tipos definidos
