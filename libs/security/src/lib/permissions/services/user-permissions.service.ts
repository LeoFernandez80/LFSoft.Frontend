import { Injectable } from '@angular/core';
import { Action } from '@lib/shared';
import { EnumActions, EnumLiteralKeys, PermisionsActionsService } from '@lib/common';
import { EnumUserRole } from '../enums/user-role.enum';
import { UserPermissions } from '../models/user-permissions.model';
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
    const userRolFields = this._userRolFieldsBD.filter(field => field.userRolId === userRolId);

    // Fallback to VIEWER for roles without explicit mock permissions (e.g. USER).
    if (permissionsUser.length === 0 && userRolId !== EnumUserRole.VIEWER) {
      this._permissionsUser = this._permissionsUserBD.filter(permission => permission.userRolId === EnumUserRole.VIEWER);
      this._userRolFields = this._userRolFieldsBD.filter(field => field.userRolId === EnumUserRole.VIEWER);
      return;
    }

    this._permissionsUser = permissionsUser;
    this._userRolFields = userRolFields;
    
  }
  
  enabledActions(userRolId:EnumUserRole, tipeLiteralKey: string, conditions: string): Action[] {
    const permittedActions: Action[] = [];
    
    this._permissionsUser.forEach(permission => {
      if (permission.userRolId === userRolId && permission.eTypeLiteralKey === tipeLiteralKey && permission.permissionConditions === conditions) {
        const actions = permission.permitionsActions.split('|').filter(a => a !== '#' && a !== '');
        actions.forEach(actionStr => {
          const action = EnumActions[actionStr as keyof typeof EnumActions];
          if (action !== undefined) {
            const resolvedAction = this._actionsService.getAction(action);
            if (resolvedAction) {
              permittedActions.push(resolvedAction);
            }
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
    const userRolField = this._userRolFields.find(field => field.userRolId === userRolId && field.eTypeLiteralKey === tipeLiteralKey);
    if (userRolField) {
      
      return userRolField.hiddenFields.split('|').filter(f => f !== '#' && f !== '');
    }
    return [];
  } 

  private _inicializeUsersAndPermissions_VIEWER_MOCK(): void {
    this._permissionsUserBD.push(
    );
  }

  private _inicializeBasicConfigurations_VIEWER_MOCK(): void {
    this._permissionsUserBD.push(
      {
        userRolId: EnumUserRole.VIEWER,
        eTypeLiteralKey: EnumLiteralKeys.eModule_BasicConfiguration,
        permissionConditions: '#|V|#',
        permitionsActions: '#|eAction_OpenEntities|eAction_OpenCompanies|eAction_OpenPersons|#',
        caseId: 1
      },
    //Entities
    {
      userRolId: EnumUserRole.VIEWER,
      eTypeLiteralKey: EnumLiteralKeys.eModule_Entities,
      permissionConditions: '#|V|#',
      permitionsActions: '',
      caseId: 2
    },
    {
      userRolId: EnumUserRole.VIEWER,
      eTypeLiteralKey: EnumLiteralKeys.eGrid_Entities,
      permissionConditions: '#|V|#',
      permitionsActions: '#|eAction_Edit|#',
      caseId: 1
    },
    {
      userRolId: EnumUserRole.VIEWER,
      eTypeLiteralKey: EnumLiteralKeys.eForm_Entities,
      permissionConditions: '#|V|#',
      permitionsActions: '#|eAction_Cancel|#',
      caseId: 1
    }, 

    //Companies
    {
      userRolId: EnumUserRole.VIEWER,
      eTypeLiteralKey: EnumLiteralKeys.eModule_Companies,
      permissionConditions: '#|V|#',
      permitionsActions: '',
      caseId: 2
    },
    {
      userRolId: EnumUserRole.VIEWER,
      eTypeLiteralKey: EnumLiteralKeys.eGrid_Companies,
      permissionConditions: '#|V|#',
      permitionsActions: '#|eAction_Edit|#',
      caseId: 1
    },
    {
      userRolId: EnumUserRole.VIEWER,
      eTypeLiteralKey: EnumLiteralKeys.eForm_Companies,
      permissionConditions: '#|V|#',
      permitionsActions: '#|eAction_Cancel|#',
      caseId: 1
    }, 

    //Persons
    {
      userRolId: EnumUserRole.VIEWER,
      eTypeLiteralKey: EnumLiteralKeys.eModule_Persons,
      permissionConditions: '#|V|#',
      permitionsActions: '',
      caseId: 2
    },
    {
      userRolId: EnumUserRole.VIEWER,
      eTypeLiteralKey: EnumLiteralKeys.eGrid_Persons,
      permissionConditions: '#|V|#',
      permitionsActions: '#|eAction_Edit|#',
      caseId: 1
    },    
    {
      userRolId: EnumUserRole.VIEWER,
      eTypeLiteralKey: EnumLiteralKeys.eForm_Persons,
      permissionConditions: '#|V|#',
      permitionsActions: '#|eAction_Cancel|#',
      caseId: 1
    },
    );
  }

  private _inicializeBasicConfigurations_ADMIN_MOCK(): void {
    this._permissionsUserBD.push(
      {
        userRolId: EnumUserRole.ADMIN,
        eTypeLiteralKey: EnumLiteralKeys.eModule_BasicConfiguration,
        permissionConditions: '#|V|#',
        permitionsActions: '#|eAction_OpenHome|eAction_OpenParidades|eAction_OpenEntities|eAction_OpenCompanies|eAction_OpenPersons|#',
        caseId: 1
      },

      //Entities
      {
        userRolId: EnumUserRole.ADMIN,
        eTypeLiteralKey: EnumLiteralKeys.eModule_Entities,
        permissionConditions: '#|V|#',
        permitionsActions: '#|eAction_OpenBasicConfiguration|eAction_New|#',
        caseId: 2
      },
      {
        userRolId: EnumUserRole.ADMIN,
        eTypeLiteralKey: EnumLiteralKeys.eGrid_Entities,
        permissionConditions: '#|V|#',
        permitionsActions: '#|eAction_Edit|#',
        caseId: 1
      },
      {
        userRolId: EnumUserRole.ADMIN,
        eTypeLiteralKey: EnumLiteralKeys.eForm_Entities,
        permissionConditions: '#|V|#',
        permitionsActions: '#|eAction_Save|eAction_Cancel|#',
        caseId: 1
      },
      //Companies
      {
        userRolId: EnumUserRole.ADMIN,
        eTypeLiteralKey: EnumLiteralKeys.eModule_Companies,
        permissionConditions: '#|V|#',
        permitionsActions: '#|eAction_OpenBasicConfiguration|eAction_New|#',
        caseId: 2
      },
      {
        userRolId: EnumUserRole.ADMIN,
        eTypeLiteralKey: EnumLiteralKeys.eGrid_Companies,
        permissionConditions: '#|V|#',
        permitionsActions: '#|eAction_Edit|#',
        caseId: 1
      },
      {
        userRolId: EnumUserRole.ADMIN,
        eTypeLiteralKey: EnumLiteralKeys.eForm_Companies,
        permissionConditions: '#|V|#',
        permitionsActions: '#|eAction_Save|eAction_Cancel|#',
        caseId: 1
      },
      

      //Persons
      {
        userRolId: EnumUserRole.ADMIN,
        eTypeLiteralKey: EnumLiteralKeys.eModule_Persons,
        permissionConditions: '#|V|#',
        permitionsActions: '#|eAction_OpenBasicConfiguration|eAction_New|#',
        caseId: 2
      },
       {
        userRolId: EnumUserRole.ADMIN,
        eTypeLiteralKey: EnumLiteralKeys.eGrid_Persons,
        permissionConditions: '#|V|#',
        permitionsActions: '#|eAction_Edit|#',
        caseId: 1
      },
      {
        userRolId: EnumUserRole.ADMIN,
        eTypeLiteralKey: EnumLiteralKeys.eForm_Persons,
        permissionConditions: '#|V|#',
        permitionsActions: '#|eAction_Save|eAction_Cancel|#',
        caseId: 1
      },
     
      //Paridades
      {
        userRolId: EnumUserRole.ADMIN,
        eTypeLiteralKey: EnumLiteralKeys.eModule_Paridades,
        permissionConditions: '#|V|#',
        permitionsActions: '#|eAction_OpenBasicConfiguration|eAction_New|#',
        caseId: 2
      },
      {
        userRolId: EnumUserRole.ADMIN,
        eTypeLiteralKey: EnumLiteralKeys.eGrid_Paridades,
        permissionConditions: '#|V|#',
        permitionsActions: '#|eAction_Edit|eAction_Delete|eAction_Open|#',
        caseId: 1
      },
      {
        userRolId: EnumUserRole.ADMIN,
        eTypeLiteralKey: EnumLiteralKeys.eForm_Paridades,
        permissionConditions: '#|V|#',
        permitionsActions: '#|eAction_Save|eAction_Cancel|#',
        caseId: 1
      }
    );
  }

  private _inicializeUsersAndPermissions_ADMIN_MOCK(): void {
    this._permissionsUserBD.push(
      {
        userRolId: EnumUserRole.ADMIN,
        eTypeLiteralKey: EnumLiteralKeys.eModule_UsersAndSecurity,
        permissionConditions: '#|V|#',
        permitionsActions: '#|eAction_OpenHome|eAction_OpenUsers|eAction_OpenUserRoles|#',
        caseId: 1
      },   
      //Users   
      {
        userRolId: EnumUserRole.ADMIN,
        eTypeLiteralKey: EnumLiteralKeys.eModule_Users,
        permissionConditions: '#|V|#',
        permitionsActions: '#|eAction_OpenHome|eAction_OpenUsersAndSecurity|eAction_OpenUserRoles|#',
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
        eTypeLiteralKey: EnumLiteralKeys.eForm_Users,
        permissionConditions: '#|V|#',
        permitionsActions: '#|eAction_Save|eAction_Cancel|#',
        caseId: 2
      },
      //User Roles
      {
        userRolId: EnumUserRole.ADMIN,
        eTypeLiteralKey: EnumLiteralKeys.eModule_UserRoles,
        permissionConditions: '#|V|#',
        permitionsActions: '#|eAction_OpenHome|eAction_OpenUsersAndSecurity|eAction_OpenUsers|#',
        caseId: 1
      },      
      {
        userRolId: EnumUserRole.ADMIN,
        eTypeLiteralKey: EnumLiteralKeys.eGrid_UserRoles,
        permissionConditions: '#|V|#',
        permitionsActions: '#|eAction_Edit|#',
        caseId: 1
      },
      {
        userRolId: EnumUserRole.ADMIN,
        eTypeLiteralKey: EnumLiteralKeys.eForm_UserRole,
        permissionConditions: '#|V|#',
        permitionsActions: '#|eAction_Save|eAction_Cancel|#',
        caseId: 1
      },

      //user configuration form
      {
        userRolId: EnumUserRole.ADMIN,
        eTypeLiteralKey: EnumLiteralKeys.eForm_UsersConfig,
        permissionConditions: '#|V|#',
        permitionsActions: '',
        caseId: 2
      },
    );
  }

  private _inicializeOthers_ADMIN_MOCK(): void {
    this._permissionsUserBD.push(        
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
      
    );
  }

  private _inicializePermissionsUserMOCK(): void {
    this._permissionsUserBD.push(
    {
      userRolId: EnumUserRole.ADMIN,
      eTypeLiteralKey: EnumLiteralKeys.eModule_Home,
      permissionConditions: '#|V|#',
      permitionsActions: '#|eAction_OpenUsersAndSecurity|eAction_OpenBasicConfiguration|#',
      caseId: 1
    },  
    {
      userRolId: EnumUserRole.VIEWER,
      eTypeLiteralKey: EnumLiteralKeys.eModule_Home,
      permissionConditions: '#|V|#',
      permitionsActions: '#|eAction_OpenBasicConfiguration|#',
      caseId: 1
    },
  );
    this._inicializeBasicConfigurations_ADMIN_MOCK();
    this._inicializeBasicConfigurations_VIEWER_MOCK();
    this._inicializeUsersAndPermissions_ADMIN_MOCK();
    this._inicializeUsersAndPermissions_VIEWER_MOCK();
    this._inicializeOthers_ADMIN_MOCK();
    console.log("permissions", this._permissionsUserBD);
    
  }

  private _inicializeUserRolFieldsMOCK(): void {
    this._userRolFieldsBD.push(
      {
        userRolId: EnumUserRole.ADMIN,
        eTypeLiteralKey: EnumLiteralKeys.eForm_Users,
        hiddenFields: ''
      },
      {
        userRolId: EnumUserRole.ADMIN,
        eTypeLiteralKey: EnumLiteralKeys.eForm_Entities,
        hiddenFields: ''
      },
      {
        userRolId: EnumUserRole.ADMIN,
        eTypeLiteralKey: EnumLiteralKeys.eForm_Companies,
        hiddenFields: 'empresa_id'
      },
      {
        userRolId: EnumUserRole.VIEWER,
        eTypeLiteralKey: EnumLiteralKeys.eForm_Users,
        hiddenFields: 'user_role|user_password|user_email'
      },
      {
        userRolId: EnumUserRole.VIEWER,
        eTypeLiteralKey: EnumLiteralKeys.eForm_Entities,
        hiddenFields: 'entity_active'
      },
      {
        userRolId: EnumUserRole.VIEWER,
        eTypeLiteralKey: EnumLiteralKeys.eForm_Companies,
        hiddenFields: 'empresa_id'
      },
      {
        userRolId: EnumUserRole.ADMIN,
        eTypeLiteralKey: EnumLiteralKeys.eForm_Persons,
        hiddenFields: 'person_id'
      },
      {
        userRolId: EnumUserRole.VIEWER,
        eTypeLiteralKey: EnumLiteralKeys.eForm_Persons,
        hiddenFields: 'person_id'
      },
      {
        userRolId: EnumUserRole.ADMIN,
        eTypeLiteralKey: EnumLiteralKeys.eForm_UserRole,
        hiddenFields: 'userRolId'
      },
      {
        userRolId: EnumUserRole.VIEWER,
        eTypeLiteralKey: EnumLiteralKeys.eForm_UserRole,
        hiddenFields: 'userRolId'
      },
      {
        userRolId: EnumUserRole.ADMIN,
        eTypeLiteralKey: EnumLiteralKeys.eForm_Paridades,
        hiddenFields: 'paridad_fecha'
      },
      {
        userRolId: EnumUserRole.VIEWER,
        eTypeLiteralKey: EnumLiteralKeys.eForm_Paridades,
        hiddenFields: 'paridad_fecha'
      }
    );
  }
}
