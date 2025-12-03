import { EnumPermissionType } from "./enum-permission.type.model";
import { UserRole } from "./user-role.model";

/**
 * Información del usuario autenticado
 */
export interface AuthenticatedUser {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  permissions: EnumPermissionType[];
  isAuthenticated: boolean;
}
