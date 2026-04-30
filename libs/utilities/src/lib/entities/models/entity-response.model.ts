import { AccessControl } from '@lib/common';
import { Entity } from './entity.model';

export class EntityResponse {
  entity: Entity = new Entity();
  accessControl: AccessControl | null = null;
  validations: string[] = [];
  errores: string[] = [];
}
