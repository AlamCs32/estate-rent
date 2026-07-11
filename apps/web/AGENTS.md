# AI Assistant Guide — @repo/web (React Frontend)

## Identity

You are working in `apps/web/` — the React 19 frontend for EstateRent. Built with Vite 6, TypeScript, and MUI (planned).

## Key Files

| File               | Purpose                                                  |
| ------------------ | -------------------------------------------------------- |
| `src/main.tsx`     | App entry point, root React rendering                    |
| `src/app.tsx`      | Root component (temporary — will be replaced by router)  |
| `src/types.ts`     | Local type aliases and re-exports from `@repo/types`     |
| `vite.config.ts`   | Vite configuration (React plugin, `@/` alias, dev proxy) |
| `vitest.config.ts` | Vitest configuration (same alias, React plugin)          |
| `index.html`       | HTML entry point                                         |
| `tsconfig.json`    | TypeScript config (extends `@repo/tsconfig/vite.json`)   |
| `nginx.conf`       | Production nginx config (SLA + API proxy)                |

## Architecture Rules

- **Functional components with hooks only.** No class components.
- **Feature-based folder structure** under `src/`.
- **All pages lazy-loaded** with `React.lazy` and `Suspense`.
- **Reusable components live in `shared/components/`** or in `@repo/ui`.
- **Server data via RTK Query** (planned). No direct `fetch`/`axios` in components.
- **Form validation with React Hook Form + Zod** (planned).
- **MUI for styling** (planned). `@repo/ui` wraps MUI components for shared usage.

## Available Packages

```typescript
import { Button, Card, Input, Badge } from '@repo/ui';
import { Estate, Booking } from '@repo/types';
import { formatCurrency, formatDate, cn, truncate, debounce } from '@repo/utils';
```

## Testing

- Test files: `*.test.tsx` co-located or in `__tests__/` directories
- Runner: Vitest with global test utilities
- Component tests: `@testing-library/react` (planned)
- Hook tests: `renderHook` from `@testing-library/react` (planned)

## Common Tasks

### Add a new page

1. Create `src/<feature>/pages/<name>.page.tsx`
2. Lazy-load in `router.tsx` (or add to `app.tsx` temporarily)
3. Add route to router config

### Add a new shared component

- If used across features: add to `src/shared/components/`
- If truly generic: add to `packages/ui/src/`

### Add data fetching

- Use RTK Query (planned). Define API slice in `<feature>/<feature>-api.ts`
- For now, use `fetch()` directly as shown in `app.tsx`
