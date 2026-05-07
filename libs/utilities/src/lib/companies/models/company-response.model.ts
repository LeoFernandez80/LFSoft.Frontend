import { AccessControl } from '@lib/common';
import { Company } from './company.model';

export class CompanyResponse {
  company: Company = new Company();
  accessControl: AccessControl | null = null;
  validations: string[] = [];
  errores: string[] = [];
}




