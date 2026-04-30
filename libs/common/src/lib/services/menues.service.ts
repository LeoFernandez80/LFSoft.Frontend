import { Injectable } from '@angular/core';
import { DrawerService, EnumActionsType, UrlService } from '@lib/shared';
import { EnumActions } from '../enums/actions.enum';

@Injectable({
  providedIn: 'root',
})
export class MenuesService {

  private _menues: Map<EnumActionsType | EnumActions, string[]>; // Mapa para almacenar los menús y sus rutas
  
  constructor(private _UrlService: UrlService, private _drawerService: DrawerService) { 
    this._menues = new Map<EnumActionsType | EnumActions, string[]>();
    this._inicilizeMenues();
  }

  openMenu(action: EnumActionsType | EnumActions): void {
    if (action === EnumActions.eAction_OpenConfig || action === EnumActionsType.openConfig) {
      this._openConfiguration();
      return;
    }        
    const route = this._menues.get(action);
    if (route) {
      this._UrlService.openUrl(route);
    }   
  }

  private _openConfiguration(): void {
    this._openDrawer();
  }

  private _openDrawer() {
    this._drawerService.show({
      width: '600px',
      position: 'right'
    })
  }
  private _inicilizeMenues(): void {
    this._menues.set(EnumActions.eAction_Login, ['login']);
    this._menues.set(EnumActions.eAction_OpenHome, ['home']);
    this._menues.set(EnumActions.eAction_OpenEntities, ['entities-module', 'entities']);
    this._menues.set(EnumActions.eAction_OpenPersons, ['persons-module', 'persons']);
    this._menues.set(EnumActions.eAction_OpenCustomers, ['customers-module', 'customers']);
    this._menues.set(EnumActions.eAction_OpenArticles, ['articles-module', 'articles']);
    this._menues.set(EnumActions.eAction_OpenQuotes, ['quotes-module', 'quotes']);
    this._menues.set(EnumActions.eAction_OpenDocuments, ['documents-module', 'documents']);
    this._menues.set(EnumActions.eAction_OpenInvoices, ['invoices-module', 'invoices']);
    this._menues.set(EnumActions.eAction_OpenUsers, ['users-module', 'users']); 
    this._menues.set(EnumActions.eAction_OpenUserRoles, ['user-roles-module', 'user-role']);
    this._menues.set(EnumActions.eAction_Logout, ['logout']);
    

    this._menues.set( EnumActionsType.openUsers, ['users-module', 'users']); 

  }
}
