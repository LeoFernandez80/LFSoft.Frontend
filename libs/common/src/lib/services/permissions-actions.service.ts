import { Injectable } from '@angular/core';
import { Action, EnumActionsStyle, EnumActionsType, EnumActionsViewType } from '@lib/shared';
import { EnumActionsIcons } from 'libs/shared/src/lib/generic-actions/enums/actions-icons.enums';
import { EnumActions } from '../enums/actions.enum';

@Injectable({
  providedIn: 'root'
})
export class PermisionsActionsService {
  private _actions: Map<EnumActions, Action> = new Map();

  constructor() {
    this._loadActions();
  }

  private _loadActions(): void {
    //Ver si es necesario tener el enum de icons de acciones separado

    //Crear todas las acciones aquí
    this._actions.set(EnumActions.eAction_OpenHome, new Action('BUTTON.home', EnumActions.eAction_OpenHome, EnumActionsIcons.openHome, false, EnumActionsViewType.view16x16));
    this._actions.set(EnumActions.eAction_OpenArticles, new Action('BUTTON.articles', EnumActions.eAction_OpenArticles, EnumActionsIcons.openArticles, false, EnumActionsViewType.view16x16));
    this._actions.set(EnumActions.eAction_OpenUsers, new Action('BUTTON.users', EnumActions.eAction_OpenUsers, EnumActionsIcons.openUsers, false, EnumActionsViewType.view16x16));
    this._actions.set(EnumActions.eAction_OpenEntities, new Action('BUTTON.entities', EnumActions.eAction_OpenEntities, EnumActionsIcons.openEntities, false, EnumActionsViewType.view16x16));
    this._actions.set(EnumActions.eAction_OpenCustomers, new Action('BUTTON.customers', EnumActions.eAction_OpenCustomers, EnumActionsIcons.openCustomers, false, EnumActionsViewType.view16x16));
    this._actions.set(EnumActions.eAction_OpenDocuments, new Action('BUTTON.documents', EnumActions.eAction_OpenDocuments, EnumActionsIcons.openDocuments, false, EnumActionsViewType.view16x16));
    this._actions.set(EnumActions.eAction_OpenQuotes, new Action('BUTTON.quotes', EnumActions.eAction_OpenQuotes, EnumActionsIcons.openQuotes, false, EnumActionsViewType.view16x16));
    this._actions.set(EnumActions.eAction_OpenInvoices, new Action('BUTTON.invoices', EnumActions.eAction_OpenInvoices, EnumActionsIcons.openInvoices, false, EnumActionsViewType.view16x16));
    this._actions.set(EnumActions.eAction_OpenConfig, new Action('BUTTON.config', EnumActions.eAction_OpenConfig, EnumActionsIcons.openConfig, false, EnumActionsViewType.view16x16));
    this._actions.set(EnumActions.eAction_OpenPersons, new Action('BUTTON.persons', EnumActions.eAction_OpenPersons, EnumActionsIcons.openPersons, false, EnumActionsViewType.view16x16));
    
    this._actions.set(EnumActions.eAction_New, new Action('BUTTON.new', EnumActions.eAction_New, EnumActionsIcons.actionNew, false, EnumActionsViewType.view16x16));
    this._actions.set(EnumActions.eAction_Edit, new Action('BUTTON.edit', EnumActions.eAction_Edit, EnumActionsIcons.actionEdit, false, EnumActionsViewType.view16x16));
    this._actions.set(EnumActions.eAction_Delete, new Action('BUTTON.delete', EnumActions.eAction_Delete, EnumActionsIcons.actionDelete, false, EnumActionsViewType.view16x16));
    this._actions.set(EnumActions.eAction_Logout, new Action('BUTTON.logout', EnumActions.eAction_Logout, EnumActionsIcons.actionLogout, false, EnumActionsViewType.view16x16));
    this._actions.set(EnumActions.eAction_Save, new Action('BUTTON.save', EnumActions.eAction_Save, EnumActionsIcons.actionSave, false,  EnumActionsViewType.viewFooter,EnumActionsStyle.primary));
    this._actions.set(EnumActions.eAction_Cancel, new Action('BUTTON.cancel', EnumActions.eAction_Cancel, EnumActionsIcons.actionCancel, false, EnumActionsViewType.viewFooter,EnumActionsStyle.primary));
  }
  
  getAction(actionEnum: EnumActions): Action {
    return this._actions.get(actionEnum)!;
  }
}
