import { EntityObject } from '@lib/common';

export class Entity extends EntityObject {
  entity_id: number = 0;
  entity_description: string = '';
  entity_active: boolean = true;

  get objectType(): string { return 'eObject_Entity'; }
  get objectKey(): string { return `${this.objectType}_${this.entity_id.toString()}`; }
}
