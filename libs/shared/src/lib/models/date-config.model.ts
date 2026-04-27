/**
 * Configuración de formato de fechas y zona horaria
 */
export interface DateConfig {
  /**
   * Zona horaria en formato IANA (ej: 'America/Argentina/Buenos_Aires', 'Europe/Madrid', 'UTC')
   */
  timezone: string;

  /**
   * Formato de fecha por defecto
   * Ejemplos: 'dd/MM/yyyy', 'MM/dd/yyyy', 'yyyy-MM-dd'
   */
  dateFormat: string;

  /**
   * Formato de fecha y hora por defecto
   * Ejemplos: 'dd/MM/yyyy HH:mm:ss', 'MM/dd/yyyy hh:mm a'
   */
  dateTimeFormat: string;

  /**
   * Formato de hora por defecto
   * Ejemplos: 'HH:mm:ss', 'hh:mm a'
   */
  timeFormat: string;

  /**
   * Formato corto de fecha
   * Ejemplo: 'dd/MM/yy'
   */
  shortDateFormat?: string;

  /**
   * Formato largo de fecha
   * Ejemplo: 'EEEE, d MMMM yyyy'
   */
  longDateFormat?: string;
}

/**
 * Formatos de fecha predefinidos comunes
 */
export const DATE_FORMATS = {
  // Formatos de fecha
  SPANISH: 'dd/MM/yyyy',
  US: 'MM/dd/yyyy',
  ISO: 'yyyy-MM-dd',
  EUROPEAN_SHORT: 'dd/MM/yy',
  
  // Formatos de fecha y hora
  SPANISH_DATETIME: 'dd/MM/yyyy HH:mm:ss',
  US_DATETIME: 'MM/dd/yyyy hh:mm a',
  ISO_DATETIME: 'yyyy-MM-dd HH:mm:ss',
  
  // Formatos de hora
  TIME_24H: 'HH:mm:ss',
  TIME_12H: 'hh:mm a',
  TIME_SHORT_24H: 'HH:mm',
  
  // Formatos largos
  LONG_DATE_ES: 'EEEE, d \'de\' MMMM \'de\' yyyy',
  LONG_DATE_EN: 'EEEE, MMMM d, yyyy'
} as const;

/**
 * Zonas horarias comunes
 */
export const TIMEZONES = {
  // América
  BUENOS_AIRES: 'America/Argentina/Buenos_Aires',
  MEXICO_CITY: 'America/Mexico_City',
  NEW_YORK: 'America/New_York',
  LOS_ANGELES: 'America/Los_Angeles',
  SAO_PAULO: 'America/Sao_Paulo',
  SANTIAGO: 'America/Santiago',
  
  // Europa
  MADRID: 'Europe/Madrid',
  LONDON: 'Europe/London',
  PARIS: 'Europe/Paris',
  BERLIN: 'Europe/Berlin',
  
  // Asia
  TOKYO: 'Asia/Tokyo',
  SHANGHAI: 'Asia/Shanghai',
  DUBAI: 'Asia/Dubai',
  
  // Universal
  UTC: 'UTC'
} as const;

/**
 * Configuración por defecto de fechas
 */
export const DEFAULT_DATE_CONFIG: DateConfig = {
  timezone: TIMEZONES.BUENOS_AIRES,
  dateFormat: DATE_FORMATS.SPANISH,
  dateTimeFormat: DATE_FORMATS.SPANISH_DATETIME,
  timeFormat: DATE_FORMATS.TIME_24H,
  shortDateFormat: DATE_FORMATS.EUROPEAN_SHORT,
  longDateFormat: DATE_FORMATS.LONG_DATE_ES
};
