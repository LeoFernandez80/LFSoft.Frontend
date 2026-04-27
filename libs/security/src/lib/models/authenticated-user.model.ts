//import { EnumPermissionType } from "../enums/enum-permission.type.enum";
import { EnumUserRole } from "../permissions/enums/user-role.enum";

/**
 * Información del usuario autenticado
 */
export interface AuthenticatedUser {
  id: string;
  name: string;
  email: string;
  role: EnumUserRole;
  //permissions: EnumPermissionType[];
  isAuthenticated: boolean;
}
