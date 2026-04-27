import { EnumUserRole } from "@lib/security";
import { EntityObject } from "@lib/common";

export class User extends EntityObject {     
  user_id: any='';    
  user_username: string='';
  user_email  : string='';
  user_password: string='';
  user_firstName: string='';
  user_lastName: string='';
  user_role: EnumUserRole = EnumUserRole.USER;  
  personId: number=0;  
  user_active: boolean=false;
  
  get objectType(): string {
    return 'eObject_User';
  }

  get objectKey(): string {
    return `${this.objectType}_${this.user_id.toString()}`;
  }

}


