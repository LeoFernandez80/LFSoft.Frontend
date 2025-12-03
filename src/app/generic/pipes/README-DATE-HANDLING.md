# Manejo de Fechas con Zonas Horarias

La aplicación ahora cuenta con un sistema robusto para manejar fechas con soporte de zonas horarias y formatos personalizables.

## Componentes del Sistema

### 1. Modelo de Configuración (`date-config.model.ts`)

Define la estructura de configuración de fechas:

```typescript
interface DateConfig {
  timezone: string;          // Zona horaria IANA
  dateFormat: string;        // Formato de fecha
  dateTimeFormat: string;    // Formato fecha y hora
  timeFormat: string;        // Formato de hora
  shortDateFormat?: string;  // Formato corto
  longDateFormat?: string;   // Formato largo
}
```

#### Formatos Predefinidos

```typescript
DATE_FORMATS.SPANISH          // 'dd/MM/yyyy'
DATE_FORMATS.US               // 'MM/dd/yyyy'
DATE_FORMATS.ISO              // 'yyyy-MM-dd'
DATE_FORMATS.SPANISH_DATETIME // 'dd/MM/yyyy HH:mm:ss'
DATE_FORMATS.TIME_24H         // 'HH:mm:ss'
DATE_FORMATS.TIME_12H         // 'hh:mm a'
```

#### Zonas Horarias Predefinidas

```typescript
TIMEZONES.BUENOS_AIRES  // 'America/Argentina/Buenos_Aires'
TIMEZONES.MEXICO_CITY   // 'America/Mexico_City'
TIMEZONES.NEW_YORK      // 'America/New_York'
TIMEZONES.MADRID        // 'Europe/Madrid'
TIMEZONES.UTC           // 'UTC'
```

### 2. Servicio de Configuración (`date-config.service.ts`)

Gestiona la configuración global de fechas:

```typescript
// Inyectar el servicio
constructor(private dateConfigService: DateConfigService) {}

// Obtener configuración actual
const config = this.dateConfigService.getConfig();

// Cambiar zona horaria
this.dateConfigService.setTimezone(TIMEZONES.MADRID);

// Cambiar formato de fecha
this.dateConfigService.setDateFormat(DATE_FORMATS.US);

// Cambiar formato de fecha y hora
this.dateConfigService.setDateFormat(DATE_FORMATS.US_DATETIME, 'dateTime');

// Usar zona horaria del navegador
this.dateConfigService.useBrowserTimezone();

// Configuración completa
this.dateConfigService.setConfig({
  timezone: TIMEZONES.NEW_YORK,
  dateFormat: DATE_FORMATS.US,
  dateTimeFormat: DATE_FORMATS.US_DATETIME,
  timeFormat: DATE_FORMATS.TIME_12H
});

// Restablecer valores por defecto
this.dateConfigService.resetToDefaults();

// Convertir fecha a zona horaria específica
const nyDate = this.dateConfigService.convertToTimezone(
  new Date(), 
  TIMEZONES.NEW_YORK
);
```

### 3. Pipe Personalizado (`customDate`)

Formatea fechas automáticamente según la configuración:

#### Uso Básico en Templates

```html
<!-- Formato de fecha por defecto -->
{{ fecha | customDate }}

<!-- Formatos predefinidos -->
{{ fecha | customDate:'date' }}          <!-- 15/03/2024 -->
{{ fecha | customDate:'dateTime' }}      <!-- 15/03/2024 10:30:45 -->
{{ fecha | customDate:'time' }}          <!-- 10:30:45 -->
{{ fecha | customDate:'short' }}         <!-- 15/03/24 -->
{{ fecha | customDate:'long' }}          <!-- viernes, 15 de marzo de 2024 -->

<!-- Formato personalizado -->
{{ fecha | customDate:'dd/MM/yyyy HH:mm' }}
{{ fecha | customDate:'EEEE, d MMMM' }}

<!-- Con zona horaria específica -->
{{ fecha | customDate:'dateTime':'America/New_York' }}
{{ fecha | customDate:'date':'Europe/Madrid' }}

<!-- Con locale específico -->
{{ fecha | customDate:'long':'':'en-US' }}
```

#### Uso en Componentes

```typescript
import { CustomDatePipe } from './generic/pipes/custom-date.pipe';

@Component({
  imports: [CustomDatePipe],
  // ...
})
export class MyComponent {
  fecha = new Date();
}
```

### 4. Configuración de Environment

Define la configuración inicial en `environment.ts`:

```typescript
export const environment = {
  dateConfig: {
    timezone: TIMEZONES.BUENOS_AIRES,
    dateFormat: DATE_FORMATS.SPANISH,
    dateTimeFormat: DATE_FORMATS.SPANISH_DATETIME,
    timeFormat: DATE_FORMATS.TIME_24H,
    shortDateFormat: DATE_FORMATS.EUROPEAN_SHORT,
    longDateFormat: DATE_FORMATS.LONG_DATE_ES
  },
  locale: 'es-ES'
};
```

## Ejemplos de Uso Completos

### Ejemplo 1: Grilla con Fechas

```typescript
// Component
import { CustomDatePipe } from './generic/pipes/custom-date.pipe';

@Component({
  imports: [CustomDatePipe],
  template: `
    <table>
      <tr *ngFor="let item of items">
        <td>{{ item.nombre }}</td>
        <td>{{ item.fechaCreacion | customDate:'dateTime' }}</td>
        <td>{{ item.fechaActualizacion | customDate:'short' }}</td>
      </tr>
    </table>
  `
})
export class MiGrillaComponent {
  items = [
    { nombre: 'Item 1', fechaCreacion: new Date(), fechaActualizacion: new Date() }
  ];
}
```

### Ejemplo 2: Formulario con Fechas

```html
<!-- invoice-form.component.html -->
<div class="form-group">
  <label for="invoiceCreationDate">
    {{ 'LABEL.creationDate' | translate }}
  </label>
  <input
    id="invoiceCreationDate"
    type="date"
    formControlName="invoiceCreationDate"
  />
  <!-- Mostrar fecha formateada -->
  <span class="formatted-date">
    {{ form.get('invoiceCreationDate')?.value | customDate:'long' }}
  </span>
</div>
```

### Ejemplo 3: Cambiar Configuración Dinámicamente

```typescript
// settings.component.ts
import { DateConfigService } from './generic/services/date-config.service';
import { TIMEZONES, DATE_FORMATS } from './generic/models/date-config.model';

@Component({
  template: `
    <select (change)="changeTimezone($event)">
      <option value="America/Argentina/Buenos_Aires">Buenos Aires</option>
      <option value="America/New_York">New York</option>
      <option value="Europe/Madrid">Madrid</option>
    </select>
    
    <select (change)="changeDateFormat($event)">
      <option value="dd/MM/yyyy">DD/MM/YYYY</option>
      <option value="MM/dd/yyyy">MM/DD/YYYY</option>
      <option value="yyyy-MM-dd">YYYY-MM-DD</option>
    </select>
    
    <button (click)="useBrowserTimezone()">
      Usar zona horaria del navegador
    </button>
  `
})
export class SettingsComponent {
  constructor(private dateConfigService: DateConfigService) {}
  
  changeTimezone(event: Event) {
    const timezone = (event.target as HTMLSelectElement).value;
    this.dateConfigService.setTimezone(timezone);
  }
  
  changeDateFormat(event: Event) {
    const format = (event.target as HTMLSelectElement).value;
    this.dateConfigService.setDateFormat(format);
  }
  
  useBrowserTimezone() {
    this.dateConfigService.useBrowserTimezone();
  }
}
```

### Ejemplo 4: Comparar Fechas en Diferentes Zonas Horarias

```typescript
import { DateConfigService } from './generic/services/date-config.service';
import { TIMEZONES } from './generic/models/date-config.model';

export class DateComparisonComponent {
  constructor(private dateConfigService: DateConfigService) {}
  
  showTimeInDifferentZones() {
    const now = new Date();
    
    const buenosAires = this.dateConfigService.convertToTimezone(
      now, 
      TIMEZONES.BUENOS_AIRES
    );
    
    const newYork = this.dateConfigService.convertToTimezone(
      now, 
      TIMEZONES.NEW_YORK
    );
    
    const madrid = this.dateConfigService.convertToTimezone(
      now, 
      TIMEZONES.MADRID
    );
  }
}
```

## Persistencia

La configuración se guarda automáticamente en `localStorage` con la clave `app_date_config`. Esto permite que las preferencias del usuario persistan entre sesiones.

## Notas Importantes

1. **Zonas Horarias**: Usa siempre formato IANA (ej: 'America/Argentina/Buenos_Aires')
2. **Formatos**: Los formatos siguen la sintaxis de Angular DatePipe
3. **Locale**: El pipe usa 'es-ES' por defecto pero puede cambiarse por parámetro
4. **Inicialización**: La configuración se carga de `environment.ts` al iniciar la app
5. **Standalone**: El pipe es standalone y puede importarse directamente en componentes

## Migración de Código Existente

Para migrar fechas existentes:

```html
<!-- Antes -->
{{ fecha | date:'dd/MM/yyyy' }}

<!-- Después -->
{{ fecha | customDate }}
<!-- o -->
{{ fecha | customDate:'date' }}
```

## Formatos de Angular DatePipe Soportados

- `d`: Día del mes (1-31)
- `dd`: Día del mes con ceros (01-31)
- `M`: Mes (1-12)
- `MM`: Mes con ceros (01-12)
- `MMM`: Mes abreviado (ene, feb, mar...)
- `MMMM`: Mes completo (enero, febrero, marzo...)
- `yy`: Año de 2 dígitos (24)
- `yyyy`: Año de 4 dígitos (2024)
- `H`: Hora 24h (0-23)
- `HH`: Hora 24h con ceros (00-23)
- `h`: Hora 12h (1-12)
- `hh`: Hora 12h con ceros (01-12)
- `m`: Minutos (0-59)
- `mm`: Minutos con ceros (00-59)
- `s`: Segundos (0-59)
- `ss`: Segundos con ceros (00-59)
- `a`: AM/PM
- `E`: Día de la semana abreviado (lun, mar...)
- `EEEE`: Día de la semana completo (lunes, martes...)
