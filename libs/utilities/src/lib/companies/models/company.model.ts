import { EntityObject } from '@lib/common';

export class Company extends EntityObject {
  company_id: number = 0;
  company_razonSocial: string = '';
  company_tipo: string = '';
  company_estado: string = '';
  company_observacion: string = '';

  get objectType(): string { return 'eObject_Company'; }
  get objectKey(): string { return `${this.objectType}_${this.company_id.toString()}`; }
}




