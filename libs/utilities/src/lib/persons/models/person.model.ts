import { EntityObject } from '@lib/common';

export class Person extends EntityObject {
  person_id: number = 0;
  person_name: string = '';
  person_lastName: string = '';
  person_fullName: string = '';

  get objectType(): string { return 'eObject_Person'; }
  get objectKey(): string { return `${this.objectType}_${this.person_id.toString()}`; }
}
