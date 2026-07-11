---
name: zod-validation-patterns
description: Zod v4 validation patterns for form schemas, API response validation, environment variable parsing, and shared schema design in the EstateRent monorepo. Use when writing Zod schemas, integrating with React Hook Form, or validating API data.
license: MIT
metadata:
  author: estate-rent
  version: '1.0.0'
---

# Zod Validation Patterns — EstateRent

Guide for using Zod 4 in the EstateRent React + Vite frontend and shared packages.

## When to Apply

- Writing form validation schemas with React Hook Form
- Validating API responses in RTK Query `transformResponse`
- Parsing environment variables
- Designing shared schema in `@repo/types` or `packages/`
- Any `z.infer<>` type derivation

---

## 1. Schema Location Convention

| Schema Type                | Location                                        |
| -------------------------- | ----------------------------------------------- |
| Form schemas (UI-specific) | `apps/web/src/store/schemas/<domain>.schema.ts` |
| API response schemas       | same file, export separately                    |
| Shared entity schemas      | `packages/types/src/schemas/<domain>.schema.ts` |
| Environment schemas        | `packages/config/src/env.schema.ts`             |

---

## 2. Entity Schema Pattern

```typescript
// packages/types/src/schemas/estate.schema.ts
import { z } from 'zod';

export const estateSchema = z.object({
  id: z.string().uuid(),
  title: z.string().min(5).max(200),
  description: z.string().min(20).max(5000),
  pricePerMonth: z.string().regex(/^\d+(\.\d{1,2})?$/), // numeric(12,2) from DB
  bedrooms: z.number().int().min(0).max(20),
  bathrooms: z.number().int().min(0).max(20),
  city: z.string().min(2).max(100),
  address: z.string().min(5).max(300),
  status: z.enum(['AVAILABLE', 'RENTED', 'MAINTENANCE']),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
  deletedAt: z.string().datetime().nullable(),
});

export type Estate = z.infer<typeof estateSchema>;

// Partial schema for PATCH requests
export const updateEstateSchema = estateSchema
  .partial()
  .omit({ id: true, createdAt: true, updatedAt: true, deletedAt: true });
export type UpdateEstateDto = z.infer<typeof updateEstateSchema>;

// Create schema — omit server-generated fields
export const createEstateSchema = estateSchema.omit({
  id: true,
  createdAt: true,
  updatedAt: true,
  deletedAt: true,
  status: true,
});
export type CreateEstateDto = z.infer<typeof createEstateSchema>;
```

---

## 3. Paginated Response Schema

```typescript
// packages/types/src/schemas/pagination.schema.ts
import { z } from 'zod';

export function paginatedSchema<T extends z.ZodTypeAny>(itemSchema: T) {
  return z.object({
    data: z.array(itemSchema),
    meta: z.object({
      total: z.number().int().nonnegative(),
      page: z.number().int().positive(),
      limit: z.number().int().positive(),
      totalPages: z.number().int().nonnegative(),
    }),
  });
}

// Usage:
export const paginatedEstatesSchema = paginatedSchema(estateSchema);
export type PaginatedEstates = z.infer<typeof paginatedEstatesSchema>;
```

---

## 4. Form Schemas (React Hook Form)

```typescript
// apps/web/src/store/schemas/booking.schema.ts
import { z } from 'zod';

export const createBookingFormSchema = z
  .object({
    estateId: z.string().uuid('Invalid estate'),
    checkIn: z.string().date('Must be a valid date (YYYY-MM-DD)'),
    checkOut: z.string().date('Must be a valid date (YYYY-MM-DD)'),
    message: z.string().max(500).optional(),
  })
  .refine((data) => new Date(data.checkOut) > new Date(data.checkIn), {
    message: 'Check-out must be after check-in',
    path: ['checkOut'],
  });

export type CreateBookingFormValues = z.infer<typeof createBookingFormSchema>;
```

```typescript
// Component integration
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';

const form = useForm<CreateBookingFormValues>({
  resolver: zodResolver(createBookingFormSchema),
  defaultValues: { message: '' },
});
```

---

## 5. Environment Variable Parsing

```typescript
// packages/config/src/env.schema.ts
import { z } from 'zod';

const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  PORT: z.coerce.number().int().positive().default(3000),
  DATABASE_URL: z.string().url(),
  JWT_SECRET: z.string().min(32),
  JWT_EXPIRES_IN: z.string().default('7d'),
  CORS_ORIGIN: z.string().url(),
});

export const env = envSchema.parse(process.env);
export type Env = z.infer<typeof envSchema>;
```

---

## 6. API Response Validation in RTK Query

```typescript
// In transformResponse — always validate, don't trust the network
transformResponse: (raw: unknown) => {
  const result = estateSchema.safeParse(raw);
  if (!result.success) {
    console.error('API response validation failed:', result.error.flatten());
    throw new Error('Invalid API response shape');
  }
  return result.data;
},
```

---

## 7. Common Patterns

### Phone number (Pakistani format)

```typescript
const phoneSchema = z
  .string()
  .regex(/^(\+92|0)?[0-9]{10}$/, 'Enter a valid Pakistani phone number');
```

### Price field

```typescript
const priceSchema = z
  .number({ required_error: 'Price is required' })
  .positive('Price must be positive')
  .multipleOf(0.01, 'Max 2 decimal places');
```

### File upload

```typescript
const imageUploadSchema = z.object({
  file: z
    .instanceof(File)
    .refine((f) => f.size <= 5 * 1024 * 1024, 'Max 5MB')
    .refine(
      (f) => ['image/jpeg', 'image/png', 'image/webp'].includes(f.type),
      'Only JPEG, PNG, or WebP',
    ),
});
```

### Optional nullable string

```typescript
const optionalString = z.string().min(1).nullable().optional();
```

---

## 8. Type Derivation Rules

- **Always** derive TypeScript types from Zod schemas using `z.infer<typeof schema>`.
- **Never** write a TypeScript interface that duplicates a Zod schema — maintain a single source of truth.
- Export both the schema and the derived type from the same file.
- For DTOs used by the backend (NestJS), use `@repo/types` schemas as the authoritative source.

---

## 9. Error Display Pattern (MUI)

```tsx
<Controller
  name="checkIn"
  control={form.control}
  render={({ field, fieldState }) => (
    <TextField
      {...field}
      type="date"
      label="Check-in Date"
      error={!!fieldState.error}
      helperText={fieldState.error?.message}
      InputLabelProps={{ shrink: true }}
    />
  )}
/>
```
