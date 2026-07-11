# Architectural Decision Records — EstateRent Monorepo

## ADR-001: Use pnpm Workspaces

**Date**: 2025-07  
**Context**: Needed a monorepo manager that supports strict dependency isolation, workspace protocol, and fast installs.  
**Decision**: pnpm over npm or Yarn.  
**Consequences**:

- Strict `node_modules` structure prevents phantom dependencies
- `workspace:*` protocol ensures local packages resolve correctly
- Corepack enforces version consistency across the team

## ADR-002: Use Turborepo for Build Orchestration

**Date**: 2025-07  
**Context**: Multiple packages need caching, parallel execution, and dependency-aware task running.  
**Decision**: Turborepo over Nx or Lage.  
**Consequences**:

- Remote caching (Vercel) available for CI speed
- `turbo.json` defines task dependency graph explicitly
- `--filter` allows targeted builds, dev, and testing

## ADR-003: Use Fastify over Express

**Date**: 2025-07  
**Context**: NestJS supports multiple HTTP adapters. Express is the default but slower.  
**Decision**: Fastify adapter.  
**Consequences**:

- ~2x throughput vs Express
- Different plugin/hook API from Express middleware
- NestJS platform abstraction hides most differences

## ADR-004: Use TypeORM

**Date**: 2025-07  
**Context**: Need an ORM with migrations, relations, and good NestJS integration.  
**Decision**: TypeORM over Prisma or MikroORM.  
**Consequences**:

- Decorator-based entity definition matches NestJS style
- Repository pattern integrates naturally with NestJS DI
- Must manage migrations manually (no `synchronize: true` in production)
- Slightly more boilerplate than Prisma

## ADR-005: Use PostgreSQL

**Date**: 2025-07  
**Context**: Relational data with complex queries, need JSON support and ACID compliance.  
**Decision**: PostgreSQL over MySQL or SQLite.  
**Consequences**:

- Rich type system (JSONB, arrays, enums)
- Excellent query performance with proper indexing
- Docker dev environment with `postgres:16-alpine`

## ADR-006: Use Material UI

**Date**: 2025-07  
**Context**: Need a comprehensive, accessible, and customizable component library for the admin-heavy UI.  
**Decision**: MUI over Ant Design or Chakra UI.  
**Consequences**:

- Large component set reduces custom CSS
- Theming system enables brand customization
- Bundle size concerns — use tree-shaking and dynamic imports
- `@repo/ui` wraps MUI components for shared usage

## ADR-007: Use RTK Query

**Date**: 2025-07  
**Context**: Need data fetching, caching, and state management for server data.  
**Decision**: RTK Query over React Query or SWR.  
**Consequences**:

- Tight integration with Redux for complex client state when needed
- Code generation from OpenAPI specs (future)
- Automatic cache invalidation on mutations

## ADR-008: Separate Shared Packages

**Date**: 2025-07  
**Context**: Multiple apps share types, utilities, UI, and config. Duplication is unacceptable.  
**Decision**: Create `@repo/types`, `@repo/utils`, `@repo/ui`, `@repo/config`, `@repo/eslint-config`, `@repo/tsconfig`.  
**Consequences**:

- Single source of truth for shared interfaces
- Tree-shakeable exports prevent dead code
- Clear dependency direction: types → utils → ui
- Extra build step needed — Turborepo handles dependency order

## ADR-009: Feature-Based Folder Structure

**Date**: 2025-07  
**Context**: Controllers, services, and modules grow together. Scattered file organization is hard to navigate.  
**Decision**: Group by feature (`estates/`, `bookings/`, `users/`) instead of type (`controllers/`, `services/`).  
**Consequences**:

- Co-located files for each feature
- Easier to extract a feature into its own module
- Consistent across backend and frontend
- Follows NestJS recommended structure

## ADR-010: Repository Pattern for Data Access

**Date**: 2025-07  
**Context**: Services should not depend directly on TypeORM. Need testability and separation of concerns.  
**Decision**: Use custom repositories or `@InjectRepository` for all database access.  
**Consequences**:

- Services depend on repository interfaces
- Repositories are mockable in tests
- Data access logic is centralized and reusable

## ADR-011: Flat ESLint Config

**Date**: 2025-07  
**Context**: ESLint 9 deprecated `.eslintrc`. Projects need to migrate to `eslint.config.mjs`.  
**Decision**: Use ESLint flat config with shared presets in `@repo/eslint-config`.  
**Consequences**:

- Forward-compatible config
- Shared presets for base, NestJS, and Vite
- No more `extends` — configs are composed as arrays

## ADR-012: Module Alias `@/`

**Date**: 2025-07  
**Context**: Deep relative imports (`../../../../utils/date`) are error-prone and hard to refactor.  
**Decision**: Use `@/` alias mapping to `./src/` in both apps, configured in tsconfig, Vite, Jest, and Vitest.  
**Consequences**:

- Clean imports: `@/estates/estates.service` instead of `../../estates/estates.service`
- Must configure alias in every tool that resolves paths
- `baseUrl` is not used (deprecated in TS 5.9) — only `paths`
