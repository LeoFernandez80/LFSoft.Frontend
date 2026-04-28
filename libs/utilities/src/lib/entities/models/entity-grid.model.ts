import { GridObject } from '@lib/common';

export class EntityGrid extends GridObject {
  entity_id: number = 0;
  entity_description: string = '';
  entity_active: boolean = true;
}
