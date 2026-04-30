# 20 Backend Module Integration

## Objetivo
Cerrar la integracion del modulo nuevo en la libreria y en el arbol de modulos de Nest para que quede disponible en runtime.

## Dependencias
- Pasos 14 al 19 finalizados.

## Integracion en la libreria
1. Verificar export en `libs/<domain>/src/index.ts`.
2. Si el dominio tiene modulo raiz, importar y exportar `<EntityPlural>Module` en ese modulo.

## Integracion en app principal
1. Importar el modulo de dominio donde corresponda (ejemplo: modulo agregado en `app.module.ts` o modulo agregado del dominio).
2. Verificar que no haya colisiones de rutas entre controllers.

## Integracion de seguridad
1. Confirmar que `JwtAuthGuard` aplica a todos los endpoints privados.
2. Confirmar que `@Public()` solo esta en endpoints justificados.

## Integracion de contratos
1. Revisar alineacion frontend-backend para:
   - payload de `create` y `update`
   - query params de `list`
   - contrato de `open` y `close`
2. Validar nombres de propiedades (`snake_case` o `camelCase`) segun contrato real.

## Checklist de salida
- El modulo se puede importar y usar desde la aplicacion.
- Las rutas del controller quedan disponibles.
- No hay diferencias de contrato entre frontend y backend.
