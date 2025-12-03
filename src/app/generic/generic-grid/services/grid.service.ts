import { Injectable } from "@angular/core";
import { BehaviorSubject, Observable } from "rxjs";
import { Action } from "../../generic-actions/models/actions.model";
import { EnumActionsType } from "../../generic-actions/enums/actions-type.enums";
import { ActionService } from "../../generic-actions/services/actions.service";
import { GridColumn } from "../models/grid-column.model";

@Injectable({
  providedIn: 'any'
})
export class GridService<T> {
    
  private _data$: BehaviorSubject<T[]> = new BehaviorSubject<T[]>([]);
  private _columns$: BehaviorSubject<GridColumn<T>[]> = new BehaviorSubject<GridColumn<T>[]>([]);
  private _actions$: BehaviorSubject<Action[]> =  new BehaviorSubject<Action[]>([]);
  
  constructor(private _actionService: ActionService) { }

  setData(data: T[]): void {
    this._data$.next(data);
  }
  
  clear(): void {
    this._data$.next([]);
  }
  
  getData(): Observable<T[]> {
    return this._data$.asObservable();
  }

  setColumns(columns: any[]): void {
    this._columns$.next(columns);
  }
  
  getColumns(): Observable<any[]> {
    return this._columns$.asObservable();
  }


  disable(actionTypeId: EnumActionsType): void {
    this._actionService.disable(actionTypeId);
  }
  
  enable(actionTypeId: EnumActionsType): void {
    this._actionService.enable(actionTypeId);
  }

  setActions(actions: Action[]): void {
    this._actions$.next(actions);    
  }
  
  getActions(): Observable<Action[]> {
    return this._actions$.asObservable();
  }
  
  clearActions(): void {
    this._actionService.clearActions();
  }

  removeAction(actionTypeId: EnumActionsType): void {
    this._actionService.removeAction(actionTypeId);
  }
}
