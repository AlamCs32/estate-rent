# AI Assistant Guide — @repo/ui

## Identity

You are working in `packages/ui/` — the shared UI component library for EstateRent. Consumed by `apps/web` (and potentially future apps).

## Rules

- **Generic components only.** No domain-specific logic. Estate-specific components belong in `apps/web/src/estates/`.
- **Named exports only.** Every component exported from `src/index.ts`.
- **Tree-shakeable.** Import only what's used. Don't create barrel files that re-export everything.
- **One component per file.** File name matches component name (kebab-case).
- **TypeScript strict.** All props interfaces defined and exported.
- **MUI wrappers.** When MUI is introduced, these components should wrap MUI primitives.
- **No application logic.** No API calls, no routing, no store access.
- **Accessibility.** All components must use semantic HTML, ARIA attributes, and support keyboard navigation.

## Current Components

| Component     | File             | Status    |
| ------------- | ---------------- | --------- |
| `Button`      | `src/button.tsx` | ✅ Active |
| `Card`        | `src/card.tsx`   | ✅ Active |
| `CardContent` | `src/card.tsx`   | ✅ Active |
| `CardHeader`  | `src/card.tsx`   | ✅ Active |
| `Input`       | `src/input.tsx`  | ✅ Active |
| `Badge`       | `src/badge.tsx`  | ✅ Active |

## Conventions

```typescript
// button.tsx
interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  children: ReactNode;
  variant?: 'primary' | 'secondary' | 'outline';
  size?: 'sm' | 'md' | 'lg';
}

export function Button({
  children,
  variant = 'primary',
  size = 'md',
  className = '',
  ...props
}: ButtonProps) {
  // ... implementation
}
```

## Dependencies

- `react` (peer dependency)
- No other external dependencies. Keep it minimal.
