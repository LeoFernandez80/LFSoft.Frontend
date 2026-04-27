import { InjectionToken } from '@angular/core';
import { EntityObject } from '@lib/common';

/**
 * Interfaz que define el contrato para servicios de permisos
 * Debe ser implementada por cualquier servicio que proporcione funcionalidad de permisos
 */
export interface ISectionForm {
  isLoading: boolean
  get data(): EntityObject
  get modified(): boolean
  get valid(): boolean
  get required(): boolean
}
  