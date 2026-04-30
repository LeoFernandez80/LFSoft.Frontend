# 04 Http Service

## Objetivo
Describir la implementacion del servicio HTTP del modulo para que siga un contrato operativo uniforme con el resto de la UI.

## Dependencias
- Los modelos base ya existen.
- La API del backend ya tiene definidos endpoints y payloads.

## Archivo objetivo
- `http-services/<entity-singular>.service.ts`

## Estructura recomendada
1. Imports Angular: `Injectable`, `inject`, `HttpClient`, `HttpHeaders`.
2. Imports RxJS: `Observable`, `catchError`, `throwError`.
3. Imports compartidos: `PageFilter`, `PaginatedList`, `ConfigurationService`, `Terminal`.
4. Imports de modelos propios: `<Entity-Singular>`, `<Entity-Singular>Grid`, `<Entity-Singular>Filter`, `<Entity-Singular>Response`.
5. Uso de `environment.apiUrl` para construir `apiUrl`.

## Clases internas del archivo

### Clase de request: `HTTPRequest<EntitySingular>`
Definir **dentro del archivo** (sin `export`, sin `@Injectable`) cuando el backend espera la entidad anidada junto con datos de terminal:

```typescript
class HTTPRequestUser {
  user: User = new User();
  terminal: Terminal | null = null;
}
```

Reglas:
- Nombre: `HTTPRequest<EntitySingular>` (PascalCase, prefijo `HTTPRequest`).
- Solo los campos que el backend realmente recibe; no copiar campos de solo-UI.
- Usar `Terminal | null` para el campo `terminal`.
- Instanciar un objeto de esta clase en `create` y `update` antes de llamar al `http`.
- Si el backend no necesita datos de terminal en el payload, omitir la clase y enviar la entidad directamente.

### Clase de response: `<EntitySingular>Response` (modelo compartido)
Cuando la respuesta incluye la entidad mas metadatos (lock, validaciones, errores), definir la clase **en `models/<entity-singular>-response.model.ts`** y NO duplicarla dentro del servicio.

```typescript
// models/user-response.model.ts
export class UserResponse {
  user: User = new User();
  accessControl: AccessControl | null = null;
  validations: string[] = [];
  errores: string[] = [];
}
```

Reglas:
- Nunca declarar una clase de response local dentro del servicio si ya existe en `models/`.
- Importar y reutilizar la clase del modelo compartido.

## Convencion de nombre de clase del servicio
- Clase del servicio: `HTTPService<EntitySingular>`.
- Mantener el sufijo de metodos orientado a la entidad: `get<EntityPlural>`, `get<EntitySingular>`, `create<EntitySingular>`, `update<EntitySingular>`, `delete<EntitySingular>`, `close<EntitySingular>`.

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

## Especificacion obligatoria de metodos (contrato minimo)
Documentar para cada metodo del servicio:
1. firma completa
2. endpoint
3. payload/params
4. tipo de retorno
5. politica de error (`catchError`)

Plantilla minima esperada:
- `get<EntityPlural>(pageFilter: PageFilter, filterParameters: <EntitySingular>Filter): Observable<PaginatedList<<EntitySingular>Grid>>`
- `get<EntitySingular>(id: number | string): Observable<<EntitySingular>Response>`
- `open(id: number | string): Observable<<EntitySingular>Response>`
- `create<EntitySingular>(entity: <EntitySingular>): Observable<<EntitySingular>>`
- `update<EntitySingular>(entity: <EntitySingular>): Observable<<EntitySingular>>`
- `delete<EntitySingular>(id: number | string): Observable<void>`
- `close<EntitySingular>(id: number | string): Observable<void>`

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
- `http-services/<entity-singular>.service.ts`
- `models/<entity-singular>-filter.model.ts`
- `models/<entity-singular>-response.model.ts`

## Checklist de salida
- El servicio cubre CRUD, `open` y `close`.
- Los filtros y pagina viajan en el formato esperado.
- Los headers y el token estan centralizados.
- Los payloads incluyen `terminal` cuando corresponde.
- Si `create`/`update` envian entidad + terminal, existe la clase interna `HTTPRequest<EntitySingular>`.
- No hay clase de response duplicada dentro del servicio; se importa desde `models/`.