import { EntityObject } from '@lib/common';

export class Grupo extends EntityObject {
  grupo_codigo: number = 0;
  grupo_descripcion: string = '';
  grupo_familiaCodigo: number = 0;
  grupo_isActive: boolean = true;
  grupo_createdAt: Date | null = null;
  grupo_updatedAt: Date | null = null;

  get objectType(): string {
    return 'eObject_Grupo';
  }

  get objectKey(): string {
    return `${this.objectType}_${this.grupo_codigo}`;
  }
}


