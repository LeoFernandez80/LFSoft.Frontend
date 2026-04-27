import { MatIconRegistry } from '@angular/material/icon';
import { ApplicationConfig, provideBrowserGlobalErrorListeners, provideZoneChangeDetection, ErrorHandler, APP_INITIALIZER, LOCALE_ID } from '@angular/core';
import { provideRouter } from '@angular/router';
import { registerLocaleData } from '@angular/common';
import localeEs from '@angular/common/locales/es';
import localeEsAr from '@angular/common/locales/es-AR';
import { HTTP_INTERCEPTORS, provideHttpClient, withInterceptorsFromDi } from '@angular/common/http';

import { routes } from './app.routes';
import { ErrorHandlerService } from './core/error-handler/error-handler.service';
import { HttpRetryInterceptor } from './core/error-handler/http-retry.interceptor';
import { environment } from '../environments/environment';
import { DateConfigService, PERMISSION_SERVICE } from '@lib/shared';
import { AuthService, API_URL } from '@lib/security';

// Registrar locales de español
registerLocaleData(localeEs, 'es');
registerLocaleData(localeEsAr, 'es-AR');

/**
 * Inicializa la configuración de fechas desde environment
 */
function initializeDateConfig(dateConfigService: DateConfigService) {
  return () => {
    dateConfigService.setConfig(environment.dateConfig);
  };
}

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideRouter(routes),
    provideHttpClient(withInterceptorsFromDi()),
    // Global ErrorHandler
    { provide: ErrorHandler, useClass: ErrorHandlerService },
    // HTTP retry interceptor
    { provide: HTTP_INTERCEPTORS, useClass: HttpRetryInterceptor, multi: true },
    // Locale configuration
    { provide: LOCALE_ID, useValue: environment.locale },
    // Date configuration initialization
    {
      provide: APP_INITIALIZER,
      useFactory: initializeDateConfig,
      deps: [DateConfigService],
      multi: true
    },
    // API URL para AuthService
    { provide: API_URL, useValue: environment.apiUrl },
    // Permission service - conecta lib/shared con lib/security
    { provide: PERMISSION_SERVICE, useExisting: AuthService },
    MatIconRegistry
  ]
};
