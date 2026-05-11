import { QueryParams } from '@lib/shared';

export class ActividadFilter implements QueryParams {
  actividad_codigo?: string;
  actividad_descripcion?: string;

  toString(): string {
    const params = new URLSearchParams();
    if (this.actividad_codigo !== undefined && this.actividad_codigo !== null && this.actividad_codigo !== '') {
      params.append('actividad_codigo', this.actividad_codigo);
    }
    if (this.actividad_descripcion !== undefined && this.actividad_descripcion !== null && this.actividad_descripcion !== '') {
      params.append('actividad_descripcion', this.actividad_descripcion);
    }
    return params.toString();
  }
}
