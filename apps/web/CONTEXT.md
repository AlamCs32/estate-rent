# Context — @repo/web

## Current State

The web app is a React 19 application configured with:

- Vite 6 with React plugin and `@/` path alias
- Vitest for testing (globals enabled)
- TypeScript strict mode
- Dev server on port 5173 with API proxy to `http://localhost:3001`
- Production nginx server on port 80 routing `/api` to backend

## Existing Pages/Components

### App (`src/app.tsx`)

- Fetches estates and health data from the API on mount
- Displays estate cards in a responsive grid
- Shows API health status in the header
- Loading state while data is being fetched
- Uses `@repo/ui` components (Card, CardContent, Button)
- Uses `@repo/utils` formatters (formatCurrency, formatDate)

### Types (`src/types.ts`)

- Local re-exports of `Estate` and `PaginatedResponse` from `@repo/types`
- `HealthResponse` interface (local — API-specific)

## Planned Architecture (Not Yet Implemented)

- **React Router** with lazy-loaded routes
- **RTK Query** slices for API data fetching
- **React Hook Form + Zod** for form validation
- **MUI** theme provider and component integration
- **Auth pages** (login, register)
- **Estate detail page**
- **Booking flow**
- **User dashboard**

## Environment Variables

```env
VITE_API_URL=http://localhost:3001
```

## Dev Proxy

Vite proxies `/api/*` requests to `http://localhost:3001` in development. In production, nginx handles this.

## @repo/ui Components Available

| Component     | Props                                  |
| ------------- | -------------------------------------- |
| `Button`      | `variant`, `size`, `children`          |
| `Card`        | `children`                             |
| `CardContent` | `children`                             |
| `CardHeader`  | `children`                             |
| `Input`       | `label`, `error`, standard input attrs |
| `Badge`       | `variant` (success/warning/error/info) |

These use Tailwind-like class names currently. When MUI is introduced, they will be refactored to wrap MUI components.
