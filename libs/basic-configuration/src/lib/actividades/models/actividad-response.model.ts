import { Actividad } from './actividad.model';

export class ActividadResponse {
  actividad: Actividad = new Actividad();
  accessControl: any | null = null;
  validations: string[] = [];
  errores: string[] = [];
}
