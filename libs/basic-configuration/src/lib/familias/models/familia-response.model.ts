import { Familia } from './familia.model';

export class FamiliaResponse {
  familia: Familia = new Familia();
  accessControl: any | null = null;
  validations: string[] = [];
  errores: string[] = [];
}
