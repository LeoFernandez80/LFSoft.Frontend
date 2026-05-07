import { QueryParams } from '@lib/shared';

export class ParidadFilter implements QueryParams {
  paridad_fecha?: string;

  toString(): string {
    const params = new URLSearchParams();
    if (this.paridad_fecha !== undefined && this.paridad_fecha !== null && this.paridad_fecha !== '') {
      params.append('paridad_fecha', this.paridad_fecha);
    }
    return params.toString();
  }
}
