import { IModalConfig } from "./modal-config.model";

export const CONFIRM_CANCEL: IModalConfig = {
      text: 'MESSAGE.confirmCancel',
      icon: 'fa fa-info-circle', // Opcional: clase del ícono (FontAwesome u otro)
      title: 'TITLE.persons', // Opcional
      showCloseButton: true, // Opcional
      showActions: true, // Opcional
      acceptLabel: 'BUTTON.acept', // Opcional
      cancelLabel: 'BUTTON.cancel' // Opcional
}

export const CONFIRM_DELETE: IModalConfig = {
      text: 'MESSAGE.confirmDelete',
      icon: 'fa fa-info-circle', // Opcional: clase del ícono (FontAwesome u otro)
      title: 'TITLE.persons', // Opcional
      showCloseButton: true, // Opcional
      showActions: true, // Opcional
      acceptLabel: 'BUTTON.acept', // Opcional
      cancelLabel: 'BUTTON.cancel' // Opcional
}