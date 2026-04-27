import { EnumLiteralKeys } from "libs/common/src/lib/enums/literal-keys.enum";
import { EnumUserRole } from "../../enums/user-role.enum";

export class UserPermissions{
  userRolId: EnumUserRole;
  eTypeLiteralKey: EnumLiteralKeys;
  permissionConditions: string;
  permitionsActions: string;
  caseId: number;

  constructor() {
    this.userRolId = EnumUserRole.VIEWER;
    this.eTypeLiteralKey = EnumLiteralKeys.eLiteralKey_Empty;
    this.permissionConditions = '';
    this.permitionsActions = '';
    this.caseId = 0;
  } 
}