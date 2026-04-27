import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, Subject } from 'rxjs';
import { IModalConfig } from '../models/modal-config.model';
import { EnumActionsType } from '../../generic-actions/enums/actions-type.enums';
import { EnumActions } from 'libs/common/src/lib/enums/actions.enum';

@Injectable({
  providedIn: 'root'
})
export class ModalService {
  private modalConfig = new BehaviorSubject<IModalConfig | null>(null);
  private isVisible = new BehaviorSubject<boolean>(false);
  private actionSelected = new Subject<EnumActionsType | EnumActions>();

  showModal(config: IModalConfig): Observable<EnumActionsType | EnumActions> {
    this.modalConfig.next(config);
    this.isVisible.next(true);
    return this.actionSelected.asObservable();
  }

  hideModal(action: EnumActionsType | EnumActions = EnumActionsType.actionCancel): void {
    this.actionSelected.next(action);
    this.isVisible.next(false);
    this.modalConfig.next(null);    
  }

  getModalConfig(): Observable<IModalConfig | null> {
    return this.modalConfig.asObservable();
  }

  getIsVisible(): Observable<boolean> {
    return this.isVisible.asObservable();
  }
}
