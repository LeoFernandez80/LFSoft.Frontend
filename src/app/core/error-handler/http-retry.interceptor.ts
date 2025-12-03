import { Injectable } from '@angular/core';
import { HttpEvent, HttpHandler, HttpInterceptor, HttpRequest, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError, timer } from 'rxjs';
import { retryWhen, mergeMap } from 'rxjs/operators';

/**
 * Interceptor que aplica retry para llamadas HTTP fallidas.
 * Evita reintentos para errores 4xx (bad requests / auth) y reintenta en 5xx o fallos de red.
 */
@Injectable()
export class HttpRetryInterceptor implements HttpInterceptor {
  // número de reintentos y delay base
  private readonly maxRetries = 2;
  private readonly scalingDuration = 1000; // ms

  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    return next.handle(req).pipe(
      retryWhen(errors => errors.pipe(
        mergeMap((error, retryCount) => {
          const shouldRetry = this._shouldRetry(error);
          if (retryCount >= this.maxRetries || !shouldRetry) {
            return throwError(() => error);
          }
          // Exponential backoff
          const backoffTime = Math.pow(2, retryCount) * this.scalingDuration;
          return timer(backoffTime);
        })
      ))
    );
  }

  private _shouldRetry(error: any): boolean {
    if (!error) return false;
    // No reintentar en errores del cliente (4xx)
    if (error instanceof HttpErrorResponse) {
      if (error.status >= 400 && error.status < 500) {
        return false;
      }
      // Reintentar en 5xx y network errors
      return true;
    }
    // En caso de otros tipos de errores (p.ej. network), permitir retry
    return true;
  }
}
