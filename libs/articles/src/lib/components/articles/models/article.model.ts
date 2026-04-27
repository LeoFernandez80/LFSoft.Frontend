import { EntityObject } from "libs/common/src/lib/models/entity-object.model";

export class Article extends EntityObject {
  //grid
  id: number = 0;
  //grid
  codigoAsy: string = '';
  //grid
  description: string = '';
  //grid
  listprice: number = 0;
  revendedorsPrice: number = 0;
  codigoProvider: string = '';
  descriptionProvider: string = '';
  get objectType(): string {
    return 'eObject_Article';
  }
  get objectKey(): string {
    return `${this.objectType}_${this.id.toString()}`;
  }
}
