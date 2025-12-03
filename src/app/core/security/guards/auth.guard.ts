import { Injectable } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot, UrlTree, Router } from '@angular/router';
import { Observable } from 'rxjs';
import { AuthService } from '../services/auth.service';
import { EnumPermissionType } from '../../../components/security-module/models/enum-permission.type.model';

/**
 * Guard que protege rutas requiriendo autenticación
 */
@Injectable({
  providedIn: 'root'
})
export class AuthGuard implements CanActivate {
  constructor(
    private _authService: AuthService,
    private _router: Router
  ) {}

  canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): Observable<boolean | UrlTree> | Promise<boolean | UrlTree> | boolean | UrlTree {
    if (this._authService.isAuthenticated()) {
      return true;
    }

    // Redirigir a login si no está autenticado
    // En versión completa: this._router.navigate(['/login']);
    console.warn('Access denied: User not authenticated');
    return false;
  }
}

/**
 * Guard que verifica permisos específicos
 */
@Injectable({
  providedIn: 'root'
})
export class PermissionGuard implements CanActivate {
  constructor(
    private _authService: AuthService,
    private _router: Router
  ) {}

  canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): Observable<boolean | UrlTree> | Promise<boolean | UrlTree> | boolean | UrlTree {
    // Obtener permisos requeridos de la ruta (data.requiredPermissions)
    const requiredPermissions = route.data['requiredPermissions'] as EnumPermissionType[] | undefined;

    if (!requiredPermissions || requiredPermissions.length === 0) {
      return true;
    }

    // Verificar si el usuario tiene todos los permisos requeridos
    const hasPermission = this._authService.hasAllPermissions(...requiredPermissions);

    if (hasPermission) {
      return true;
    }

    // Acceso denegado
    console.warn(`Access denied: Missing permissions ${requiredPermissions.join(', ')}`);
    return false;
  }
}

/**
 * Guard para verificar cualquiera de los permisos especificados
 */
@Injectable({
  providedIn: 'root'
})
export class AnyPermissionGuard implements CanActivate {
  constructor(
    private _authService: AuthService,
    private _router: Router
  ) {}

  canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): Observable<boolean | UrlTree> | Promise<boolean | UrlTree> | boolean | UrlTree {
    const requiredPermissions = route.data['requiredPermissions'] as EnumPermissionType[] | undefined;

    if (!requiredPermissions || requiredPermissions.length === 0) {
      return true;
    }

    // Verificar si el usuario tiene al menos uno de los permisos
    const hasPermission = this._authService.hasAnyPermission(...requiredPermissions);

    if (hasPermission) {
      return true;
    }

    console.warn(`Access denied: Missing any of permissions ${requiredPermissions.join(', ')}`);
    return false;
  }
}
