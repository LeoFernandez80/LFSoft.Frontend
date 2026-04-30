import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { DrawerConfig } from '../models/drawer-config.model';
import { EnumActionsType } from '../../generic-actions/enums/actions-type.enums';

@Injectable({
    providedIn: 'root'
})
export class DrawerService {
    private _isVisible = new BehaviorSubject<boolean>(false);
    private _config = new BehaviorSubject<DrawerConfig | null>(null); 
    private _actionSelected = new BehaviorSubject<EnumActionsType>(EnumActionsType.actionNone);
    private _data = new BehaviorSubject<any>(null);

    show(config?: Partial<DrawerConfig>): void {
        const drawerConfig = new DrawerConfig(config);        
        this._config.next(drawerConfig);
        this._data.next(drawerConfig.data);
        this._isVisible.next(true);
    }

    hide(action: EnumActionsType = EnumActionsType.actionNone): void {
        this._isVisible.next(false);
        this._config.next(null);
        this._actionSelected.next(action);        
    }

    getIsVisible(): Observable<boolean> {
        return this._isVisible.asObservable();
    }

    afterClose(): Observable<EnumActionsType> {
        return this._actionSelected.asObservable();
    }

    getConfig(): Observable<DrawerConfig | null> {
        return this._config.asObservable();
    }

    getData(): Observable<any> {
        return this._data.asObservable();
    }
}
