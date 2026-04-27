import { ErrorHandler, Injectable, Injector } from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';
import { EnumMessageType, MessagesService } from '@lib/shared';

/**
 * ErrorHandler centralizado que separa errores técnicos de mensajes de usuario.
 * - Loggea errores técnicos a consola (o a un logger exterior)
 * - Muestra mensajes amigables al usuario vía MessagesService
 */
@Injectable({ providedIn: 'root' })
export class ErrorHandlerService implements ErrorHandler {
  constructor(private injector: Injector) {}

  handleError(error: unknown): void {
    // obtener MessagesService de forma diferida para evitar ciclos de inyección
    const messagesService = this.injector.get(MessagesService, null as any);

    try {
      // Manejo de HttpErrorResponse
      if (error instanceof HttpErrorResponse) {
        // Errores de red / backend
        const userMessage = this._userMessageFromHttpError(error);
        if (messagesService) {
          messagesService.addMessage(userMessage, EnumMessageType.Error);
        }
        // Log técnico
        console.error('HTTP Error captured by ErrorHandlerService:', error);
        return;
      }

      // Errores con propiedad originalError (por ejemplo, rejections)
      const anyError = error as any;
      if (anyError && anyError.rejection) {
        console.error('Unhandled Promise rejection:', anyError.rejection);
        if (messagesService) {
          messagesService.addMessage('Ocurrió un error inesperado.', EnumMessageType.Error);
        }
        return;
      }

      // Otros errores de runtime
      console.error('Error captured by ErrorHandlerService:', error);
      if (messagesService) {
        messagesService.addMessage('Ocurrió un error en la aplicación. Intente nuevamente.', EnumMessageType.Error);
      }
    } catch (err) {
      // Si ocurre un error dentro del handler, al menos loguearlo
      console.error('ErrorHandlerService failed:', err);
    }
  }

  private _userMessageFromHttpError(error: HttpErrorResponse): string {
    // No exponer detalles técnicos al usuario. Mapear códigos comunes.
    if (!navigator.onLine) {
      return 'Sin conexión. Verifique su conexión a internet.';
    }

    if (error.status >= 500) {
      return 'Error del servidor. Intente más tarde.';
    }

    if (error.status === 404) {
      return 'Recurso no encontrado.';
    }

    if (error.status === 401 || error.status === 403) {
      return 'No autorizado. Inicie sesión con una cuenta con permisos.';
    }

    // Para otros casos, devolver mensaje genérico o el mensaje del backend si existe
    const backendMessage = (error.error && error.error.message) ? error.error.message : null;
    return backendMessage ?? 'Ocurrió un error en la solicitud.';
  }
}
