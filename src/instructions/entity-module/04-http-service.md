# 04 Http Service

## Objetivo
Describir la implementacion del servicio HTTP del modulo para que siga un contrato operativo uniforme con el resto de la UI.

## Dependencias
- Los modelos base ya existen.
- La API del backend ya tiene definidos endpoints y payloads.

## Archivo objetivo
- `http-services/<entity-plural>.service.ts`

## Estructura recomendada
1. Imports Angular: `Injectable`, `inject`, `HttpClient`, `HttpHeaders`.
2. Imports RxJS: `Observable`, `catchError`, `throwError`.
3. Imports compartidos: `PageFilter`, `PaginatedList`, `ConfigurationService`, `Terminal`.
4. Imports de modelos propios: `<Entity-Singular>`, `<Entity-Singular>Grid`, `<Entity-Singular>Filter`, `<Entity-Singular>Response`.
5. Uso de `environment.apiUrl` para construir `apiUrl`.

## Clases internas sugeridas
- `HTTPResponse` cuando la respuesta tipada sea local al servicio.
- `HTTPRequest` cuando el backend espere una entidad anidada mas datos de terminal.

## Operaciones esperadas
1. `getList(pageFilter, filterParameters)`
   - Combinar `pageFilter.toString()` con `filterParameters.toString()`.
   - Retornar `Observable<PaginatedList<<Entity-Singular>Grid>>`.
2. `getById(id)`
   - Obtener una entidad por id.
3. `open(id)`
   - Obtener una entidad para apertura controlada.
   - Enviar `terminalId` y `terminalName` si el backend lo requiere.
4. `create(entity)`
   - Construir request con entidad + terminal.
5. `update(entity)`
   - Construir request con entidad + terminal.
6. `delete(id)`
   - Ejecutar borrado logico o fisico segun API.
7. `close(id)`
   - Notificar liberacion de lock o apertura.

## Reglas de implementacion
- Centralizar headers en `getHeaders()`.
- Leer token desde `localStorage` salvo que el proyecto cambie el patron global.
- Conservar `catchError` por metodo para facilitar mensajes y debugging.
- Mantener el nombre del endpoint base alineado con la ruta del backend.
- No mezclar logica de formularios o seguridad de UI en este servicio.

## Payloads
- En `create` y `update`, enviar solo los campos que el backend espera.
- Incluir `terminal` cuando la API haga lock o auditoria de sesion.
- En `open`, revisar si los datos de terminal viajan por query params o body segun el endpoint real.

## Riesgos comunes
- Enviar campos de solo UI al backend.
- Armar mal el query string y duplicar `?` o `&`.
- No contemplar los endpoints `open` y `close`, rompiendo el flujo de bloqueo.

## Archivos de referencia
- `http-services/<entity-plural>.service.ts`
- `models/<entity-singular>-filter.model.ts`
- `models/<entity-singular>-response.model.ts`

## Checklist de salida
- El servicio cubre CRUD, `open` y `close`.
- Los filtros y pagina viajan en el formato esperado.
- Los headers y el token estan centralizados.
- Los payloads incluyen `terminal` cuando corresponde.