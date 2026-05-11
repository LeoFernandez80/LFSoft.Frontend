import { EntityObject } from '@lib/common';

export class Actividad extends EntityObject {
  actividad_codigo: string = '';
  actividad_descripcion: string = '';
  actividad_colorHojaRGB: number = 0;

  get objectType(): string {
    return 'eObject_Actividad';
  }

  get objectKey(): string {
    return `${this.objectType}_${this.actividad_codigo}`;
  }
}
