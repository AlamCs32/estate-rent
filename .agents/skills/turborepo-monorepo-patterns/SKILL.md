---
name: turborepo-monorepo-patterns
description: Turborepo and pnpm workspace patterns for the EstateRent monorepo. Use when adding packages, configuring build pipelines, setting up shared configs, managing workspace dependencies, or optimizing CI caching.
license: MIT
metadata:
  author: estate-rent
  version: '1.0.0'
---

# Turborepo & pnpm Workspace Patterns — EstateRent

Guide for maintaining and extending the EstateRent Turborepo monorepo.

## When to Apply

- Adding a new shared package (`packages/*`)
- Adding a new app (`apps/*`)
- Modifying `turbo.json` pipelines
- Configuring pnpm workspace dependencies
- Optimizing CI build caching
- Troubleshooting dependency resolution

---

## 1. Workspace Structure

```
estate-rent/
├── apps/
│   ├── api/          (@repo/api — NestJS backend)
│   └── web/          (@repo/web — React + Vite frontend)
├── packages/
│   ├── types/        (@repo/types — shared TS types)
│   ├── utils/        (@repo/utils — pure utilities)
│   ├── ui/           (@repo/ui — shared React components)
│   ├── config/       (@repo/config — env config)
│   ├── eslint-config/(@repo/eslint-config)
│   └── tsconfig/     (@repo/tsconfig)
├── turbo.json
└── pnpm-workspace.yaml
```

---

## 2. Adding a New Shared Package

Follow this checklist when creating a new package in `packages/`:

```bash
# 1. Create directory and package.json
mkdir packages/my-package

# 2. Create package.json
cat > packages/my-package/package.json << 'EOF'
{
  "name": "@repo/my-package",
  "version": "0.0.0",
  "private": true,
  "type": "module",
  "exports": {
    ".": {
      "import": "./src/index.ts",
      "require": "./src/index.ts"
    }
  },
  "scripts": {
    "lint": "eslint .",
    "check-types": "tsc --noEmit"
  },
  "devDependencies": {
    "@repo/eslint-config": "workspace:*",
    "@repo/tsconfig": "workspace:*",
    "typescript": "catalog:"
  }
}
EOF

# 3. Add tsconfig.json extending @repo/tsconfig
# 4. Export everything from src/index.ts
# 5. Add the package as a dependency where needed
pnpm add @repo/my-package --filter @repo/web --workspace
```

---

## 3. turbo.json Pipeline Rules

```json
{
  "$schema": "https://turbo.build/schema.json",
  "tasks": {
    "build": {
      "dependsOn": ["^build"], // ← build deps first
      "outputs": ["dist/**", ".next/**"]
    },
    "dev": {
      "cache": false, // ← never cache dev servers
      "persistent": true // ← long-running process
    },
    "lint": {
      "dependsOn": ["^build"], // ← may need built types
      "outputs": []
    },
    "check-types": {
      "dependsOn": ["^build"],
      "outputs": []
    },
    "test": {
      "dependsOn": ["^build"],
      "outputs": ["coverage/**"],
      "inputs": ["src/**", "tests/**", "vitest.config.*"]
    },
    "migration:generate": {
      "cache": false // ← never cache DB migrations
    },
    "migration:run": {
      "cache": false
    }
  }
}
```

### Key Rules

- `"dependsOn": ["^build"]` means "build all dependencies first" — required for any task that imports from `@repo/*` packages.
- `"cache": false` on `dev` and anything that touches the database.
- `"persistent": true` for long-running processes (dev servers).

---

## 4. Running Filtered Commands

```bash
# Run a command in a single package
pnpm --filter @repo/api dev
pnpm --filter @repo/web build

# Run across all packages matching a pattern
pnpm --filter "@repo/*" lint

# Run in all apps
pnpm --filter "./apps/**" check-types

# Add a dependency to a specific package
pnpm add typeorm --filter @repo/api
pnpm add react-query --filter @repo/web

# Add a workspace-internal dependency
pnpm add @repo/types --filter @repo/api --workspace
```

---

## 5. pnpm Workspace Dependency Rules

| Dependency Type        | `package.json` value           | Example                        |
| ---------------------- | ------------------------------ | ------------------------------ |
| Internal workspace pkg | `"workspace:*"`                | `"@repo/types": "workspace:*"` |
| External, any version  | Use `catalog:` (if configured) | `"typescript": "catalog:"`     |
| External, pinned       | Exact semver                   | `"zod": "4.4.3"`               |

**Never** use `*` for external dependencies. Always pin or use catalog.

---

## 6. Shared TypeScript Config

```json
// packages/tsconfig/base.json — shared strict config
{
  "$schema": "https://json.schemastore.org/tsconfig",
  "compilerOptions": {
    "strict": true,
    "noUncheckedIndexedAccess": true,
    "exactOptionalPropertyTypes": true,
    "noImplicitOverride": true,
    "moduleDetection": "force",
    "skipLibCheck": true
  }
}
```

Each app/package `tsconfig.json` extends the appropriate base:

```json
// apps/api/tsconfig.json
{
  "extends": "@repo/tsconfig/nestjs.json",
  "include": ["src/**/*"],
  "exclude": ["node_modules", "dist"]
}
```

---

## 7. CI Caching with Turborepo

Turborepo caches task outputs by hashing inputs. Maximize cache hits by:

1. **Correct `inputs` specification** — if a task's output doesn't change when unrelated files change, specify exact inputs.
2. **Remote caching** — enable Vercel Remote Cache or self-hosted for team environments.
3. **Never add `node_modules` to `outputs`** — only list build artifacts.

```json
// Good: specific inputs
"test": {
  "inputs": ["src/**", "tests/**", "vitest.config.*", "tsconfig.json"],
  "outputs": ["coverage/**"]
}
```

---

## 8. Common Issues & Fixes

| Problem                            | Fix                                                 |
| ---------------------------------- | --------------------------------------------------- |
| `Cannot find module '@repo/types'` | Run `pnpm build --filter @repo/types` first         |
| Circular dependency warning        | Check `@repo/types` doesn't import from apps        |
| `workspace:*` not resolved         | Ensure package is listed in `pnpm-workspace.yaml`   |
| Turbo cache not invalidating       | Check `inputs` in `turbo.json` covers changed files |
| Wrong Node version                 | Check `.nvmrc` / `engines` field, use `nvm use`     |
