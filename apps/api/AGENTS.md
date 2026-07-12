# AI Assistant Guide — @repo/api (NestJS Backend)

## Identity

You are working in `apps/api/` — the NestJS backend for EstateRent. This is a modular monolith designed so each feature module can be extracted into a microservice later.

## Source Layout

```
src/
├── main.ts                      # Bootstrap, global pipes/interceptors/filters
├── app.module.ts                # Root module — imports features + infrastructure
├── modules/                     # Business domains (microservice-ready)
│   ├── estates/                 #   module, controller, service, repository, entities, dto
│   ├── health/                  #   health check (no DB)
│   ├── bookings/                #   (future)
│   ├── users/                   #   (future)
│   └── auth/                    #   (future)
├── infrastructure/              # External services
│   ├── logging/                 #   Pino logger, interceptor, filter, request context
│   ├── database/                #   TypeORM config, DataSource, seeds, migrations
│   ├── cache/                   #   (future)
│   ├── queues/                  #   (future)
│   ├── storage/                 #   (future)
│   └── telemetry/               #   (future)
├── shared/                      # Reusable abstractions
│   ├── base/                    #   BaseEntity, BaseService
│   ├── pagination/              #   Pagination interfaces/helpers
│   └── response/                #   ApiResponse wrappers
├── jobs/                        # Scheduled tasks (future)
├── workers/                     # Background processing (future)
├── test/                        # E2E tests
│   └── jest-e2e.json
└── nest-cli.json
```

## Key Files

| File                             | Purpose                                          |
| -------------------------------- | ------------------------------------------------ |
| `src/main.ts`                    | Bootstrap, CORS, global prefix, pipes, filters   |
| `src/app.module.ts`              | Root module                                      |
| `src/modules/<name>/`            | Feature modules (estates, bookings, users, auth) |
| `src/modules/health/`            | Health check module (simple, no DB)              |
| `src/infrastructure/logging/`    | Logger module (Pino, global, DI-driven)          |
| `src/infrastructure/database/`   | Database module (TypeORM forRootAsync)           |
| `src/shared/base/base.entity.ts` | Abstract base entity (id, createdAt, updatedAt)  |
| `src/shared/response/`           | success(), created(), paginated() helpers        |

## Architecture Rules

- **Controllers are thin.** Parse request, call service, return response. No business logic.
- **Services contain business logic.** Orchestrate repositories, apply rules, throw typed exceptions.
- **Repositories handle data access.** Use TypeORM `Repository` with custom query methods.
- **DTOs validate input.** Use `class-validator` decorators. Global `ValidationPipe` with `whitelist: true`.
- **Entities extend `BaseEntity`** for consistent id/timestamps.
- **Modules are self-contained.** A module imports only its own entities, DTOs, and infrastructure interfaces. No cross-module imports.
- **Infrastructure modules are global.** DatabaseModule and LoggerModule are `@Global()` — import once in AppModule.
- **No Express dependencies.** Using `@nestjs/platform-express` currently; eventually Fastify.

## Import Conventions

```typescript
// Infrastructure
import { LoggerService } from '@/infrastructure/logging/logger.service';
import { RequestContextService } from '@/infrastructure/logging/request-context.service';

// Modules
import { EstatesModule } from '@/modules/estates/estates.module';
import { EstateEntity } from '@/modules/estates/entities/estate.entity';

// Shared
import { BaseEntity } from '@/shared/base/base.entity';
import { success, paginated } from '@/shared/response/response.wrapper';

// Shared domain types (from @repo/types)
import type { Estate, PaginatedResponse } from '@repo/types';
```

## Testing

- Unit tests: `*.spec.ts` co-located with source files
- E2E tests: `src/test/*.e2e-spec.ts`
- Use `Test.createTestingModule` with mocked providers
- Mock repositories via `getRepositoryToken()`
- Coverage target: 90% services, 85% controllers

## Common Tasks

### Add a new feature module

1. Create `src/modules/<name>/` directory
2. Create entity (extends `BaseEntity`), DTOs, service, repository, controller, module
3. Register entity in feature module via `TypeOrmModule.forFeature([Entity])`
4. Import feature module in `app.module.ts`

### Add a migration

```bash
pnpm --filter @repo/api migration:create ./src/infrastructure/database/migrations/<Name>
pnpm --filter @repo/api migration:generate
pnpm --filter @repo/api migration:run
pnpm --filter @repo/api seed
```

Never use `synchronize: true` in production.

### Add a new endpoint

1. Add method to controller with decorators
2. Add method to service with business logic
3. Add DTO for request/response if needed
4. Add unit tests for both controller and service
