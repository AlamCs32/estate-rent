# Context — @repo/api

## Current State

The API is a NestJS 11 application configured with:

- `@nestjs/platform-express` (Fastify migration planned)
- `@nestjs/config` for environment variable management
- `@repo/config` for typed runtime configuration
- CORS enabled for `http://localhost:5173`
- Global prefix: `/api`
- Structured logging via Pino (console + file transports, configurable)

## Existing Modules

### Health Module (`src/health/`)

- `GET /api/health` — Returns status, timestamp, and uptime
- No database dependency
- Used by frontend to verify API connectivity

### Estates Module (`src/estates/`)

- `GET /api/estates` — Paginated estate list with search, price range, location filters
- `GET /api/estates/:id` — Single estate by ID
- `POST /api/estates` — Create estate
- `PATCH /api/estates/:id` — Update estate
- `DELETE /api/estates/:id` — Delete estate
- Uses `EstateEntity` (TypeORM) with `EstatesRepository` and `EstatesService`
- DTOs: `CreateEstateDto`, `UpdateEstateDto`, `QueryEstateDto` with class-validator

### Logger Module (`src/logger/`)

- Pino-based structured logging with configurable transports
- Global `@Global()` module, imported once in `AppModule`
- `LoggerService` replaces NestJS default logger via `app.useLogger()`
- `LoggerInterceptor` logs every request/response with correlation IDs
- `LoggerExceptionFilter` catches unhandled exceptions, logs stack traces
- `RequestContextService` uses `AsyncLocalStorage` for request-scoped context
- Console transport (pretty-print in dev, JSON in prod)
- File transport with daily rotation via `pino-roll`
- Sensitive data redaction (headers, body fields)

## Planned Modules (Not Yet Implemented)

- **Auth Module**: JWT authentication, registration, login
- **Users Module**: User profiles, preferences
- **Bookings Module**: Booking CRUD, availability checking
- **Images Module**: Image upload and management

### Database Module (`src/database/`)

- `DatabaseModule` — Global module that configures TypeORM via `forRootAsync`
- Reads all settings from `@repo/config` (host, port, credentials, pool, SSL)
- Uses `autoLoadEntities: true` so feature modules register entities via `TypeOrmModule.forFeature()`
- Retry logic: 3 attempts with 3s delay
- Migrations disabled by default in dev (`DB_SYNCHRONIZE=true`)

### Base Entity (`src/common/entities/base.entity.ts`)

Abstract class with `id` (UUID), `createdAt`, `updatedAt` — all entities extend it.

## Environment Variables

```env
NODE_ENV=development
PORT=3001
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/estate_rent
CORS_ORIGIN=http://localhost:5173

# Database
DB_HOST=localhost
DB_PORT=5432
DB_USERNAME=postgres
DB_PASSWORD=postgres
DB_NAME=estate_rent
DB_SSL=false
DB_POOL_SIZE=10
DB_LOGGING=false
DB_SYNCHRONIZE=true
DB_MIGRATIONS_RUN=false

# Logger
LOG_LEVEL=debug
LOG_TRANSPORTS=console
LOG_FORMAT=pretty
LOG_DIR=logs
LOG_FILE_NAME=application
LOG_ROTATION=daily
LOG_MAX_SIZE=20M
LOG_MAX_FILES=30
LOG_COMPRESS=true
LOG_TIMESTAMP=true
LOG_COLORIZE=true
LOG_REQUEST_BODY=true
LOG_RESPONSE_BODY=false
LOG_SLOW_REQUEST_MS=1000
LOG_REDACT_HEADERS=authorization,cookie,x-api-key
LOG_REDACT_BODY=password,token,refreshToken,accessToken,apiKey,secret,otp
```

## Current Dependencies (planned additions in parentheses)

| Package                  | Status                           |
| ------------------------ | -------------------------------- |
| @nestjs/common           | ✅ Installed                     |
| @nestjs/core             | ✅ Installed                     |
| @nestjs/config           | ✅ Installed                     |
| @nestjs/platform-express | ✅ Installed (→ Fastify planned) |
| @nestjs/swagger          | ❌ Planned                       |
| pino                     | ✅ Installed                     |
| pino-pretty              | ✅ Installed                     |
| pino-roll                | ✅ Installed                     |
| typeorm                  | ✅ Installed                     |
| @nestjs/typeorm          | ✅ Installed                     |
| pg                       | ✅ Installed                     |
| class-validator          | ✅ Installed                     |
| class-transformer        | ✅ Installed                     |

## Test Setup

- Jest with `ts-jest` transformer
- `moduleNameMapper` maps `@/` to `<rootDir>/` for clean imports
- 4 unit test files existing: `app.controller.spec.ts`, `health.controller.spec.ts`, `estates.controller.spec.ts`, `estates.service.spec.ts`
