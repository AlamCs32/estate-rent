# Global Rules — EstateRent Monorepo

These rules apply to all code in this repository, across all packages and apps.

## General

- Production-grade code only. No prototypes, no demo code, no debug artifacts.
- Every file must have a clear, single responsibility.
- No circular dependencies between packages. `@repo/types` must never import from `@repo/ui`.
- No application-specific logic in shared packages.
- Named exports only. No default exports unless required by framework (e.g., Next.js pages).
- All exports from shared packages must be tree-shakeable.
- No `console.log` in production code. Use the NestJS Logger on the backend.
- No hardcoded secrets, keys, or URLs. Use environment variables via `@repo/config`.

## TypeScript

- `strict: true` everywhere.
- Prefer `interface` over `type` for object shapes.
- Use `type` for unions, intersections, and utility types.
- Use `as const` for literal constants.
- Use `satisfies` for type validation without widening.
- No `any`. Use `unknown` and narrow with type guards.
- No `// @ts-ignore` or `// @ts-expect-error`.
- Import types with `import type { ... }` — enforced by ESLint `consistent-type-imports`.
- Use `readonly` for immutable arrays and object properties.

## Naming

| Category               | Convention                 | Example                   |
| ---------------------- | -------------------------- | ------------------------- |
| Packages               | `@repo/*`                  | `@repo/types`             |
| Apps                   | `@repo/*`                  | `@repo/api`               |
| Directories (apps)     | kebab-case                 | `apps/api/src/estates/`   |
| Directories (features) | kebab-case                 | `estates/`, `bookings/`   |
| Classes                | PascalCase                 | `EstatesService`          |
| Functions              | camelCase                  | `formatCurrency`          |
| Interfaces             | PascalCase                 | `Estate`                  |
| Types                  | PascalCase                 | `BookingStatus`           |
| Enums                  | PascalCase                 | `BookingStatus`           |
| Constants              | camelCase                  | `defaultPageSize`         |
| Files (backend)        | kebab-case                 | `estates.service.ts`      |
| Files (frontend)       | kebab-case                 | `estate-card.tsx`         |
| Test files             | `*.spec.ts` / `*.test.tsx` | `estates.service.spec.ts` |
| CSS classes            | kebab-case                 | `estate-card__title`      |

## Import Order

Within each file, group imports in this order (separated by blank lines):

1. Node builtins (`node:fs`, `node:path`)
2. Third-party libraries (`@nestjs/common`, `react`)
3. Internal monorepo packages (`@repo/types`, `@repo/utils`)
4. Relative imports within the same package (`./estates.service`, `../dto`)

## Error Handling

- Backend: Use NestJS `HttpException` subclasses (`NotFoundException`, `BadRequestException`).
- Frontend: Use error boundaries at route level. Handle API errors in RTK Query middleware.
- Never swallow errors silently. Log them with appropriate context.
- Use typed error responses via `ApiResponse<T>` from `@repo/types`.

## Async/Await

- Use `async/await` over raw promises or callbacks.
- Never pass `async` functions as event listeners without error handling.
- Use `Promise.all` for independent concurrent operations.
- Avoid `Promise.allSettled` unless you need partial-failure semantics.

## Logging

- Backend: Inject `Logger` from `@nestjs/common` in services. Use structured context.
- Frontend: Use `console.error` for errors only. No debug logs in production builds.
- Never log passwords, tokens, or personal data.

## Security

- Validate all input. Use DTOs with `class-validator` on the backend, Zod on the frontend.
- Never trust user input in queries. Use parameterized queries (TypeORM handles this).
- Use Helmet for HTTP headers (NestJS middleware).
- Rate-limit endpoints that accept unauthenticated input.
- All sensitive operations require authentication and authorization.

## Performance

- Lazy-load frontend routes with `React.lazy` and `Suspense`.
- Use pagination for all list endpoints.
- Index database columns used in `WHERE`, `ORDER BY`, and `JOIN` clauses.
- Avoid N+1 queries. Use TypeORM relations or `QueryBuilder` with joins.
- Memoize expensive computations with `useMemo` / `useCallback` on the frontend.

## Dependencies

- No new dependency without justification in the PR description.
- Prefer built-in Node.js APIs and framework features over utility libraries.
- Keep versions consistent across the monorepo. Use `pnpm up --recursive` for upgrades.
- Avoid peer dependency warnings: use `pnpm.overrides` in root `package.json` if needed.
