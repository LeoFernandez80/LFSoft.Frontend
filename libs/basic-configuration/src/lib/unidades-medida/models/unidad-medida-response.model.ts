import { UnidadMedida } from './unidad-medida.model';

export class UnidadMedidaResponse {
  unidadMedida: UnidadMedida = new UnidadMedida();
  accessControl: any | null = null;
  validations: string[] = [];
  errores: string[] = [];
}
