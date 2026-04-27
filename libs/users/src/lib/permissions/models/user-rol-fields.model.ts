import { EnumLiteralKeys } from "libs/common/src/lib/enums/literal-keys.enum";
import { EnumUserRole } from "../../../../../security/src/lib/enums/user-role.enum";

export class UserRolFields{
  userRolId: EnumUserRole;
  eTypeLiteralKey: EnumLiteralKeys;
  hiddenFields: string;

  constructor() {
    this.userRolId = EnumUserRole.VIEWER;
    this.eTypeLiteralKey = EnumLiteralKeys.eLiteralKey_Empty;
    this.hiddenFields = '';
  } 
}