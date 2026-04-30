import { QueryParams } from '@lib/shared';
import { FilterObject } from '@lib/common';

export class UserRoleFilter extends FilterObject implements QueryParams {
  userRolId?: string = '';
  userRolName?: string = '';
  userRolType?: string = '';

  toString(): string {
    const params = new URLSearchParams();
    if (this.userRolId) {
      params.append('userRolId', this.userRolId);
    }
    if (this.userRolName) {
      params.append('userRolName', this.userRolName);
    }
    if (this.userRolType) {
      params.append('userRolType', this.userRolType);
    }
    return params.toString();
  }
}
