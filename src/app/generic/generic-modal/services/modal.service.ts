import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, Subject } from 'rxjs';
import { IModalConfig } from '../models/modal-config.model';
import { EnumActionsType } from '../../generic-actions/enums/actions-type.enums';

@Injectable({
  providedIn: 'root'
})
export class ModalService {
  private modalConfig = new BehaviorSubject<IModalConfig | null>(null);
  private isVisible = new BehaviorSubject<boolean>(false);
  private actionSelected = new Subject<EnumActionsType>();

  showModal(config: IModalConfig): Observable<EnumActionsType> {
    this.modalConfig.next(config);
    this.isVisible.next(true);
    return this.actionSelected.asObservable();
  }

  hideModal(action: EnumActionsType = EnumActionsType.actionCancel): void {
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