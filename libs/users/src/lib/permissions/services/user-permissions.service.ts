import { Injectable } from '@angular/core';
import { EnumUserRole } from '../../../../../security/src/lib/enums/user-role.enum';
import { EnumActions } from '../../../../../common/src/lib/enums/actions.enum';
import { Action } from '@lib/shared';
import { PermisionsActionsService } from './permissions-actions.service';
import { UserPermissions } from '../models/user-permissions.model';
import { EnumLiteralKeys } from 'libs/common/src/lib/enums/literal-keys.enum';
import { UserRolFields } from '../models/user-rol-fields.model';

@Injectable({
  providedIn: 'root'
})
export class UserPermissionsService {

  private _permissionsUserBD: UserPermissions[] = [];
  private _permissionsUser: UserPermissions[] = [];
  
  private _userRolFieldsBD: UserRolFields[] = [];
  private _userRolFields: UserRolFields[] = [];

  constructor(private _actionsService: PermisionsActionsService) {  
    this._inicializePermissionsUserMOCK();
    this._inicializeUserRolFieldsMOCK();
  }

  loadUserPermissions(userRolId:EnumUserRole): void {
    const permissionsUser = this._permissionsUserBD.filter(permission => permission.userRolId === userRolId);    
    this._permissionsUser = permissionsUser;

    const userRolFields = this._userRolFieldsBD.filter(field => field.userRolId === userRolId);
    this._userRolFields = userRolFields;
    console.log("loadUserPermissions", userRolId, this._permissionsUser, this._userRolFields);
    
  }
  
  enabledActions(userRolId:EnumUserRole, tipeLiteralKey: string, conditions: string): Action[] {
    const permittedActions: Action[] = [];
    
    this._permissionsUser.forEach(permission => {
      if (permission.userRolId === userRolId && permission.eTypeLiteralKey === tipeLiteralKey && permission.permissionConditions === conditions) {
        const actions = permission.permitionsActions.split('|').filter(a => a !== '#' && a !== '');
        actions.forEach(actionStr => {
          const action = EnumActions[actionStr as keyof typeof EnumActions];
          if (action !== undefined) {
            permittedActions.push(this._actionsService.getAction(action));
          }
        });
      }
    });

    return permittedActions;
  }

  enabledLiteralKeys(): string[] {
    let permittedLiteralKeys: string[] = [];
    permittedLiteralKeys =this._permissionsUser.map(permission => permission.eTypeLiteralKey);
    return permittedLiteralKeys;
  }

  hideFields(userRolId:EnumUserRole, tipeLiteralKey: EnumLiteralKeys): string[] {
    console.log("hideFields", userRolId, tipeLiteralKey);
    const userRolField = this._userRolFields.find(field => field.userRolId === userRolId && field.eTypeLiteralKey === tipeLiteralKey);
    if (userRolField) {
      
      return userRolField.hiddenFields.split('|').filter(f => f !== '#' && f !== '');
    }
    return [];
  } 

  private _inicializePermissionsUserMOCK(): void {
    this._permissionsUserBD.push(
    {
      userRolId: EnumUserRole.ADMIN,
      eTypeLiteralKey: EnumLiteralKeys.eLiteralKey_Empty,
      permissionConditions: '#|V|#',
      permitionsActions: '#|eAction_OpenUsers|eAction_OpenEntities|#',
      caseId: 1
    },
    {
      userRolId: EnumUserRole.ADMIN,
      eTypeLiteralKey: EnumLiteralKeys.eModule_Users,
      permissionConditions: '#|V|#',
      permitionsActions: '#|eAction_OpenHome|eAction_OpenEntities|#',
      caseId: 1
    },
    {
      userRolId: EnumUserRole.ADMIN,
      eTypeLiteralKey: EnumLiteralKeys.eGrid_Users,
      permissionConditions: '#|V|#',
      permitionsActions: '#|eAction_Edit|#',
      caseId: 1
    },
    {
      userRolId: EnumUserRole.ADMIN,
      eTypeLiteralKey: EnumLiteralKeys.eModule_Entities,
      permissionConditions: '#|V|#',
      permitionsActions: '#|eAction_OpenUsers|#',
      caseId: 2
    },
    {
      userRolId: EnumUserRole.ADMIN,
      eTypeLiteralKey: EnumLiteralKeys.eForm_Users,
      permissionConditions: '#|V|#',
      permitionsActions: '#|eAction_Save|eAction_Cancel|#',
      caseId: 2
    },
    {
      userRolId: EnumUserRole.ADMIN,
      eTypeLiteralKey: EnumLiteralKeys.eModule_Articles,
      permissionConditions: '#|V|#',
      permitionsActions: '',
      caseId: 2
    },
    {
      userRolId: EnumUserRole.ADMIN,
      eTypeLiteralKey: EnumLiteralKeys.eModule_Customers,
      permissionConditions: '#|V|#',
      permitionsActions: '',
      caseId: 2
    },
    {
      userRolId: EnumUserRole.ADMIN,
      eTypeLiteralKey: EnumLiteralKeys.eModule_Documents,
      permissionConditions: '#|V|#',
      permitionsActions: '',
      caseId: 2
    },
    {
      userRolId: EnumUserRole.ADMIN,
      eTypeLiteralKey: EnumLiteralKeys.eModule_Invoices,
      permissionConditions: '#|V|#',
      permitionsActions: '',
      caseId: 2
    },
    {
      userRolId: EnumUserRole.ADMIN,
      eTypeLiteralKey: EnumLiteralKeys.eModule_Quotes,
      permissionConditions: '#|V|#',
      permitionsActions: '',
      caseId: 2
    },
    {
      userRolId: EnumUserRole.ADMIN,
      eTypeLiteralKey: EnumLiteralKeys.eModule_Persons,
      permissionConditions: '#|V|#',
      permitionsActions: '',
      caseId: 2
    },
    {
      userRolId: EnumUserRole.ADMIN,
      eTypeLiteralKey: EnumLiteralKeys.eForm_UsersConfig,
      permissionConditions: '#|V|#',
      permitionsActions: '',
      caseId: 2
    },
    {
      userRolId: EnumUserRole.ADMIN,
      eTypeLiteralKey: EnumLiteralKeys.eModule_Home,
      permissionConditions: '#|V|#',
      permitionsActions: '#|eAction_OpenUsers|eAction_OpenEntities|#',
      caseId: 1
    },
    {
      userRolId: EnumUserRole.VIEWER,
      eTypeLiteralKey: EnumLiteralKeys.eModule_Home,
      permissionConditions: '#|V|#',
      permitionsActions: '#|eAction_OpenUsers|eAction_OpenEntities|#',
      caseId: 1
    },
    {
      userRolId: EnumUserRole.VIEWER,
      eTypeLiteralKey: EnumLiteralKeys.eModule_Users,
      permissionConditions: '#|V|#',
      permitionsActions: '#|eAction_OpenHome|eAction_OpenEntities|#',
      caseId: 1
    },
    {
      userRolId: EnumUserRole.VIEWER,
      eTypeLiteralKey: EnumLiteralKeys.eGrid_Users,
      permissionConditions: '#|V|#',
      permitionsActions: '#|eAction_Edit|#',
      caseId: 1
    },
    {
      userRolId: EnumUserRole.VIEWER,
      eTypeLiteralKey: EnumLiteralKeys.eForm_Users,
      permissionConditions: '#|V|#',
      permitionsActions: '',
      caseId: 1
    });
  }

  private _inicializeUserRolFieldsMOCK(): void {
    this._userRolFieldsBD.push(
      {
        userRolId: EnumUserRole.ADMIN,
        eTypeLiteralKey: EnumLiteralKeys.eForm_Users,
        hiddenFields: 'user_role'
      },
      {
        userRolId: EnumUserRole.VIEWER,
        eTypeLiteralKey: EnumLiteralKeys.eForm_Users,
        hiddenFields: 'user_role|user_password|user_email'
      }
    );
  }
}
