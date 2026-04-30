
import { EntityObject } from '@lib/common';

export class UserRoles extends EntityObject {
  userRolId: string;
  userRolName: string;
  userRolType: string;
  userRolDescription: string;

  constructor() {
    super();
    this.userRolId = '';
    this.userRolName = '';
    this.userRolType = '';
    this.userRolDescription = '';
  }

  get objectType(): string {
    return 'eObject_UserRole';
  }

  get objectKey(): string {
    return `${this.objectType}_${this.userRolId || '0'}`;
  }
}
