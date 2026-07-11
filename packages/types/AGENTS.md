# AI Assistant Guide — @repo/types

## Identity

You are working in `packages/types/` — the shared TypeScript type definitions for EstateRent. This is the lowest-level package with zero dependencies.

## Rules

- **Interfaces and types only.** No runtime code, no classes, no enums (use `union type` instead).
- **Pure types.** No values, no constants, no functions.
- **Named exports only.** Every type exported from `src/index.ts`.
- **No dependencies.** Zero external dependencies. Not even Node types.
- **No application logic.** Pure type definitions only.
- **Breaking changes are expensive.** This package is consumed by every other package. Think carefully before modifying existing types.

## Current Types

| Type                   | Purpose                                                 |
| ---------------------- | ------------------------------------------------------- |
| `User`                 | User entity shape                                       |
| `Estate`               | Estate/rental property shape                            |
| `Booking`              | Booking entity shape                                    |
| `BookingStatus`        | Union: `pending \| confirmed \| cancelled \| completed` |
| `ApiResponse<T>`       | Wrapper for single-resource API responses               |
| `PaginatedResponse<T>` | Wrapper for paginated list API responses                |

## Conventions

```typescript
export interface Estate {
  id: string;
  title: string;
  description: string;
  price: number;
  location: string;
  images: string[];
  available: boolean;
  createdAt: string;
  updatedAt: string;
}

export type BookingStatus = 'pending' | 'confirmed' | 'cancelled' | 'completed';
```

## Adding a New Type

1. Create `src/<name>.ts` with the type definition
2. Export it in `src/index.ts`
3. Ensure it has no imports from other monorepo packages
4. Use `interface` for object shapes, `type` for unions/intersections/utilities
5. Add JSDoc comments for public types explaining their purpose
