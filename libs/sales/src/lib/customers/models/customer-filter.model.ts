import { QueryParams } from '@lib/shared';
import { FilterObject } from 'libs/common/src/lib/models/filter-object.model';

export class CustomerFilter  implements QueryParams {
  id?: number;
  nombre?: string;
  apellido?: string;
  razonSocial?: string;
  documento?: string;
  email?: string;
  activo?: boolean;

  
  toString(): string {
    const params = new URLSearchParams();
    if (this.id !== undefined && this.id !== null) {
      params.append('id', this.id.toString());
    }
    if (this.nombre !== undefined && this.nombre !== null && this.nombre !== '') {
      params.append('nombre', this.nombre);
    }
    if (this.apellido !== undefined && this.apellido !== null && this.apellido !== '') {
      params.append('apellido', this.apellido);
    }
    if (this.razonSocial !== undefined && this.razonSocial !== null && this.razonSocial !== '') {
      params.append('razonSocial', this.razonSocial);
    }
    if (this.documento !== undefined && this.documento !== null && this.documento !== '') {
      params.append('documento', this.documento);
    }
    if (this.email !== undefined && this.email !== null && this.email !== '') {
      params.append('email', this.email);
    }
    if (this.activo !== undefined && this.activo !== null) {
      params.append('activo', this.activo.toString());
    }
    if (params.toString() === '') {
      return '';
    }
    return params.toString();
  }
}
