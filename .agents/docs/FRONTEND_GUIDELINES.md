# Frontend Guidelines — EstateRent Monorepo

## MUI MCP (Model Context Protocol)

This project has the MUI MCP server configured (see `.vscode/mcp.json`, `.claude/mcp.json`). AI assistants must use the `mui-mcp` server to look up official MUI component APIs, props, code examples, and migration guides before writing any MUI code. This ensures accurate, up-to-date usage.

## Architecture

- React 19 with functional components and hooks only. No class components.
- Vite 6 as build tool. Fast HMR, TypeScript native.
- Feature-based folder structure under `src/`.
- All pages are lazy-loaded with `React.lazy` + `Suspense`.
- Material UI (MUI) for component library. Wrapped in `@repo/ui` for shared usage.
- React Router for client-side routing.
- RTK Query for server data fetching and caching.
- React Hook Form + Zod for form state and validation.

## Component Structure

```typescript
// EstateCard.tsx
import { Card, CardContent, Badge } from '@repo/ui';
import { formatCurrency } from '@repo/utils';
import type { Estate } from '@repo/types';

interface EstateCardProps {
  estate: Estate;
  onSelect?: (id: string) => void;
}

export function EstateCard({ estate, onSelect }: EstateCardProps) {
  return (
    <Card onClick={() => onSelect?.(estate.id)}>
      <CardContent>
        <h3>{estate.title}</h3>
        <p>{formatCurrency(estate.price)}</p>
        <Badge variant={estate.available ? 'success' : 'error'}>
          {estate.available ? 'Available' : 'Rented'}
        </Badge>
      </CardContent>
    </Card>
  );
}
```

### Component Guidelines

- One component per file.
- Props interface defined above the component, exported if reused.
- Named exports only.
- Use `children` prop type explicitly (`ReactNode`).
- Prefer composition over prop drilling.
- Keep presentation components pure — data fetching lives in hooks or pages.

## Routing

```typescript
// router.tsx
import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import { lazy, Suspense } from 'react';
import { Layout } from './shared/components/layout';
import { Loading } from './shared/components/loading';

const EstatesList = lazy(() => import('@/estates/pages/estates-list.page'));
const EstatesDetail = lazy(() => import('@/estates/pages/estates-detail.page'));

const router = createBrowserRouter([
  {
    path: '/',
    element: <Layout />,
    children: [
      { index: true, element: <EstatesList /> },
      { path: 'estates/:id', element: <EstatesDetail /> },
    ],
  },
]);

export function AppRouter() {
  return (
    <Suspense fallback={<Loading />}>
      <RouterProvider router={router} />
    </Suspense>
  );
}
```

## State Management

- **Server state**: RTK Query (API data caching, auto-refetch, optimistic updates).
- **Client state**: React context for truly global state (theme, auth). Local state (`useState`) for component-specific data.
- **URL state**: React Router params and search params.
- **Form state**: React Hook Form.

### RTK Query Pattern

```typescript
// estates-api.ts
import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import type { Estate, PaginatedResponse } from '@repo/types';

export const estatesApi = createApi({
  reducerPath: 'estatesApi',
  baseQuery: fetchBaseQuery({ baseUrl: '/api' }),
  endpoints: (builder) => ({
    getEstates: builder.query<PaginatedResponse<Estate>, { page: number; limit: number }>({
      query: ({ page, limit }) => `estates?page=${page}&limit=${limit}`,
    }),
    getEstateById: builder.query<Estate, string>({
      query: (id) => `estates/${id}`,
    }),
  }),
});

export const { useGetEstatesQuery, useGetEstateByIdQuery } = estatesApi;
```

## Forms

Use React Hook Form with Zod validation:

```typescript
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Input } from '@repo/ui';

const estateSchema = z.object({
  title: z.string().min(1).max(200),
  price: z.number().min(0),
  description: z.string().min(10).max(2000),
});

type EstateFormData = z.infer<typeof estateSchema>;

export function EstateForm() {
  const { register, handleSubmit, formState: { errors } } = useForm<EstateFormData>({
    resolver: zodResolver(estateSchema),
  });

  return (
    <form onSubmit={handleSubmit((data) => console.log(data))}>
      <Input label="Title" error={errors.title?.message} {...register('title')} />
      <Input label="Price" type="number" error={errors.price?.message} {...register('price', { valueAsNumber: true })} />
      <button type="submit">Submit</button>
    </form>
  );
}
```

## Hooks

Custom hooks encapsulate reusable stateful logic:

```typescript
import { useState, useCallback } from 'react';
import { useGetEstatesQuery } from './estates-api';

export function useEstates(page = 1, limit = 10) {
  const { data, error, isLoading } = useGetEstatesQuery({ page, limit });

  return {
    estates: data?.data ?? [],
    total: data?.total ?? 0,
    isLoading,
    error,
  };
}
```

## Styling

- Material UI `sx` prop or styled components for one-off styles.
- MUI `theme` object for consistent design tokens (colors, spacing, typography).
- No plain CSS files unless globally scoped.
- No CSS-in-JS libraries beyond MUI's built-in styling.

```typescript
import { useTheme } from '@mui/material/styles';
import { Box, Typography } from '@mui/material';

export function HeroSection() {
  const theme = useTheme();

  return (
    <Box sx={{ padding: theme.spacing(4), backgroundColor: theme.palette.primary.main }}>
      <Typography variant="h2">Find Your Perfect Rental</Typography>
    </Box>
  );
}
```

## Error Handling

```typescript
// Error boundary at route level
class RouteErrorBoundary extends React.Component<{ children: ReactNode }, { hasError: boolean }> {
  state = { hasError: false };

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  render() {
    if (this.state.hasError) {
      return <ErrorFallback />;
    }
    return this.props.children;
  }
}
```

## Loading States

All data-fetching components handle three states:

```typescript
export function EstatesList() {
  const { estates, isLoading, error } = useEstates();

  if (isLoading) return <Skeleton variant="rectangular" width="100%" height={200} />;
  if (error) return <Alert severity="error">Failed to load estates</Alert>;
  if (estates.length === 0) return <EmptyState message="No estates found" />;

  return (
    <Grid container spacing={2}>
      {estates.map((estate) => (
        <EstateCard key={estate.id} estate={estate} />
      ))}
    </Grid>
  );
}
```

## Performance

- Use `React.memo` on components that receive the same props frequently.
- Use `useMemo` for expensive computations, `useCallback` for stable function references.
- Lazy-load all route-level components.
- Virtualize long lists with `@tanstack/react-virtual`.
- Use MUI's `sx` prop sparingly in hot paths — prefer styled components or `styled()`.
- Monitor bundle size — use `vite-plugin-visualizer` for analysis.
