import { Grupo } from './grupo.model';

export class GrupoResponse {
  grupo: Grupo = new Grupo();
  accessControl: any | null = null;
  validations: string[] = [];
  errores: string[] = [];
}

