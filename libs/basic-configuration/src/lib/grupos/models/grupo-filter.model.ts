import { QueryParams } from '@lib/shared';

export class GrupoFilter implements QueryParams {
  grupo_codigo: number = 0;
  grupo_descripcion: string = '';
  grupo_familiaCodigo: number = 0;

  toString(): string {
    const params = new URLSearchParams();
    if (this.grupo_codigo > 0) {
      params.append('grupo_codigo', String(this.grupo_codigo));
    }
    if (this.grupo_descripcion.trim() !== '') {
      params.append('grupo_descripcion', this.grupo_descripcion.trim());
    }
    if (this.grupo_familiaCodigo > 0) {
      params.append('grupo_familiaCodigo', String(this.grupo_familiaCodigo));
    }
    return params.toString();
  }
}

