import { DateConfig, DATE_FORMATS, TIMEZONES } from '../app/generic/models/date-config.model';

/**
 * Configuración del entorno de producción
 */
export const environment = {
  production: true,
  
  /**
   * URL base de la API
   */
  apiUrl: 'https://api.example.com',
  
  /**
   * Configuración de fechas y zona horaria
   */
  dateConfig: {
    timezone: TIMEZONES.BUENOS_AIRES,
    dateFormat: DATE_FORMATS.SPANISH,
    dateTimeFormat: DATE_FORMATS.SPANISH_DATETIME,
    timeFormat: DATE_FORMATS.TIME_24H,
    shortDateFormat: DATE_FORMATS.EUROPEAN_SHORT,
    longDateFormat: DATE_FORMATS.LONG_DATE_ES
  } as DateConfig,
  
  /**
   * Locale por defecto de la aplicación
   * 'es-AR' para español de Argentina, 'es' para español genérico
   */
  locale: 'es-AR'
};
