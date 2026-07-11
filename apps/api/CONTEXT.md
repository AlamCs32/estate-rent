# Context — @repo/api

## Current State

The API is a NestJS 11 application configured with:

- `@nestjs/platform-express` (Fastify migration planned)
- `@nestjs/config` for environment variable management
- `@repo/config` for typed runtime configuration
- CORS enabled for `http://localhost:5173`
- Global prefix: `/api`

## Existing Modules

### Health Module (`src/health/`)

- `GET /api/health` — Returns status, timestamp, and uptime
- No database dependency
- Used by frontend to verify API connectivity

### Estates Module (`src/estates/`)

- `GET /api/estates?page=1&limit=10` — Paginated estate list
- `GET /api/estates/:id` — Single estate by ID
- Currently uses mock data (`estates.service.ts` hardcoded array)
- TypeORM integration is planned — entities will replace mock data

## Planned Modules (Not Yet Implemented)

- **Auth Module**: JWT authentication, registration, login
- **Users Module**: User profiles, preferences
- **Bookings Module**: Booking CRUD, availability checking
- **Images Module**: Image upload and management

## Environment Variables

```env
NODE_ENV=development
PORT=3001
DATABASE_URL=postgresql://user:password@localhost:5432/estate_rent
```

## Current Dependencies (planned additions in parentheses)

| Package                  | Status                           |
| ------------------------ | -------------------------------- |
| @nestjs/common           | ✅ Installed                     |
| @nestjs/core             | ✅ Installed                     |
| @nestjs/config           | ✅ Installed                     |
| @nestjs/platform-express | ✅ Installed (→ Fastify planned) |
| @nestjs/swagger          | ❌ Planned                       |
| @nestjs/throttler        | ❌ Planned                       |
| @nestjs/jwt              | ❌ Planned                       |
| @nestjs/passport         | ❌ Planned                       |
| typeorm                  | ❌ Planned                       |
| @nestjs/typeorm          | ❌ Planned                       |
| pg                       | ❌ Planned                       |
| class-validator          | ❌ Planned                       |
| class-transformer        | ❌ Planned                       |

## Test Setup

- Jest with `ts-jest` transformer
- `moduleNameMapper` maps `@/` to `<rootDir>/` for clean imports
- 3 unit test files existing: `app.controller.spec.ts`, `health.controller.spec.ts`, `estates.controller.spec.ts`, `estates.service.spec.ts`
