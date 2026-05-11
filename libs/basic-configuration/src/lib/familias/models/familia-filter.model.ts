import { FilterObject } from '@lib/common';
import { QueryParams } from '@lib/shared';

export class FamiliaFilter extends FilterObject implements QueryParams {
  familia_codigo?: number = 0;
  familia_descripcion?: string = '';

  toString(): string {
    const params = new URLSearchParams();
    if (this.familia_codigo !== undefined && this.familia_codigo !== null && this.familia_codigo !== 0)
      params.append('familia_codigo', this.familia_codigo.toString());
    if (this.familia_descripcion !== undefined && this.familia_descripcion !== null && this.familia_descripcion !== '')
      params.append('familia_descripcion', this.familia_descripcion);
    return params.toString();
  }
}
