import { Injectable } from "@angular/core";
import { BehaviorSubject, Observable } from "rxjs";
import { EnumActionsType } from "../enums/actions-type.enums";
import { Action } from "../models/actions.model";
import { EnumActions } from "libs/common/src/lib/enums/actions.enum";

@Injectable({
  providedIn: 'root'
})
export class ActionService {

  private _actions$: BehaviorSubject<Action[]> = new BehaviorSubject<Action[]>([]);

  constructor() { }

  disable(actionTypeId: EnumActionsType | EnumActions): void {
    const currentActions = this._actions$.getValue();
    const newActions = currentActions.map(action => {
      if (action.actionType == actionTypeId) {
        
        action.disabled = true;
      }      
      return action;
    });
    this._actions$.next(newActions);
  }
  
  enable(actionTypeId: EnumActionsType | EnumActions): void {
    const currentActions = this._actions$.getValue();
    const newActions = currentActions.map(action => {
      if (action.actionType == actionTypeId) {
        action.disabled = false;
      }
      return action;
    });
    this._actions$.next(newActions);
  }

  setActions(actions: Action[]): void {
    this._actions$.next(actions);
  }
  
  getActions(): Observable<Action[]> {    
    return this._actions$.asObservable();
  }
  
  clearActions(): void {
    this._actions$.next([]);
  }

  removeAction(actionTypeId: EnumActionsType): void {
    const currentActions = this._actions$.getValue();
    const newActions = currentActions.filter(action => action.actionType !== actionTypeId);
    this._actions$.next(newActions);
  }

}
