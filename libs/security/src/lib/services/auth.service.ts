import { Injectable, inject, InjectionToken, Optional, Inject, DestroyRef } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, throwError } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { UserPermissionsService } from '@lib/security';

import { AuthenticatedUser } from '../models/authenticated-user.model';
import { EnumUserRole } from '../permissions/enums/user-role.enum';
import { Configuration, ConfigurationService } from '@lib/common';
import { GridConfigurationService } from '@lib/shared';
/**
 * Token para inyectar la URL de la API
 */
export const API_URL = new InjectionToken<string>('API_URL');

/**
 * Servicio de autenticación y autorización
 * Gestiona sesión de usuario y permisos
 */
@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private http = inject(HttpClient);
  private apiUrl: string;
  
  private _currentUser$ = new BehaviorSubject<AuthenticatedUser | null>(null);
  private _isAuthenticated$ = new BehaviorSubject<boolean>(false);

  /**
   * Observable del usuario actual
   */
  public currentUser$ = this._currentUser$.asObservable();

  /**
   * Observable del estado de autenticación
   */
  public isAuthenticated$ = this._isAuthenticated$.asObservable();
  private _destroyRef: DestroyRef | undefined;

  constructor(
    private _permissionsUserService: UserPermissionsService,
    private _configurationService: ConfigurationService,
    private _gridConfigurationService: GridConfigurationService,
    @Optional() @Inject(API_URL) apiUrl: string
  ) {
    this.apiUrl = `${apiUrl}/auth` || '';
    this._loadUserFromSession();
  }

  /**
   * Obtener usuario actual
   */
  getCurrentUser(): AuthenticatedUser | null {
    return this._currentUser$.getValue();
  }

  /**
   * Verificar si está autenticado
   */
  isAuthenticated(): boolean {
    return this._isAuthenticated$.getValue();
  }

  /**
   * Login del usuario con el backend
   * Si el usuario no existe, lo registra automáticamente
   * @param email Email del usuario
   * @param password Password del usuario
   */
  login(email: string, password: string): Observable<AuthenticatedUser> {
    const loginDto = { email, password };    
    return this.http.post<any>(`${this.apiUrl}/login`, loginDto).pipe(
      catchError(error => {
        // Si el usuario no existe (401), intentar registrarlo
        if (error.status === 401 && error.error?.message?.includes('Credenciales')) {
          console.log('Usuario no encontrado, registrando automáticamente...');
          //return this.register(email, password, 'Usuario', 'Nuevo');
        }
        return throwError(() => error);
      }),
      map(response => {        
        // Guardar el token
        if (response.token) {
          localStorage.setItem('token', response.token);
        }
        
        // Crear el usuario autenticado
        const user: AuthenticatedUser = {
          id: response.user.id,
          name: `${response.user.firstName || ''} ${response.user.lastName || ''}`.trim(),
          email: response.user.email,
          role: this.mapRole(response.user.role),
          //permissions: this._securityService.getPermissionsByRole(this.mapRole(response.user.role)),
          isAuthenticated: true
        };
        
        this._setCurrentUserToSessionStorage(user);
        this._permissionsUserService.loadUserPermissions(user.role || EnumUserRole.VIEWER);
        this._configurationService.loadUserConfiguration(user.id || '').subscribe(config => {
          this._configurationService.setConfiguration(config || new Configuration());
        });
        
        this._gridConfigurationService.loadUserGridConfiguration(user.id || '').subscribe( configs => {          
          this._gridConfigurationService.setUserGridConfiguration(configs || []);
        });

        return user;
      })
    );
  }

  /**
   * Registrar un nuevo usuario
   * @param email Email del usuario
   * @param password Password del usuario
   * @param firstName Nombre
   * @param lastName Apellido
   */
  register1(email: string, password: string, firstName?: string, lastName?: string): Observable<AuthenticatedUser> {
    const registerDto = { email, password, firstName, lastName };
    
    return this.http.post<any>(`${this.apiUrl}/register`, registerDto).pipe(
      map(response => {
        // Guardar el token
        if (response.token) {
          localStorage.setItem('token', response.token);
        }
        
        // Crear el usuario autenticado
        const user: AuthenticatedUser = {
          id: response.user.id,
          name: `${response.user.firstName || ''} ${response.user.lastName || ''}`.trim(),
          email: response.user.email,
          role: this.mapRole(response.user.role),
          //permissions: this._securityService.getPermissionsByRole(this.mapRole(response.user.role)),
          isAuthenticated: true
        };
        
        this._setCurrentUserToSessionStorage(user);
        return user;
      }),
      catchError(error => {
        console.error('Error during registration:', error);
        return throwError(() => error);
      })
    );
  }

  /**
   * Mapear el rol del backend al rol del frontend
   */
  private mapRole(backendRole: string): EnumUserRole {
    switch (backendRole) {
      case 'ADMIN':
          return EnumUserRole.ADMIN;
      case 'USER':
        return EnumUserRole.USER;
      case 'VIEWER':
        return EnumUserRole.VIEWER;
      default:
        return EnumUserRole.EMPTY;
    }
  }

  /**
   * Logout del usuario
   */
  logout(): void {
    this._currentUser$.next(null);
    this._isAuthenticated$.next(false);
    localStorage.removeItem('token');
    localStorage.removeItem('config');
    sessionStorage.removeItem('currentUser');

  }

  // /**
  //  * Verificar si el usuario tiene un permiso específico
  //  * @param permission Permiso a verificar
  //  */
  // hasPermission(permission: EnumPermissionType): boolean {
  //   const user = this._currentUser$.getValue();
  //   if (!user) {
  //     return false;
  //   }
  //   return user.permissions.includes(permission);
  // }

  // /**
  //  * Verificar si el usuario tiene alguno de los permisos especificados
  //  * @param permissions Array de permisos
  //  */
  // hasAnyPermission(...permissions: EnumPermissionType[]): boolean {
  //   const user = this._currentUser$.getValue();
  //   if (!user) {
  //     return false;
  //   }
  //   return permissions.some(permission => user.permissions.includes(permission));
  // }

  // /**
  //  * Verificar si el usuario tiene todos los permisos especificados
  //  * @param permissions Array de permisos
  //  */
  // hasAllPermissions(...permissions: EnumPermissionType[]): boolean {
  //   const user = this._currentUser$.getValue();    
  //   if (!user) {
  //     return false;
  //   }
  //   //return permissions.every(permission => user.permissions.includes(permission));
  //   return permissions.every(permission => user.permissions.includes(permission));
  // }


  hasPermission(literalKeyType: string): boolean {
    const user = this._currentUser$.getValue();    
    if (!user) {
      return false;
    }
    //return permissions.every(permission => user.permissions.includes(permission));
    return  this._permissionsUserService.enabledLiteralKeys().includes( literalKeyType);
  }

  hasAnyPermission(...permissions: string[]): boolean {
    const user = this._currentUser$.getValue();    
    if (!user) {
      return false;
    }
    return permissions.some(permission => this._permissionsUserService.enabledLiteralKeys().includes( permission)); 

  }

  hasAllPermissions(...permissions: string[]): boolean {
    const user = this._currentUser$.getValue();    
    if (!user) {
      return false;
    }
    //return permissions.every(permission => user.permissions.includes(permission));
    return permissions.every(permission => this._permissionsUserService.enabledLiteralKeys().includes( permission));
  }


  /**
   * Establecer usuario actual
   */
  private _setCurrentUserToSessionStorage(user: AuthenticatedUser): void {
    this._currentUser$.next(user);
    this._isAuthenticated$.next(true);
    // Guardar en session storage para persistencia
    sessionStorage.setItem('currentUser', JSON.stringify(user));
  }

  /**
   * Cargar usuario desde session storage
   */
  private _loadUserFromSession(): void {
    const userJson = sessionStorage.getItem('currentUser');
    if (userJson) {
      try {
        const user = JSON.parse(userJson) as AuthenticatedUser;
        this._setCurrentUserToSessionStorage(user);
        
        // Cargar permisos del usuario restaurado
        this._permissionsUserService.loadUserPermissions(user.role || EnumUserRole.VIEWER);
        // Cargar configuración del usuario restaurado
        this._configurationService.loadUserConfiguration(user.id || '').subscribe(config => {
          this._configurationService.setConfiguration(config || new Configuration());
        });
      } catch (error) {
        console.error('Error loading user from session:', error);
        this.logout();
      }
    }
  }
}
