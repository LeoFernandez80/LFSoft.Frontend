# Plan de Migración Backend: NestJS → Go

## ⚠️ IMPORTANTE: Ubicación de Migraciones

**Todas las migraciones SQL deben crearse en el proyecto `LFSoft.database`, organizadas por módulo:**

- **Basic Configurations**: `c:\Desarrollo\LFSoft.database\basic-configurations\migrations\`
  - Actividades, Familias, Grupos, Paridades, Unidades de Medida, etc.
  
- **Utilities**: `c:\Desarrollo\LFSoft.database\utilities\migrations\`
  - Companies, Users, Settings, etc.
  
- **Sales**: `c:\Desarrollo\LFSoft.database\sales\migrations\` (cuando exista)
  - Customers, Quotes, Invoices, etc.

**NO crear migraciones dentro de `LFSoft.Backend.Go/migrations/`**

## Stack Tecnológico

**Framework:** Fiber (web framework, API similar a Express)
**Database:** sqlx + sqlc (SQL type-safe sin ORM overhead)
**Migraciones:** golang-migrate (control total SQL)
**Validación:** validator/v10
**Auth:** jwt-go (compatible con JWT actual)
**Logging:** zerolog

## Estructura del Proyecto

```
LFSoft.Backend.Go/
├── cmd/api/main.go
├── internal/
│   ├── basic-configuration/
│   │   ├── actividades/
│   │   │   ├── handler.go      # HTTP endpoints (Controller)
│   │   │   ├── service.go      # Business logic
│   │   │   ├── repository.go   # Generado por sqlc
│   │   │   ├── models.go       # Domain models
│   │   │   └── dto.go          # Request/Response DTOs
│   │   ├── paridades/
│   │   └── unidades-medida/
│   ├── sales/
│   ├── shared/
│   │   ├── database/
│   │   ├── middleware/
│   │   ├── pagination/
│   │   └── response/
│   └── [otros módulos...]
├── sql/                        # Queries para sqlc
│   └── actividades.sql
├── scripts/lfsoft-gen/         # CLI Generador
│   ├── main.go
│   └── templates/
└── sqlc.yaml

LFSoft.database/
├── basic-configurations/
│   └── migrations/             # Migraciones para basic-configurations
│       ├── 000001_create_actividades.up.sql
│       └── 000001_create_actividades.down.sql
└── utilities/
    └── migrations/             # Migraciones para utilities
        ├── 000001_create_companies.up.sql
        └── 000001_create_companies.down.sql
```

## Sistema de Generación: lfsoft-gen CLI

### Comando
```bash
lfsoft-gen entity <Nombre> --module=<modulo>
```

### Genera Automáticamente
- ✅ handler.go - HTTP endpoints CRUD
- ✅ service.go - Business logic
- ✅ repository.go stub - sqlc genera el código real
- ✅ models.go - Structs de dominio
- ✅ dto.go - CreateDTO, UpdateDTO, FilterDTO, ResponseDTO
- ✅ queries.sql - CRUD completo para sqlc
- ✅ migration.up.sql y .down.sql (en LFSoft.database/<modulo>/migrations/)
- ✅ routes.go - Registro en router

### Metadata para Templates
```go
type EntityMeta struct {
    Name           string   // "Actividad"
    NamePlural     string   // "Actividades"
    TableName      string   // "actividades"
    Module         string   // "basic-configuration"
    PrimaryKey     string   // "actividad_id"
    PKType         string   // "int" | "string"
    Fields         []Field
    HasAccessControl bool
    Nested         bool
}

type Field struct {
    Name       string // "actividad_nombre"
    Type       string // "string", "int", "float64", "bool", "time.Time"
    GoType     string
    SQLType    string // "VARCHAR(100)", "INT", "DECIMAL(18,6)", "BOOLEAN", "DATE"
    Nullable   bool
    MaxLength  int
    Validation string // "required,max=100"
}
```

## Patrón de Implementación por Módulo

### 1. Migración SQL

**Ubicación según módulo:**
- Basic configurations: `c:\Desarrollo\LFSoft.database\basic-configurations\migrations\`
- Utilities: `c:\Desarrollo\LFSoft.database\utilities\migrations\`
- Sales: `c:\Desarrollo\LFSoft.database\sales\migrations\` (si existe)

```sql
-- <ruta-segun-modulo>/NNNN_create_<tabla>.up.sql
CREATE TABLE <tabla> (
    <pk> INT PRIMARY KEY AUTO_INCREMENT,
    <campo1> VARCHAR(100) NOT NULL,
    <campo2> VARCHAR(255),
    <campo3> BOOLEAN DEFAULT true,
    INDEX idx_<campo> (<campo>)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- <ruta-segun-modulo>/NNNN_create_<tabla>.down.sql
DROP TABLE <tabla>;
```

### 2. Queries sqlc
```sql
-- sql/<entidad>.sql
-- name: Get<Entidades> :many
SELECT * FROM <tabla>
WHERE <campo>_activo = ?
  AND (sqlc.narg('filter') IS NULL OR <campo> LIKE sqlc.narg('filter'))
ORDER BY <campo> ASC
LIMIT ? OFFSET ?;

-- name: Count<Entidades> :one
SELECT COUNT(*) FROM <tabla>
WHERE <campo>_activo = ?;

-- name: Get<Entidad>ByID :one
SELECT * FROM <tabla> WHERE <pk> = ?;

-- name: Create<Entidad> :execresult
INSERT INTO <tabla> (<campos>)
VALUES (?, ?, ?);

-- name: Update<Entidad> :exec
UPDATE <tabla> SET <campos> WHERE <pk> = ?;

-- name: Delete<Entidad> :exec
UPDATE <tabla> SET <campo>_activo = false WHERE <pk> = ?;
```

### 3. Models
```go
package <modulo>

type <Entidad> struct {
    <PK>     int     `json:"<pk>" db:"<pk>"`
    <Campo1> string  `json:"<campo1>" db:"<campo1>"`
    <Campo2> *string `json:"<campo2>" db:"<campo2>"`
    <Campo3> bool    `json:"<campo3>" db:"<campo3>"`
}
```

### 4. DTOs
```go
package <modulo>

type Create<Entidad>Dto struct {
    <Campo1> string  `json:"<campo1>" validate:"required,max=100"`
    <Campo2> *string `json:"<campo2>" validate:"omitempty,max=255"`
    <Campo3> *bool   `json:"<campo3>"`
}

type Update<Entidad>Dto struct {
    <Campo1> *string `json:"<campo1>" validate:"omitempty,max=100"`
    <Campo2> *string `json:"<campo2>" validate:"omitempty,max=255"`
    <Campo3> *bool   `json:"<campo3>"`
}

type <Entidad>FilterDto struct {
    <Campo1> *string `json:"<campo1>"`
    <Campo3> *bool   `json:"<campo3>"`
}

type <Entidad>ResponseDto struct {
    <Entidad>      *<Entidad> `json:"<entidad_lower>"`
    AccessControl  interface{} `json:"accessControl"`
    Validations    []string    `json:"validations"`
    Errores        []string    `json:"errores"`
}
```

### 5. Service
```go
package <modulo>

type <Entidad>Service struct {
    repo *Repository // sqlc generated
}

func New<Entidad>Service(repo *Repository) *<Entidad>Service {
    return &<Entidad>Service{repo: repo}
}

func (s *<Entidad>Service) FindAll(ctx context.Context, 
    filters <Entidad>FilterDto, page PageFilter) (*PaginatedList, error) {
    
    // Build query params
    total, err := s.repo.Count<Entidades>(ctx, filters.<Campo3>)
    if err != nil {
        return nil, err
    }
    
    items, err := s.repo.Get<Entidades>(ctx, Get<Entidades>Params{
        <Campo3>: filters.<Campo3>,
        Filter:   filters.<Campo1>,
        Limit:    page.PageSize,
        Offset:   (page.Page - 1) * page.PageSize,
    })
    if err != nil {
        return nil, err
    }
    
    return &PaginatedList{Data: items, Total: total}, nil
}

func (s *<Entidad>Service) FindOne(ctx context.Context, id int) (*<Entidad>, error) {
    item, err := s.repo.Get<Entidad>ByID(ctx, id)
    if err == sql.ErrNoRows {
        return nil, ErrNotFound
    }
    return item, err
}

func (s *<Entidad>Service) Create(ctx context.Context, dto Create<Entidad>Dto) (*<Entidad>, error) {
    result, err := s.repo.Create<Entidad>(ctx, Create<Entidad>Params{
        <Campo1>: dto.<Campo1>,
        <Campo2>: dto.<Campo2>,
        <Campo3>: dto.<Campo3> != nil && *dto.<Campo3>,
    })
    if err != nil {
        return nil, err
    }
    
    id, _ := result.LastInsertId()
    return s.FindOne(ctx, int(id))
}

func (s *<Entidad>Service) Update(ctx context.Context, id int, dto Update<Entidad>Dto) (*<Entidad>, error) {
    // Check exists
    existing, err := s.FindOne(ctx, id)
    if err != nil {
        return nil, err
    }
    
    // Update with merge logic
    err = s.repo.Update<Entidad>(ctx, Update<Entidad>Params{
        <PK>:     id,
        <Campo1>: dto.<Campo1> != nil ? *dto.<Campo1> : existing.<Campo1>,
        // ... rest of fields
    })
    if err != nil {
        return nil, err
    }
    
    return s.FindOne(ctx, id)
}

func (s *<Entidad>Service) Delete(ctx context.Context, id int) error {
    return s.repo.Delete<Entidad>(ctx, id)
}
```

### 6. Handler
```go
package <modulo>

type <Entidad>Handler struct {
    service *<Entidad>Service
}

func New<Entidad>Handler(service *<Entidad>Service) *<Entidad>Handler {
    return &<Entidad>Handler{service: service}
}

func (h *<Entidad>Handler) RegisterRoutes(router fiber.Router) {
    router.Get("/", jwtMiddleware, h.FindAll)
    router.Get("/:id", jwtMiddleware, h.FindOne)
    router.Post("/", jwtMiddleware, h.Create)
    router.Put("/:id", jwtMiddleware, h.Update)
    router.Delete("/:id", jwtMiddleware, h.Delete)
}

func (h *<Entidad>Handler) FindAll(c *fiber.Ctx) error {
    var page PageFilter
    if err := c.QueryParser(&page); err != nil {
        return c.Status(400).JSON(fiber.Map{"error": "Invalid page filter"})
    }
    
    var filters <Entidad>FilterDto
    if err := c.QueryParser(&filters); err != nil {
        return c.Status(400).JSON(fiber.Map{"error": "Invalid filters"})
    }
    
    result, err := h.service.FindAll(c.Context(), filters, page)
    if err != nil {
        return c.Status(500).JSON(fiber.Map{"error": err.Error()})
    }
    
    return c.JSON(result)
}

func (h *<Entidad>Handler) FindOne(c *fiber.Ctx) error {
    id, err := c.ParamsInt("id")
    if err != nil {
        return c.Status(400).JSON(fiber.Map{"error": "Invalid ID"})
    }
    
    item, err := h.service.FindOne(c.Context(), id)
    if err == ErrNotFound {
        return c.Status(404).JSON(fiber.Map{"error": "Not found"})
    }
    if err != nil {
        return c.Status(500).JSON(fiber.Map{"error": err.Error()})
    }
    
    return c.JSON(<Entidad>ResponseDto{
        <Entidad>: item,
        AccessControl: nil,
        Validations: []string{},
        Errores: []string{},
    })
}

func (h *<Entidad>Handler) Create(c *fiber.Ctx) error {
    var dto Create<Entidad>Dto
    if err := c.BodyParser(&dto); err != nil {
        return c.Status(400).JSON(fiber.Map{"error": "Invalid body"})
    }
    
    if err := validator.Validate(dto); err != nil {
        return c.Status(400).JSON(fiber.Map{"error": err.Error()})
    }
    
    item, err := h.service.Create(c.Context(), dto)
    if err != nil {
        return c.Status(500).JSON(fiber.Map{"error": err.Error()})
    }
    
    return c.Status(201).JSON(<Entidad>ResponseDto{<Entidad>: item})
}

func (h *<Entidad>Handler) Update(c *fiber.Ctx) error {
    id, err := c.ParamsInt("id")
    if err != nil {
        return c.Status(400).JSON(fiber.Map{"error": "Invalid ID"})
    }
    
    var dto Update<Entidad>Dto
    if err := c.BodyParser(&dto); err != nil {
        return c.Status(400).JSON(fiber.Map{"error": "Invalid body"})
    }
    
    if err := validator.Validate(dto); err != nil {
        return c.Status(400).JSON(fiber.Map{"error": err.Error()})
    }
    
    item, err := h.service.Update(c.Context(), id, dto)
    if err == ErrNotFound {
        return c.Status(404).JSON(fiber.Map{"error": "Not found"})
    }
    if err != nil {
        return c.Status(500).JSON(fiber.Map{"error": err.Error()})
    }
    
    return c.JSON(<Entidad>ResponseDto{<Entidad>: item})
}

func (h *<Entidad>Handler) Delete(c *fiber.Ctx) error {
    id, err := c.ParamsInt("id")
    if err != nil {
        return c.Status(400).JSON(fiber.Map{"error": "Invalid ID"})
    }
    
    if err := h.service.Delete(c.Context(), id); err != nil {
        if err == ErrNotFound {
            return c.Status(404).JSON(fiber.Map{"error": "Not found"})
        }
        return c.Status(500).JSON(fiber.Map{"error": err.Error()})
    }
    
    return c.SendStatus(204)
}
```

### 7. Integración en main.go
```go
// Initialize repository (sqlc)
queries := New(db)

// Initialize service
<entidad>Service := New<Entidad>Service(queries)

// Initialize handler
<entidad>Handler := New<Entidad>Handler(<entidad>Service)

// Register routes
apiGroup := app.Group("/api")
<entidad>Group := apiGroup.Group("/<Entidades>")
<entidad>Handler.RegisterRoutes(<entidad>Group)
```

## Checklist de Verificación por Módulo

### Compilación y Generación
- [ ] `go build cmd/api/main.go` sin errores
- [ ] `migrate up` ejecuta sin errores
- [ ] `sqlc generate` genera código type-safe

### Testing Funcional
- [ ] `GET /api/<Entidades>?page=1&pageSize=10` retorna PaginatedList
- [ ] Response JSON idéntico a backend NestJS
- [ ] `POST /api/<Entidades>` crea registro
- [ ] `PUT /api/<Entidades>/:id` actualiza registro
- [ ] `DELETE /api/<Entidades>/:id` elimina (soft delete)
- [ ] Validaciones retornan 400 con mensajes correctos
- [ ] JWT requerido (401 sin token)

### Integración Frontend
- [ ] Frontend Angular consume API sin cambios
- [ ] Paginación funciona correctamente
- [ ] Filtros aplicados correctamente
- [ ] Sorting funciona

### Performance
- [ ] Response time < 15ms (queries simples)
- [ ] Memory usage razonable bajo carga

## Comandos Útiles

```bash
# Crear migración (especificar directorio según módulo)
# Para basic-configurations:
migrate create -ext sql -dir ../../../LFSoft.database/basic-configurations/migrations -seq create_<tabla>

# Para utilities:
migrate create -ext sql -dir ../../../LFSoft.database/utilities/migrations -seq create_<tabla>

# Ejecutar migraciones (desde LFSoft.database)
cd c:\Desarrollo\LFSoft.database
migrate -path basic-configurations/migrations -database "mysql://root:password@tcp(localhost:3306)/lfsoft" up
migrate -path utilities/migrations -database "mysql://root:password@tcp(localhost:3306)/lfsoft" up

# Rollback migración
migrate -path basic-configurations/migrations -database "mysql://root:password@tcp(localhost:3306)/lfsoft" down 1

# Generar código sqlc
sqlc generate

# Generar nuevo módulo
lfsoft-gen entity <Nombre> --module=<modulo>

# Hot reload (development)
air

# Build production
go build -ldflags="-s -w" -o api cmd/api/main.go

# Run tests
go test ./...

# Docker build
docker build -t lfsoft-api .
```

## Compatibilidad con Frontend Angular

### Request Pattern
```typescript
// NestJS espera
{ [entidad]: CreateDto }

// Go debe retornar igual
{ "[entidad]": dto }
```

### Response Pattern
```typescript
// Single entity
{
  "[entidad]": Entity,
  "accessControl": null,
  "validations": [],
  "errores": []
}

// List
{
  "data": Entity[],
  "total": number
}
```

### JWT Auth
- Header: `Authorization: Bearer <token>`
- Validar token con misma secret que NestJS
- Extraer claims: user_id, role, etc.

### Error Responses
```json
{
  "error": "Error message",
  "statusCode": 400,
  "message": "Detailed error"
}
```

## Beneficios Esperados

| Métrica | NestJS + Prisma | Go + sqlc | Mejora |
|---------|----------------|-----------|--------|
| Response Time | ~45ms | ~10ms | 4.5x |
| Memory (idle) | 180MB | 25MB | 7x menos |
| Binary Size | ~200MB | ~20MB | 10x menos |
| Queries complejas | Limitado | SQL total | ✅ |
| Migraciones | Lentas | Instantáneas | ✅ |
| Dev velocity | 20s regeneración | < 1s | ✅ |
| Concurrent Users | 200-300 | 1000+ | 3-5x |

## Notas de Implementación

### Nested Entities (Quotes/Invoices con items/details)
- Usar transacciones: `tx, _ := db.BeginTx(ctx, nil)`
- Queries separadas para parent e items
- Rollback en cualquier error
- Include items en response con JOIN o queries múltiples

### Access Control
- Tabla `access_control` igual que NestJS
- Middleware para verificar permisos
- Service layer maneja creación de registros de control

### Soft Delete
- Todos los deletes son updates: `SET activo = false`
- Queries filtran por `activo = true` por defecto
- Hard delete solo con flag especial

### Pagination
```go
type PageFilter struct {
    Page          int    `query:"page"`
    PageSize      int    `query:"pageSize"`
    SortField     string `query:"sortField"`
    SortDirection string `query:"sortDirection"`
}

type PaginatedList struct {
    Data  interface{} `json:"data"`
    Total int64       `json:"total"`
}
```

## Resolución de Problemas Comunes

### "SQLSTATE: syntax error near..."
→ Revisar queries.sql, sqlc es estricto con SQL válido

### "JWT token invalid"
→ Verificar secret key es la misma que NestJS, claims structure igual

### "Response JSON no coincide"
→ Verificar json tags en structs, usar omitempty donde corresponda

### "Performance no mejora"
→ Revisar índices en migrations, usar EXPLAIN ANALYZE en queries

### "Frontend error CORS"
→ Configurar CORS middleware con origins correctas
