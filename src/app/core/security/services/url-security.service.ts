import { Injectable } from '@angular/core';
import { DomSanitizer, SafeUrl } from '@angular/platform-browser';

/**
 * Servicio para validar y sanitizar URLs
 * Previene XSS y ataques de navegación insegura
 */
@Injectable({
  providedIn: 'root'
})
export class UrlSecurityService {
  // Dominios permitidos para navegación
  private readonly ALLOWED_DOMAINS = [
    window.location.hostname,
    'localhost'
  ];

  // Protocolos permitidos
  private readonly ALLOWED_PROTOCOLS = ['http', 'https'];

  constructor(private _domSanitizer: DomSanitizer) {}

  /**
   * Validar si una URL es segura
   * @param url URL a validar
   * @returns true si la URL es segura
   */
  isSecureUrl(url: string): boolean {
    try {
      const urlObj = new URL(url, window.location.origin);

      // Validar protocolo
      if (!this._isAllowedProtocol(urlObj.protocol)) {
        console.warn(`Security: Invalid protocol in URL: ${urlObj.protocol}`);
        return false;
      }

      // Validar dominio
      if (!this._isAllowedDomain(urlObj.hostname)) {
        console.warn(`Security: Invalid domain in URL: ${urlObj.hostname}`);
        return false;
      }

      return true;
    } catch (error) {
      console.error('Security: Error parsing URL:', error);
      return false;
    }
  }

  /**
   * Sanitizar URL para uso seguro en href
   * @param url URL a sanitizar
   * @returns URL segura para usar en templates
   */
  sanitizeUrl(url: string): SafeUrl {
    if (!this.isSecureUrl(url)) {
      console.warn(`Security: Potentially unsafe URL blocked: ${url}`);
      return this._domSanitizer.bypassSecurityTrustUrl('');
    }
    return this._domSanitizer.sanitize(1, url) as any; // 1 = SecurityContext.URL
  }

  /**
   * Validar ID de ruta
   * @param id ID a validar
   * @returns true si el ID es válido
   */
  isValidRouteId(id: string | number): boolean {
    if (!id) {
      return false;
    }

    // Validar que sea un número o string alfanumérico
    const idStr = String(id).trim();
    return /^[a-zA-Z0-9_-]+$/.test(idStr);
  }

  /**
   * Validar si el protocolo es permitido
   */
  private _isAllowedProtocol(protocol: string): boolean {
    const protocolWithoutColon = protocol.replace(':', '');
    return this.ALLOWED_PROTOCOLS.includes(protocolWithoutColon.toLowerCase());
  }

  /**
   * Validar si el dominio es permitido
   */
  private _isAllowedDomain(hostname: string): boolean {
    if (!hostname) {
      return false;
    }

    // Permitir localhost con puerto
    if (hostname.startsWith('localhost:')) {
      return true;
    }

    // Permitir dominios en la lista blanca
    return this.ALLOWED_DOMAINS.some(domain => {
      return hostname === domain || hostname.endsWith('.' + domain);
    });
  }
}
