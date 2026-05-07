import { GridObject } from '@lib/common';

export class PersonGrid extends GridObject {
  person_id: number = 0;
  person_name: string = '';
  person_lastname: string = '';
  person_nickname: string = '';
  person_fullname: string = '';
  person_active: boolean = true;
  person_maritalStatus: string = '';
}
