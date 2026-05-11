import { EntityObject } from '@lib/common';

export class UnidadMedida extends EntityObject {
  unidadMedida_codigo: number = 0;
  unidadMedida_descripcion: string = '';
  unidadMedida_abreviatura: string = '';
  unidadMedida_activo: boolean = true;

  get objectType(): string {
    return 'eObject_UnidadMedida';
  }

  get objectKey(): string {
    return `${this.objectType}_${this.unidadMedida_codigo}`;
  }
}
