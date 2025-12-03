import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { EnumPermissionType } from '../models/enum-permission.type.model';
import { UserRole } from '../models/user-role.model';

@Injectable({
  providedIn: 'root'
})
export class PermissionsService {
  private _ROLE_PERMISSIONS: { [key in UserRole]: EnumPermissionType[] } =[] as any;

  constructor() {
    this._loasdRolePermissions().subscribe(data => this._ROLE_PERMISSIONS = data);
  }

  getPermissionsByRole(role: UserRole): EnumPermissionType[] {
    const permissions = this._ROLE_PERMISSIONS[role] || [];
    return permissions;
  }

  private _loasdRolePermissions(): Observable<{ [key in UserRole]: EnumPermissionType[] }> {
    return of({
      [UserRole.ADMIN]: [
          // Todos los permisos para admin
          EnumPermissionType.VIEW_ENTITIES,
          EnumPermissionType.CREATE_ENTITY,
          EnumPermissionType.EDIT_ENTITY,
          EnumPermissionType.DELETE_ENTITY,
          EnumPermissionType.OPEN_ENTITY,
          EnumPermissionType.VIEW_PERSONS,
          EnumPermissionType.CREATE_PERSON,
          EnumPermissionType.EDIT_PERSON,
          EnumPermissionType.DELETE_PERSON,
          EnumPermissionType.VIEW_ARTICLES,
          EnumPermissionType.CREATE_ARTICLE,
          EnumPermissionType.EDIT_ARTICLE,
          EnumPermissionType.DELETE_ARTICLE,
          EnumPermissionType.VIEW_QUOTES,
          EnumPermissionType.CREATE_QUOTE,
          EnumPermissionType.EDIT_QUOTE,
          EnumPermissionType.DELETE_QUOTE,
          EnumPermissionType.VIEW_CONFIG,
          EnumPermissionType.EDIT_CONFIG
      ],
      [UserRole.USER]: [
        // Usuario normal puede ver y crear/editar
        EnumPermissionType.VIEW_ENTITIES,
        EnumPermissionType.CREATE_ENTITY,
        EnumPermissionType.EDIT_ENTITY,
        EnumPermissionType.VIEW_PERSONS,
        EnumPermissionType.CREATE_PERSON,
        EnumPermissionType.EDIT_PERSON,
        EnumPermissionType.VIEW_ARTICLES,
        EnumPermissionType.CREATE_ARTICLE,
        EnumPermissionType.EDIT_ARTICLE,
        EnumPermissionType.VIEW_QUOTES,
        EnumPermissionType.CREATE_QUOTE,
        EnumPermissionType.EDIT_QUOTE
      ],
      [UserRole.VIEWER]: [
        // Viewer solo puede ver
        EnumPermissionType.VIEW_ENTITIES,
        EnumPermissionType.VIEW_PERSONS,
        EnumPermissionType.VIEW_ARTICLES,
        EnumPermissionType.VIEW_QUOTES
      ]}
    );
  }
  
}