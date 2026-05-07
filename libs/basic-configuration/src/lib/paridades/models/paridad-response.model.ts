import { Paridad } from './paridad.model';

export class ParidadResponse {
  paridad: Paridad = new Paridad();
  accessControl: any | null = null;
  validations: string[] = [];
  errores: string[] = [];
}
