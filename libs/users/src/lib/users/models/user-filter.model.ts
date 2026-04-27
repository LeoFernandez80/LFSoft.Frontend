import { QueryParams } from "@lib/shared";
import { FilterObject } from "@lib/common";

export class UserFilter extends FilterObject implements QueryParams {
  user_id?: number=0;
  user_username?: string='';
  user_role?: number=0

  toString(): string {
    const params = new URLSearchParams();
    if (this.user_id !== undefined && this.user_id !== null) {
      params.append('user_id', this.user_id.toString());
    }
    if (this.user_username !== undefined && this.user_username !== null && this.user_username !== '') {
      params.append('user_username', this.user_username);
    }
    if (this.user_role !== undefined && this.user_role !== null && this.user_role !== 0) {
      params.append('user_role', this.user_role.toString());
    }
    if (params.toString() === '') {
      return '';
    }
    return params.toString();
  }
}
