import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DateConfigService } from '../../generic/services/date-config.service';
import { CustomDatePipe } from '../../generic/pipes/custom-date.pipe';
import { DATE_FORMATS, TIMEZONES, DateConfig } from '../../generic/models/date-config.model';

/**
 * Componente de ejemplo para demostrar el uso del sistema de fechas
 * Incluye controles para cambiar la configuración y ejemplos de visualización
 */
@Component({
  selector: 'app-date-config-example',
  standalone: true,
  imports: [CommonModule, FormsModule, CustomDatePipe],
  templateUrl: './date-config-example.component.html',
  styleUrls: ['./date-config-example.component.scss']
})
export class DateConfigExampleComponent implements OnInit {
  // Fecha de ejemplo
  exampleDate = new Date();
  
  // Configuración actual
  currentConfig: DateConfig = {
    timezone: '',
    dateFormat: '',
    dateTimeFormat: '',
    timeFormat: ''
  };
  
  // Opciones disponibles
  timezones = [
    { value: TIMEZONES.BUENOS_AIRES, label: 'Buenos Aires (GMT-3)' },
    { value: TIMEZONES.MEXICO_CITY, label: 'Ciudad de México (GMT-6)' },
    { value: TIMEZONES.NEW_YORK, label: 'New York (GMT-5)' },
    { value: TIMEZONES.LOS_ANGELES, label: 'Los Angeles (GMT-8)' },
    { value: TIMEZONES.MADRID, label: 'Madrid (GMT+1)' },
    { value: TIMEZONES.LONDON, label: 'London (GMT+0)' },
    { value: TIMEZONES.TOKYO, label: 'Tokyo (GMT+9)' },
    { value: TIMEZONES.UTC, label: 'UTC' }
  ];
  
  dateFormats = [
    { value: DATE_FORMATS.SPANISH, label: 'Español (dd/MM/yyyy)' },
    { value: DATE_FORMATS.US, label: 'US (MM/dd/yyyy)' },
    { value: DATE_FORMATS.ISO, label: 'ISO (yyyy-MM-dd)' }
  ];
  
  dateTimeFormats = [
    { value: DATE_FORMATS.SPANISH_DATETIME, label: 'Español 24h (dd/MM/yyyy HH:mm:ss)' },
    { value: DATE_FORMATS.US_DATETIME, label: 'US 12h (MM/dd/yyyy hh:mm a)' },
    { value: DATE_FORMATS.ISO_DATETIME, label: 'ISO (yyyy-MM-dd HH:mm:ss)' }
  ];
  
  timeFormats = [
    { value: DATE_FORMATS.TIME_24H, label: '24 horas (HH:mm:ss)' },
    { value: DATE_FORMATS.TIME_12H, label: '12 horas (hh:mm a)' },
    { value: DATE_FORMATS.TIME_SHORT_24H, label: '24 horas corto (HH:mm)' }
  ];
  
  // Zona horaria del navegador
  browserTimezone = '';

  constructor(private dateConfigService: DateConfigService) {}

  ngOnInit() {
    this.loadCurrentConfig();
    this.browserTimezone = this.dateConfigService.getBrowserTimezone();
  }

  /**
   * Carga la configuración actual
   */
  loadCurrentConfig() {
    this.currentConfig = this.dateConfigService.getConfig();
  }

  /**
   * Cambia la zona horaria
   */
  onTimezoneChange(timezone: string) {
    this.dateConfigService.setTimezone(timezone);
    this.loadCurrentConfig();
  }

  /**
   * Cambia el formato de fecha
   */
  onDateFormatChange(format: string) {
    this.dateConfigService.setDateFormat(format, 'date');
    this.loadCurrentConfig();
  }

  /**
   * Cambia el formato de fecha y hora
   */
  onDateTimeFormatChange(format: string) {
    this.dateConfigService.setDateFormat(format, 'dateTime');
    this.loadCurrentConfig();
  }

  /**
   * Cambia el formato de hora
   */
  onTimeFormatChange(format: string) {
    this.dateConfigService.setDateFormat(format, 'time');
    this.loadCurrentConfig();
  }

  /**
   * Usa la zona horaria del navegador
   */
  useBrowserTimezone() {
    this.dateConfigService.useBrowserTimezone();
    this.loadCurrentConfig();
  }

  /**
   * Reinicia a valores por defecto
   */
  resetToDefaults() {
    this.dateConfigService.resetToDefaults();
    this.loadCurrentConfig();
  }

  /**
   * Obtiene fechas en diferentes zonas horarias para comparar
   */
  getDateInTimezone(timezone: string): Date {
    return this.dateConfigService.convertToTimezone(this.exampleDate, timezone);
  }
}
