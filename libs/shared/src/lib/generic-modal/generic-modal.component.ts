import { Component, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ModalService } from './services/modal.service';
import { IModalConfig } from './models/modal-config.model';
import { Subscription } from 'rxjs';
import { GenericActionsComponent } from '../generic-actions/generic-actions.component';
import { Action } from '../generic-actions/models/actions.model';
import { EnumActionsType } from '../generic-actions/enums/actions-type.enums';
import { EnumActionsViewType } from '../generic-actions/enums/actions-view-type.enums';
import { EnumActionsStyle } from '../generic-actions/enums/actions-styles.enums';
import { ActionService } from '../generic-actions/services/actions.service';
import { TranslatePipe } from '../generic-translate/translate.pipe';
import { EnumActions } from 'libs/common/src/lib/enums/actions.enum';

@Component({
  selector: 'lfsoft-shared-modal',
  standalone: true,
  imports: [CommonModule, TranslatePipe, GenericActionsComponent],
  templateUrl: './generic-modal.component.html',
  styleUrls: ['./generic-modal.component.scss'],
  providers: [ActionService]
})
export class GenericModalComponent implements OnDestroy {
  modalConfig: IModalConfig = {} as IModalConfig;
  isVisible: boolean = false;
  private subscriptions: Subscription[] = [];

  constructor(
    private modalService: ModalService,
    private actionService: ActionService
  ) {
    this.subscriptions.push(
      this.modalService.getModalConfig().subscribe(config => {
        if (!config) {
          return;
        }
        this.modalConfig = config;
        if (config?.showActions) {
          const actions = [
            new Action(
              config.acceptLabel || 'acept',
              EnumActionsType.actionAccept,
              'check',
              false,
              EnumActionsViewType.viewFooter,
              EnumActionsStyle.primary
            ),
            new Action(
              config.cancelLabel || 'Cancelar',
              EnumActionsType.actionCancel,
              'close',
              false,
              EnumActionsViewType.viewFooter,
              EnumActionsStyle.primary
            )
          ];
          this.actionService.setActions(actions);
        }
      }),
      this.modalService.getIsVisible().subscribe(visible => {
        this.isVisible = visible;
        if (!visible) {
          this.actionService.setActions([]);
        }
      })
    );
  }

  ngOnDestroy(): void {
    this.subscriptions.forEach(sub => sub.unsubscribe());
    this.actionService.setActions([]);    
  }

  onActionSelected(action: EnumActionsType | EnumActions): void {
    this.modalService.hideModal(action);
  }

  close(): void {
    if (!this.modalConfig?.blockClose) {
      this.modalService.hideModal(EnumActionsType.actionCancel);
    }
  }

  stopPropagation(event: MouseEvent): void {
    event.stopPropagation();
  }
}
