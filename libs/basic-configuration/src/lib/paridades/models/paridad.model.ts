import { EntityObject } from '@lib/common';

export class Paridad extends EntityObject {
  paridad_fecha: string = '';
  paridad_fechaCorrespondeA: string = '';
  paridad_dolar: number = 0;
  paridad_euro: number = 0;
  paridad_dolarDivisa: number = 0;
  paridad_euroDivisa: number = 0;
  paridad_usuario: string = '';

  get objectType(): string {
    return 'eObject_Paridad';
  }

  get objectKey(): string {
    return `${this.objectType}_${this.paridad_fecha}`;
  }
}
