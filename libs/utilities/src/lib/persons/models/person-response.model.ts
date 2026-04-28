import { Person } from './person.model';

export class PersonResponse {
  person: Person = new Person();
  validations: string[] = [];
  errores: string[] = [];
}
