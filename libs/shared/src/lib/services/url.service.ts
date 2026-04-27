import { Injectable } from '@angular/core';
import { DateConfig, DEFAULT_DATE_CONFIG } from '../models/date-config.model';
import { Router } from '@angular/router';
import { UrlSecurityService } from '@lib/security';
import { EnumMessageType } from '../generic-message/enums/message-type.enum';
import { MessagesService } from '../generic-message/services/message.service';

/**
 * Servicio para gestionar la configuración global de fechas y zonas horarias
 * Permite definir formato de fechas y zona horaria para toda la aplicación
 */
@Injectable({
  providedIn: 'root'
})
export class UrlService {
  
  constructor( private _router: Router,   
    private _messagesService: MessagesService, 
    private _urlSecurityService: UrlSecurityService) { 


  }

    openUrl(commands: readonly any[]): void {
      try {
        // Crear URL de forma segura
        
        const urlTree = this._router.createUrlTree(commands);
        const url = this._router.serializeUrl(urlTree);
        
        // Validar URL antes de abrir
        if (!this._urlSecurityService.isSecureUrl(url)) {
          this._messagesService.addMessage("URL no segura detectada", EnumMessageType.Error);
          return;
        }
        
        // Abrir en nueva ventana
        const windowRef = window.open(url, '_self', 'noopener,noreferrer');
        if (!windowRef) {
          this._messagesService.addMessage("No se pudo abrir la ventana. Verifica la configuración del navegador.", EnumMessageType.Warning);
        }
      } catch (error) {
        console.error('Error opening:', error);
        this._messagesService.addMessage("Error al abrir en nueva pestaña", EnumMessageType.Error);
      }
    }
  
}
