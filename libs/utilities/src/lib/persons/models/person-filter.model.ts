import { FilterObject } from '@lib/common';
import { QueryParams } from '@lib/shared';

export class PersonFilter extends FilterObject implements QueryParams {
  person_id?: number = 0;
  person_name?: string = '';
  person_lastName?: string = '';

  toString(): string {
    const params = new URLSearchParams();
    if (this.person_id !== undefined && this.person_id !== null && this.person_id !== 0)
      params.append('id', this.person_id.toString());
    if (this.person_name !== undefined && this.person_name !== null && this.person_name !== '')
      params.append('name', this.person_name);
    if (this.person_lastName !== undefined && this.person_lastName !== null && this.person_lastName !== '')
      params.append('lastName', this.person_lastName);
    if (params.toString() === '') return '';
    return params.toString();
  }
}
