import { Entity } from './entity.model';

export class EntityResponse {
  entity: Entity = new Entity();
  validations: string[] = [];
  errores: string[] = [];
}