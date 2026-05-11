import { AccessControl } from '@lib/common';
import { AlicuotaIva } from './alicuota-iva.model';

export class AlicuotaIvaResponse {
  alicuotaIva: AlicuotaIva = new AlicuotaIva();
  accessControl: AccessControl | null = null;
  validations: string[] = [];
  errores: string[] = [];
}
