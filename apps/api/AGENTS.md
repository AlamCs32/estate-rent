# AI Assistant Guide — @repo/api (NestJS Backend)

## Identity

You are working in `apps/api/` — the NestJS backend for EstateRent. This is a modular monolith using Fastify adapter, TypeORM, and PostgreSQL.

## Key Files

| File                 | Purpose                                                |
| -------------------- | ------------------------------------------------------ |
| `src/main.ts`        | Application bootstrap, middleware, CORS, global prefix |
| `src/app.module.ts`  | Root module — imports all feature modules              |
| `src/<feature>/`     | Feature modules (estates, bookings, users, auth)       |
| `src/health/`        | Health check module (simple, no DB)                    |
| `test/jest-e2e.json` | E2E test configuration                                 |
| `nest-cli.json`      | NestJS CLI config (source root, compiler options)      |

## Architecture Rules

- **Controllers are thin.** Parse request, call service, return response. No business logic.
- **Services contain business logic.** Orchestrate repositories, apply rules, throw typed exceptions.
- **Repositories handle data access.** Extend TypeORM `Repository<T>` or use `DataSource`.
- **DTOs validate input.** Use `class-validator` decorators. Global `ValidationPipe` with `whitelist: true`.
- **Entities map to database tables.** TypeORM decorators on each field.
- **Modules encapsulate features.** Each feature has its own module, controller, service, entities, and DTOs.
- **No Express dependencies.** Using `@nestjs/platform-express` currently; eventually Fastify. Don't add Express-specific middleware.

## Available Packages

```typescript
import { config } from '@repo/config'; // Runtime configuration
import { Estate, Booking, User } from '@repo/types'; // Shared types
import { formatCurrency, formatDate } from '@repo/utils'; // Shared utilities
```

## Testing

- Unit tests: `*.spec.ts` co-located with source files
- E2E tests: `test/*.e2e-spec.ts`
- Use `Test.createTestingModule` with mocked providers
- Mock external services (DB, HTTP clients)
- Coverage target: 90% services, 85% controllers

## Common Tasks

### Add a new feature module

1. Create `src/<feature>/` directory
2. Create entity, DTOs, service, controller, module files
3. Register in `app.module.ts` imports
4. Add TypeORM entity registration in feature module

### Add a migration

```bash
pnpm --filter @repo/api typeorm migration:create ./src/migrations/<Name>
```

Never use `synchronize: true` in production.

### Add a new endpoint

1. Add method to controller with decorators
2. Add method to service with business logic
3. Add DTO for request/response if needed
4. Add unit tests for both controller and service
