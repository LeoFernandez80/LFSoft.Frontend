/**
 * Sistema de manejo de fechas con zonas horarias
 * 
 * Este módulo proporciona:
 * - Pipe customDate para formatear fechas
 * - DateConfigService para configurar zona horaria y formatos
 * - Modelos y constantes para configuración
 */

// Pipe
export { CustomDatePipe } from './custom-date.pipe';

// Servicio
export { DateConfigService } from '../services/date-config.service';

// Modelos y constantes
export type { DateConfig } from '../models/date-config.model';
export {
  DATE_FORMATS,
  TIMEZONES,
  DEFAULT_DATE_CONFIG
} from '../models/date-config.model';
