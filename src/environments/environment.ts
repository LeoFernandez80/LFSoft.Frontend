import { DateConfig, DATE_FORMATS, TIMEZONES } from '../app/generic/models/date-config.model';

/**
 * Configuración del entorno de desarrollo
 */
export const environment = {
  production: false,
  
  /**
   * URL base de la API
   */
  entitiesApiUrl: 'http://localhost:3000/api',
  articlesApiUrl: 'http://localhost:3001/api',
  
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
