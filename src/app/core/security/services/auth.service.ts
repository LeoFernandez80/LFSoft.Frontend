import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { BehaviorSubject, Observable, throwError } from 'rxjs';
import { catchError, map, switchMap } from 'rxjs/operators';
import { AuthenticatedUser } from '../../../components/security-module/models/authenticated-user.model';
import { UserRole } from '../../../components/security-module/models/user-role.model';
import { PermissionsService } from '../../../components/security-module/services/permissions.service';
import { EnumPermissionType } from '../../../components/security-module/models/enum-permission.type.model';
import { environment } from '../../../../environments/environment';

/**
 * Servicio de autenticación y autorización
 * Gestiona sesión de usuario y permisos
 */
@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.entitiesApiUrl}/auth`;
  
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

  constructor(private _securityService: PermissionsService) {
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
          return this.register(email, password, 'Usuario', 'Nuevo');
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
          permissions: this._securityService.getPermissionsByRole(this.mapRole(response.user.role)),
          isAuthenticated: true
        };
        
        this._setCurrentUser(user);
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
  register(email: string, password: string, firstName?: string, lastName?: string): Observable<AuthenticatedUser> {
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
          permissions: this._securityService.getPermissionsByRole(this.mapRole(response.user.role)),
          isAuthenticated: true
        };
        
        this._setCurrentUser(user);
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
  private mapRole(backendRole: string): UserRole {
    switch (backendRole) {
      case 'ADMIN':
      case 'SUPER_ADMIN':
        return UserRole.ADMIN;
      case 'USER':
      default:
        return UserRole.USER;
    }
  }

  /**
   * Logout del usuario
   */
  logout(): void {
    this._currentUser$.next(null);
    this._isAuthenticated$.next(false);
    localStorage.removeItem('token');
    sessionStorage.removeItem('currentUser');
  }

  /**
   * Verificar si el usuario tiene un permiso específico
   * @param permission Permiso a verificar
   */
  hasPermission(permission: EnumPermissionType): boolean {
    const user = this._currentUser$.getValue();
    if (!user) {
      return false;
    }
    return user.permissions.includes(permission);
  }

  /**
   * Verificar si el usuario tiene alguno de los permisos especificados
   * @param permissions Array de permisos
   */
  hasAnyPermission(...permissions: EnumPermissionType[]): boolean {
    const user = this._currentUser$.getValue();
    if (!user) {
      return false;
    }
    return permissions.some(permission => user.permissions.includes(permission));
  }

  /**
   * Verificar si el usuario tiene todos los permisos especificados
   * @param permissions Array de permisos
   */
  hasAllPermissions(...permissions: EnumPermissionType[]): boolean {
    const user = this._currentUser$.getValue();    
    if (!user) {
      return false;
    }
    return permissions.every(permission => user.permissions.includes(permission));
  }

  /**
   * Establecer usuario actual
   */
  private _setCurrentUser(user: AuthenticatedUser): void {
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
        this._setCurrentUser(user);
      } catch (error) {
        console.error('Error loading user from session:', error);
        this.logout();
      }
    }
  }
}
