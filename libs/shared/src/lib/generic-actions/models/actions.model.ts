import { EnumActions } from "libs/common/src/lib/enums/actions.enum";
import { EnumActionsStyle } from "../enums/actions-styles.enums";
import { EnumActionsViewType } from "../enums/actions-view-type.enums";
import { EnumActionsType } from "../enums/actions-type.enums";

export class Action {
  label: string; // Texto visible en el botón
  actionType: EnumActions | EnumActionsType; // Identificador único de la acción
  icon?: string; // (Opcional) Nombre del ícono Material
  disabled?: boolean; // (Opcional) Si el botón está deshabilitado
  viewType?: EnumActionsViewType; // (Opcional) Tipo de vista del botón
  style?: EnumActionsStyle; // (Opcional) Estilo del botón
  permisions?: string[]; // (Opcional) Permisos necesarios para mostrar la acción

    constructor(label: string, actionType: EnumActions | EnumActionsType, icon?: string, 
      disabled?: boolean, viewType?: EnumActionsViewType, style?: EnumActionsStyle, 
      permisions?: string[]) {
      this.label = label; 
      this.actionType = actionType;
      this.icon = icon;
      this.disabled = disabled;
      this.viewType = viewType || EnumActionsViewType.viewFooter;
      this.style = style || EnumActionsStyle.primary;
      this.permisions = permisions;
    }
}
