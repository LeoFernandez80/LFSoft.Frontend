import { Injectable } from '@angular/core';
import { DateConfig, DEFAULT_DATE_CONFIG } from '../models/date-config.model';

/**
 * Servicio para gestionar la configuración global de fechas y zonas horarias
 * Permite definir formato de fechas y zona horaria para toda la aplicación
 */
@Injectable({
  providedIn: 'root'
})
export class DateConfigService {
  private config: DateConfig = { ...DEFAULT_DATE_CONFIG };

  constructor() {
    // Cargar configuración desde localStorage si existe
    this.loadConfigFromStorage();
  }

  /**
   * Obtiene la configuración actual de fechas
   */
  getConfig(): DateConfig {
    return { ...this.config };
  }

  /**
   * Establece una nueva configuración de fechas
   * @param config Configuración parcial o completa de fechas
   */
  setConfig(config: Partial<DateConfig>): void {
    this.config = { ...this.config, ...config };
    this.saveConfigToStorage();
  }

  /**
   * Obtiene la zona horaria actual
   */
  getTimezone(): string {
    return this.config.timezone;
  }

  /**
   * Establece la zona horaria
   * @param timezone Zona horaria en formato IANA
   */
  setTimezone(timezone: string): void {
    this.config.timezone = timezone;
    this.saveConfigToStorage();
  }

  /**
   * Obtiene el formato de fecha actual
   * @param type Tipo de formato (date, dateTime, time, short, long)
   */
  getDateFormat(type: 'date' | 'dateTime' | 'time' | 'short' | 'long' = 'date'): string {
    switch (type) {
      case 'dateTime':
        return this.config.dateTimeFormat;
      case 'time':
        return this.config.timeFormat;
      case 'short':
        return this.config.shortDateFormat || this.config.dateFormat;
      case 'long':
        return this.config.longDateFormat || this.config.dateFormat;      
      default:
        return this.config.dateFormat;
    }
  }

  /**
   * Establece el formato de fecha
   * @param format Formato de fecha
   * @param type Tipo de formato a establecer
   */
  setDateFormat(format: string, type: 'date' | 'dateTime' | 'time' | 'short' | 'long' = 'date'): void {
    switch (type) {
      case 'dateTime':
        this.config.dateTimeFormat = format;
        break;
      case 'time':
        this.config.timeFormat = format;
        break;
      case 'short':
        this.config.shortDateFormat = format;
        break;
      case 'long':
        this.config.longDateFormat = format;
        break;
      case 'date':
      default:
        this.config.dateFormat = format;
        break;
    }
    this.saveConfigToStorage();
  }

  /**
   * Reinicia la configuración a los valores por defecto
   */
  resetToDefaults(): void {
    this.config = { ...DEFAULT_DATE_CONFIG };
    this.saveConfigToStorage();
  }

  /**
   * Convierte una fecha de una zona horaria a otra
   * @param date Fecha a convertir
   * @param targetTimezone Zona horaria destino (por defecto usa la configurada)
   */
  convertToTimezone(date: Date | string | number, targetTimezone?: string): Date {
    const sourceDate = new Date(date);
    const timezone = targetTimezone || this.config.timezone;
    
    // Obtener el offset de la zona horaria objetivo usando Intl
    const targetDateString = sourceDate.toLocaleString('en-US', { timeZone: timezone });
    const targetDate = new Date(targetDateString);
    
    return targetDate;
  }

  /**
   * Obtiene la zona horaria del navegador del usuario
   */
  getBrowserTimezone(): string {
    return Intl.DateTimeFormat().resolvedOptions().timeZone;
  }

  /**
   * Establece la zona horaria del navegador como zona horaria de la aplicación
   */
  useBrowserTimezone(): void {
    this.setTimezone(this.getBrowserTimezone());
  }

  /**
   * Guarda la configuración en localStorage
   */
  private saveConfigToStorage(): void {
    try {
      localStorage.setItem('app_date_config', JSON.stringify(this.config));
    } catch (error) {
      console.error('Error al guardar configuración de fechas:', error);
    }
  }

  /**
   * Carga la configuración desde localStorage
   */
  private loadConfigFromStorage(): void {
    try {
      const stored = localStorage.getItem('app_date_config');
      if (stored) {
        const parsedConfig = JSON.parse(stored);
        this.config = { ...DEFAULT_DATE_CONFIG, ...parsedConfig };
      }
    } catch (error) {
      console.error('Error al cargar configuración de fechas:', error);
      this.config = { ...DEFAULT_DATE_CONFIG };
    }
  }
}
