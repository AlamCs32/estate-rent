# Coding Standards — EstateRent Monorepo

## TypeScript

- `strict: true` in all tsconfigs
- Use `interface` for public API shapes, `type` for unions and utilities
- `readonly` on interface properties where applicable
- No `any` — use `unknown` with type guards
- No `as` casts except when narrowing `unknown`
- Prefer `const` assertions (`as const`) for literal types
- Use `satisfies` keyword for type validation without widening
- Type all function parameters and return values

## File Naming

| Context         | Convention                | Examples                                     |
| --------------- | ------------------------- | -------------------------------------------- |
| Backend source  | `*.ts`, kebab-case        | `estates.service.ts`, `create-estate.dto.ts` |
| Frontend source | `*.tsx`, kebab-case       | `estate-card.tsx`, `use-estates.ts`          |
| Test files      | `*.spec.ts`, `*.test.tsx` | `estates.service.spec.ts`                    |
| Shared packages | `*.ts`, kebab-case        | `format-currency.ts`                         |
| Config files    | `*.json`, `.js`, `.mjs`   | `tsconfig.json`, `vite.config.ts`            |
| Styles          | `*.css`, kebab-case       | `estate-card.css`                            |

## Folder Structure

### Backend (`apps/api/src/`)

```
src/
  main.ts
  app.module.ts
  app.controller.ts
  app.service.ts
  <feature>/
    <feature>.module.ts
    <feature>.controller.ts
    <feature>.service.ts
    <feature>.repository.ts          # optional
    dto/
      create-<feature>.dto.ts
      update-<feature>.dto.ts
      query-<feature>.dto.ts
    entities/
      <feature>.entity.ts
    <feature>.controller.spec.ts
    <feature>.service.spec.ts
```

### Frontend (`apps/web/src/`)

```
src/
  main.tsx
  app.tsx
  router.tsx
  theme.ts
  <feature>/
    pages/
      <feature>-list.page.tsx
      <feature>-detail.page.tsx
    components/
      <feature>-card.tsx
      <feature>-form.tsx
    hooks/
      use-<feature>.ts
    <feature>-api.ts               # RTK Query slice
    <feature>-api.spec.ts
  shared/
    components/
    hooks/
    utils/
```

## Imports

```typescript
// 1. Node built-ins
import { readFile } from 'node:fs';

// 2. Third-party
import { Injectable } from '@nestjs/common';
import { useState } from 'react';

// 3. Monorepo packages
import { Estate } from '@repo/types';
import { formatCurrency } from '@repo/utils';
import { Button } from '@repo/ui';

// 4. Internal relative (using @/ alias)
import { EstatesService } from '@/estates/estates.service';
import { CreateEstateDto } from '@/estates/dto/create-estate.dto';
```

## Functions & Components

- One component/function per file (exceptions: tightly coupled utilities)
- Keep functions under 50 lines. Extract helpers.
- Keep React components focused: one responsibility per component.
- Use composition over inheritance everywhere.
- Prefer small, pure functions over large, stateful ones.

## React Components

```typescript
// Functional component with explicit return type
export function EstateCard({ estate }: EstateCardProps): JSX.Element {
  // Hooks at top
  const { data, isLoading } = useGetEstateQuery(estate.id);

  // Early returns for loading/error/empty states
  if (isLoading) return <Skeleton />;
  if (!data) return <ErrorState />;

  // Render
  return (
    <Card>
      <CardContent>{data.title}</CardContent>
    </Card>
  );
}
```

## NestJS Modules

```typescript
@Module({
  imports: [TypeOrmModule.forFeature([Estate])],
  controllers: [EstatesController],
  providers: [EstatesService, EstatesRepository],
  exports: [EstatesService], // only if consumed by other modules
})
export class EstatesModule {}
```

## Error Handling

```typescript
// Backend — use NestJS exceptions
if (!estate) throw new NotFoundException(`Estate ${id} not found`);

// Frontend — use error boundaries
throw new Error('Failed to load estates');
```

## Async Patterns

```typescript
// ✅ Good
const [users, estates] = await Promise.all([userService.findAll(), estateService.findAll()]);

// ❌ Bad — sequential when could be parallel
const users = await userService.findAll();
const estates = await estateService.findAll();
```
