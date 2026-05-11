import { EntityObject } from '@lib/common';

export class Familia extends EntityObject {
  familia_codigo: number = 0;
  familia_descripcion: string = '';

  get objectType(): string { return 'eObject_Familia'; }
  get objectKey(): string { return `${this.objectType}_${this.familia_codigo.toString()}`; }
}
