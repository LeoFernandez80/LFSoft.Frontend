import { FilterObject } from '@lib/common';
import { QueryParams } from '@lib/shared';

export class EntityFilter extends FilterObject implements QueryParams {
  entity_id?: number = 0;
  entity_description?: string = '';

  toString(): string {
    const params = new URLSearchParams();
    if (this.entity_id !== undefined && this.entity_id !== null && this.entity_id !== 0)
      params.append('entity_id', this.entity_id.toString());
    if (this.entity_description !== undefined && this.entity_description !== null && this.entity_description !== '')
      params.append('entity_description', this.entity_description);
    if (params.toString() === '') return '';
    return params.toString();
  }
}
