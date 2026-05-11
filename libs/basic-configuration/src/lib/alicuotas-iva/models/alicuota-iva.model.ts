import { EntityObject } from '@lib/common';

export class AlicuotaIva extends EntityObject {
  alicuotaIva_codigo: number = 0;
  alicuotaIva_descripcion: string = '';
  alicuotaIva_tasa: number = 0;

  get objectType(): string {
    return 'eObject_AlicuotaIva';
  }

  get objectKey(): string {
    return `${this.objectType}_${this.alicuotaIva_codigo}`;
  }
}
