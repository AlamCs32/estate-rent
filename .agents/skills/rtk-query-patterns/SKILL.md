---
name: rtk-query-patterns
description: RTK Query patterns for React + Vite apps. Use when creating API slices, handling cache invalidation, implementing optimistic updates, or integrating RTK Query with Zod validation and React Hook Form.
license: MIT
metadata:
  author: estate-rent
  version: '1.0.0'
---

# RTK Query Patterns — EstateRent Frontend

Guide for building robust, type-safe data-fetching with RTK Query in the EstateRent React + Vite app.

## When to Apply

- Creating or modifying API slices in `apps/web/src/store/`
- Implementing cache invalidation after mutations
- Writing optimistic update logic
- Typing query responses with Zod schemas
- Connecting RTK Query hooks to React Hook Form

---

## 1. API Slice Structure

### Rules

- One API slice per domain (e.g., `estatesApi`, `bookingsApi`, `authApi`).
- API slices live in `apps/web/src/store/api/`.
- Use `tagTypes` for cache invalidation — every resource type gets a tag.
- Always type the base query response explicitly — no `any`.
- Use `transformResponse` to validate / transform data with Zod before it hits the store.

```typescript
// store/api/estates.api.ts
import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import type { Estate, PaginatedResponse } from '@repo/types';
import { estateSchema, paginatedEstatesSchema } from '../schemas/estate.schema';

export const estatesApi = createApi({
  reducerPath: 'estatesApi',
  baseQuery: fetchBaseQuery({
    baseUrl: '/api',
    prepareHeaders: (headers, { getState }) => {
      const token = (getState() as RootState).auth.token;
      if (token) headers.set('authorization', `Bearer ${token}`);
      return headers;
    },
  }),
  tagTypes: ['Estate', 'EstateList'],
  endpoints: (builder) => ({
    getEstates: builder.query<PaginatedResponse<Estate>, EstatesQueryParams>({
      query: (params) => ({ url: '/estates', params }),
      providesTags: (result) =>
        result
          ? [
              ...result.data.map(({ id }) => ({ type: 'Estate' as const, id })),
              { type: 'EstateList', id: 'LIST' },
            ]
          : [{ type: 'EstateList', id: 'LIST' }],
      transformResponse: (raw) => paginatedEstatesSchema.parse(raw), // Zod validation
    }),

    getEstate: builder.query<Estate, string>({
      query: (id) => `/estates/${id}`,
      providesTags: (_result, _err, id) => [{ type: 'Estate', id }],
      transformResponse: (raw) => estateSchema.parse(raw),
    }),

    createEstate: builder.mutation<Estate, CreateEstateDto>({
      query: (body) => ({ url: '/estates', method: 'POST', body }),
      invalidatesTags: [{ type: 'EstateList', id: 'LIST' }],
    }),

    updateEstate: builder.mutation<Estate, { id: string; body: UpdateEstateDto }>({
      query: ({ id, body }) => ({ url: `/estates/${id}`, method: 'PATCH', body }),
      invalidatesTags: (_result, _err, { id }) => [
        { type: 'Estate', id },
        { type: 'EstateList', id: 'LIST' },
      ],
    }),

    deleteEstate: builder.mutation<void, string>({
      query: (id) => ({ url: `/estates/${id}`, method: 'DELETE' }),
      invalidatesTags: (_result, _err, id) => [
        { type: 'Estate', id },
        { type: 'EstateList', id: 'LIST' },
      ],
    }),
  }),
});

export const {
  useGetEstatesQuery,
  useGetEstateQuery,
  useCreateEstateMutation,
  useUpdateEstateMutation,
  useDeleteEstateMutation,
} = estatesApi;
```

---

## 2. Store Setup

```typescript
// store/index.ts
import { configureStore } from '@reduxjs/toolkit';
import { estatesApi } from './api/estates.api';
import { bookingsApi } from './api/bookings.api';
import { authSlice } from './slices/auth.slice';

export const store = configureStore({
  reducer: {
    auth: authSlice.reducer,
    [estatesApi.reducerPath]: estatesApi.reducer,
    [bookingsApi.reducerPath]: bookingsApi.reducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(estatesApi.middleware).concat(bookingsApi.middleware),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
```

---

## 3. Using Queries in Components

```typescript
// components/EstateList.tsx
import { useGetEstatesQuery } from '@/store/api/estates.api';

export function EstateList() {
  const { data, isLoading, isError, isFetching } = useGetEstatesQuery({
    page: 1,
    limit: 12,
    city: 'Karachi',
  });

  if (isLoading) return <EstateListSkeleton />;
  if (isError) return <ErrorBoundaryFallback />;

  return (
    <Grid container spacing={2}>
      {data?.data.map((estate) => (
        <EstateCard key={estate.id} estate={estate} dimmed={isFetching} />
      ))}
    </Grid>
  );
}
```

---

## 4. Mutations with React Hook Form

```typescript
// pages/CreateEstate.tsx
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { createEstateSchema } from '@/store/schemas/estate.schema';
import { useCreateEstateMutation } from '@/store/api/estates.api';

export function CreateEstatePage() {
  const [createEstate, { isLoading }] = useCreateEstateMutation();

  const form = useForm<CreateEstateDto>({
    resolver: zodResolver(createEstateSchema),
  });

  const onSubmit = async (data: CreateEstateDto) => {
    try {
      await createEstate(data).unwrap(); // .unwrap() throws on error
      navigate('/estates');
    } catch (err) {
      // handle RTK Query error
      form.setError('root', { message: extractApiError(err) });
    }
  };

  return <form onSubmit={form.handleSubmit(onSubmit)}>{/* fields */}</form>;
}
```

---

## 5. Optimistic Updates

Use for mutations where you want instant UI feedback:

```typescript
updateEstate: builder.mutation<Estate, { id: string; body: UpdateEstateDto }>({
  query: ({ id, body }) => ({ url: `/estates/${id}`, method: 'PATCH', body }),
  async onQueryStarted({ id, body }, { dispatch, queryFulfilled }) {
    // Optimistically update the cache
    const patch = dispatch(
      estatesApi.util.updateQueryData('getEstate', id, (draft) => {
        Object.assign(draft, body);
      })
    );
    try {
      await queryFulfilled;
    } catch {
      patch.undo(); // roll back on error
    }
  },
}),
```

---

## 6. Error Handling Utility

```typescript
// utils/api-error.ts
import type { FetchBaseQueryError } from '@reduxjs/toolkit/query';
import type { ApiResponse } from '@repo/types';

export function extractApiError(error: unknown): string {
  if (typeof error === 'object' && error !== null && 'data' in error) {
    const data = (error as FetchBaseQueryError).data as ApiResponse<never>;
    return data?.message ?? 'An unexpected error occurred';
  }
  return 'Network error — please try again';
}
```

---

## 7. Cache Tag Quick Reference

| Tag                                   | Provided By   | Invalidated By                   |
| ------------------------------------- | ------------- | -------------------------------- |
| `{ type: 'Estate', id }`              | `getEstate`   | `updateEstate`, `deleteEstate`   |
| `{ type: 'EstateList', id: 'LIST' }`  | `getEstates`  | `createEstate`, `deleteEstate`   |
| `{ type: 'Booking', id }`             | `getBooking`  | `updateBooking`, `cancelBooking` |
| `{ type: 'BookingList', id: 'LIST' }` | `getBookings` | `createBooking`                  |

---

## 8. Key Rules Summary

- Always use `.unwrap()` in mutation handlers to get proper error throwing.
- Never fetch inside `useEffect` — always use RTK Query hooks.
- Use `selectFromResult` to derive computed values without extra re-renders.
- Use `skip` option to conditionally skip queries: `useGetEstateQuery(id, { skip: !id })`.
- Prefer `isFetching` over `isLoading` for background refresh indicators.
