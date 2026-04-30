import { AccessControl } from '@lib/common';
import { UserRole } from './user-role.model';

export class UserRoleResponse {
  userRole: UserRole = new UserRole();
  accessControl: AccessControl | null = null;
  validations: string[] = [];
  errores: string[] = [];
}
