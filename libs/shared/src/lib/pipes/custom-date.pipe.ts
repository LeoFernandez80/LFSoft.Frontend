import { Pipe, PipeTransform, inject, LOCALE_ID } from '@angular/core';
import { DatePipe } from '@angular/common';
import { DateConfigService } from '../services/date-config.service';

/**
 * Pipe personalizado para formatear fechas con soporte de zona horaria
 * 
 * Uso:
 * {{ fecha | customDate }}                          - Usa formato de fecha por defecto
 * {{ fecha | customDate:'short' }}                  - Usa formato corto
 * {{ fecha | customDate:'dateTime' }}               - Usa formato fecha y hora
 * {{ fecha | customDate:'time' }}                   - Usa formato de hora
 * {{ fecha | customDate:'long' }}                   - Usa formato largo
 * {{ fecha | customDate:'dd/MM/yyyy HH:mm' }}       - Formato personalizado
 * {{ fecha | customDate:'date':'America/New_York' }} - Especifica zona horaria
 */
@Pipe({
  name: 'customDate',
  standalone: true
})
export class CustomDatePipe implements PipeTransform {
  private dateConfigService = inject(DateConfigService);
  private defaultLocale = inject(LOCALE_ID);

  constructor() {}

  /**
   * Transforma una fecha aplicando formato y zona horaria configurados
   * @param value Fecha a formatear (Date, string, number o null/undefined)
   * @param formatType Tipo de formato predefinido o formato personalizado
   * @param timezone Zona horaria específica (opcional, usa la configurada por defecto)
   * @param locale Locale para el formato (opcional, usa 'es-ES' por defecto)
   */
  transform(
    value: Date | string | number | null | undefined,
    formatType: 'date' | 'dateTime' | 'time' | 'short' | 'long' | string = 'date',
    timezone?: string,
    locale?: string
  ): string | null {
    if (!value) {
      return null;
    }

    try {
      // Determinar el formato a usar
      let format: string;
      
      // Si es un formato predefinido, obtenerlo del servicio
      if (['date', 'dateTime', 'time', 'short', 'long'].includes(formatType)) {
        format = this.dateConfigService.getDateFormat(
          formatType as 'date' | 'dateTime' | 'time' | 'short' | 'long'
        );
      } else {
        // Usar el formato personalizado proporcionado
        format = formatType;
      }

      // Determinar la zona horaria a usar
      const tz = timezone || this.dateConfigService.getTimezone();

      // Usar el locale especificado o el configurado globalmente
      const localeToUse = locale || this.defaultLocale;

      // Crear un nuevo DatePipe con el locale especificado
      const pipe = new DatePipe(localeToUse);

      // Formatear la fecha con el formato y zona horaria especificados
      return pipe.transform(value, format, tz);
    } catch (error) {
      console.error('Error al formatear fecha:', error);
      return String(value);
    }
  }
}
