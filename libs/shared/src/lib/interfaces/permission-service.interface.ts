import { InjectionToken } from '@angular/core';

/**
 * Interfaz que define el contrato para servicios de permisos
 * Debe ser implementada por cualquier servicio que proporcione funcionalidad de permisos
 */
export interface IPermissionService {
  /**
   * Verifica si el usuario tiene un permiso específico
   * @param permission Permiso a verificar
   */
  hasPermission(permission: any): boolean;

  /**
   * Verifica si el usuario tiene alguno de los permisos especificados
   * @param permissions Array de permisos
   */
  hasAnyPermission(...permissions: any[]): boolean;

  /**
   * Verifica si el usuario tiene todos los permisos especificados
   * @param permissions Array de permisos
   */
  hasAllPermissions(...permissions: any[]): boolean;
}

/**
 * InjectionToken para inyectar el servicio de permisos
 * Permite desacoplar la librería shared de la implementación concreta de permisos
 */
export const PERMISSION_SERVICE = new InjectionToken<IPermissionService>('PERMISSION_SERVICE');
