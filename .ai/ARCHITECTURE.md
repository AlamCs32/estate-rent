# Architecture — EstateRent Monorepo

## High-Level Overview

```
┌─────────────────────────────────────────────────────────────┐
│                      pnpm workspace                          │
│  ┌──────────┐  ┌──────────┐  ┌──────┐  ┌───────┐  ┌──────┐ │
│  │ apps/api │  │ apps/web │  │ types│  │ utils │  │  ui  │ │
│  │ (NestJS) │  │ (React)  │  │      │  │       │  │      │ │
│  └────┬─────┘  └────┬─────┘  └──┬───┘  └──┬────┘  └──┬───┘ │
│       │              │           │         │          │      │
│       └──────────────┴───────────┴─────────┴──────────┘      │
│                           Turborepo                           │
└─────────────────────────────────────────────────────────────┘
```

## Backend Architecture (`apps/api`)

```
Client
  │
  ▼
NestJS (Fastify Adapter)
  │
  ├── Controllers (thin — handle HTTP only)
  │     │
  │     ▼
  ├── Services (business logic)
  │     │
  │     ▼
  ├── Repositories (data access via TypeORM)
  │     │
  │     ▼
  └── PostgreSQL
```

### Layer Rules

| Layer      | Responsibility                     | Can Import From                  |
| ---------- | ---------------------------------- | -------------------------------- |
| Controller | HTTP parsing, validation, response | Services, DTOs                   |
| Service    | Business logic, orchestration      | Repositories, DTOs, Entities     |
| Repository | Database access only               | Entities, DataSource             |
| Entity     | Database model definition          | TypeORM decorators               |
| DTO        | Input/output validation            | `class-validator`, `@repo/types` |
| Module     | DI container, imports              | NestJS core, other modules       |

### Key Patterns

- **Repository Pattern**: Services never touch the database directly. Create custom repositories extending `Repository<E>` or use `DataSource.getRepository()` in services.
- **DTO Validation**: All incoming request bodies are validated with `class-validator` + `ValidationPipe`.
- **Exception Filters**: Global exception filter converts unhandled errors to structured `ApiResponse<T>`.
- **Config Module**: All environment variables accessed through `@repo/config`, never directly via `process.env`.

## Frontend Architecture (`apps/web`)

```
Browser
  │
  ▼
React (Vite)
  │
  ├── App (Router + Layout)
  │     │
  │     ├── Pages (lazy-loaded routes)
  │     │     │
  │     │     ├── Components (feature-specific)
  │     │     └── Hooks (custom hooks)
  │     │
  │     ├── Shared UI (from @repo/ui)
  │     │
  │     └── State (RTK Query for server state)
  │
  └── API Layer (RTK Query)
        │
        ▼
      Backend API
```

### Layer Rules

| Layer      | Responsibility                        | Can Import From                                |
| ---------- | ------------------------------------- | ---------------------------------------------- |
| Pages      | Route-level components, data fetching | Feature modules, shared components, `@repo/ui` |
| Components | Reusable UI pieces                    | `@repo/ui`, `@repo/utils`                      |
| Hooks      | Custom React hooks                    | `@repo/utils`, RTK Query hooks                 |
| Store      | RTK Query config, API slices          | `@repo/types`                                  |
| Types      | Local type definitions                | `@repo/types`                                  |

## Shared Packages

| Package               | Provides                                         | Consumed By |
| --------------------- | ------------------------------------------------ | ----------- |
| `@repo/types`         | TypeScript interfaces, DTOs, enums               | All         |
| `@repo/utils`         | Pure utility functions                           | All         |
| `@repo/ui`            | React UI components (Button, Card, Input, Badge) | `apps/web`  |
| `@repo/config`        | Runtime configuration from env vars              | `apps/api`  |
| `@repo/eslint-config` | Shared ESLint flat configs                       | All         |
| `@repo/tsconfig`      | Shared TypeScript configs                        | All         |

## Dependency Graph

```
apps/api  ──► @repo/config, @repo/types, @repo/utils
apps/web  ──► @repo/ui, @repo/types, @repo/utils
@repo/ui  ──► react
@repo/utils ──► (none)
@repo/types ──► (none)
@repo/config ──► (none)
```

## Data Flow

### Request Lifecycle (Backend)

1. HTTP request arrives at Fastify
2. NestJS pipes it through middleware (Helmet, CORS, Rate Limiting)
3. Controller receives parsed request
4. DTO is validated via `ValidationPipe`
5. Controller calls Service method
6. Service applies business logic, calls Repository
7. Repository executes TypeORM query against PostgreSQL
8. Response flows back through the same chain

### Frontend Data Fetching

1. RTK Query hook triggers on component mount
2. Request sent to Vite proxy → NestJS API
3. Response cached in RTK Query store
4. Component re-renders with data
5. Cache invalidation on mutation
