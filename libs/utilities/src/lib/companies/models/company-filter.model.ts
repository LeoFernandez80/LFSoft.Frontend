import { FilterObject } from '@lib/common';
import { QueryParams } from '@lib/shared';

export class CompanyFilter extends FilterObject implements QueryParams {
  company_id?: number = 0;
  company_razonSocial?: string = '';
  company_tipo?: string = '';
  company_estado?: string = '';

  toString(): string {
    const params = new URLSearchParams();
    if (this.company_id !== undefined && this.company_id !== null && this.company_id !== 0)
      params.append('company_id', this.company_id.toString());
    if (this.company_razonSocial !== undefined && this.company_razonSocial !== null && this.company_razonSocial !== '')
      params.append('company_razonSocial', this.company_razonSocial);
    if (this.company_tipo !== undefined && this.company_tipo !== null && this.company_tipo !== '')
      params.append('company_tipo', this.company_tipo);
    if (this.company_estado !== undefined && this.company_estado !== null && this.company_estado !== '')
      params.append('company_estado', this.company_estado);
    if (params.toString() === '') return '';
    return params.toString();
  }
}




