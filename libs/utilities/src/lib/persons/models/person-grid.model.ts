import { GridObject } from '@lib/common';

export class PersonGrid extends GridObject {
  person_id: number = 0;
  person_name: string = '';
  person_lastName: string = '';
  person_fullName: string = '';
}
