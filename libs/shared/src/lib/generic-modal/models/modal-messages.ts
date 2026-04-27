import { IModalConfig } from './modal-config.model';

export const CONFIRM_CANCEL: IModalConfig = {
      text: 'MESSAGE.confirmCancel',
      icon: 'fa fa-info-circle',
      title: 'TITLE.persons',
      showCloseButton: true,
      showActions: true,
      acceptLabel: 'BUTTON.accept',
      cancelLabel: 'BUTTON.cancel'
};

export const CONFIRM_DELETE: IModalConfig = {
      text: 'MESSAGE.confirmDelete',
      icon: 'fa fa-info-circle',
      title: 'TITLE.persons',
      showCloseButton: true,
      showActions: true,
      acceptLabel: 'BUTTON.accept',
      cancelLabel: 'BUTTON.cancel'
};
