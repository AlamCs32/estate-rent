# AI Assistant Guide — @repo/utils

## Identity

You are working in `packages/utils/` — shared pure utility functions for EstateRent. Used by both `apps/api` and `apps/web`.

## Rules

- **Pure functions only.** No side effects, no async, no I/O.
- **No dependencies.** Zero external dependencies. Only use built-in JS/TS APIs.
- **Named exports only.** Every function exported from `src/index.ts`.
- **Fully tested.** Every function must have a corresponding unit test.
- **No application logic.** No knowledge of domains (estates, bookings, users).
- **Tree-shakeable.** Import what you need.
- **Strict TypeScript.** Generic parameters where appropriate.

## Current Functions

| Function         | Purpose                                  |
| ---------------- | ---------------------------------------- |
| `formatDate`     | Format date to locale string             |
| `formatCurrency` | Format number as currency string         |
| `cn`             | Merge class names (filters falsy values) |
| `truncate`       | Truncate string to max length            |
| `debounce`       | Create debounced function                |
| `generateId`     | Generate UUID or random ID               |

## Conventions

```typescript
export function formatCurrency(amount: number, currency = 'USD', locale = 'en-US'): string {
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency,
  }).format(amount);
}
```

## Adding a New Function

1. Create `src/<name>.ts` with the function implementation
2. Export it in `src/index.ts`
3. Add a test in `src/<name>.spec.ts`
4. Ensure it has no external dependencies
5. Keep it small and focused — one function per file
