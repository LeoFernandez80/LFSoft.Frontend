import { AccessControl } from '@lib/common';
import { Person } from './person.model';

export class PersonResponse {
  person: Person = new Person();
  accessControl: AccessControl | null = null;
  validations: string[] = [];
  errores: string[] = [];
}
