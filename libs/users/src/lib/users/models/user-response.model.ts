import { AccessControl } from "@lib/common";
import { User } from "./user.model";

export class UserResponse {   
  user: User = new User();
  accessControl: AccessControl | null = null;
  validations: string[] = [];
  errores: string[] = [];
}


