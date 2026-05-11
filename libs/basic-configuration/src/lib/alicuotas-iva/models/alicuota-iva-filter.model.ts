import { QueryParams } from '@lib/shared';

export class AlicuotaIvaFilter implements QueryParams {
  alicuotaIva_codigo?: number;
  alicuotaIva_descripcion?: string;

  toString(): string {
    const params = new URLSearchParams();
    if (this.alicuotaIva_codigo !== undefined && this.alicuotaIva_codigo !== null && this.alicuotaIva_codigo > 0) {
      params.append('alicuotaIva_codigo', `${this.alicuotaIva_codigo}`);
    }
    if (this.alicuotaIva_descripcion !== undefined && this.alicuotaIva_descripcion !== null && this.alicuotaIva_descripcion !== '') {
      params.append('alicuotaIva_descripcion', this.alicuotaIva_descripcion);
    }
    return params.toString();
  }
}
