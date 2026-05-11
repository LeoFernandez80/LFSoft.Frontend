import { QueryParams } from '@lib/shared';

export class UnidadMedidaFilter implements QueryParams {
  unidadMedida_codigo?: number;
  unidadMedida_descripcion?: string;
  unidadMedida_abreviatura?: string;

  toString(): string {
    const params = new URLSearchParams();

    if (this.unidadMedida_codigo !== undefined && this.unidadMedida_codigo > 0) {
      params.append('unidadMedida_codigo', String(this.unidadMedida_codigo));
    }

    if (this.unidadMedida_descripcion !== undefined && this.unidadMedida_descripcion !== null && this.unidadMedida_descripcion !== '') {
      params.append('unidadMedida_descripcion', this.unidadMedida_descripcion);
    }

    if (this.unidadMedida_abreviatura !== undefined && this.unidadMedida_abreviatura !== null && this.unidadMedida_abreviatura !== '') {
      params.append('unidadMedida_abreviatura', this.unidadMedida_abreviatura);
    }

    return params.toString();
  }
}
