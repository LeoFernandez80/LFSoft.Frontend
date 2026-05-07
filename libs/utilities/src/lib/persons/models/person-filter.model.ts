import { FilterObject } from '@lib/common';
import { QueryParams } from '@lib/shared';

export class PersonFilter extends FilterObject implements QueryParams {
  person_id?: number = 0;
  person_name?: string = '';
  person_lastname?: string = '';
  person_nickname?: string = '';
  person_fullname?: string = '';
  person_active?: boolean | null = null;
  person_maritalStatus?: string = '';

  toString(): string {
    const params = new URLSearchParams();
    if (this.person_id !== undefined && this.person_id !== null && this.person_id !== 0)
      params.append('person_id', this.person_id.toString());
    if (this.person_name !== undefined && this.person_name !== null && this.person_name !== '')
      params.append('person_name', this.person_name);
    if (this.person_lastname !== undefined && this.person_lastname !== null && this.person_lastname !== '')
      params.append('person_lastname', this.person_lastname);
    if (this.person_nickname !== undefined && this.person_nickname !== null && this.person_nickname !== '')
      params.append('person_nickname', this.person_nickname);
    if (this.person_fullname !== undefined && this.person_fullname !== null && this.person_fullname !== '')
      params.append('person_fullname', this.person_fullname);
    if (this.person_active !== undefined && this.person_active !== null)
      params.append('person_active', this.person_active.toString());
    if (this.person_maritalStatus !== undefined && this.person_maritalStatus !== null && this.person_maritalStatus !== '')
      params.append('person_maritalStatus', this.person_maritalStatus);
    if (params.toString() === '') return '';
    return params.toString();
  }
}
