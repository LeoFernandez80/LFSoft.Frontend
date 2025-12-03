import { EnumPermissionType } from "../../../components/security-module/models/enum-permission.type.model";
import { EnumActionsStyle } from "../enums/actions-styles.enums";
import { EnumActionsType } from "../enums/actions-type.enums";
import { EnumActionsViewType } from "../enums/actions-view-type.enums";

export class Action {
  label: string; // Texto visible en el botón
  actionType: EnumActionsType; // Identificador único de la acción
  icon?: string; // (Opcional) Nombre del ícono Material
  disabled?: boolean; // (Opcional) Si el botón está deshabilitado
  viewType?: EnumActionsViewType; // (Opcional) Tipo de vista del botón
  style?: EnumActionsStyle; // (Opcional) Estilo del botón
  permisions?: EnumPermissionType[]; // (Opcional) Permisos necesarios para mostrar la acción

    constructor(label: string, actionType: EnumActionsType, icon?: string, 
      disabled?: boolean, viewType?: EnumActionsViewType, style?: EnumActionsStyle, 
      permisions?: EnumPermissionType[]) {
      this.label = label; 
      this.actionType = actionType;
      this.icon = icon;
      this.disabled = disabled;
      this.viewType = viewType || EnumActionsViewType.viewFooter;
      this.style = style || EnumActionsStyle.primary;
      this.permisions = permisions;
    }
}