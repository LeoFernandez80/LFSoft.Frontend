import { DATE_FORMATS, DateConfig, TIMEZONES } from "@lib/shared";

/**
 * Configuración del entorno de desarrollo
 */
export const environment = {
  production: false,
  
  /**
   * URL base de la API
   */
  apiUrl: 'http://localhost:3002/api',
  basicConfigurationsApiUrl: 'http://localhost:3003/api',
  utilitiesApiUrl: 'http://localhost:3004/api',
  // entitiesApiUrl: 'http://localhost:3000/api',
  // articlesApiUrl: 'http://localhost:3001/api',
  // securityApiUrl: 'http://localhost:3002/api',
  
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
